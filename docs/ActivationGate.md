# 🔐 Activation Gate — Dokumentasi Sistem Aktivasi Aplikasi

> Modul untuk mengelola aktivasi aplikasi sebelum pengguna dapat mengakses fitur-fitur utama. Sistem ini memerlukan kode aktivasi yang divalidasi melalui API sebelum memberikan akses ke halaman-halaman protected.

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [File & Struktur](#file--struktur)
- [API Endpoints](#api-endpoints)
- [Komponen: ActivationPage](#komponen-activationpage)
- [Hook: useActivation](#hook-useactivation)
- [Komponen: ProtectedRoute](#komponen-protectedroute)
- [Konfigurasi Routing](#konfigurasi-routing)
- [LocalStorage Cache](#localstorage-cache)
- [Integrasi di App](#integrasi-di-app)
- [Contoh Penggunaan](#contoh-penggunaan)

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              App.tsx                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ProtectedRoute                                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  useActivation()                                           │   │   │
│  │  │  ├─ GET /activate → cek status aktivasi                   │   │   │
│  │  │  ├─ localStorage: activation_status_cache                  │   │   │
│  │  │  └─ State: isActive, activatedAt, isLoading, isError      │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                              │                                          │   │
│  │         ┌────────────────────┼────────────────────┐                 │   │
│  │         ▼                    ▼                    ▼                 │   │
│  │  ┌─────────────┐    ┌─────────────────┐    ┌──────────┐        │   │
│  │  │ is_active   │    │   isLoading     │    │  isError │        │   │
│  │  │    = true   │    │    = true       │    │  = true  │        │   │
│  │  └──────┬──────┘    └────────┬────────┘    └─────┬────┘        │   │
│  │         │                     │                    │               │   │
│  │         ▼                     ▼                    ▼               │   │
│  │  Render Children      Loading Screen         Error +              │   │
│  │  (/dashboard)         (Spinner)             Retry               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  PublicActivationRoute                                               │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  useActivation() → GET /activate                           │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                              │                                      │   │
│  │         ┌────────────────────┼────────────────────┐                 │   │
│  │         ▼                    ▼                                         │   │
│  │  ┌─────────────┐    ┌─────────────────┐                             │   │
│  │  │ is_active   │    │   is_active     │                             │   │
│  │  │    = true   │    │    = false      │                             │   │
│  │  └──────┬──────┘    └────────┬────────┘                             │   │
│  │         │                     │                                       │   │
│  │         ▼                     ▼                                       │   │
│  │  Redirect to         Render ActivationPage                          │   │
│  │  /dashboard         (Form input kode aktivasi)                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Alur Data

```
Akses Halaman Protected (/dashboard)
    │
    ▼
ProtectedRoute
    │
    ▼
useActivation() → GET /activate
    │
    ├─ localStorage ada? →ambil cache
    │         │
    │         ▼
    │    is_active: true → Render children
    │    is_active: false → Redirect /activation
    │
    └─ localStorage kosong? → API call
              │
              ▼
         Response: { status, is_active, activated_at, message }
              │
              ├─ is_active: true
              │    → Simpan ke localStorage
              │    → Render children
              │
              └─ is_active: false
                   → Redirect /activation
```

---

## File & Struktur

```
src/
├── Components/
│   └── Activation/
│       └── ActivationPage.tsx        # Halaman form aktivasi
│
├── Hooks/
│   └── useActivation.ts              # Custom hook untuk cek & aktivasi
│
├── Config/
│   └── ProtectedRoute.tsx            # ProtectedRoute & PublicActivationRoute
│
├── Services/
│   ├── Modules/
│   │   └── activation/
│   │       ├── activation.types.ts   # Type definitions
│   │       ├── index.ts              # RTK Query API service
│   │       └── endpoints/
│   │           ├── index.ts         # Export endpoints
│   │           ├── getActivation.ts  # GET /activate
│   │           └── postActivation.ts # POST /activate
│   └── api.tsx                       # Base API configuration
│
└── App.tsx                          # Routing configuration
```

---

## API Endpoints

### GET /activate

Mengecek status aktivasi aplikasi.

**Response (Sudah Aktif):**

```json
{
  "status": "success",
  "is_active": true,
  "activated_at": "2026-03-09T10:30:00.000Z",
  "message": "Aplikasi sudah diaktifkan"
}
```

**Response (Belum Aktif):**

```json
{
  "status": "success",
  "is_active": false,
  "activated_at": null,
  "message": "Aplikasi belum diaktifkan. Silakan masukkan kode aktivasi."
}
```

### POST /activate

Meredeem kode aktivasi untuk mengaktifkan aplikasi.

**Request Body:**

```json
{
  "activation_code": "XXXX-XXXX-XXXX-XXXX"
}
```

**Response (Sukses):**

```json
{
  "status": "success",
  "message": "Aktivasi berhasil",
  "activated_at": "2026-03-09T10:30:00.000Z"
}
```

**Response (Gagal):**

```json
{
  "status": "error",
  "message": "Kode aktivasi tidak valid atau sudah kedaluwarsa"
}
```

---

## Komponen: ActivationPage

**File:** `src/Components/Activation/ActivationPage.tsx`

Halaman form input kode aktivasi dengan fitur auto-format XXXX-XXXX-XXXX-XXXX.

### Fitur

| Fitur            | Deskripsi                                       |
| ---------------- | ----------------------------------------------- |
| 🔢 Auto-format   | Input otomatis format XXXX-XXXX-XXXX-XXXX       |
| ⏳ Loading State | Spinner saat submit kode aktivasi               |
| ❌ Error State   | Tampilkan pesan error jika aktivasi gagal       |
| ✅ Success State | Tampilkan pesan sukses + redirect ke dashboard  |
| ↩️ Auto-redirect | Setelah sukses, otomatis redirect ke /dashboard |

### State Management

```tsx
const [activationCode, setActivationCode] = useState('')
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [success, setSuccess] = useState(false)
```

### Auto-format Logic

```tsx
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value.replace(/\D/g, '') // Hapus non-digits
  value = value.substring(0, 16) // Maks 16 karakter

  // Format: XXXX-XXXX-XXXX-XXXX
  const formatted = value
    .replace(/(\w{4})(\w)/, '$1-$2')
    .replace(/(\w{4})-(\w{4})(\w)/, '$1-$2-$3')
    .replace(/(\w{4})-(\w{4})-(\w{4})(\w)/, '$1-$2-$3-$4')

  setActivationCode(formatted)
}
```

### Props

Komponen ini tidak menerima props eksternal (self-contained).

### Contoh Penggunaan

```tsx
import ActivationPage from '@/Components/Activation/ActivationPage'

// Di dalam routing
;<Route
  path="/activation"
  element={
    <PublicActivationRoute>
      <ActivationPage />
    </PublicActivationRoute>
  }
/>
```

---

## Hook: useActivation

**File:** `src/Hooks/useActivation.ts`

Custom hook untuk mengelola status aktivasi aplikasi.

### Fitur

- ✅ Cek status aktivasi saat app pertama load
- ✅ Cache status di localStorage
- ✅ Submit kode aktivasi
- ✅ Loading & error states
- ✅ Manual refresh/refetch

### Return Value

| Property      | Tipe                        | Deskripsi                        |
| ------------- | --------------------------- | -------------------------------- |
| `isActive`    | `boolean \| null`           | Status aktivasi (null = loading) |
| `activatedAt` | `string \| null`            | Tanggal aktivasi                 |
| `message`     | `string`                    | Pesan dari API                   |
| `isLoading`   | `boolean`                   | Loading state cek status         |
| `isError`     | `boolean`                   | Error state                      |
| `error`       | `any`                       | Error object                     |
| `activate`    | `(code: string) => Promise` | Fungsi submit kode aktivasi      |
| `refetch`     | `() => void`                | Refresh status aktivasi          |

### Penggunaan

```tsx
import { useActivation } from '@/Hooks/useActivation'

const MyComponent = () => {
  const { isActive, activatedAt, message, isLoading, isError, error, activate, refetch } = useActivation()

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Error state
  if (isError) {
    return <ErrorMessage error={error} onRetry={refetch} />
  }

  // Cek status aktivasi
  if (isActive === false) {
    return <Redirect to="/activation" />
  }

  // Aktif - render children
  return <Dashboard />
}
```

### LocalStorage Cache

Status aktivasi di-cache di localStorage dengan key `activation_status_cache`:

```ts
// Struktur cache
{
  is_active: boolean,
  activated_at: string | null,
  message: string,
  cached_at: string // ISO timestamp
}
```

**Alur cache:**

1. Saat GET /activate berhasil, simpan ke localStorage
2. Saat app load, cek localStorage dulu sebelum API call
3. Jika cache ada dan masih fresh, gunakan data cache
4. Jika cache expired atau tidak ada, fetch dari API

---

## Komponen: ProtectedRoute

**File:** `src/Config/ProtectedRoute.tsx`

Komponen untuk melindungi routes yang membutuhkan aktivasi.

### ProtectedRoute

Wrap halaman yang butuh aktivasi. Redirect ke `/activation` jika `is_active: false`.

```tsx
interface ProtectedRouteProps {
  children: React.ReactNode
}
```

### PublicActivationRoute

Halaman aktivasi itu sendiri. Redirect ke `/dashboard` jika sudah aktif.

```tsx
interface PublicActivationRouteProps {
  children: React.ReactNode
}
```

### State Flow

```
ProtectedRoute
    │
    ▼
useActivation() → GET /activate
    │
    ├─ isLoading = true → Loading Screen
    │
    ├─ is_active = true → Render children
    │
    ├─ is_active = false → Redirect /activation
    │
    └─ isError = true → Error + Retry Button
```

### Loading Screen

```tsx
// Tampilkan saat cek status aktivasi
<div className="flex items-center justify-center min-h-screen">
  <div className="text-center">
    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
    <p className="mt-4 text-neutral-600">Memeriksa status aktivasi...</p>
  </div>
</div>
```

### Contoh Penggunaan

```tsx
import { ProtectedRoute, PublicActivationRoute } from '@/Config/ProtectedRoute'
import ActivationPage from '@/Components/Activation/ActivationPage'
import DashboardContainer from '@/Containers/Dashboard/DashboardContainer'

// Di dalam Routes
;<Routes>
  {/* Route yang butuh aktivasi */}
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <DashboardContainer />
      </ProtectedRoute>
    }
  />

  {/* Route publik untuk aktivasi */}
  <Route
    path="/activation"
    element={
      <PublicActivationRoute>
        <ActivationPage />
      </PublicActivationRoute>
    }
  />
</Routes>
```

---

## Konfigurasi Routing

**File:** `src/App.tsx`

### Struktur Routing

```tsx
const AppRoutes = () => {
  useTokenRefresh()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginContainer />} />

      {/* Activation Route - Public */}
      <Route
        path="/activation"
        element={
          <PublicActivationRoute>
            <ActivationPage />
          </PublicActivationRoute>
        }
      />

      {/* Protected Routes - Butuh aktivasi */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardContainer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/diagnostik"
        element={
          <ProtectedRoute>
            <DiagnostikContainer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manage/user"
        element={
          <ProtectedRoute>
            <UserContainer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/setting"
        element={
          <ProtectedRoute>
            <SettingContainer />
          </ProtectedRoute>
        }
      />

      {/* 403 Forbidden */}
      <Route path="/403" element={<ForbiddenAccess />} />

      {/* 404 Not Found */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
```

---

## LocalStorage Cache

### Key

```
activation_status_cache
```

### Struktur Data

```typescript
interface ActivationCache {
  is_active: boolean
  activated_at: string | null
  message: string
  cached_at: string // ISO timestamp
}
```

### Fungsi Bantu

```ts
// Simpan cache
const saveActivationCache = (data: ActivationResponse) => {
  localStorage.setItem(
    'activation_status_cache',
    JSON.stringify({
      ...data,
      cached_at: new Date().toISOString(),
    }),
  )
}

// Ambil cache
const getActivationCache = (): ActivationCache | null => {
  const cached = localStorage.getItem('activation_status_cache')
  return cached ? JSON.parse(cached) : null
}

// Hapus cache
const clearActivationCache = () => {
  localStorage.removeItem('activation_status_cache')
}
```

---

## Integrasi di App

### Setup di App.tsx

```tsx
import React from 'react'
import { Provider } from 'react-redux'
import { Route, Routes, Navigate } from 'react-router-dom'
import { store } from './Store'
import { PermissionProvider } from '@/Permissions'

// Components
import { ProtectedRoute, PublicActivationRoute } from '@/Config/ProtectedRoute'
import ActivationPage from '@/Components/Activation/ActivationPage'
import { LoginContainer, DashboardContainer, DiagnostikContainer, UserContainer } from './Containers'
import SettingContainer from './Containers/Setting/SettingContainer'

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Login - Public */}
      <Route path="/login" element={<LoginContainer />} />

      {/* Activation - Public (jika belum aktif) */}
      <Route
        path="/activation"
        element={
          <PublicActivationRoute>
            <ActivationPage />
          </PublicActivationRoute>
        }
      />

      {/* Protected Routes - Butuh aktivasi */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardContainer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/diagnostik"
        element={
          <ProtectedRoute>
            <DiagnostikContainer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manage/user"
        element={
          <ProtectedRoute>
            <UserContainer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/setting"
        element={
          <ProtectedRoute>
            <SettingContainer />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Provider store={store}>
      <PermissionProvider>
        <AppRoutes />
      </PermissionProvider>
    </Provider>
  )
}

export default App
```

---

## Contoh Penggunaan

### 1. Akses Halaman Tanpa Aktivasi

```
1. User membuka http://localhost:5173/dashboard
2. ProtectedRoute menangkap request
3. useActivation() dipanggil → GET /activate
4. Response: is_active = false
5. Redirect ke /activation
6. Tampilkan ActivationPage
```

### 2. Aktivasi Aplikasi

```
1. User berada di halaman /activation
2. User input kode: 1234-5678-9012-3456
3. Auto-format: 1234-5678-9012-3456
4. User klik "Aktivasi"
5. POST /activate dengan { activation_code: "1234-5678-9012-3456" }
6. Response: { status: "success", activated_at: "..." }
7. Simpan ke localStorage
8. Tampilkan pesan sukses
9. Redirect ke /dashboard
```

### 3. Akses Setelah Aktivasi

```
1. User membuka http://localhost:5173/dashboard
2. ProtectedRoute menangkap request
3. useActivation() cek localStorage
4. Cache ada: is_active = true
5. Langsung render children (/dashboard)
```

### 4. Refresh Status Aktivasi

```
1. User klik "Periksa Status" di halaman aktivasi
2. useActivation().refetch() dipanggil
3. GET /activate → Response terbaru
4. Update state dan localStorage
5. Jika sudah aktif → redirect ke dashboard
```

---

## Troubleshooting

### Kode Aktivasi Tidak Valid

**Gejala:** Error "Kode aktivasi tidak valid"

**Solusi:**

- Periksa format kode (XXXX-XXXX-XXXX-XXXX)
- Hubungi admin untuk kode yang valid
- Periksa endpoint API di backend

### Cache Expired

**Gejala:** Tiba-tiba redirect ke /activation padahal sudah aktif

**Solusi:**

- localStorage mungkin corrupt atau expire
- Klik "Periksa Status" untuk refresh
- Clear cache manual di browser console: `localStorage.removeItem('activation_status_cache')`

### Loading Terus Menerus

**Gejala:** Loading spinner tidak hilang

**Solusi:**

- Periksa koneksi internet
- Periksa endpoint API /activate
- Check console untuk error detail

### Loop Redirect

**Gejala:** Redirect bolak-balik antara /dashboard dan /activation

**Solusi:**

- Periksa logic di ProtectedRoute
- Pastikan GET /activate mengembalikan response yang konsisten
- Check localStorage tidak dalam state corrupt
