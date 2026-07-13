# 🔐 JWT Authentication — Dokumentasi Sistem Autentikasi

> Sistem autentikasi JWT lengkap dengan silent token refresh, promise lock untuk race condition prevention, visibility-aware scheduling, dan route validation otomatis setelah refresh.

---

## Daftar Isi

-   [Arsitektur](#arsitektur)
-   [File & Struktur](#file--struktur)
-   [Alur Kerja](#alur-kerja)
-   [JWT Token Payload](#jwt-token-payload)
-   [Redux Store: AuthSlicer](#redux-store-authslicer)
-   [Service: tokenRefresh](#service-tokenrefresh)
-   [Hook: useTokenRefresh](#hook-usetokenrefresh)
-   [API Interceptor](#api-interceptor)
-   [Silent Refresh](#silent-refresh)
-   [Promise Lock (Race Condition)](#promise-lock-race-condition)
-   [Visibility-Aware Scheduling](#visibility-aware-scheduling)
-   [Route Validation & Redirect](#route-validation--redirect)
-   [Integrasi di App](#integrasi-di-app)
-   [Konfigurasi](#konfigurasi)
-   [Troubleshooting](#troubleshooting)

---

## Arsitektur

```
┌──────────────────────────────────────────────────────────────────────┐│                           App.tsx                                      ││  ┌────────────────────────────────────────────────────────────────┐  ││  │  AppRoutes (useTokenRefresh)                                    │  ││  │                                                                  │  ││  │  ┌─ Login ──────────────────────────────────────────────────┐  │  ││  │  │  postLoginUser() → setBearerToken(token)                  │  │  ││  │  │  → parse modules/permissions dari JWT payload             │  │  ││  │  │  → simpan ke Redux (AuthSlicer)                           │  │  ││  │  │  → scheduleTokenRefresh() (10 menit sebelum expired)      │  │  ││  │  └──────────────────────────────────────────────────────────┘  │  ││  │                                                                  │  ││  │  ┌─ Silent Refresh Timer ───────────────────────────────────┐  │  ││  │  │  setTimeout(refreshFn, tokenExp - 10min - now)            │  │  ││  │  │                                                           │  │  ││  │  │  Timer fires:                                             │  │  ││  │  │  ├─ Tab hidden? → skip, pasang visibilitychange listener  │  │  ││  │  │  └─ Tab visible? → performTokenRefresh()                  │  │  ││  │  │       │                                                   │  │  ││  │  │       ├─ Promise Lock aktif? → tunggu promise yang sama   │  │  ││  │  │       └─ Refresh berhasil:                                │  │  ││  │  │            ├─ setBearerToken(newToken)                     │  │  ││  │  │            ├─ parse modules baru                           │  │  ││  │  │            ├─ bandingkan dengan modules lama               │  │  ││  │  │            ├─ route masih valid? → OK                      │  │  ││  │  │            └─ route tidak valid? → Modal.confirm + redirect│  │  ││  │  └──────────────────────────────────────────────────────────┘  │  ││  │                                                                  │  ││  │  ┌─ API Interceptor ───────────────────────────────────────┐   │  ││  │  │  Pre-request: token expired? → refresh dulu              │   │  ││  │  │  Post-request: 401? → refresh + retry                    │   │  ││  │  │  Promise Lock: multiple 401 → satu refresh, semua tunggu │   │  ││  │  └──────────────────────────────────────────────────────────┘   │  ││  └────────────────────────────────────────────────────────────────┘  │└──────────────────────────────────────────────────────────────────────┘
```

---

## File & Struktur

```
src/├── Store/redux/Auth/│   └── index.ts                    # Redux slice: BearerToken, modules, permissions│├── Services/│   ├── api.tsx                     # RTK Query base + interceptor (refresh on 401)│   └── tokenRefresh.ts            # Silent refresh service + promise lock + route helpers│├── Hooks/│   └── useTokenRefresh.ts         # React hook: schedule refresh + route validation│├── Utils/│   ├── jwtHelper.ts               # JWT decode, expiry check, remaining time│   └── authUtils.ts               # Auth initialization helpers│├── Services/Modules/auth/│   ├── auth.api.ts                # RTK Query endpoints (login, refresh, logout, me)│   ├── auth.types.ts              # TypeScript types (ModuleMenu, Permissions, dll)│   └── endpoints/│       ├── postLoginUser.ts       # POST /login│       ├── postRefresh.ts         # POST /auth/refresh│       ├── postLogoutUser.ts      # POST /auth/logout│       └── getMe.ts              # GET /auth/me│└── App.tsx                        # Integrasi useTokenRefresh di AppRoutes
```

---

## Alur Kerja

### Login Flow

```
User submit login form    │    ▼postLoginUser({ username, password })    │    ▼Response: { status: 'success', token: 'eyJ...' }    │    ▼dispatch(setBearerToken(token))    │  ├─ Decode JWT payload    │  ├─ Extract modules[] → state.modules    │  ├─ Extract permissions{} → state.permissions    │  └─ Set user data → state.user, state.defaultData    │    ▼dispatch(setDefaultUser(decodeJWT(token)))    │    ▼useTokenRefresh() detects token change    │    ▼scheduleTokenRefresh(callback)    │  └─ setTimeout(refreshFn, tokenExp - 10min - now)    │    ▼navigate('/dashboard')
```

### Silent Refresh Flow

```
Timer fires (10 menit sebelum expired)    │    ├─ document.visibilityState === 'hidden'?    │   └─ YES → Skip refresh    │           └─ Pasang listener: visibilitychange → retry saat visible    │    └─ NO (tab visible) → performTokenRefresh()        │        ├─ refreshPromise sudah ada? (promise lock)        │   └─ YES → return refreshPromise (tunggu yang sama)        │        └─ NO → Mulai refresh baru            │            ▼        POST /auth/refresh (dengan Bearer token lama)            │            ├─ 200 OK → { token: 'eyJ...(baru)' }            │   ├─ dispatch(setBearerToken(newToken))            │   ├─ Parse modules baru dari JWT            │   ├─ Bandingkan dengan modules lama            │   │   ├─ Sama → OK, lanjut            │   │   └─ Berubah → Cek route aktif            │   │       ├─ Route masih valid → OK            │   │       └─ Route tidak valid → Modal.confirm + redirect            │   └─ Re-schedule refresh untuk token baru            │            ├─ 401 → Token sudah tidak valid            │   └─ clearBearerToken() → redirect ke login            │            └─ Error lain → Log error, tidak re-schedule
```

### API Request Flow (dengan Interceptor)

```
RTK Query request    │    ▼prepareHeaders()    │  └─ Set Authorization: Bearer <token>    │    ▼baseQueryWithInterceptor()    │    ├─ PRE-REQUEST: Token expired?    │   └─ YES → performTokenRefresh()    │       ├─ Berhasil → Lanjut request dengan token baru    │       └─ Gagal → clearBearerToken() → redirect login    │    ▼Execute request    │    ├─ 200 OK → Return result    │    └─ 401 Unauthorized        ├─ isRefreshing()? → Tunggu getRefreshPromise()        └─ Tidak → performTokenRefresh()            ├─ Berhasil → Retry request            └─ Gagal → clearBearerToken() → redirect login
```

---

## JWT Token Payload

Struktur payload JWT yang di-decode dari Bearer token:

```json
{  "iss": "http://10.147.17.70:3001/api/login",  "iat": 1772573306,  "exp": 1772659706,  "nbf": 1772573306,  "jti": "B1hzXcXZ3DSujrrc",  "sub": "5",  "prv": "23bd5c8949f600adb39e701c400872db7a5976f7",  "permissions": {    "diagnostics": ["view", "create", "update", "approve", "reject", "print"]  },  "modules": [    {      "id": 1,      "module_name": "Klinik",      "icon": "document-chart-bar",      "react_route": "/klinik",      "sortorder": 1,      "menus": [        {          "id": 1,          "menu_name": "Diagnostik",          "icon": "activity",          "sortorder": 1,          "submenus": [            {              "id": 1,              "name": "List Diagnostik",              "icon": "list",              "sortorder": 1            },            {              "id": 2,              "name": "Laporan Diagnostik",              "icon": "file-text",              "sortorder": 2            }          ]        }      ]    }  ]}
```

### Field Penting

Field

Tipe

Deskripsi

`exp`

`number`

Unix timestamp expiry (detik)

`sub`

`string`

User ID

`permissions`

`object`

Map module → array permission actions

`modules`

`array`

Daftar modul yang diizinkan (nested menus)

---

## Redux Store: AuthSlicer

**File:** `src/Store/redux/Auth/index.ts`

### State Interface

```typescript
interface AuthState {  BearerToken: string | null // JWT token string  user: Record<string, any> | null // Decoded JWT payload  defaultData: JWTPayload | null // Decoded JWT payload (alias)  modules: ModuleMenu[] // Parsed modules dari JWT  permissions: Permissions // Parsed permissions dari JWT}
```

### Actions

Action

Payload

Deskripsi

`setBearerToken`

`string | null`

Set token + auto-parse modules/permissions dari JWT

`clearBearerToken`

-

Clear semua auth state (logout)

`validateToken`

-

Cek apakah token expired, clear jika ya

`setDefaultUser`

`Record<string, any> | null`

Set decoded JWT data + sync modules/permissions

`setModules`

`ModuleMenu[]`

Update modules saja

`setPermissions`

`Permissions`

Update permissions saja

### Contoh Penggunaan

```typescript
import { useSelector, useDispatch } from 'react-redux'import { RootState } from '@/Store'import { setBearerToken, clearBearerToken } from '@/Store/redux/Auth'// Baca stateconst token = useSelector((state: RootState) => state.AuthSlicer.BearerToken)const modules = useSelector((state: RootState) => state.AuthSlicer.modules)const permissions = useSelector((state: RootState) => state.AuthSlicer.permissions)// Set token (otomatis parse modules/permissions)dispatch(setBearerToken('eyJ...'))// Logoutdispatch(clearBearerToken())
```

### Auto-Parse pada setBearerToken

Ketika `setBearerToken` dipanggil dengan token valid:

1.  Decode JWT payload menggunakan `decodeJWT()`
2.  Extract `modules[]` dari payload → simpan ke `state.modules`
3.  Extract `permissions{}` dari payload → simpan ke `state.permissions`
4.  Simpan decoded payload ke `state.user` dan `state.defaultData`
5.  Log informasi token ke console

Jika token expired, action akan di-ignore dan state di-clear.

---

## Service: tokenRefresh

**File:** `src/Services/tokenRefresh.ts`

Service utama untuk mengelola silent token refresh.

### Konstanta

Konstanta

Nilai

Deskripsi

`REFRESH_BUFFER_MS`

`600000` (10m)

Waktu sebelum expired untuk trigger refresh

`MIN_REFRESH_DELAY_MS`

`1000` (1s)

Minimum delay untuk setTimeout

### Fungsi Utama

#### `performTokenRefresh(): Promise<string | null>`

Melakukan refresh token ke backend. Menggunakan **promise lock** agar multiple caller mendapat result yang sama.

```typescript
import { performTokenRefresh } from '@/Services/tokenRefresh'const newToken = await performTokenRefresh()if (newToken) {  console.log('Token refreshed:', newToken)} else {  console.log('Refresh failed')}
```

**Cara kerja:**

1.  Cek apakah `refreshPromise` sudah ada (lock aktif)
2.  Jika ya → return promise yang sama (semua caller menunggu satu refresh)
3.  Jika tidak → buat promise baru, call `POST /auth/refresh`
4.  Berhasil → dispatch `setBearerToken(newToken)`, return token
5.  Gagal 401 → `clearBearerToken()`, redirect ke login
6.  Finally → release lock (`refreshPromise = null`)

#### `scheduleTokenRefresh(onRefreshSuccess?): void`

Jadwalkan silent refresh 10 menit sebelum token expired.

```typescript
import { scheduleTokenRefresh } from '@/Services/tokenRefresh'scheduleTokenRefresh((newToken, oldModules) => {  // Callback setelah refresh berhasil  console.log('New token:', newToken)  console.log('Old modules:', oldModules)})
```

**Cara kerja:**

1.  Clear timer sebelumnya
2.  Decode token untuk mendapatkan `exp`
3.  Hitung delay: `exp - now - 10 menit`
4.  Jika delay ≤ 0 → refresh sekarang
5.  Jika delay > 0 → `setTimeout(refreshFn, delay)`

#### `clearRefreshTimer(): void`

Clear timer refresh yang sedang berjalan.

```typescript
import { clearRefreshTimer } from '@/Services/tokenRefresh'clearRefreshTimer() // Saat logout atau unmount
```

### Fungsi Promise Lock

#### `getRefreshPromise(): Promise<string | null> | null`

Mendapatkan promise refresh yang sedang berjalan. Digunakan oleh interceptor.

#### `isRefreshing(): boolean`

Cek apakah sedang ada proses refresh.

### Fungsi Route Validation

#### `extractAllowedRoutes(modules): string[]`

Ekstrak semua route yang diizinkan dari modules JWT (termasuk nested menus dan submenus).

```typescript
import { extractAllowedRoutes } from '@/Services/tokenRefresh'const routes = extractAllowedRoutes(modules)// ['/klinik', '/klinik/diagnostik', '/klinik/diagnostik/list', '/klinik/diagnostik/laporan']
```

#### `isCurrentRouteAllowed(modules): boolean`

Cek apakah `window.location.pathname` masih diizinkan berdasarkan modules.

Route publik (`/`, `/login`, `/dashboard`, `/403`) selalu diizinkan.

```typescript
import { isCurrentRouteAllowed } from '@/Services/tokenRefresh'if (!isCurrentRouteAllowed(newModules)) {  // Redirect user}
```

#### `getFirstAllowedRoute(modules): string`

Dapatkan route pertama yang diizinkan. Fallback ke `/dashboard`.

```typescript
import { getFirstAllowedRoute } from '@/Services/tokenRefresh'const firstRoute = getFirstAllowedRoute(modules)// '/klinik/diagnostik' atau '/dashboard'
```

#### `hasModulesChanged(oldModules, newModules): boolean`

Bandingkan modules lama dan baru untuk mendeteksi perubahan route.

```typescript
import { hasModulesChanged } from '@/Services/tokenRefresh'if (hasModulesChanged(oldModules, newModules)) {  console.log('Modules changed!')}
```

---

## Hook: useTokenRefresh

**File:** `src/Hooks/useTokenRefresh.ts`

React hook yang mengintegrasikan silent refresh dengan React lifecycle.

### Penggunaan

```tsx
import { useTokenRefresh } from '@/Hooks/useTokenRefresh'const AppRoutes = () => {  useTokenRefresh()  return <Routes>{/* ... */}</Routes>}
```

### Fitur

Fitur

Deskripsi

Auto-schedule

Jadwalkan refresh saat token berubah

Auto-cleanup

Clear timer saat unmount atau token berubah

Route validation

Setelah refresh, cek apakah route aktif masih valid

Modal confirm

Tampilkan dialog konfirmasi sebelum redirect

Visibility re-schedule

Re-schedule refresh saat tab kembali aktif

Stale closure prevention

Gunakan refs untuk state terbaru

### Callback: handleRefreshSuccess

Dipanggil setelah refresh berhasil. Melakukan:

1.  Decode token baru → extract modules
2.  Bandingkan modules lama vs baru (`hasModulesChanged`)
3.  Jika berubah → cek route aktif (`isCurrentRouteAllowed`)
4.  Jika route tidak valid → tampilkan `Modal.confirm` dari Ant Design
5.  Redirect ke route pertama yang diizinkan (`getFirstAllowedRoute`)

### Dialog Confirm

Saat route tidak lagi diizinkan setelah refresh, user akan melihat:

```
┌─────────────────────────────────────────────┐│  ⚠️ Akses Berubah                            ││                                               ││  Hak akses Anda telah diperbarui.            ││  Halaman "/klinik/diagnostik" tidak lagi     ││  tersedia. Anda akan dialihkan ke halaman    ││  yang diizinkan.                             ││                                               ││                        [Batal]  [OK]         │└─────────────────────────────────────────────┘
```

> **Catatan:** Baik klik OK maupun Batal, user tetap akan di-redirect karena route sudah tidak valid.

---

## API Interceptor

**File:** `src/Services/api.tsx`

### Pre-Request Check

Sebelum setiap request, interceptor memeriksa:

1.  Apakah token ada?
2.  Apakah token expired?
3.  Jika expired → coba refresh dulu
4.  Jika refresh gagal → logout + redirect

```typescript
// Pre-requestif (token && isTokenExpired(token)) {  const newToken = await performTokenRefresh()  if (!newToken) {    dispatch(clearBearerToken())    window.location.href = '/'    return { error: { status: 401, data: { message: '...' } } }  }}
```

### Post-Request 401 Handling

Setelah request, jika response 401:

1.  Cek apakah sudah ada refresh berjalan (`isRefreshing()`)
2.  Jika ya → tunggu promise yang sama (`getRefreshPromise()`)
3.  Jika tidak → mulai refresh baru (`performTokenRefresh()`)
4.  Berhasil → retry request asli
5.  Gagal → logout + redirect

```typescript
// Post-request 401if (result.error?.status === 401) {  let newToken = isRefreshing() ? await getRefreshPromise() : await performTokenRefresh()  if (newToken) {    result = await baseQuery(args, api, extraOptions) // retry  } else {    dispatch(clearBearerToken())    window.location.href = '/'  }}
```

---

## Silent Refresh

### Mekanisme

-   Menggunakan `setTimeout` (bukan `setInterval`)
-   Dijadwalkan **10 menit sebelum token expired**
-   Setelah refresh berhasil, **re-schedule** untuk token baru
-   Timer di-clear saat logout atau komponen unmount

### Timeline

```
Token issued (iat)                    Refresh scheduled              Token expires (exp)    │                                       │                              │    ├───────────────────────────────────────┤──────────────────────────────┤    │           Token valid                 │    10 menit buffer           │    │                                       │                              │    │                                  Timer fires                         │    │                                  → refresh token                     │    │                                  → re-schedule                       │
```

### Contoh Perhitungan

```
Token exp: 2026-03-04 10:00:00 (UTC)Current:   2026-03-04 08:30:00 (UTC)Buffer:    10 menit = 600,000 msTime until refresh = (exp - now - buffer)                   = (10:00 - 08:30 - 00:10)                   = 1 jam 20 menit                   = 4,800,000 mssetTimeout(refreshFn, 4800000)→ Refresh akan terjadi pada 09:50:00
```

---

## Promise Lock (Race Condition)

### Problem

Tanpa lock, skenario berikut bisa terjadi:

```
Request A → 401 → refresh token → new token ARequest B → 401 → refresh token → new token B (token A sudah invalid!)Request C → 401 → refresh token → new token C (token B sudah invalid!)
```

### Solution

Dengan promise lock:

```
Request A → 401 → performTokenRefresh() → set refreshPromiseRequest B → 401 → isRefreshing() = true → await refreshPromiseRequest C → 401 → isRefreshing() = true → await refreshPromise                                              │                                              ▼                                    Semua mendapat token yang sama                                    Semua retry dengan token baru
```

### Implementasi

```typescript
let refreshPromise: Promise<string | null> | null = nullexport const performTokenRefresh = async () => {  // Lock: return promise yang sama jika sudah ada  if (refreshPromise) return refreshPromise  refreshPromise = (async () => {    try {      // ... refresh logic      return newToken    } finally {      refreshPromise = null // Release lock    }  })()  return refreshPromise}
```

---

## Visibility-Aware Scheduling

### Problem

Jika user membuka tab lain selama berjam-jam, silent refresh timer akan fire saat tab hidden. Ini membuang resource karena:

-   Browser mungkin throttle setTimeout di background tab
-   Tidak ada user interaction yang membutuhkan token valid

### Solution

1.  **Saat timer fires dan tab hidden** → skip refresh, pasang `visibilitychange` listener
2.  **Saat tab kembali visible** → trigger refresh
3.  **Saat ada API request di background** → interceptor yang handle (bukan silent refresh)

```typescript
const executeRefresh = async (onRefreshSuccess?) => {  // Skip jika tab tidak aktif  if (document.visibilityState === 'hidden') {    console.log('Tab hidden, skipping refresh')    // Re-schedule saat tab visible    const handler = () => {      if (document.visibilityState === 'visible') {        document.removeEventListener('visibilitychange', handler)        executeRefresh(onRefreshSuccess)      }    }    document.addEventListener('visibilitychange', handler)    return  }  // Tab visible → lakukan refresh  const newToken = await performTokenRefresh()  // ...}
```

### Hook: Visibility Re-schedule

Di `useTokenRefresh`, ada effect tambahan yang re-schedule refresh saat tab kembali aktif:

```typescript
useEffect(() => {  const handleVisibilityChange = () => {    if (document.visibilityState === 'visible' && tokenRef.current) {      scheduleTokenRefresh(handleRefreshSuccess)    }  }  document.addEventListener('visibilitychange', handleVisibilityChange)  return () => document.removeEventListener('visibilitychange', handleVisibilityChange)}, [handleRefreshSuccess])
```

---

## Route Validation & Redirect

### Kapan Terjadi

Route validation dilakukan **setelah setiap silent refresh berhasil**, bukan saat login.

### Alur

```
Refresh berhasil → decode token baru → extract modules baru    │    ▼hasModulesChanged(oldModules, newModules)?    │    ├─ NO → Selesai, tidak ada perubahan    │    └─ YES → isCurrentRouteAllowed(newModules)?        │        ├─ YES → Route masih valid, lanjut        │        └─ NO → Tampilkan Modal.confirm                 │                 ▼              getFirstAllowedRoute(newModules)                 │                 ▼              dispatch(setRoute(firstAllowed))              navigate(firstAllowed, { replace: true })
```

### Route Matching Logic

```typescript
// Route publik selalu diizinkanconst publicRoutes = ['/', '/login', '/dashboard', '/403']// Cek exact match atau prefix matchallowedRoutes.some((route) => currentPath === route || currentPath.startsWith(route + '/'))
```

### Contoh Skenario

**Sebelum refresh:**

-   Modules: `[{ react_route: '/klinik', menus: [{ react_route: '/klinik/diagnostik' }] }]`
-   User di: `/klinik/diagnostik`

**Setelah refresh (admin menghapus akses klinik):**

-   Modules: `[{ react_route: '/farmasi', menus: [...] }]`
-   Route `/klinik/diagnostik` tidak ada di modules baru
-   → Modal confirm → redirect ke `/farmasi` (route pertama yang diizinkan)

---

## Integrasi di App

**File:** `src/App.tsx`

```tsx
import { useTokenRefresh } from '@/Hooks/useTokenRefresh'const AppRoutes = () => {  // Aktifkan silent token refresh  useTokenRefresh()  return (    <Routes>      <Route path="/" element={<LoginContainer />} />      <Route path="/dashboard" element={<DashboardContainer />} />      <Route path="/klinik">        <Route index element={<DiagnostikContainer />} />        <Route path="diagnostik" element={<DiagnostikContainer />} />      </Route>      {/* ... */}    </Routes>  )}function App() {  return (    <Provider store={store}>      <AppRoutes />    </Provider>  )}
```

> **Penting:** `useTokenRefresh()` harus dipanggil di dalam komponen yang sudah di-wrap oleh `<Provider>` dan `<BrowserRouter>`.

---

## Konfigurasi

### Mengubah Buffer Refresh

Edit `REFRESH_BUFFER_MS` di `src/Services/tokenRefresh.ts`:

```typescript
// Default: 10 menit sebelum expiredconst REFRESH_BUFFER_MS = 10 * 60 * 1000// Ubah ke 5 menitconst REFRESH_BUFFER_MS = 5 * 60 * 1000// Ubah ke 15 menitconst REFRESH_BUFFER_MS = 15 * 60 * 1000
```

### Mengubah Route Publik

Edit `isCurrentRouteAllowed()` di `src/Services/tokenRefresh.ts`:

```typescript
const publicRoutes = ['/', '/login', '/dashboard', '/403']// Tambahkan route publik lain:const publicRoutes = ['/', '/login', '/dashboard', '/403', '/about', '/help']
```

### Mengubah Pesan Dialog

Edit `handleRefreshSuccess()` di `src/Hooks/useTokenRefresh.ts`:

```typescript
Modal.confirm({  title: 'Akses Berubah',  content: `Hak akses Anda telah diperbarui...`,  okText: 'OK',  cancelText: 'Batal',  // Kustomisasi di sini})
```

### Mengubah Refresh Endpoint

Edit `performTokenRefresh()` di `src/Services/tokenRefresh.ts`:

```typescript
const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {  method: 'POST',  headers: {    'Content-Type': 'application/json',    Authorization: `Bearer ${currentToken}`,  },})
```

---

## Troubleshooting

### Token tidak ter-refresh

**Gejala:** Token expired dan user di-logout tanpa refresh.

**Penyebab:**

1.  Endpoint `/auth/refresh` tidak tersedia atau error
2.  Token sudah expired sebelum timer fires
3.  Tab hidden saat timer fires dan tidak ada request masuk

**Solusi:**

-   Cek console log `[TokenRefresh]` untuk detail
-   Pastikan `VITE_API_URL` benar di `.env`
-   Pastikan endpoint refresh mengembalikan `{ token: '...' }`

### Multiple refresh terjadi

**Gejala:** Console menunjukkan beberapa refresh bersamaan.

**Penyebab:** Promise lock tidak bekerja (seharusnya tidak terjadi).

**Solusi:**

-   Cek apakah `refreshPromise` di-set null terlalu cepat
-   Cek console log `[TokenRefresh] Refresh already in progress, waiting...`

### Modules tidak ter-parse

**Gejala:** Sidebar kosong setelah login.

**Penyebab:**

1.  JWT payload tidak mengandung field `modules`
2.  Field bernama berbeda (misalnya `menus` bukan `modules`)

**Solusi:**

-   Decode token manual: `console.log(decodeJWT(token))`
-   Sesuaikan field name di `parseTokenData()` di `src/Store/redux/Auth/index.ts`

### Route validation terlalu agresif

**Gejala:** User di-redirect padahal seharusnya tidak.

**Penyebab:** Route matching logic terlalu strict.

**Solusi:**

-   Tambahkan route ke `publicRoutes` di `isCurrentRouteAllowed()`
-   Cek apakah `react_route` di modules sesuai dengan route di `App.tsx`

### Console log terlalu banyak

Semua log menggunakan prefix `[Auth]`, `[TokenRefresh]`, `[API]`, `[useTokenRefresh]` untuk memudahkan filtering di DevTools:

```
// Filter di Chrome DevTools Console:[TokenRefresh][Auth][API]
```

Untuk production, pertimbangkan menghapus atau menggunakan conditional logging:

```typescript
const isDev = import.meta.env.DEVif (isDev) console.log('[TokenRefresh] ...')
```