# 🛡️ Permissions — Dokumentasi Modul Hak Akses

> Modul untuk mengelola hak akses role terhadap resource-resource sistem. Menampilkan tabel daftar role, lalu saat role dipilih menampilkan panel pengaturan hak akses per resource dengan toggle switch.

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [File & Struktur](#file--struktur)
- [Quick Start](#quick-start)
- [Alur Data API](#alur-data-api)
- [Komponen: MainPermissions](#komponen-mainpermissions)
- [Komponen: UserPermissionPanel](#komponen-userpermissionpanel)
- [Utility: permissionsUtils](#utility-permissionsutils)
- [Types](#types)
- [API Service (RTK Query)](#api-service-rtk-query)
- [Integrasi API](#integrasi-api)
- [Kustomisasi](#kustomisasi)

---

## Arsitektur

```
┌──────────────────────────────────────────────────────────────┐
│  MainSetting.tsx → Tab "Hak Akses"                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  MainPermissions.tsx                                    │  │
│  │                                                         │  │
│  │  ┌─ VIEW 1: Tabel Daftar Role ─────────────────────┐  │  │
│  │  │  DataTable                                        │  │  │
│  │  │  Kolom: Role, Status, [Pilih]                    │  │  │
│  │  └───────────────────────────────┬───────────────────┘  │  │
│  │                                  │ klik "Pilih"         │  │
│  │                                  │ → getRolePermission  │  │
│  │                                  ▼                      │  │
│  │  ┌─ VIEW 2: Panel Hak Akses Role ──────────────────┐  │  │
│  │  │  UserPermissionPanel                              │  │  │
│  │  │                                                   │  │  │
│  │  │  ┌─ Role Info ─────────────────────────────────┐ │  │  │
│  │  │  │ [←] [Avatar] ADMIN  [12/20 permission aktif]│ │  │  │
│  │  │  └─────────────────────────────────────────────┘ │  │  │
│  │  │                                                   │  │  │
│  │  │  ┌─ Modul Dashboard ───────────────────────────┐ │  │  │
│  │  │  │  view              [====] ON                 │ │  │  │
│  │  │  │  create            [====] ON                 │ │  │  │
│  │  │  └─────────────────────────────────────────────┘ │  │  │
│  │  │                                                   │  │  │
│  │  │  ┌─ Modul Diagnostik ──────────────────────────┐ │  │  │
│  │  │  │  view              [====] ON                 │ │  │  │
│  │  │  │  create            [    ] OFF                │ │  │  │
│  │  │  │  print             [    ] OFF                │ │  │  │
│  │  │  └─────────────────────────────────────────────┘ │  │  │
│  │  │                                                   │  │  │
│  │  │  ┌─ Save Bar (sticky) ─────────────────────────┐ │  │  │
│  │  │  │  Perubahan belum disimpan  [Reset] [Simpan]  │ │  │  │
│  │  │  └─────────────────────────────────────────────┘ │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Alur Interaksi

```
Tabel Role → Klik "Pilih" → API getRolePermission → Panel Hak Akses
                                                          │
                                                          ├── Toggle permission ON/OFF
                                                          ├── Toggle semua per kategori
                                                          ├── Toggle semua permission
                                                          │
                                                          ├── [Reset] → kembalikan ke state awal
                                                          └── [Simpan] → kirim ke API
```

---

## File & Struktur

```
src/
├── Components/Setting/
│   ├── MainSetting.tsx                          # Tab "Hak Akses" → render MainPermissions
│   └── Permissions/
│       ├── types.ts                             # Type definitions (RoleItem, ModulePermission, dll)
│       ├── permissionsData.ts                   # Master modul (MODULE_DEFINITIONS, MODULE_CATEGORIES)
│       ├── permissionsUtils.ts                  # ⭐ Utility functions reusable
│       ├── MainPermissions.tsx                  # Tabel daftar role + routing ke panel
│       └── UserPermissionPanel.tsx              # Panel hak akses per role
│
└── Services/Modules/
    └── permissions/
        ├── index.ts                             # RTK Query endpoints + hooks
        ├── getListRole.ts                       # GET /master/roles
        └── getRolePermission.ts                 # GET /master/role-permissions/:id
```

---

## Quick Start

Tab "Hak Akses" sudah terintegrasi di `MainSetting.tsx`:

```tsx
case 'permissions':
  return <MainPermissions />
```

Akses: `http://localhost:5174/setting` → Klik tab "Hak Akses"

---

## Alur Data API

```
1. MainPermissions mount
   → useGetListRoleQuery() → GET /master/roles
   → Tampilkan tabel daftar role

2. User klik "Pilih" pada baris role
   → handleSelectRole(role)
   → useLazyGetRolePermissionQuery() → GET /master/role-permissions/:id
   → Response: { status, role, data: RoleResourceItem[] }

3. Jika berhasil:
   → setSelectedRole({ role, resources: res.data })
   → Render UserPermissionPanel

4. UserPermissionPanel mount
   → useEffect: flattenPermissions(resources) → FlatPermissionItem[]
   → groupPermissionsByCategory(permissions) → PermissionGroup[]
   → Render permission groups dengan toggle

5. User toggle permission
   → togglePermissionById / togglePermissionsByCategory / toggleAllPermissions
   → setHasChanges(true)
   → Save bar muncul

6. User klik "Simpan"
   → buildUpdatePayload(permissions) → { id, granted }[]
   → onSave(roleId, payload)
   → TODO: API update permissions
```

### Struktur Response API

```ts
// GET /master/role-permissions/:id
{
  status: 'success',
  role: { id: 1, role_name: 'Admin' },
  data: [
    {
      resource_id: 1,
      resource_name: 'Dashboard',
      description: 'Modul Dashboard',   // ← digunakan sebagai label kategori
      permissions: [
        { id: 1, permission_name: 'view', granted: true },
        { id: 2, permission_name: 'create', granted: false },
      ]
    },
    // ...
  ]
}
```

---

## Komponen: MainPermissions

**File:** `src/Components/Setting/Permissions/MainPermissions.tsx`

Komponen utama yang menampilkan tabel daftar role. Saat role dipilih, memanggil API dan beralih ke `UserPermissionPanel`.

### Fitur Tabel Role

| Fitur         | Deskripsi                                     |
| ------------- | --------------------------------------------- |
| 🔍 Search     | Pencarian global (nama role)                  |
| ↕️ Sorting    | Klik header kolom untuk sort                  |
| 📄 Pagination | 10 per halaman                                |
| 🏷️ Role Badge | Badge role dengan uppercase                   |
| 🟢 Status     | Badge aktif/nonaktif                          |
| 🖱️ Pilih      | Tombol "Pilih" → panggil API + buka panel     |
| ⏳ Loading    | Spinner pada tombol saat API sedang dipanggil |

### Kolom Tabel

| Kolom  | Deskripsi                                 |
| ------ | ----------------------------------------- |
| Role   | Badge uppercase dengan nama role          |
| Status | Badge aktif/nonaktif dengan dot indicator |
| Aksi   | Tombol "Pilih" (disabled saat loading)    |

### State

```tsx
// Role yang sedang dipilih beserta data permissions-nya
interface SelectedRoleState {
  role: RoleItem
  resources: RoleResourceItem[]
}

const [selectedRole, setSelectedRole] = useState<SelectedRoleState | null>(null)
const [isSaving, setIsSaving] = useState(false)
const [isLoadingSelected, setIsLoadingSelected] = useState<boolean>(false)
```

### Handlers

| Handler                  | Deskripsi                                                    |
| ------------------------ | ------------------------------------------------------------ |
| `handleSelectRole(role)` | Panggil API getRolePermission, simpan ke state, buka panel   |
| `handleBack()`           | Kembali ke tabel (set selectedRole = null)                   |
| `handleSavePermissions`  | Simpan perubahan permissions (TODO: integrasikan API update) |

---

## Komponen: UserPermissionPanel

**File:** `src/Components/Setting/Permissions/UserPermissionPanel.tsx`

Panel untuk menampilkan dan mengelola hak akses per role yang dipilih.

### Fitur

| Fitur                | Deskripsi                                                                 |
| -------------------- | ------------------------------------------------------------------------- |
| 👤 Info Role         | Nama role + deskripsi role                                                |
| 📊 Counter           | Jumlah permission aktif / total (e.g. 12/20 permission aktif)             |
| 🔄 Toggle All        | Aktifkan/nonaktifkan semua permission sekaligus                           |
| 📂 Group by Category | Permission dikelompokkan per kategori (dari field `description` resource) |
| 🔄 Toggle Category   | Aktifkan/nonaktifkan semua permission dalam satu kategori                 |
| 🔘 Toggle Per Item   | Switch ON/OFF per permission individual (berdasarkan field `granted`)     |
| 💾 Save Bar (Sticky) | Muncul saat ada perubahan, dengan tombol Reset + Simpan                   |
| ⬅️ Back              | Tombol kembali ke tabel daftar role                                       |
| 📭 Empty State       | Pesan jika tidak ada data permission                                      |

### Props

```tsx
interface UserPermissionPanelProps {
  /** Data role yang dipilih */
  role: RoleItem
  /** Data resources + permissions dari API (RoleResourceItem[]) */
  resources: RoleResourceItem[]
  /** Loading state saat simpan */
  isSaving?: boolean
  /** Callback kembali ke daftar role */
  onBack: () => void
  /** Callback simpan perubahan permissions (hanya resource yang berubah) */
  onSave: (roleId: number, payload: ResourcePermissionPayload[]) => void
}
```

### Komponen ToggleSwitch (Reusable)

Toggle switch dipisahkan menjadi komponen internal reusable:

```tsx
interface ToggleSwitchProps {
  enabled: boolean // Apakah toggle aktif
  indeterminate?: boolean // Sebagian aktif (untuk toggle kategori)
  onClick: () => void // Callback saat diklik
  title?: string // Tooltip
}
```

Ukuran: Track `w-9 h-5` (36×20px), Knob `w-4 h-4` (16×16px), padding 2px.
Posisi knob menggunakan `left-0.5` (OFF) dan `left-[18px]` (ON) agar tidak keluar jalur.

### Logika Kategori

Label kategori diambil dari field `description` resource API:

```ts
// Jika description ada → gunakan description sebagai label kategori
// Jika description null → fallback ke resource_name
category: resource.description ?? resource.resource_name
```

### Logika Toggle

Setiap permission diidentifikasi secara unik menggunakan kombinasi `resource_id + permission id` (karena permission ID bisa sama di resource berbeda).

| Toggle          | Kondisi                                                                  |
| --------------- | ------------------------------------------------------------------------ |
| Toggle per item | Flip `granted` untuk permission dengan resource_id + id yang cocok       |
| Toggle resource | Jika semua aktif → nonaktifkan semua. Jika ada nonaktif → aktifkan semua |
| Toggle all      | Jika semua aktif → nonaktifkan semua. Jika ada nonaktif → aktifkan semua |

### Payload Simpan (Hanya Resource yang Berubah)

Saat user klik "Simpan", hanya resource yang memiliki perubahan yang dikirim:

```json
[
  {
    "resource_id": 14,
    "permissions": [
      { "id": 15, "granted": true },
      { "id": 11, "granted": true }
    ]
  },
  {
    "resource_id": 11,
    "permissions": [
      { "id": 15, "granted": true },
      { "id": 11, "granted": false }
    ]
  }
]
```

Fungsi `buildChangedResourcesPayload()` membandingkan state saat ini dengan state awal (disimpan di `useRef`) dan hanya menyertakan resource yang berubah. Semua permissions dari resource tersebut disertakan (bukan hanya yang berubah).

### Contoh Penggunaan

```tsx
<UserPermissionPanel
  role={selectedRole.role}
  resources={selectedRole.resources}
  isSaving={isSaving}
  onBack={handleBack}
  onSave={handleSavePermissions}
/>
```

---

## Utility: permissionsUtils

**File:** `src/Components/Setting/Permissions/permissionsUtils.ts`

Kumpulan utility functions reusable untuk transformasi dan manipulasi data permissions.

### Types

#### FlatPermissionItem

Representasi flat dari satu permission item (gabungan data resource + permission):

```ts
interface FlatPermissionItem {
  id: number // ID permission dari API
  permission_name: string // Nama permission (e.g. "view", "create")
  granted: boolean // Apakah permission aktif
  resource_id: number // ID resource induk
  resource_name: string // Nama resource induk
  category: string // Kategori (dari description resource, fallback ke resource_name)
}
```

#### PermissionGroup

Grup permissions berdasarkan kategori:

```ts
interface PermissionGroup {
  category: string // Nama kategori (dari description resource)
  resource_name: string // Nama resource asli
  resource_id: number // ID resource
  items: FlatPermissionItem[] // Daftar permission dalam grup
}
```

### Fungsi Transformasi

#### `flattenPermissions(resources)`

Flatten `RoleResourceItem[]` (nested) menjadi `FlatPermissionItem[]` (flat).

```ts
import { flattenPermissions } from './permissionsUtils'

const flat = flattenPermissions(apiResponse.data)
// [{ id: 1, permission_name: 'view', granted: true, resource_id: 1, ... }, ...]
```

#### `groupPermissionsByResource(items)`

Group `FlatPermissionItem[]` berdasarkan `resource_id`.

```ts
import { groupPermissionsByResource } from './permissionsUtils'

const groups = groupPermissionsByResource(flatItems)
// [{ category: 'Modul Dashboard', resource_id: 1, items: [...] }, ...]
```

### Fungsi Kalkulasi

| Fungsi                 | Deskripsi                                          |
| ---------------------- | -------------------------------------------------- |
| `countGranted(items)`  | Hitung jumlah permission dengan `granted = true`   |
| `isAllGranted(items)`  | Cek apakah semua permission aktif                  |
| `isSomeGranted(items)` | Cek apakah sebagian (tidak semua) permission aktif |

### Fungsi Toggle

| Fungsi                                                  | Deskripsi                                             |
| ------------------------------------------------------- | ----------------------------------------------------- |
| `togglePermissionById(items, resourceId, permissionId)` | Toggle satu permission (unique key: resource_id + id) |
| `togglePermissionsByResource(items, resourceId)`        | Toggle semua permission dalam satu resource           |
| `toggleAllPermissions(items)`                           | Toggle semua permission                               |

### Fungsi Payload

#### `buildChangedResourcesPayload(currentItems, originalItems)`

Buat payload untuk API update permissions. **Hanya menyertakan resource yang memiliki perubahan.**

```ts
import { buildChangedResourcesPayload } from './permissionsUtils'

const payload = buildChangedResourcesPayload(currentPermissions, originalPermissions)
// [{ resource_id: 14, permissions: [{ id: 15, granted: true }, { id: 11, granted: false }] }]
```

#### `getPermissionKey(item)`

Buat unique key untuk FlatPermissionItem (kombinasi `resource_id_permissionId`).

```ts
import { getPermissionKey } from './permissionsUtils'

const key = getPermissionKey(item) // "14_15"
```

---

## Types

**File:** `src/Components/Setting/Permissions/types.ts`

### RoleItem

```ts
interface RoleItem {
  id: number
  created_by: string
  created_at: string
  updated_by: string | null
  updated_at: string
  role_name: string
  is_active: boolean
  description: string
  deleted_at: null | string
}
```

### ModulePermission

```ts
interface ModulePermission {
  key: string // Key unik modul
  label: string // Nama modul yang ditampilkan
  description?: string // Deskripsi singkat modul
  category: string // Kategori/grup modul
  enabled: boolean // Apakah user memiliki akses
}
```

### UpdatePermissionsPayload

```ts
interface UpdatePermissionsPayload {
  userId: string
  permissions: { key: string; enabled: boolean }[]
}
```

---

## API Service (RTK Query)

**File:** `src/Services/Modules/permissions/index.ts`

| Endpoint            | Method | URL                            | Deskripsi                   |
| ------------------- | ------ | ------------------------------ | --------------------------- |
| `getListRole`       | GET    | `/master/roles`                | Daftar semua role           |
| `getRolePermission` | GET    | `/master/role-permissions/:id` | Permissions satu role by ID |

### Hooks

```tsx
import {
  useGetListRoleQuery,
  useLazyGetListRoleQuery,
  useGetRolePermissionQuery,
  useLazyGetRolePermissionQuery,
} from '@/Services/Modules/permissions'
```

### Response Types

```ts
// GET /master/roles
interface ResponseDefault {
  status: string
  data: {
    data: RoleItem[]
    current_page: number
  }
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
}

// GET /master/role-permissions/:id
interface ResponseDefault {
  status: string
  role: { id: number; role_name: string }
  data: RoleResourceItem[]
}

interface RoleResourceItem {
  resource_id: number
  resource_name: string
  description: string | null // ← digunakan sebagai label kategori
  permissions: RolePermissionItem[]
}

interface RolePermissionItem {
  id: number
  permission_name: string
  granted: boolean // ← digunakan untuk toggle state
}
```

---

## Integrasi API

### Langkah 1: Implementasi API Update Permissions

Di `MainPermissions.tsx`, ganti handler dummy dengan API call:

```tsx
// Tambahkan mutation hook
const [updateRolePermissions] = useUpdateRolePermissionsMutation()

const handleSavePermissions = async (roleId: number, payload: { id: number; granted: boolean }[]) => {
  setIsSaving(true)
  try {
    await updateRolePermissions({ roleId, permissions: payload }).unwrap()
    // RTK Query otomatis invalidate cache jika dikonfigurasi
  } catch (error) {
    console.error('Gagal menyimpan permissions:', error)
  } finally {
    setIsSaving(false)
  }
}
```

### Langkah 2: Tambahkan Endpoint Update di Service

Di `src/Services/Modules/permissions/index.ts`:

```ts
import updateRolePermission from './updateRolePermission'

export const roleApi = api.injectEndpoints({
  endpoints: (build) => ({
    getListRole: getListRole(build),
    getRolePermission: getRolePermission(build),
    updateRolePermission: updateRolePermission(build), // ← Tambah ini
  }),
})

export const {
  useGetListRoleQuery,
  useLazyGetRolePermissionQuery,
  useUpdateRolePermissionMutation, // ← Export hook baru
} = roleApi
```

### Langkah 3: Buat File Endpoint Update

```ts
// src/Services/Modules/permissions/updateRolePermission.ts
import type { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'

export default (build: EndpointBuilder<any, any, any>) =>
  build.mutation<{ status: string }, { roleId: number; permissions: { id: number; granted: boolean }[] }>({
    query: ({ roleId, permissions }) => ({
      url: `/master/role-permissions/${roleId}`,
      method: 'PUT',
      body: { permissions },
    }),
  })
```

---

## Kustomisasi

### Mengubah Tampilan Toggle

Edit `UserPermissionPanel.tsx`, bagian toggle switch:

```tsx
{
  /* Ganti dengan checkbox jika diinginkan */
}
;<input
  type="checkbox"
  checked={perm.granted}
  onChange={() => handleToggle(perm.id)}
  className="w-4 h-4 text-primary-500 rounded"
/>
```

### Menambah Kolom di Tabel Role

Edit `columns` di `MainPermissions.tsx`:

```tsx
{
  accessorKey: 'description',
  header: 'Deskripsi',
  cell: ({ row }) => (
    <span className="text-sm text-neutral-500">{row.original.description}</span>
  ),
},
```

### Menambah Logika Validasi Sebelum Simpan

Di `UserPermissionPanel.tsx`, modifikasi `handleSave`:

```tsx
const handleSave = () => {
  // Validasi: minimal 1 permission harus aktif
  if (countGranted(permissions) === 0) {
    alert('Minimal 1 permission harus aktif')
    return
  }
  const payload = buildUpdatePayload(permissions)
  onSave(role.id, payload)
}
```

### Menambah Fitur Search di Panel

Tambahkan state search di `UserPermissionPanel.tsx`:

```tsx
const [searchQuery, setSearchQuery] = useState('')

const filteredGroups = useMemo(() => {
  if (!searchQuery) return permissionGroups
  return permissionGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((p) => p.permission_name.toLowerCase().includes(searchQuery.toLowerCase())),
    }))
    .filter((group) => group.items.length > 0)
}, [permissionGroups, searchQuery])
```
