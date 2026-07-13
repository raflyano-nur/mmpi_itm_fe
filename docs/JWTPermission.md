# 🔐 JWT Permission System — Dokumentasi Sistem Hak Akses Berbasis JWT

> Sistem autentikasi dan otorisasi berbasis JWT dengan permission checking frontend, auto-refresh token pada 403, dan event-driven notification.

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [File & Struktur](#file--struktur)
- [Konsep Dasar](#konsep-dasar)
- [JWT Token Payload](#jwt-token-payload)
- [PermissionContext](#permissioncontext)
- [Hook: usePermission](#hook-usepermission)
- [Component: Can](#component-can)
- [API Interceptor 403](#api-interceptor-403)
- [Permission Events](#permission-events)
- [Quick Start](#quick-start)
- [Contoh Penggunaan](#contoh-penggunaan)
- [Konfigurasi](#konfigurasi)
- [Troubleshooting](#troubleshooting)

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           App.tsx                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  PermissionProvider                                               │  │
│  │  ┌───────────────────────────────────────────────────────────┐   │  │
│  │  │  PermissionContext (membaca dari Redux AuthSlicer)        │   │  │
│  │  │                                                            │   │  │
│  │  │  ┌─ usePermission(resource)                             │   │  │
│  │  │  │  ├── can(action): boolean                            │   │  │
│  │  │  │  ├── canAny(actions[]): boolean                      │   │  │
│  │  │  │  ├── canAll(actions[]): boolean                      │   │  │
│  │  │  │  └── actions: string[]                               │   │  │
│  │  │  └───────────────────────────────────────────────────────┘   │  │
│  │  │                                                            │   │
│  │  │  ┌─ <Can resource="x" action="y">                        │   │  │
│  │  │  │  └── children / fallback                               │   │  │
│  │  │  └───────────────────────────────────────────────────────┘   │  │
│  │  └───────────────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │  API Interceptor (api.tsx)                                        │  │
│  │  ┌───────────────────────────────────────────────────────────┐   │  │
│  │  │  403 Forbidden? → Emit 'permission:denied'               │   │  │
│  │  │      → Trigger token refresh                              │   │  │
│  │  │      → Retry request                                      │   │  │
│  │  │      → Emit 'permission:refreshed' / 'permission:refresh-failed'│  │
│  │  └───────────────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │  permissionEvents (Event Emitter)                                 │  │
│  │  ┌───────────────────────────────────────────────────────────┐   │  │
│  │  │  'permission:denied'        → Toast: "Akses Ditolak"      │   │  │
│  │  │  'permission:refreshed'     → Toast: "Hak Akses Diperbarui"│   │
│  │  │  'permission:refresh-failed'→ Toast: "Gagal Memperbarui"  │   │  │
│  │  └───────────────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

Data Flow:
┌─────────────────────────────────────────────────────────────────────────┐
│  Login → JWT Token → Redux AuthSlicer → PermissionContext              │
│                                      │                                  │
│                                      ▼                                  │
│  API 403 → permissionEvents.emit() → PermissionContext → Toast       │
│              │                                                        │
│              ▼                                                        │
│         performTokenRefresh() → Retry Request                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## File & Struktur

```
src/
├── Permissions/
│   ├── types.ts              # TypeScript types
│   ├── permissionEvents.ts   # Event emitter (decouple interceptor & context)
│   ├── PermissionContext.tsx # React Context Provider
│   ├── usePermission.ts      # Hooks: usePermission, usePermissionContext
│   ├── Can.tsx               # Wrapper component <Can>
│   ├── index.ts              # Barrel export
│   └── examples.tsx          # Contoh penggunaan
│
├── Services/
│   ├── api.tsx               # RTK Query + 403 interceptor
│   └── tokenRefresh.ts       # Silent token refresh service
│
├── Store/
│   └── redux/
│       └── Auth/
│           └── index.ts      # AuthSlicer (permissions from JWT)
│
└── App.tsx                   # PermissionProvider integration
```

---

## Konsep Dasar

### Frontend vs Backend Authority

> ⚠️ **PENTING:** Pengecekan permission di frontend hanya untuk **UX (User Experience)** — yaitu menyembunyikan/menampilkan komponen. **Backend tetap menjadi sumber kebenaran utama.**

- **Frontend:** Hide/show tombol, menu, fitur berdasarkan permission
- **Backend:** Validasi sebenarnya, return 403 jika tidak punya akses
- **Interceptor:** Otomatis tangani 403 dengan refresh token + retry

### Mengapa Frontend Check?

1. **UX Lebih Baik** — User tidak melihat tombol yang tidak bisa diklik
2. **Mengurangi Load Server** — Tidak perlu kirim request yang pasti ditolak
3. **Feedback Instan** — UI langsung menyesuaikan dengan role user

---

## JWT Token Payload

Permission disimpan di JWT payload sebagai pasangan resource → action[]:

```json
{
  "iss": "http://192.168.18.80:3001/api/login",
  "exp": 1772815160,
  "sub": "11",
  "permissions": {
    "devices": ["create", "update"],
    "users": ["approve", "create", "delete", "export", "import", "print", "reject", "update", "view"]
  },
  "modules": [
    {
      "id": 3,
      "module_name": "Pengaturan",
      "react_route": "/setting",
      "menus": [...]
    }
  ]
}
```

### Parse di Redux AuthSlicer

Ketika `setBearerToken(token)` dipanggil, AuthSlicer otomatis:

1. Decode JWT payload
2. Extract `permissions` → simpan ke `state.permissions`
3. Extract `modules` → simpan ke `state.modules`

---

## PermissionContext

**File:** `src/Permissions/PermissionContext.tsx`

React Context yang membaca permission dari Redux store dan menyediakan method untuk cek permission.

### Fitur

- ✅ Baca permission dari Redux (`state.AuthSlicer.permissions`)
- ✅ Method `can`, `canAny`, `canAll`
- ✅ Subscribe ke `permissionEvents` untuk toast notifications
- ✅ Auto-refresh permission setelah 403

### Provider Setup

```tsx
// App.tsx
import { Provider } from 'react-redux'
import { PermissionProvider } from '@/Permissions'

function App() {
  return (
    <Provider store={store}>
      <PermissionProvider>
        <AppRoutes />
      </PermissionProvider>
    </Provider>
  )
}
```

---

## Hook: usePermission

**File:** `src/Permissions/usePermission.ts`

### usePermission(resource)

Scoped ke resource tertentu:

```tsx
import { usePermission } from '@/Permissions'

function DeviceManagement() {
  const { can, canAny, canAll, actions } = usePermission('devices')

  return (
    <div>
      {can('view') && <DeviceList />}
      {can('create') && <Button>Tambah</Button>}
      {canAny(['update', 'delete']) && <ActionColumn />}
      {canAll(['export', 'print']) && <BulkActions />}
      <p>Available: {actions.join(', ')}</p>
    </div>
  )
}
```

### Return Value

| Property  | Tipe                     | Deskripsi                       |
| --------- | ------------------------ | ------------------------------- |
| `can`     | `(action) => boolean`    | Cek satu action                 |
| `canAny`  | `(actions[]) => boolean` | Cek salah satu                  |
| `canAll`  | `(actions[]) => boolean` | Cek semua action                |
| `actions` | `string[]`               | Semua action untuk resource ini |

### usePermissionContext()

Untuk cek permission lintas resource:

```tsx
import { usePermissionContext } from '@/Permissions'

const { can, canAny, canAll, permissions } = usePermissionContext()

// Cross-resource check
if (can('devices', 'view') && can('users', 'view')) {
  // Show dashboard
}
```

---

## Component: Can

**File:** `src/Permissions/Can.tsx`

Wrapper component untuk conditional rendering berdasarkan permission.

### Props

| Prop       | Tipe        | Wajib | Deskripsi                        |
| ---------- | ----------- | ----- | -------------------------------- |
| `resource` | `string`    | ✅    | Resource (e.g. "devices")        |
| `action`   | `string`    | ✅    | Action (e.g. "create")           |
| `children` | `ReactNode` | ✅    | Ditampilkan jika ada akses       |
| `fallback` | `ReactNode` | ❌    | Ditampilkan jika tidak ada akses |

### Contoh Penggunaan

```tsx
import { Can } from '@/Permissions'

// Basic - tidak render apa-apa jika tidak ada akses
<Can resource="devices" action="create">
  <Button>Tambah Device</Button>
</Can>

// Dengan fallback - render komponen alternatif
<Can resource="devices" action="delete" fallback={<span className="text-gray-400">No access</span>}>
  <Button>Hapus</Button>
</Can>

// Fallback null - explicit tidak render
<Can resource="users" action="export" fallback={null}>
  <Button>Export</Button>
</Can>
```

---

## API Interceptor 403

**File:** `src/Services/api.tsx`

Interceptor yang menangani 403 Forbidden dari backend.

### Format Error Backend

```json
{
  "status": 403,
  "data": {
    "status": "error",
    "title": "Akses Ditolak",
    "permission": "view",
    "resource": "devices"
  }
}
```

### Flow Penanganan 403

```
API Response 403
      │
      ▼
Parse error payload
      │
      ▼
Emit 'permission:denied' → Toast notification
      │
      ▼
performTokenRefresh()
      │
      ├─ Berhasil → Emit 'permission:refreshed'
      │              → Retry request
      │
      └─ Gagal → Emit 'permission:refresh-failed'
                 → Return error
```

### Implementasi

```typescript
// src/Services/api.tsx
if (result.error && result.error.status === 403) {
  const errorData = result.error.data as any

  // Parse payload
  const payload = {
    status: 403,
    title: errorData?.title || 'Akses Ditolak',
    permission: errorData?.permission || 'unknown',
    resource: errorData?.resource || 'unknown',
  }

  // Emit event untuk toast
  permissionEvents.emit('permission:denied', payload)

  // Coba refresh token
  const newToken = await performTokenRefresh()

  if (newToken) {
    // Retry request
    result = await baseQuery(args, api, extraOptions)
  }
}
```

---

## Permission Events

**File:** `src/Permissions/permissionEvents.ts`

Event emitter yang memisahkan interceptor dari React context.

### Events

| Event                       | Payload                                   | Deskripsi                 |
| --------------------------- | ----------------------------------------- | ------------------------- |
| `permission:denied`         | `{ status, title, permission, resource }` | Backend返回403            |
| `permission:refreshed`      | `PermissionMap`                           | Token berhasil di-refresh |
| `permission:refresh-failed` | `{ reason: string }`                      | Refresh token gagal       |

### Subscribe ke Events

```typescript
import { permissionEvents } from '@/Permissions'

// Di komponen manapun
useEffect(() => {
  const unsub = permissionEvents.on('permission:denied', (payload) => {
    console.log(`Akses ditolak: ${payload.resource}.${payload.permission}`)
  })

  return unsub
}, [])
```

### Di PermissionContext

PermissionContext automatically subscribes ke events untuk menampilkan toast:

```typescript
// permission:denied → notification.warning()
// permission:refreshed → notification.info()
// permission:refresh-failed → notification.error()
```

---

## Quick Start

### 1. Setup Provider

```tsx
// src/App.tsx
import { Provider } from 'react-redux'
import { PermissionProvider } from '@/Permissions'

function App() {
  return (
    <Provider store={store}>
      <PermissionProvider>
        <AppRoutes />
      </PermissionProvider>
    </Provider>
  )
}
```

### 2. Gunakan di Komponen

```tsx
import { usePermission, Can } from '@/Permissions'

function MyPage() {
  // Hook untuk logic
  const { can } = usePermission('devices')

  if (!can('view')) {
    return <div>Tidak punya akses</div>
  }

  return (
    <div>
      {/* Component untuk UI */}
      <Can resource="devices" action="create">
        <Button>Tambah</Button>
      </Can>
    </div>
  )
}
```

---

## Contoh Penggunaan

### Contoh 1: Tabel dengan Action Column

```tsx
import { usePermission } from '@/Permissions'
import { Button, Space } from 'antd'

function DeviceTable({ devices }) {
  const { canAny } = usePermission('devices')

  const columns = [
    { title: 'Nama', dataIndex: 'name' },
    { title: 'Kode', dataIndex: 'code' },
    canAny(['view', 'update', 'delete']) && {
      title: 'Aksi',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {can('view') && <Button size="small">Detail</Button>}
          {can('update') && <Button size="small">Edit</Button>}
          {can('delete') && (
            <Button size="small" danger>
              Hapus
            </Button>
          )}
        </Space>
      ),
    },
  ].filter(Boolean)

  return <Table columns={columns} dataSource={devices} />
}
```

### Contoh 2: Sidebar Navigation

```tsx
import { usePermissionContext } from '@/Permissions'

function Sidebar() {
  const { can } = usePermissionContext()

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    {
      key: 'devices',
      label: 'Devices',
      path: '/devices',
      show: can('devices', 'view'), // Hide jika tidak punya akses
    },
    {
      key: 'users',
      label: 'Users',
      path: '/users',
      show: can('users', 'view'),
    },
    {
      key: 'settings',
      label: 'Settings',
      path: '/settings',
      show: can('settings', 'view'),
    },
  ].filter((item) => item.show !== false)

  return <Menu items={menuItems} />
}
```

### Contoh 3: Permission Check Sebelum API Call

```tsx
import { usePermission } from '@/Permissions'
import { useDeleteDeviceMutation } from '@/Services/api'

function DeviceList() {
  const { can } = usePermission('devices')
  const [deleteDevice] = useDeleteDeviceMutation()

  const handleDelete = async (id) => {
    // Frontend check untuk UX
    if (!can('delete')) {
      message.error('Anda tidak punya akses hapus')
      return
    }

    // Tetap lakukan API call - backend yang validasi sebenarnya
    try {
      await deleteDevice({ id }).unwrap()
      message.success('Berhasil dihapus')
    } catch (error) {
      // Interceptor akan otomatis tangani 403
      message.error('Gagal menghapus')
    }
  }

  return (
    <List>
      {devices.map((device) => (
        <List.Item>
          {device.name}
          {can('delete') && <Button onClick={() => handleDelete(device.id)}>Hapus</Button>}
        </List.Item>
      ))}
    </List>
  )
}
```

### Contoh 4: Multiple Resources Check

```tsx
import { usePermissionContext } from '@/Permissions'

function AdminDashboard() {
  const { canAny, canAll } = usePermissionContext()

  // Salah satu dari kemampuan admin
  const isAdmin = canAny('users', ['create', 'update', 'delete'])

  // Semua kemampuan penuh
  const isSuperAdmin = canAll('users', ['create', 'update', 'delete', 'export'])

  return (
    <div>
      {isSuperAdmin && <SuperAdminPanel />}
      {isAdmin && !isSuperAdmin && <AdminPanel />}
      {!isAdmin && <RegularUserPanel />}
    </div>
  )
}
```

---

## Konfigurasi

### Refresh Buffer

Waktu sebelum token expired untuk trigger refresh (default: 10 menit):

```typescript
// src/Services/tokenRefresh.ts
const REFRESH_BUFFER_MS = 10 * 60 * 1000
```

### Toast Duration

Lama tampilan notification (default: 5 detik):

```typescript
// src/Permissions/PermissionContext.tsx
notification.warning({
  message: payload.title || 'Akses Ditolak',
  description: `Anda tidak memiliki izin "${payload.permission}"...`,
  placement: 'topRight',
  duration: 5, // detik
})
```

---

## Troubleshooting

### "Hook must be used within a PermissionProvider"

Pastikan komponen dibungkus oleh `<PermissionProvider>`:

```tsx
// ✅ Benar
function App() {
  return (
    <Provider store={store}>
      <PermissionProvider>
        <MyComponent />
      </PermissionProvider>
    </Provider>
  )
}

// ❌ Salah - tidak ada PermissionProvider
function App() {
  return (
    <Provider store={store}>
      <MyComponent />
    </Provider>
  )
}
```

### Permission tidak update setelah refresh

Pastikan interceptor emit event dengan permission terbaru:

```typescript
// Di api.tsx
if (newToken) {
  const state = api.getState() as RootState
  const newPermissions = state.AuthSlicer?.permissions ?? {}
  permissionEvents.emit('permission:refreshed', newPermissions)
}
```

### Toast tidak muncul saat 403

Cek apakah PermissionProvider sudah terpasang dan error format sesuai:

```json
{
  "status": 403,
  "data": {
    "status": "error",
    "title": "Akses Ditolak",
    "permission": "view",
    "resource": "devices"
  }
}
```

---

## Best Practices

1. **Gunakan frontend check untuk UX** — Hide/show komponen, bukan untuk security
2. **Tetapi tetap validasi di backend** — Jangan bergantung sepenuhnya pada frontend
3. **Gunakan hook untuk logic kompleks** — `usePermission('resource')` lebih readable
4. **Gunakan component untuk JSX** — `<Can>` lebih declaratif
5. **Fallback yang informatif** — Beri tahu user mengapa mereka tidak bisa akses

---

## Catatan Penting

> ⚠️ **Security Notice:** Sistem ini hanya untuk **UX enhancement**. Backend HARUS tetap melakukan validasi permission untuk setiap request. Serangan bisa dengan mudah mem-bypass checking di frontend.

---

## Implementasi: Device Management

Dokumentasi penerapan permission system pada halaman Device Management.

### Resource Mapping

Backend mengembalikan permission dengan format:

```json
{
  "permissions": {
    "devices": ["create", "update", "view", "delete"]
  }
}
```

Di frontend, gunakan resource name sesuai dengan key di JWT (`devices`):

```tsx
// ❌ Salah - tidak cocok dengan key di JWT
const { can } = usePermission('device')

// ✅ Benar - sesuai dengan key di JWT
const { can } = usePermission('devices')
```

### Komponen yang Diamankan

| Komponen        | Action   | Keterangan                                                     |
| --------------- | -------- | -------------------------------------------------------------- |
| **Tambah Alat** | `create` | Tombol "Tambah Alat" hanya muncul jika punya permission create |
| **Detail**      | `view`   | Tombol eye icon di tabel                                       |
| **Edit**        | `update` | Tombol pencil icon di tabel & di detail modal                  |
| **Delete**      | `trash`  | Tombol trash icon di tabel                                     |

### Contoh Implementasi

```tsx
// src/Components/Setting/DeviceManagement/MainDeviceManagement.tsx
import { usePermission } from '@/Permissions'

function MainDeviceManagement() {
  // Setup permission hook
  const { can, canAny } = usePermission('devices')

  return (
    <div>
      {/* Header dengan tombol Tambah */}
      <div className="flex justify-between items-center mb-4">
        <h1>Manajemen Alat</h1>
        {can('create') && (
          <button onClick={handleCreate}>
            <HiPlus className="w-4 h-4" />
            Tambah Alat
          </button>
        )}
      </div>

      {/* Tabel dengan kolom aksi */}
      <DataTable
        columns={[
          // ... kolom lainnya
          {
            title: 'Aksi',
            key: 'actions',
            render: (_, record) => (
              <div className="flex gap-2">
                {can('view') && (
                  <button onClick={() => handleDetail(record)}>
                    <HiEye />
                  </button>
                )}
                {can('update') && (
                  <button onClick={() => handleEdit(record)}>
                    <HiPencilSquare />
                  </button>
                )}
                {can('delete') && (
                  <button onClick={() => handleDelete(record)}>
                    <HiTrash />
                  </button>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
```

### Menggunakan Component Can

Alternatif lain menggunakan component `<Can>`:

```tsx
import { Can } from '@/Permissions'

function DeviceActions({ device }) {
  return (
    <div className="flex gap-2">
      <Can resource="devices" action="view">
        <Button size="small" onClick={() => handleDetail(device)}>
          Detail
        </Button>
      </Can>

      <Can resource="devices" action="update">
        <Button size="small" onClick={() => handleEdit(device)}>
          Edit
        </Button>
      </Can>

      <Can resource="devices" action="delete" fallback={null}>
        <Button size="small" danger onClick={() => handleDelete(device)}>
          Hapus
        </Button>
      </Can>
    </div>
  )
}
```

### Backend Error Format

Ketika user mencoba mengakses tanpa permission, backend mengembalikan:

```json
{
  "status": 403,
  "data": {
    "status": "error",
    "title": "Akses Ditolak",
    "permission": "create",
    "resource": "devices"
  }
}
```

Interceptor akan:

1. Menangkap error 403
2. Emit event `permission:denied` → Toast notification
3. Coba refresh token
4. Retry request jika berhasil
5. Emit `permission:refreshed` atau `permission:refresh-failed`

---

## Implementasi: Institution Management

Dokumentasi penerapan permission system pada halaman Institution Management.

### Resource Mapping

Gunakan resource name `"institution"` sesuai request:

```tsx
const { can, canAny } = usePermission('institution')
```

### Komponen yang Diamankan

| Komponen             | Action   | Keterangan                                                          |
| -------------------- | -------- | ------------------------------------------------------------------- |
| **Tambah Institusi** | `create` | Tombol "Tambah Institusi" hanya muncul jika punya permission create |
| **Detail**           | `view`   | Tombol eye icon di tabel                                            |
| **Edit**             | `update` | Tombol pencil icon di tabel & di detail modal                       |
| **Delete**           | `delete` | Tombol trash icon di tabel                                          |

### Contoh Implementasi

```tsx
// src/Components/Setting/Institution/MainInstitution.tsx
import { usePermission } from '@/Permissions'

function MainInstitution() {
  // Setup permission hook
  const { can, canAny } = usePermission('institution')

  return (
    <div>
      {/* Header dengan tombol Tambah */}
      <div className="flex justify-between items-center mb-4">
        <h1>Data Institusi</h1>
        {can('create') && (
          <button onClick={handleCreate}>
            <HiPlus className="w-4 h-4" />
            Tambah Institusi
          </button>
        )}
      </div>

      {/* Tabel dengan kolom aksi */}
      <DataTable
        columns={[
          // ... kolom lainnya
          {
            title: 'Aksi',
            key: 'actions',
            render: (_, record) => (
              <div className="flex gap-2">
                {can('view') && (
                  <button onClick={() => handleDetail(record)}>
                    <HiEye />
                  </button>
                )}
                {can('update') && (
                  <button onClick={() => handleEdit(record)}>
                    <HiPencilSquare />
                  </button>
                )}
                {can('delete') && (
                  <button onClick={() => handleDelete(record)}>
                    <HiTrash />
                  </button>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
```

### Permission di Detail View

Untuk edit button di detail modal, gunakan prop `canUpdate`:

```tsx
<InstitutionDetailView item={item} onClose={onClose} onEdit={onEdit} canUpdate={can('update')} />
```

---

## Implementasi: User Management

Dokumentasi penerapan permission system pada halaman User Management.

### Resource Mapping

Gunakan resource name `"users"` sesuai dengan JWT payload:

```tsx
const { can } = usePermission('users')
```

### Komponen yang Diamankan

| Komponen          | Action   | Keterangan                                                     |
| ----------------- | -------- | -------------------------------------------------------------- |
| **Tambah User**   | `create` | Tombol "Tambah User" hanya muncul jika punya permission create |
| **Edit**          | `update` | Tombol pencil icon di tabel                                    |
| **Delete**        | `delete` | Tombol trash icon di tabel                                     |
| **Status Toggle** | -        | Toggle aktif/nonaktif (tidak menggunakan permission check)     |

### Catatan

- Tidak ada tombol "Detail/View" di halaman ini karena tidak ada detail modal
- Status toggle button tidak menggunakan permission check karena action-nya tidak jelas (bisa jadi `approve`, `reject`, atau bagian dari `update`)

---

## Implementasi: Roles Management

Dokumentasi penerapan permission system pada halaman Roles Management.

### Resource Mapping

Gunakan resource name `"roles"` sesuai request:

```tsx
const { can } = usePermission('roles')
```

### Komponen yang Diamankan

| Komponen        | Action   | Keterangan                                                            |
| --------------- | -------- | --------------------------------------------------------------------- |
| **Tambah Role** | `create` | Tombol "Tambah Role" hanya muncul jika punya permission create        |
| **Detail**      | `view`   | Tombol eye icon di tabel                                              |
| **Edit**        | `update` | Tombol pencil icon di tabel                                           |
| **Delete**      | `delete` | Tombol trash icon di tabel (untuk role aktif)                         |
| **Restore**     | `create` | Tombol restore icon (untuk role terhapus) - menggunakan action create |

### Catatan

- Tidak ada detail modal di halaman ini - hanya menggunakan `RoleDetailModal` untuk view saja
- Action "restore" menggunakan permission `create` karena restore dianggap seperti membuat ulang data
