# 🛡️ Permission Protected Route — Dokumentasi Protected Route dengan Pengecekan Izin Akses

> Komponen protected route yang memeriksa izin akses user berdasarkan module dan permission dari Redux store. Jika user tidak memiliki akses, akan ditampilkan halaman "Akses Ditolak".

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [File & Struktur](#file--struktur)
- [Komponen yang Tersedia](#komponen-yang-tersedia)
- [PermissionProtectedRoute](#permissionprotectedroute)
- [Cara Penggunaan](#cara-penggunaan)
- [Contoh Penggunaan](#contoh-penggunaan)
- [Integrasi dengan App.tsx](#integrasi-dengan-apptsx)
- [Data dari Redux Store](#data-dari-redux-store)
- [Halaman UnauthorizedAccess](#halaman-unauthorizedaccess)
- [Troubleshooting](#troubleshooting)

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           App.tsx                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    PermissionProtectedRoute                             │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  1. useActivation() → cek status aktivasi                     │  │  │
│  │  │     ├─ isLoading = true → LoadingScreen                        │  │  │
│  │  │     ├─ is_active = false → Redirect /activation               │  │  │
│  │  │     └─ is_active = true → Lanjut cek permission               │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  2. Redux Store (AuthSlicer)                                  │  │  │
│  │  │     ├─ modules: ModuleMenu[] → cek akses module                │  │  │
│  │  │     └─ permissions: Permissions → cek akses permission         │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  3. Cek Akses                                                  │  │  │
│  │  │     ├─ requiredModuleRoute → hasModuleAccess(modules, route)  │  │  │
│  │  │     └─ requiredPermission → permissions[resource]?.includes() │  │  │
│  │  │                                                                       │  │
│  │  │     ├─ Akses DITERIMA → Render children                        │  │  │
│  │  │     └─ akses DITOLAK → <UnauthorizedAccess />                  │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Alur Pengecekan

```
User mengakses halaman
        │
        ▼
Cek status aktivasi (useActivation)
        │
        ├─ Loading → Tampilkan LoadingScreen
        │
        ├─ Belum aktif → Redirect ke /activation
        │
        └─ Sudah aktif → Lanjut cek permission
                │
                ▼
Cek login status (Redux BearerToken)
                │
                ├─ Belum login → Redirect ke /login
                │
                └─ Sudah login → Lanjut cek module/permission
                        │
                        ▼
Cek requiredModuleRoute (jika ada)
        │
        ├─ User punya akses → Lanjut
        │
        └─ User tidak punya akses → Tampilkan UnauthorizedAccess
                │
                ▼
Cek requiredPermission (jika ada)
        │
        ├─ User punya permission → Render children
        │
        └─ User tidak punya permission → Tampilkan UnauthorizedAccess
```

---

## File & Struktur

```
src/
├── Config/
│   └── ProtectedRoute.tsx        # Semua protected route components
│
├── Store/redux/
│   └── Auth/
│       └── index.ts              # AuthSlicer (modules, permissions)
│
├── Services/Modules/auth/
│   └── auth.types.ts              # Type definitions (ModuleMenu, Permissions)
│
└── App.tsx                      # Konfigurasi routing
```

---

## Komponen yang Tersedia

| Komponen                   | Deskripsi                                                    |
| -------------------------- | ------------------------------------------------------------ |
| `ProtectedRoute`           | Cek aktivasi saja (redirect ke /activation jika belum aktif) |
| `PublicActivationRoute`    | Halaman publik yang hanya bisa diakses jika BELUM aktif      |
| `PermissionProtectedRoute` | Cek aktivasi + module + permission (fitur lengkap)           |
| `UnauthorizedAccess`       | Halaman "Akses Ditolak" yang ditampilkan jika akses ditolak  |

---

## PermissionProtectedRoute

**File:** `src/Config/ProtectedRoute.tsx`

### Interface Props

```tsx
interface PermissionProtectedRouteProps {
  children: React.ReactNode
  /**
   * Route/module yang diperlukan untuk mengakses halaman ini.
   * Contoh: '/diagnostik', '/setting', '/manage/user'
   * Akan dicek apakah user memiliki module dengan react_route ini.
   */
  requiredModuleRoute?: string

  /**
   * Permission yang diperlukan (opsional).
   * Jika diisi, akan dicek apakah user memiliki permission ini.
   * Contoh: { resource: 'diagnostics', action: 'view' }
   */
  requiredPermission?: {
    resource: string
    action: string
  }
}
```

### Props Reference

| Prop                  | Tipe                                   | Wajib | Deskripsi                                        |
| --------------------- | -------------------------------------- | ----- | ------------------------------------------------ |
| `children`            | `React.ReactNode`                      | ✅    | Komponen yang akan dirender jika akses diberikan |
| `requiredModuleRoute` | `string`                               | ❌    | Route module yang diperlukan                     |
| `requiredPermission`  | `{ resource: string, action: string }` | ❌    | Permission resource dan action yang diperlukan   |

### Helper Function: hasModuleAccess

```tsx
const hasModuleAccess = (modules: ModuleMenu[], route: string): boolean => {
  return modules.some((module) => {
    // Cek langsung match dengan module route
    if (module.react_route === route) return true

    // Cek match dengan menu dalam module
    return module.menus?.some((menu) => {
      if (menu.react_route === route) return true

      // Cek match dengan submenu
      return menu.submenus?.some((submenu) => submenu.react_route === route)
    })
  })
}
```

---

## Cara Penggunaan

### 1. Cek Berdasarkan Module Route

Cek apakah user memiliki akses ke module tertentu berdasarkan `react_route` di JWT:

```tsx
<PermissionProtectedRoute requiredModuleRoute="/diagnostik">
  <DiagnostikContainer />
</PermissionProtectedRoute>
```

### 2. Cek Berdasarkan Permission Tertentu

Cek apakah user memiliki permission spesifik (resource + action):

```tsx
<PermissionProtectedRoute requiredPermission={{ resource: 'diagnostics', action: 'view' }}>
  <DiagnostikContainer />
</PermissionProtectedRoute>
```

### 3. Kombinasi Module Route dan Permission

Cek kedua-nya, user harus memiliki module DAN permission:

```tsx
<PermissionProtectedRoute
  requiredModuleRoute="/diagnostik"
  requiredPermission={{ resource: 'diagnostics', action: 'view' }}
>
  <DiagnostikContainer />
</PermissionProtectedRoute>
```

### 4. Tanpa Pengecekan (Hanya Aktivasi)

Sama seperti `ProtectedRoute` biasa:

```tsx
<PermissionProtectedRoute>
  <DashboardContainer />
</PermissionProtectedRoute>
```

---

## Contoh Penggunaan

### Contoh 1: Halaman Diagnostik

```tsx
// App.tsx
import { PermissionProtectedRoute } from '@/Config/ProtectedRoute'
import DiagnostikContainer from '@/Containers/Diagnostik/DiagnostikContainer'

;<Route
  path="/diagnostik"
  element={
    <PermissionProtectedRoute requiredModuleRoute="/diagnostik">
      <DiagnostikContainer />
    </PermissionProtectedRoute>
  }
/>
```

### Contoh 2: Halaman dengan Permission View

```tsx
<Route
  path="/diagnostik/list"
  element={
    <PermissionProtectedRoute
      requiredModuleRoute="/diagnostik"
      requiredPermission={{ resource: 'diagnostics', action: 'view' }}
    >
      <DiagnostikList />
    </PermissionProtectedRoute>
  }
/>
```

### Contoh 3: Halaman dengan Permission Create

```tsx
<Route
  path="/diagnostik/create"
  element={
    <PermissionProtectedRoute requiredPermission={{ resource: 'diagnostics', action: 'create' }}>
      <DiagnostikForm />
    </PermissionProtectedRoute>
  }
/>
```

### Contoh 4: Halaman Settings dengan Multiple Modules

```tsx
<Route
  path="/setting"
  element={
    <PermissionProtectedRoute requiredModuleRoute="/setting">
      <SettingContainer />
    </PermissionProtectedRoute>
  }
/>
```

### Contoh 5: Multiple Routes (Array)

Untuk saat ini, satu `requiredModuleRoute` hanya menerima satu route. Jika butuh multiple routes, gunakan kondisi di dalam komponen atau buat wrapper terpisah:

```tsx
// Alternatif: Cek manual di dalam komponen
const MyComponent = () => {
  const modules = useSelector((state: RootState) => state.AuthSlicer.modules)

  const canAccessDiagnostik = hasModuleAccess(modules, '/diagnostik')
  const canAccessSettings = hasModuleAccess(modules, '/setting')

  if (!canAccessDiagnostik && !canAccessSettings) {
    return <UnauthorizedAccess />
  }

  return <MyContent />
}
```

---

## Integrasi dengan App.tsx

### Langkah 1: Import Komponen

```tsx
// src/App.tsx
import { ProtectedRoute, PublicActivationRoute, PermissionProtectedRoute } from '@/Config/ProtectedRoute'
```

### Langkah 2: Konfigurasi Routes

```tsx
const AppRoutes = () => {
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

      {/* Protected Routes dengan Permission */}
      <Route
        path="/dashboard"
        element={
          <PermissionProtectedRoute>
            <DashboardContainer />
          </PermissionProtectedRoute>
        }
      />

      <Route
        path="/diagnostik"
        element={
          <PermissionProtectedRoute requiredModuleRoute="/diagnostik">
            <DiagnostikContainer />
          </PermissionProtectedRoute>
        }
      />

      <Route
        path="/diagnostik/list"
        element={
          <PermissionProtectedRoute
            requiredModuleRoute="/diagnostik"
            requiredPermission={{ resource: 'diagnostics', action: 'view' }}
          >
            <DiagnostikList />
          </PermissionProtectedRoute>
        }
      />

      <Route
        path="/setting"
        element={
          <PermissionProtectedRoute requiredModuleRoute="/setting">
            <SettingContainer />
          </PermissionProtectedRoute>
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

## Data dari Redux Store

### AuthSlicer State

PermissionProtectedRoute membaca data dari Redux store `AuthSlicer`:

```tsx
// Di dalam komponen
const permissions = useSelector((state: RootState) => state.AuthSlicer?.permissions ?? {})
const modules = useSelector((state: RootState) => state.AuthSlicer?.modules ?? [])
const isLoggedIn = useSelector((state: RootState) => !!state.AuthSlicer?.BearerToken)
```

### Format Data Modules

```tsx
// modules: ModuleMenu[]
interface ModuleMenu {
  id: number
  module_name: string
  icon: string
  react_route: string
  sortorder: number
  menus: {
    id: number
    menu_name: string
    icon: string
    react_route: string
    sortorder: number
    submenus?: {
      id: number
      name: string
      icon: string
      react_route: string
      sortorder: number
    }[]
  }[]
}
```

### Format Data Permissions

```tsx
// permissions: Permissions
interface Permissions {
  [resource: string]: string[]  // resource -> array of actions
}

// Contoh:
{
  "diagnostics": ["view", "create", "update", "approve", "reject", "print"],
  "users": ["view", "create", "update", "delete"],
  "devices": ["view", "create", "update"]
}
```

### Cara Kerja Parse Data

Ketika user login, JWT token di-decode dan data disimpan ke Redux:

```tsx
// Di AuthSlicer (setBearerToken action)
dispatch(setBearerToken(token))
// 1. Decode JWT payload
// 2. Extract modules[] → state.modules
// 3. Extract permissions{} → state.permissions
```

---

## Halaman UnauthorizedAccess

**Komponen:** `UnauthorizedAccess`

Ditampilkan ketika user tidak memiliki akses ke halaman yang diminta.

### Struktur UI

```
┌─────────────────────────────────────────────┐
│                                             │
│         🔒                                  │
│                                             │
│         Akses Ditolak                       │
│                                             │
│   Anda tidak diizinkan untuk                │
│   mengakses halaman ini.                    │
│                                             │
│   Silakan hubungi administrator             │
│   jika Anda membutuhkan akses.              │
│                                             │
│   ┌─────────────────────────────────────┐  │
│   │           Kembali                    │  │
│   └─────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### Implementasi

```tsx
const UnauthorizedAccess: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
        <p className="text-gray-600 mb-4">Anda tidak diizinkan untuk mengakses halaman ini.</p>
        <p className="text-sm text-gray-500 mb-6">
          Silakan hubungi administrator jika Anda membutuhkan akses.
        </p>
        <button
          onClick={() => window.history.back()}
          className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors"
        >
          Kembali
        </button>
      </div>
    </div>
  </div>
)
```

---

## Troubleshooting

### Masalah: User tidak bisa akses halaman meskipun sudah punya module

**Penyebab:** Format `react_route` di JWT tidak cocok dengan yang diharapkan.

**Solusi:** Cek format `react_route` di JWT payload:

```json
{
  "modules": [
    {
      "module_name": "Diagnostik",
      "react_route": "/diagnostik",  // ← Pastikan format ini yang digunakan
      "menus": [...]
    }
  ]
}
```

### Masalah: Permission tidak bekerja

**Penyebab:** Format `permissions` di JWT tidak cocok.

**Solusi:** Cek format permissions di JWT:

```json
{
  "permissions": {
    "diagnostics": ["view", "create", "update", "approve", "reject", "print"]
  }
}
```

Pastikan menggunakan format `resource: [actions]` bukan action-only array.

### Masalah: Selalu redirect ke Unauthorized

**Penyebab:** Redux store tidak memiliki data modules/permissions.

**Solusi:** Pastikan user sudah login dan JWT token sudah di-decode dengan benar:

```tsx
// Cek di console
console.log('Modules:', modules)
console.log('Permissions:', permissions)
```

### Masalah: Console warning "User tidak memiliki akses ke module"

**Ini adalah Perilaku Normal.** Komponen akan menampilkan warning di console saat akses ditolak, tapi ini tidak mempengaruhi fungsionalitas.

---

## Best Practices

1. **Gunakan requiredModuleRoute** untuk cek akses dasar ke module
2. **Gunakan requiredPermission** untuk fitur yang butuh permission spesifik
3. **Gunakan kombinasi** keduanya untuk keamanan lebih
4. **Tambahkan fallback** dengan menampilkan UI yang berbeda jika tidak punya akses (opsional)

### Contoh Kombinasi dengan UI Condition

```tsx
// Jika ingin menampilkan UI berbeda (bukan block total)
const DiagnostikPage = () => {
  const { can } = usePermission('diagnostics')

  if (!can('view')) {
    return <div>Anda tidak punya akses untuk melihat halaman ini</div>
  }

  return <DiagnostikContent />
}
```

---

## Referensi

- [ActivationGate.md](./ActivationGate.md) - Dokumentasi sistem aktivasi
- [JWTAuth.md](./JWTAuth.md) - Dokumentasi sistem autentikasi JWT
- [JWTPermission.md](./JWTPermission.md) - Dokumentasi sistem permission
