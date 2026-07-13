# 📚 Dokumentasi Project Diagnostik App

> Dokumentasi lengkap untuk aplikasi Diagnostik — sistem manajemen diagnostik kesehatan dengan fitur autentikasi JWT, manajemen user, role, institusi, dan alat diagnostik.

---

## 📋 Daftar Isi

- [Tentang Project](#tentang-project)
- [Struktur Dokumentasi](#struktur-dokumentasi)
- [Memulai Cepat](#memulai-cepat)
- [Arsitektur Aplikasi](#arsitektur-aplikasi)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Folder](#struktur-folder)

---

## 🏥 Tentang Project

**Diagnostik App** adalah aplikasi web untuk manajemen data diagnostik kesehatan yang terintegrasi dengan berbagai alat diagnostik. Aplikasi ini menyediakan antarmuka untuk mengelola hasil pemeriksaan pasien, administrasi user dan role, serta konfigurasi sistem.

### Kemampuan Utama

- 🔐 **Sistem Autentikasi** — Login aman dengan JWT Token + Silent Refresh
- 👥 **Manajemen User** — CRUD user dengan role dan institusi
- 🔑 **Manajemen Role & Hak Akses** — Permission berbasis JWT dengan checking frontend
- 🏢 **Manajemen Institusi** — Kelola data rumah sakit, puskesmas, klinik
- 🔧 **Manajemen Alat** — Kelola perangkat diagnostik
- 📊 **Dashboard** — Visualisasi data pemeriksaan dengan chart interaktif
- 🔬 **Modul Diagnostik** — Daftar & detail hasil pemeriksaan pasien

---

## 📂 Struktur Dokumentasi

Dokumentasi ini terdiri dari 19 file yang mencakup berbagai aspek aplikasi:

### 🔐 Autentikasi & Keamanan

| File                                                         | Deskripsi                                                                                                             |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| [JWTAuth.md](./JWTAuth.md)                                   | Dokumentasi sistem autentikasi JWT lengkap dengan silent token refresh, promise lock, dan visibility-aware scheduling |
| [JWTPermission.md](./JWTPermission.md)                       | Sistem hak akses berbasis JWT dengan permission checking frontend dan auto-refresh pada 403                           |
| [PermissionProtectedRoute.md](./PermissionProtectedRoute.md) | Protected route dengan pengecekan izin akses berdasarkan module dan permission                                        |

### 🖥️ Komponen UI

| File                                   | Deskripsi                                                                          |
| -------------------------------------- | ---------------------------------------------------------------------------------- |
| [TabMenu.md](./TabMenu.md)             | Komponen tab menu reusable dengan dukungan dropdown, badge, dan animated indicator |
| [ChartCard.md](./ChartCard.md)         | Komponen grafik reusable dengan filter tanggal dan toggle tipe chart               |
| [MainDashboard.md](./MainDashboard.md) | Dashboard utama dengan statistik pemeriksaan diagnostik                            |

### ⚙️ Modul Manajemen

| File                                         | Deskripsi                                                                     |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| [Users.md](./Users.md)                       | Modul manajemen user pada halaman Settings                                    |
| [Roles.md](./Roles.md)                       | Modul manajemen role dengan CRUD, toggle status, dan filter tab dinamis       |
| [Permissions.md](./Permissions.md)           | Modul pengaturan hak akses role terhadap resource sistem                      |
| [Institution.md](./Institution.md)           | Modul manajemen institusi (rumah sakit, puskesmas, klinik) dengan upload logo |
| [DeviceManagement.md](./DeviceManagement.md) | Modul manajemen alat diagnostik                                               |
| [Module.md](./Module.md)                     | Modul manajemen module/fitur aplikasi                                         |

### 🔬 Modul Diagnostik

| File                                                         | Deskripsi                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [Diagnostik.md](./Diagnostik.md)                             | Modul halaman diagnostik dengan detail parameter pemeriksaan |
| [DiagnostikAPIIntegration.md](./DiagnostikAPIIntegration.md) | Integrasi API untuk modul diagnostik                         |

### 🚪 Proteksi & Aktivasi

| File                                     | Deskripsi                                             |
| ---------------------------------------- | ----------------------------------------------------- |
| [ActivationGate.md](./ActivationGate.md) | Sistem aktivasi aplikasi sebelum akses ke fitur utama |

### 🔧 Pengembangan

| File                                             | Deskripsi                                               |
| ------------------------------------------------ | ------------------------------------------------------- |
| [TypeScriptFixes.md](./TypeScriptFixes.md)       | Perbaikan TypeScript untuk memastikan build berhasil    |
| [UserAPIIntegration.md](./UserAPIIntegration.md) | Dokumentasi integrasi API untuk manajemen user          |
| [UserManagement.md](./UserManagement.md)         | Dokumentasi modul manajemen user di halaman Institution |

---

## 🚀 Memulai Cepat

### Prerequisites

- Node.js 18+
- Yarn atau npm
- Backend API running

### Instalasi

```bash
# Install dependencies
yarn install

# Jalankan development server
yarn dev
```

### Konfigurasi Environment

Salin `.env.example` ke `.env` dan sesuaikan konfigurasi:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=Diagnostik App
```

---

## 🏗️ Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PermissionProvider                                   │   │
│  │  ┌───────────────────────────────────────────────┐   │   │
│  │  │  ProtectedRoute / PermissionProtectedRoute      │   │   │
│  │  │  ┌─────────────────────────────────────────┐   │   │   │
│  │  │  │  useTokenRefresh()                     │   │   │   │
│  │  │  │  - Silent refresh 10 menit sebelum expired│   │   │   │
│  │  │  │  - Promise lock untuk race condition    │   │   │   │
│  │  │  │  - Visibility-aware scheduling          │   │   │   │
│  │  │  └─────────────────────────────────────────┘   │   │   │
│  │  └───────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Alur Autentikasi

```
Login → JWT Token → Redux AuthSlicer → PermissionContext
                                      │
                                      ▼
API 403 → permissionEvents.emit() → Token Refresh → Retry Request
```

---

## ✨ Fitur Utama

### Sistem Autentikasi

- ✅ JWT Token dengan payload berisi modules dan permissions
- ✅ Silent token refresh (otomatis 10 menit sebelum expired)
- ✅ Promise lock untuk mencegah race condition
- ✅ Visibility-aware scheduling (skip refresh saat tab hidden)
- ✅ Route validation setelah refresh

### Sistem Hak Akses

- ✅ Permission checking berbasis JWT
- ✅ Komponen `<Can>` untuk conditional rendering
- ✅ Hook `usePermission()` untuk logic checking
- ✅ Auto-refresh permission pada 403
- ✅ Event-driven notification

### UI/UX

- ✅ Tab menu dengan dropdown dan animated indicator
- ✅ ChartCard dengan filter tanggal dan toggle Bar/Line
- ✅ DataTable dengan server-side pagination, search, sort
- ✅ Form modal dengan validasi dan error handling
- ✅ Responsive design dengan Tailwind CSS

---

## 🛠️ Tech Stack

| Teknologi           | Penggunaan                   |
| ------------------- | ---------------------------- |
| **React 18**        | UI Framework                 |
| **TypeScript**      | Type safety                  |
| **Redux Toolkit**   | State management + RTK Query |
| **React Router v6** | Routing                      |
| **Tailwind CSS**    | Styling                      |
| **Ant Design**      | UI Components                |
| **Recharts**        | Chart visualization          |
| **Vite**            | Build tool                   |

---

## 📁 Struktur Folder

```
src/
├── Components/           # React components
│   ├── Activation/     # Activation page
│   ├── Dashboard/      # Dashboard components
│   ├── Diagnostik/     # Diagnostic modules
│   ├── General/        # Reusable components (TabMenu, DataTable, dll)
│   ├── Layout/         # App layout (Header, Sidebar)
│   ├── Management/     # Management modules
│   ├── Setting/        # Settings pages
│   └── Status/         # Status components
├── Config/             # Configuration files
├── Containers/        # Page containers
├── Helpers/           # Utility functions
├── Hooks/             # Custom React hooks
├── Services/          # API services (RTK Query)
│   └── Modules/       # Feature modules
└── Store/             # Redux store
```

---

## 📖 Cara Menggunakan Dokumentasi

1. **Untuk Pemula**: Mulai dari [JWTAuth.md](./JWTAuth.md) untuk memahami sistem autentikasi
2. **Untuk Developer**: Lihat [PermissionProtectedRoute.md](./PermissionProtectedRoute.md) untuk proteksi route
3. **Untuk UI Development**: Referensi [TabMenu.md](./TabMenu.md) dan [ChartCard.md](./ChartCard.md)
4. **Untuk Backend Integration**: Lihat [DiagnostikAPIIntegration.md](./DiagnostikAPIIntegration.md)
5. **Untuk Troubleshooting**: Lihat [TypeScriptFixes.md](./TypeScriptFixes.md)

---

## 🔗 Links

- [Repository](./)
- [Issue Tracker](./)
- [API Documentation](./docs/DiagnostikAPIIntegration.md)

---

<div align="center">

**Diagnostik App** — Built with ❤️ using React + TypeScript

</div>
