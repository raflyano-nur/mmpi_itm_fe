# 👤 User Management — Dokumentasi Modul Manajemen User (Institution Menu)

> Modul untuk menampilkan dan mengelola data user di halaman Institution (Menu Management User), dilengkapi dengan server-side pagination, search, sort, toggle status, dan integrasi penuh dengan API backend menggunakan RTK Query.

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [File & Struktur](#file--struktur)
- [API Endpoints](#api-endpoints)
- [Query Parameters](#query-parameters)
- [Response Format](#response-format)
- [Komponen: MainUserManagement](#komponen-mainusermanagement)
- [Integrasi API](#integrasi-api)
- [Server-Side Features](#server-side-features)
- [Bug Fixes](#bug-fixes)
- [Kustomisasi](#kustomisasi)

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   MainUserManagement.tsx                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     DataTable (Server-side)                        │  │
│  │  ┌───────────────────────────────────────────────────────────────┐  │  │
│  │  │  useGetUserListQuery(queryParams)                            │  │  │
│  │  │  → API call dengan: page, per_page, search, sort_by,       │  │  │
│  │  │    sort_order                                                │  │  │
│  │  └───────────────────────────────────────────────────────────────┘  │  │
│  │                              │                                      │  │
│  │  ┌───────────────────────────▼──────────────────────────────────┐  │  │
│  │  │  mapApiUserToLocalUser()                                     │  │  │
│  │  │  → Konversi API response → Local UserItem type               │  │  │
│  │  └───────────────────────────────────────────────────────────────┘  │  │
│  │                              │                                      │  │
│  │  ┌───────────────────────────▼──────────────────────────────────┐  │  │
│  │  │  DataTable Component                                          │  │  │
│  │  │  Kolom: Nama Lengkap, Institusi, Role, Email, Status, Aksi   │  │  │
│  │  └───────────────────────────────────────────────────────────────┘  │  │
│  │                                                                     │  │
│  │  ┌───────────────────────────────────────────────────────────────┐  │  │
│  │  │  UserDetailModal                                             │  │  │
│  │  │  → Create / Edit user                                        │  │  │
│  │  └───────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Alur Data

```
Query Params State
    │
    ▼
useGetUserListQuery(queryParams)
    │
    ▼
GET /users?page=1&per_page=15&search=&sort_by=created_at&sort_order=desc
    │
    ▼
RTK Query Response: UserListResponse
    │
    ▼
apiResponse.data.data → ApiUserItem[]
    │
    ▼
mapApiUserToLocalUser() → LocalUserItem[]
    │
    ▼
DataTable → Tampilkan ke UI
```

---

## File & Struktur

```
src/
└── Components/Management/User/
    ├── MainUserManagement.tsx     # ⭐ Komponen utama dengan API integration
    ├── UserDetailModal.tsx       # Modal form Create/Edit user
    ├── types.ts                  # Type definitions (Local UserItem)
    └── userManagementData.ts     # Dummy data (tidak digunakan lagi)

src/Services/Modules/Users/
    ├── users.types.ts            # Type definitions (API UserItem, UserListParams)
    ├── index.ts                  # RTK Query hooks export
    ├── getUserList.ts            # GET /users (list + pagination)
    ├── getUserById.ts            # GET /users/:id
    ├── postUser.ts               # POST /users (create)
    ├── putUser.ts                # PUT /users/:id (update)
    ├── deleteUser.ts             # DELETE /users/:id (delete)
    └── patchUserToggleActive.ts  # PATCH /users/:id/toggle-active
```

---

## API Endpoints

| Endpoint                | Method | URL                        | Deskripsi                |
| ----------------------- | ------ | -------------------------- | ------------------------ |
| `getUserList`           | GET    | `/users`                   | Daftar user + pagination |
| `getUserById`           | GET    | `/users/:id`               | Detail user by ID        |
| `postUser`              | POST   | `/users`                   | Tambah user baru         |
| `putUser`               | PUT    | `/users/:id`               | Update user              |
| `deleteUser`            | DELETE | `/users/:id`               | Hapus user               |
| `patchUserToggleActive` | PATCH  | `/users/:id/toggle-active` | Toggle aktif/nonaktif    |

---

## Query Parameters

Berdasarkan file [`getUserList.ts`](src/Services/Modules/Users/getUserList.ts) dan [`users.types.ts`](src/Services/Modules/Users/users.types.ts):

| Parameter        | Tipe        | Default      | Deskripsi                          |
| ---------------- | ----------- | ------------ | ---------------------------------- |
| `page`           | `number`    | `1`          | Halaman yang diminta               |
| `per_page`       | `number`    | `15`         | Jumlah data per halaman            |
| `search`         | `string`    | `''`         | Cari berdasarkan username/fullname |
| `isactive`       | `boolean`   | -            | Filter berdasarkan status aktif    |
| `institution_id` | `number`    | -            | Filter berdasarkan institusi ID    |
| `role_id`        | `number`    | -            | Filter berdasarkan role ID         |
| `is_super_admin` | `boolean`   | -            | Filter super admin                 |
| `sort_by`        | `string`    | `created_at` | Kolom untuk sorting                |
| `sort_order`     | `asc\|desc` | `desc`       | Arah sorting                       |

### Contoh Request

```
GET /users?page=1&per_page=15&search=&sort_by=created_at&sort_order=desc
```

---

## Response Format

### GET /users Response

```json
{
  "status": "success",
  "message": "Users retrieved successfully.",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 39,
        "username": "IT_INST-010",
        "isactive": true,
        "institution_id": 9,
        "role_id": 4,
        "role_name": "STAFF IT",
        "api_key_active": false,
        "fullname": "IT_INST-010",
        "mail": null,
        "phone": null,
        "photo_link": "http://api-sid.indotelemed.web.id/images/default_profile.jpeg"
      }
    ],
    "first_page_url": "http://api-sid.indotelemed.web.id/api/users?page=1",
    "from": 1,
    "last_page": 14,
    "last_page_url": "http://api-sid.indotelemed.web.id/api/users?page=14",
    "links": [...],
    "next_page_url": "http://api-sid.indotelemed.web.id/api/users?page=2",
    "path": "http://api-sid.indotelemed.web.id/api/users",
    "per_page": 15,
    "prev_page_url": null,
    "to": 15,
    "total": 27
  }
}
```

---

## Komponen: MainUserManagement

**File:** `src/Components/Management/User/MainUserManagement.tsx`

Komponen utama yang mengelola seluruh operasi user management dengan integrasi API penuh.

### Fitur

| Fitur            | Deskripsi                                                 |
| ---------------- | --------------------------------------------------------- |
| 🔍 Search        | Pencarian server-side via query param `search`            |
| ↕️ Sorting       | Server-side sorting via `sort_by` dan `sort_order`        |
| 📄 Pagination    | Server-side pagination via `page` dan `per_page`          |
| ➕ Create        | Buka UserDetailModal mode create                          |
| ✏️ Edit          | Buka UserDetailModal mode edit (pre-filled dari data API) |
| 🔄 Toggle Status | Aktifkan/nonaktifkan user via `patchUserToggleActive`     |
| ⏳ Loading State | Spinner saat data sedang dimuat dari API                  |
| 📭 Empty State   | Pesan "Belum ada data pengguna" saat data kosong          |
| 🔄 Auto-refetch  | Data otomatis di-refresh setelah toggle status            |

### Kolom Tabel

| Kolom     | Accessor        | Deskripsi                                |
| --------- | --------------- | ---------------------------------------- |
| Pengguna  | `namaLengkap`   | Avatar inisial + nama lengkap + username |
| Institusi | `namaInstitusi` | Badge institusi user                     |
| Role      | `role`          | Badge role (Super Admin, Admin, IT)      |
| Email     | `email`         | Email user                               |
| Status    | `isactive`      | Badge: hijau (Aktif), abu-abu (Nonaktif) |
| Aksi      | -               | Tombol Edit + Toggle Status              |

### State Management

```tsx
// Query params (server-side)
const [queryParams, setQueryParams] = useState<UserListParams>({
  page: 1,
  per_page: 15,
  search: '',
  sort_by: 'created_at',
  sort_order: 'desc',
})

// API Hook
const { data: apiResponse, isLoading, isFetching, refetch } = useGetUserListQuery(queryParams)

// Toggle mutation
const [toggleActive, { isLoading: isToggling }] = usePatchUserToggleActiveMutation()
```

---

## Integrasi API

### Langkah 1: Import Hooks dan Types

```tsx
import type { UserListParams } from '@/Services/Modules/Users/users.types'
import { useGetUserListQuery, usePatchUserToggleActiveMutation } from '@/Services/Modules/Users'
```

### Langkah 2: Setup Query Params

```tsx
const [queryParams, setQueryParams] = useState<UserListParams>({
  page: 1,
  per_page: 15,
  search: '',
  sort_by: 'created_at',
  sort_order: 'desc',
})
```

### Langkah 3: Fetch Data dari API

```tsx
const { data: apiResponse, isLoading, isFetching, refetch } = useGetUserListQuery(queryParams)
```

### Langkah 4: Map Data ke Format Lokal

```tsx
// Mapper function untuk konversi API response ke format UI
const mapApiUserToLocalUser = (apiUser: ApiUserItem): LocalUserItem => {
  return {
    id: String(apiUser.id),
    username: apiUser.username,
    namaLengkap: apiUser.fullname || apiUser.username,
    phone: apiUser.phone || '',
    email: apiUser.mail || '',
    role: (apiUser.role_name?.toLowerCase().replace(' ', '_') as UserRole) || 'it',
    institutionId: apiUser.institution_id ? String(apiUser.institution_id) : null,
    namaInstitusi: apiUser.institution_id ? `Institution #${apiUser.institution_id}` : '-',
    status: apiUser.isactive ? 'aktif' : 'nonaktif',
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  }
}

// Usage
const data = useMemo<LocalUserItem[]>(() => {
  const apiData = apiResponse?.data?.data ?? []
  return apiData.map(mapApiUserToLocalUser)
}, [apiResponse])
```

### Langkah 5: Pagination Info

```tsx
const paginationInfo = useMemo(() => {
  if (!apiResponse?.data) return null
  const { current_page, last_page, per_page, total } = apiResponse.data
  const from = total > 0 ? (current_page - 1) * per_page + 1 : 0
  const to = Math.min(current_page * per_page, total)
  return { current_page, last_page, from, to, total, per_page }
}, [apiResponse])
```

---

## Server-Side Features

### Pagination

```tsx
// Handler untuk page change
const handlePageChange = (page: number) => {
  // Convert from 0-based (TanStack) to 1-based (API)
  setQueryParams((prev) => ({ ...prev, page: page + 1 }))
}

// Handler untuk page size change
const handlePageSizeChange = (pageSize: number) => {
  setQueryParams((prev) => ({ ...prev, per_page: pageSize, page: 1 }))
}
```

### Sorting

```tsx
// Handler untuk sort change
const handleSortChange = (sortBy: string, sortOrder: string) => {
  setQueryParams((prev) => ({
    ...prev,
    sort_by: sortBy,
    sort_order: sortOrder as 'asc' | 'desc',
  }))
}
```

### Search

```tsx
// Handler untuk search change
const handleSearchChange = (search: string) => {
  setQueryParams((prev) => ({ ...prev, search, page: 1 }))
}
```

### DataTable Integration

```tsx
<DataTable<LocalUserItem>
  data={data}
  columns={columns}
  pageSize={queryParams.per_page}
  showSearch={true}
  searchPlaceholder="Cari berdasarkan nama, username, atau email..."
  isLoading={isLoading || isFetching}
  emptyMessage="Belum ada data pengguna"
  // Server-side props
  currentPage={paginationInfo?.current_page}
  lastPage={paginationInfo?.last_page}
  totalData={paginationInfo?.total}
  apiFrom={paginationInfo?.from}
  apiTo={paginationInfo?.to}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  onSortChange={handleSortChange}
  serverSortBy={queryParams.sort_by}
  serverSortOrder={queryParams.sort_order}
  onSearchChange={handleSearchChange}
/>
```

---

## Bug Fixes

### Bug: Search Focus Loss

**Masalah:** Ketika user mengetik di input search, focus input hilang setelah data di-refetch dari API.

**Solusi:** Menggunakan controlled input dengan local state dan debounce:

```tsx
// Di Datatable.tsx
const [searchInputValue, setSearchInputValue] = useState('')
const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

// Debounced search handler
const handleSearchChange = (value: string) => {
  setSearchInputValue(value)

  // Clear previous timeout
  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current)
  }

  // Debounce: call API after 500ms
  searchTimeoutRef.current = setTimeout(() => {
    setGlobalFilter(value)
    if (handleSearch) {
      handleSearch(value)
    }
  }, 500)
}

// Controlled input
;<input
  type="text"
  value={searchInputValue}
  onChange={(e) => {
    const value = e.target.value
    setSearchInputValue(value)
    if (isServerSide) {
      handleSearchChange(value)
    } else {
      table.setGlobalFilter(value)
    }
  }}
/>
```

**Fitur:**

- ✅ Input tidak kehilangan focus saat mengetik
- ✅ Debounce 500ms untuk mengurangi terlalu banyak API calls
- ✅ Controlled input menjaga nilai tetap ada saat re-render

---

### Bug: Pagination Previous Button

**Masalah:** Tombol "Sebelumnya" tidak bekerja dengan benar karena logika pengurangan yang salah.

**Kode yang salah:**

```tsx
// Di Datatable.tsx - Previous button
onPageChange((currentPage || 1) - 1 - 1) // Salah: mengurangi 1 dua kali!
```

**Solusi:**

```tsx
// Di Datatable.tsx - Previous button
onPageChange((currentPage || 1) - 1) // Benar: hanya mengurangi 1

// Di Datatable.tsx - Next button
onPageChange((currentPage || 1) + 1) // Benar: menambahkan 1
```

**Penjelasan:**

- `currentPage` adalah halaman saat ini dalam format 1-based (dari API)
- Untuk tombol "Sebelumnya", kita kurangi 1 dari halaman saat ini
- Untuk tombol "Selanjutnya", kita tambahkan 1 ke halaman saat ini
- Hasilnya dikirim ke handler yang akan update state dan refetch dari API

---

### Bug: Pagination Info "Halaman -1 dari -1"

**Masalah:** Informasi pagination menampilkan nilai negatif karena extraction yang salah.

**Solusi:** Memperbaiki extraction `from`/`to` dari API response dengan fallback:

```tsx
const paginationInfo = useMemo(() => {
  if (!apiResponse?.data) return null
  const apiData = apiResponse.data
  const { current_page, last_page, per_page, total } = apiData

  // Use from/to from API if available, otherwise calculate
  const from = apiData.from ?? (total > 0 ? (current_page - 1) * per_page + 1 : 0)
  const to = apiData.to ?? Math.min(current_page * per_page, total)

  return { current_page, last_page, from, to, total, per_page }
}, [apiResponse])
```

---

## Kustomisasi

### Mengubah Default Page Size

```tsx
const [queryParams, setQueryParams] = useState<UserListParams>({
  page: 1,
  per_page: 20, // Ubah dari 15 ke 20
  // ...
})
```

### Mengubah Default Sort

```tsx
const [queryParams, setQueryParams] = useState<UserListParams>({
  page: 1,
  per_page: 15,
  search: '',
  sort_by: 'username', // Ubah kolom sorting
  sort_order: 'asc', // Ubah arah sorting
})
```

### Menambah Filter Lainnya

```tsx
// Tambahkan institution_id filter
const [queryParams, setQueryParams] = useState<UserListParams>({
  page: 1,
  per_page: 15,
  search: '',
  sort_by: 'created_at',
  sort_order: 'desc',
  institution_id: 9, // Filter by institution
})

// Di handler
const handleFilterByInstitution = (institutionId: number) => {
  setQueryParams((prev) => ({ ...prev, institution_id: institutionId, page: 1 }))
}
```

---

## Referensi API Hooks

### useGetUserListQuery

```tsx
import { useGetUserListQuery } from '@/Services/Modules/Users'

// Parameters
const queryParams: UserListParams = {
  page: 1,
  per_page: 15,
  search: '',
  sort_by: 'created_at',
  sort_order: 'desc',
}

const { data, isLoading, isFetching, refetch } = useGetUserListQuery(queryParams)
```

### usePatchUserToggleActiveMutation

```tsx
import { usePatchUserToggleActiveMutation } from '@/Services/Modules/Users'

const [toggleActive, { isLoading: isToggling }] = usePatchUserToggleActiveMutation()

// Usage
const handleToggle = async (userId: number) => {
  try {
    await toggleActive(userId).unwrap()
    refetch() // Refresh data after toggle
  } catch (error) {
    console.error('Failed to toggle user status:', error)
  }
}
```
