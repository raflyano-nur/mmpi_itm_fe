# 🔐 Role — Dokumentasi Modul Manajemen Role

> Modul untuk manajemen Role (Hak Akses) pada halaman Settings, dilengkapi dengan CRUD, toggle aktif/nonaktif, restore data, dan filter tab dinamis dari data API.

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [File & Struktur](#file--struktur)
- [Quick Start](#quick-start)
- [Komponen: MainRole](#komponen-mainrole)
- [Komponen: RoleFormModal](#komponen-roleformmodal)
- [Komponen: RoleDetailModal](#komponen-roledetailmodal)
- [Komponen: RoleDeleteModal](#komponen-roledeletemmodal)
- [Types](#types)
- [Dummy Data](#dummy-data)
- [Services API](#services-api)
- [Design System & Warna](#design-system--warna)
- [Permissions](#permissions)
- [Referensi Props](#referensi-props)
- [TODO](#todo)

---

## Arsitektur

```
┌──────────────────────────────────────────────────────────────┐
│                    MainSetting.tsx                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              AppLayout (title, subtitle)                │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │                  MainRole.tsx                      │  │  │
│  │  │                                                   │  │  │
│  │  │  ┌─────────────────────────────────────────────┐  │  │  │
│  │  │  │  Filter Tabs (dinamis dari data API)         │  │  │  │
│  │  │  │  [Semua] [ADMIN] [DOKTER] [STAFF LAB] ...    │  │  │  │
│  │  │  └─────────────────────────────────────────────┘  │  │  │
│  │  │                                                   │  │  │
│  │  │  ┌─────────────────────────────────────────────┐  │  │  │
│  │  │  │  DataTable                                   │  │  │  │
│  │  │  │  Kolom: Role (ikon+nama+deskripsi)          │  │  │  │
│  │  │  │         Jumlah User, Status, Aksi            │  │  │  │
│  │  │  └─────────────────────────────────────────────┘  │  │  │
│  │  │                                                   │  │  │
│  │  │  ┌────────────────┐  ┌─────────────────────────┐  │  │  │
│  │  │  │ RoleFormModal  │  │   RoleDetailModal        │  │  │  │
│  │  │  │ (create/edit)  │  │   (read-only + stats)    │  │  │  │
│  │  │  └────────────────┘  └─────────────────────────┘  │  │  │
│  │  │                                                   │  │  │
│  │  │  ┌─────────────────────────────────────────────┐  │  │  │
│  │  │  │  RoleDeleteModal (guard: role yg punya user  │  │  │  │
│  │  │  │  tidak bisa dihapus)                         │  │  │  │
│  │  │  └─────────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Alur Data

```
Redux Store (state.AuthSlicer)
    │
    ▼ token (BearerToken)
    │
    ▼
useGetRoleListQuery(params)              ← RTK Query (rolesApi)
useGetUserListQuery({ per_page: 9999 }) ← untuk hitung jumlah user per role
    │
    ▼
transformApiRole(apiRole)               ← src/Components/Setting/Role/types.ts
    │
    ▼
filteredData                            ← filter: with_deleted + roleNameFilter
    │
    ▼
DataTable                               ← src/Components/General/Datatable.tsx
    │
    ▼
RoleFormModal / RoleDetailModal / RoleDeleteModal
```

---

## File & Struktur

```
src/
├── Components/Setting/Role/
│   ├── types.ts                   # Type definitions + helpers + constants
│   ├── roleData.ts                # Dummy data untuk development
│   ├── MainRole.tsx               # Komponen utama: tabel + handlers + API hooks
│   ├── RoleFormModal.tsx          # Modal tambah / edit role
│   ├── RoleDetailModal.tsx        # Modal detail role (dengan stats & permissions)
│   └── RoleDeleteModal.tsx        # Modal konfirmasi hapus (guard: usersCount > 0)
│
└── Services/Modules/Roles/
    ├── roles.types.ts             # Type API request/response
    ├── rolesApi.ts                # RTK Query API slice
    ├── getRoleList.ts             # GET /roles
    ├── getRoleById.ts             # GET /roles/:id
    ├── postRole.ts                # POST /roles
    ├── putRole.ts                 # PUT /roles/:id
    ├── deleteRole.ts              # DELETE /roles/:id
    ├── patchRoleToggleActive.ts   # PATCH /roles/:id/toggle-active
    └── patchRoleRestore.ts        # PATCH /roles/:id/restore
```

---

## Quick Start
## Komponen: MainRole

**File:** `src/Components/Setting/Role/MainRole.tsx`

Komponen utama yang menampilkan daftar role beserta aksi CRUD, toggle status, dan filter tab dinamis.

### Fitur

| Fitur            | Deskripsi                                                              |
| ---------------- | ---------------------------------------------------------------------- |
| 🔍 Search        | Server-side search via query param `search`                            |
| 🗂️ Filter Tab    | Tab dinamis dari nama role yang ada di data (bukan hardcoded)          |
| 👥 Jumlah User   | Dihitung dari `useGetUserListQuery` (per_page: 9999), di-map per role  |
| ↕️ Sorting       | Server-side via param `sort_by` dan `sort_order`                       |
| 📄 Pagination    | Server-side via param `page` dan `per_page`                            |
| ➕ Tambah        | Buka RoleFormModal (mode: create)                                      |
| 👁️ Detail        | Buka RoleDetailModal — fetch ulang via `useGetRoleByIdQuery`           |
| ✏️ Edit          | Buka RoleFormModal (mode: edit)                                        |
| 🔄 Toggle Status | `usePatchRoleToggleActiveMutation` — klik langsung dari badge status   |
| 🗑️ Hapus         | Disabled otomatis jika `usersCount > 0`                                |
| ♻️ Restore       | Tampil menggantikan tombol Hapus jika role sudah dihapus (soft delete) |
| 👁️ Mode Terhapus | Tombol "Terhapus" untuk menampilkan soft-deleted roles                 |

### Kolom Tabel

| Kolom       | Accessor     | Deskripsi                                                        |
| ----------- | ------------ | ---------------------------------------------------------------- |
| Role        | `name`       | Ikon warna dinamis + nama role + deskripsi (truncated)           |
| Jumlah User | `usersCount` | Ikon HiUserGroup + jumlah user yang memiliki role ini            |
| Status      | `isActive`   | Badge clickable untuk toggle; badge "Terhapus" jika soft-deleted |
| Aksi        | -            | Detail, Edit (disembunyikan jika terhapus), Restore atau Hapus   |

### State Management

```tsx
// Filter & Pagination (server-side)
const [params, setParams] = useState<RoleListParams>({
  page: 1,
  per_page: 10,
  sort_by: 'role_name',
  sort_order: 'asc',
  with_deleted: false,
})

// Filter tab (client-side, dari nama role)
const [roleNameFilter, setRoleNameFilter] = useState<string>('all')

// Modal state
const [isFormOpen, setIsFormOpen] = useState(false)
const [isDeleteOpen, setIsDeleteOpen] = useState(false)
const [isDetailOpen, setIsDetailOpen] = useState(false)
const [selectedItem, setSelectedItem] = useState<Role | null>(null)
const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
```

### API Hooks yang Digunakan

```tsx
// Query
useGetRoleListQuery(params, { skip: !token })
useGetRoleByIdQuery(selectedItem?.id!, { skip: !selectedItem?.id || !isDetailOpen })
useGetUserListQuery({ per_page: 9999, page: 1 }, { skip: !token })

// Mutations
usePostRoleMutation()
usePutRoleMutation()
useDeleteRoleMutation()
usePatchRoleToggleActiveMutation()
usePatchRoleRestoreMutation()
```

### Filter Tab Dinamis

Tab filter tidak hardcoded — dibuat otomatis dari nama role yang ada di data:

```tsx
const filterTabs = useMemo(() => {
  const uniqueNames = [...new Set(transformedData.map((r) => r.name))]
  return [{ label: 'Semua', value: 'all' }, ...uniqueNames.map((name) => ({ label: name, value: name }))]
}, [transformedData])
```

### Hitung Jumlah User per Role

```tsx
const userCountByRoleId = useMemo(() => {
  const users = userData?.data?.data ?? []
  const countMap: Record<number, number> = {}
  users.forEach((user: any) => {
    const roleId = user.role_id ?? user.role?.id
    if (roleId !== undefined && roleId !== null) {
      countMap[roleId] = (countMap[roleId] ?? 0) + 1
    }
  })
  return countMap
}, [userData])
```

### Handlers

| Handler                      | Deskripsi                                                        |
| ---------------------------- | ---------------------------------------------------------------- |
| `handleCreate()`             | Buka RoleFormModal mode create, reset selectedItem               |
| `handleEdit(item)`           | Buka RoleFormModal mode edit dengan data role                    |
| `handleDetail(item)`         | Set selectedItem → trigger `useGetRoleByIdQuery`                 |
| `handleDelete(item)`         | Buka RoleDeleteModal (tombol disabled jika usersCount > 0)       |
| `handleStatusToggle(item)`   | Panggil `toggleActive(item.id)` lalu `refetch()`                 |
| `handleRestore(item)`        | Panggil `restoreRole(item.id)` lalu `refetch()`                  |
| `handleIncludeDeleted(bool)` | Toggle param `with_deleted`, reset roleNameFilter ke 'all'       |
| `handleSearch(value)`        | Update param `search`, reset `page` ke 1                         |
| `handlePageChange(page)`     | Update param `page`                                              |
| `handleSubmit(data, id?)`    | `putRole` jika ada `id`, `createRole` jika tidak, lalu `refetch` |
| `handleDeleteConfirm(id)`    | Panggil `deleteRole(id)` lalu tutup modal dan `refetch`          |

---

## Komponen: RoleFormModal

**File:** `src/Components/Setting/Role/RoleFormModal.tsx`

Modal form untuk tambah dan edit role. Tidak ada field `type` karena API tidak mengenal enum type — nama role bebas diisi.

### Struktur Modal

```
┌─────────────────────────────────────────┐
│ ✏️ Header                                │
│   [ShieldCheck] Tambah/Edit Role   [✕]  │
├─────────────────────────────────────────┤
│ 📋 Form Fields                           │
│   Nama Role * : [input text]            │
│                 hint: contoh ADMIN,     │
│                 DOKTER, STAFF LAB       │
│   Deskripsi   : [textarea 3 baris]     │
│   Status      : [toggle] ← hanya edit  │
├─────────────────────────────────────────┤
│ 🔘 Footer                                │
│   [Batal]  [🔄 Simpan Role/Update Role] │
└─────────────────────────────────────────┘
```

> **Catatan:** Field Status (toggle aktif/nonaktif) hanya muncul di mode `edit`, tidak di mode `create`.

### Validasi

```tsx
const validate = (): boolean => {
  const newErrors = {}
  if (!formData.role_name.trim()) newErrors.role_name = 'Nama role wajib diisi'
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

### Props

```tsx
interface Props {
  isOpen: boolean
  mode: 'create' | 'edit'
  item?: Role | null
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (data: RoleFormData, id?: number) => void
}
```

### Contoh Penggunaan

```tsx
<RoleFormModal
  isOpen={isFormOpen}
  mode={formMode}
  item={selectedItem}
  isSubmitting={isCreating || isUpdating}
  onClose={() => setIsFormOpen(false)}
  onSubmit={handleSubmit}
/>
```

---

## Komponen: RoleDetailModal

**File:** `src/Components/Setting/Role/RoleDetailModal.tsx`

Modal read-only yang menampilkan detail lengkap sebuah role, termasuk statistik dan daftar permissions yang dikelompokkan per kategori.

### Struktur Modal

```
┌─────────────────────────────────────────────────┐
│ 📄 Header                                        │
│   [ikon warna] Detail Role — Info role [X]       │
├─────────────────────────────────────────────────┤
│ 📋 Role Info Card (gradient bg)                  │
│   Nama Role          [badge nama] [badge status] │
│   Deskripsi                                      │
├─────────────────────────────────────────────────┤
│ 📊 Stats Grid (3 kolom)                          │
│   [👥 Total User] [📅 Dibuat] [🕐 Diupdate]     │
├─────────────────────────────────────────────────┤
│ 🔐 Permissions (dikelompokkan per kategori)      │
│   ┌─ Institusi ──────────────────────────────┐  │
│   │  ● Lihat Institusi  ● Tambah Institusi   │  │
│   └──────────────────────────────────────────┘  │
│   ┌─ User ───────────────────────────────────┐  │
│   │  ● Lihat User       ● Tambah User        │  │
│   └──────────────────────────────────────────┘  │
│   ... (hanya group yang ada permission-nya)      │
├─────────────────────────────────────────────────┤
│ 🔘 Footer                                        │
│                                  [Tutup]         │
└─────────────────────────────────────────────────┘
```

### Loading State

Ketika `isLoading: true`, modal menampilkan spinner penuh sebelum data tersedia:

```tsx
if (isLoading) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl p-8 mx-4 bg-white shadow-2xl rounded-xl">
        <div className="flex justify-center">
          <div className="w-12 h-12 border-4 rounded-full border-primary-500 border-t-transparent animate-spin" />
        </div>
      </div>
    </div>
  )
}
```

### Props

```tsx
interface Props {
  isOpen: boolean
  item: Role | null
  isLoading?: boolean
  onClose: () => void
}
```

### Contoh Penggunaan

```tsx
<RoleDetailModal
  isOpen={isDetailOpen}
  item={roleDetail?.data ? transformApiRole(roleDetail.data) : selectedItem}
  isLoading={isLoadingDetail}
  onClose={() => setIsDetailOpen(false)}
/>
```

---

## Komponen: RoleDeleteModal

**File:** `src/Components/Setting/Role/RoleDeleteModal.tsx`

Modal konfirmasi hapus dengan guard: role yang masih memiliki user tidak bisa dihapus.

### Struktur Modal

```
┌─────────────────────────────────────────┐
│ ⚠️ Header                                │
│   [ExclamationTriangle] Hapus Role [✕]  │
├─────────────────────────────────────────┤
│                                         │
│  [Jika usersCount > 0]                  │
│  ┌─ Warning Box (yellow) ─────────────┐ │
│  │ ⚠️ Role sedang digunakan           │ │
│  │ Role ini memiliki X user aktif.    │ │
│  └────────────────────────────────────┘ │
│  Tidak dapat menghapus. Silakan         │
│  pindahkan user terlebih dahulu.        │
│                                         │
│  [Jika usersCount === 0]                │
│  Apakah Anda yakin ingin menghapus?     │
│  ┌─ Info Card ────────────────────────┐ │
│  │  Nama Role     [badge] [status]     │ │
│  │  Deskripsi                          │ │
│  └────────────────────────────────────┘ │
│  ⚠️ Tindakan ini tidak dapat dibatalkan │
│                                         │
├─────────────────────────────────────────┤
│ 🔘 Footer                                │
│  [Batal]  [🔄 Hapus Role] ← disembunyikan│
│                              jika role  │
│                              sedang dipakai│
└─────────────────────────────────────────┘
```

### Guard Logic

```tsx
// Di tabel: tombol hapus disabled jika usersCount > 0
;<button disabled={row.original.usersCount > 0} className="disabled:opacity-50 disabled:cursor-not-allowed">
  <HiTrash className={row.original.usersCount > 0 ? 'text-gray-300' : 'text-red-600'} />
</button>

// Di modal: tombol konfirmasi disembunyikan
const isRoleUsed = item.usersCount > 0
{
  !isRoleUsed && <button onClick={() => onConfirm(item.id)}>Hapus Role</button>
}
```

### Props

```tsx
interface Props {
  isOpen: boolean
  item: Role | null
  isDeleting?: boolean
  onClose: () => void
  onConfirm: (id: number) => void // id bertipe number
}
```

### Contoh Penggunaan

```tsx
<RoleDeleteModal
  isOpen={isDeleteOpen}
  item={selectedItem}
  isDeleting={isDeleting}
  onClose={() => setIsDeleteOpen(false)}
  onConfirm={handleDeleteConfirm}
/>
```

---

## Types

**File:** `src/Components/Setting/Role/types.ts`

### Permission

```tsx
export type Permission =
  | 'view_institutions'
  | 'create_institutions'
  | 'edit_institutions'
  | 'delete_institutions'
  | 'view_users'
  | 'create_users'
  | 'edit_users'
  | 'delete_users'
  | 'view_devices'
  | 'create_devices'
  | 'edit_devices'
  | 'delete_devices'
  | 'view_patients'
  | 'view_all_patients'
  | 'print_results'
  | 'send_to_boyolali'
  | 'configure_api'
  | 'view_reports'
  | 'manage_roles'
```

### ApiRole (dari API)

```tsx
export interface ApiRole {
  id: number
  role_name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
  created_by: number | null
  updated_by: number | null
  permissions?: RolePermission[]
}
```

### Role (untuk UI)

```tsx
export interface Role {
  id: number // number (bukan string)
  name: string // dari role_name
  type: string // sama dengan name, dinamis dari role_name
  description: string
  permissions: Permission[]
  usersCount: number // dihitung dari useGetUserListQuery, bukan dari API
  createdAt: string
  updatedAt: string
  isActive: boolean
  deletedAt: string | null
}
```

> **Catatan:** Field `type` di-derive langsung dari `role_name`. Tidak ada enum type hardcoded — nama role bebas (contoh: `ADMIN`, `DOKTER`, `STAFF LAB`).

### RoleFormData

```tsx
export interface RoleFormData {
  role_name: string
  description?: string | null
  is_active?: boolean
  permissions: Permission[]
}

export const ROLE_FORM_INITIAL: RoleFormData = {
  role_name: '',
  description: '',
  is_active: true,
  permissions: [],
}
```

### RoleListParams

```tsx
export interface RoleListParams {
  page?: number
  per_page?: number
  search?: string
  is_active?: boolean
  with_deleted?: boolean
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}
```

### Helper Functions

| Fungsi                    | Return         | Deskripsi                                             |
| ------------------------- | -------------- | ----------------------------------------------------- |
| `transformApiRole()`      | `Role`         | Transform `ApiRole` ke format UI `Role`               |
| `mapApiPermissionsToUI()` | `Permission[]` | Map `RolePermission[]` dari API ke array `Permission` |
| `getRoleBadgeColor()`     | `string`       | Class Tailwind badge, konsisten dari hash nama role   |
| `getRoleIconColor()`      | `{ bg, icon }` | Class Tailwind ikon, konsisten dari hash nama role    |

---

## Dummy Data

**File:** `src/Components/Setting/Role/roleData.ts`

Data dummy berisi 5 role dari dua institusi berbeda:

| #   | id  | Nama                | isActive | Permissions Utama                              |
| --- | --- | ------------------- | -------- | ---------------------------------------------- |
| 1   | 1   | Super Administrator | ✅       | Semua permission (19 total)                    |
| 2   | 2   | Admin RSUD Wonosari | ✅       | view/manage users, view patients, view reports |
| 3   | 3   | IT RSUD Wonosari    | ✅       | view/manage devices, configure_api             |
| 4   | 4   | Admin RSUD Sleman   | ✅       | view/manage users, view patients, view reports |
| 5   | 5   | IT RSUD Sleman      | ❌       | view/manage devices, configure_api             |

> **Catatan:** `id` bertipe `number`. `type` sama dengan `name`. Tidak ada `DEFAULT_ROLE_PERMISSIONS` — setiap role mendefinisikan `permissions[]` secara eksplisit.

### Penggunaan

```tsx
import { dummyRoleData } from './roleData'

;<DataTable data={dummyRoleData} columns={columns} />
```

---

## Services API

**Directory:** `src/Services/Modules/Roles/`

Semua service diekspos sebagai RTK Query hooks via `rolesApi.ts`.

| Hook                               | Method | Endpoint                   | Deskripsi                 |
| ---------------------------------- | ------ | -------------------------- | ------------------------- |
| `useGetRoleListQuery`              | GET    | `/roles`                   | Ambil semua role          |
| `useGetRoleByIdQuery`              | GET    | `/roles/:id`               | Ambil detail satu role    |
| `usePostRoleMutation`              | POST   | `/roles`                   | Buat role baru            |
| `usePutRoleMutation`               | PUT    | `/roles/:id`               | Update role               |
| `useDeleteRoleMutation`            | DELETE | `/roles/:id`               | Hapus role (soft delete)  |
| `usePatchRoleToggleActiveMutation` | PATCH  | `/roles/:id/toggle-active` | Toggle aktif/nonaktif     |
| `usePatchRoleRestoreMutation`      | PATCH  | `/roles/:id/restore`       | Restore role yang dihapus |

### Contoh Pemanggilan

```tsx
// List dengan params server-side
const { data, isLoading, refetch, isFetching } = useGetRoleListQuery(params, {
  skip: !token,
})

// Detail — lazy fetch, hanya aktif saat modal detail terbuka
const { data: roleDetail, isLoading: isLoadingDetail } = useGetRoleByIdQuery(selectedItem?.id!, {
  skip: !selectedItem?.id || !isDetailOpen,
})

// Mutation
const [createRole, { isLoading: isCreating }] = usePostRoleMutation()
await createRole({ role_name, description, is_active }).unwrap()

const [toggleActive] = usePatchRoleToggleActiveMutation()
await toggleActive(item.id).unwrap()
refetch()
```

---

## Design System & Warna

| Class                      | Penggunaan                                           |
| -------------------------- | ---------------------------------------------------- |
| `primary-600`              | Tombol utama (Simpan, Tambah Role)                   |
| `primary-50 / primary-100` | Background ikon header modal                         |
| `green-100 / green-700`    | Badge status Aktif                                   |
| `red-100 / red-700`        | Badge status Nonaktif, tombol Hapus                  |
| `gray-100 / gray-600`      | Badge status Terhapus (soft delete)                  |
| `orange-50 / orange-600`   | Tombol mode "Terhapus" saat aktif                    |
| `yellow-50 / yellow-800`   | Warning box di RoleDeleteModal (role sedang dipakai) |
| `blue-50 / blue-600`       | Stats card Total User di RoleDetailModal             |
| `green-50 / green-600`     | Stats card Dibuat di RoleDetailModal                 |
| `yellow-50 / yellow-600`   | Stats card Diupdate di RoleDetailModal               |

### Warna Dinamis Badge & Ikon

Warna badge dan ikon role tidak hardcoded — di-generate dari **hash nama role** agar setiap role selalu mendapat warna yang konsisten meskipun nama role berubah-ubah:

```tsx
const COLORS = [
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-yellow-100 text-yellow-700 border-yellow-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
]

// Hash sederhana: jumlah charCode dari nama role
const hash = roleName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
return COLORS[hash % COLORS.length]
```

---

## Permissions

### Daftar Permission

| Permission            | Label UI                | Kategori              |
| --------------------- | ----------------------- | --------------------- |
| `view_institutions`   | Lihat Institusi         | Institusi             |
| `create_institutions` | Tambah Institusi        | Institusi             |
| `edit_institutions`   | Edit Institusi          | Institusi             |
| `delete_institutions` | Hapus Institusi         | Institusi             |
| `view_users`          | Lihat User              | User                  |
| `create_users`        | Tambah User             | User                  |
| `edit_users`          | Edit User               | User                  |
| `delete_users`        | Hapus User              | User                  |
| `manage_roles`        | Kelola Role             | User                  |
| `view_devices`        | Lihat Alat              | Alat (Device)         |
| `create_devices`      | Tambah Alat             | Alat (Device)         |
| `edit_devices`        | Edit Alat               | Alat (Device)         |
| `delete_devices`      | Hapus Alat              | Alat (Device)         |
| `view_patients`       | Lihat Data Pasien       | Data Pasien           |
| `view_all_patients`   | Lihat Semua Data Pasien | Data Pasien           |
| `print_results`       | Cetak Hasil             | Data Pasien           |
| `send_to_boyolali`    | Kirim ke Boyolali Sehat | Data Pasien           |
| `view_reports`        | Lihat Laporan           | Laporan & Konfigurasi |
| `configure_api`       | Konfigurasi API         | Laporan & Konfigurasi |

### Permission Groups

```tsx
export const PERMISSION_GROUPS = [
  {
    name: 'Institusi',
    permissions: ['view_institutions', 'create_institutions', 'edit_institutions', 'delete_institutions'],
  },
  { name: 'User', permissions: ['view_users', 'create_users', 'edit_users', 'delete_users', 'manage_roles'] },
  {
    name: 'Alat (Device)',
    permissions: ['view_devices', 'create_devices', 'edit_devices', 'delete_devices'],
  },
  {
    name: 'Data Pasien',
    permissions: ['view_patients', 'view_all_patients', 'print_results', 'send_to_boyolali'],
  },
  { name: 'Laporan & Konfigurasi', permissions: ['view_reports', 'configure_api'] },
]
```

---

## Referensi Props

### MainRole — tidak menerima props eksternal (self-contained)

### RoleFormModal

| Prop           | Type                                        | Required | Default | Deskripsi                          |
| -------------- | ------------------------------------------- | -------- | ------- | ---------------------------------- |
| `isOpen`       | `boolean`                                   | ✅       | -       | Status modal                       |
| `mode`         | `'create' \| 'edit'`                        | ✅       | -       | Mode form                          |
| `item`         | `Role \| null`                              | ❌       | `null`  | Data awal untuk mode edit          |
| `isSubmitting` | `boolean`                                   | ❌       | `false` | Loading state saat submit          |
| `onClose`      | `() => void`                                | ✅       | -       | Callback tutup                     |
| `onSubmit`     | `(data: RoleFormData, id?: number) => void` | ✅       | -       | Callback submit (id ada jika edit) |

### RoleDetailModal

| Prop        | Type           | Required | Default | Deskripsi                           |
| ----------- | -------------- | -------- | ------- | ----------------------------------- |
| `isOpen`    | `boolean`      | ✅       | -       | Status modal                        |
| `item`      | `Role \| null` | ✅       | -       | Data role (dari transformApiRole)   |
| `isLoading` | `boolean`      | ❌       | `false` | Tampilkan spinner saat fetch detail |
| `onClose`   | `() => void`   | ✅       | -       | Callback tutup                      |

### RoleDeleteModal

| Prop         | Type                   | Required | Default | Deskripsi                              |
| ------------ | ---------------------- | -------- | ------- | -------------------------------------- |
| `isOpen`     | `boolean`              | ✅       | -       | Status modal                           |
| `item`       | `Role \| null`         | ✅       | -       | Data role yang akan dihapus            |
| `isDeleting` | `boolean`              | ❌       | `false` | Loading state saat proses hapus        |
| `onClose`    | `() => void`           | ✅       | -       | Callback tutup                         |
| `onConfirm`  | `(id: number) => void` | ✅       | -       | Callback konfirmasi hapus (id: number) |

---

## TODO

- [ ] Implementasi permission checkbox di RoleFormModal (saat ini permissions tidak bisa diubah via form)
- [ ] Tambahkan toast notification sukses/gagal untuk setiap aksi
- [ ] Tambahkan filter panel by status (Aktif / Nonaktif)
- [ ] Tambahkan validasi form dengan Zod atau Yup
- [ ] Tambahkan konfirmasi dialog sebelum toggle aktif/nonaktif
- [ ] Unit test untuk service layer dan helper functions
- [ ] Tambahkan sort kolom dari UI (saat ini sort_by hanya dari params default)
