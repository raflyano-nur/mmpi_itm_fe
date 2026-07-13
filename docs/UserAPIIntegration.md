# 🔌 User API Integration — Dokumentasi Integrasi API untuk Manajemen User

> Dokumentasi ini menjelaskan bagaimana pagination dan filter seharusnya diimplementasikan menggunakan query params API secara penuh di halaman Institution > Menu User.

---

## Daftar Isi

- [Query Parameters yang Didukung](#query-parameters-yang-didukung)
- [Implementasi Saat Ini](#implementasi-saat-ini)
- [Masalah yang Ditemukan](#masalah-yang-ditemukan)
- [Solusi yang Direkomendasikan](#solusi-yang-direkomendasikan)
- [Contoh Implementasi](#contoh-implementasi)
- [Response API Reference](#response-api-reference)

---

## Query Parameters yang Didukung

Berdasarkan file [`src/Services/Modules/Users/users.types.ts`](src/Services/Modules/Users/users.types.ts) dan [`src/Services/Modules/Users/getUserList.ts`](src/Services/Modules/Users/getUserList.ts):

| Parameter        | Tipe      | Default      | Deskripsi                          |
| ---------------- | --------- | ------------ | ---------------------------------- | ------------ |
| `page`           | `number`  | `1`          | Halaman yang diminta               |
| `per_page`       | `number`  | `15`         | Jumlah data per halaman            |
| `search`         | `string`  | `''`         | Cari berdasarkan username/fullname |
| `isactive`       | `boolean` | -            | Filter berdasarkan status aktif    |
| `institution_id` | `number`  | -            | Filter berdasarkan institusi ID    |
| `role_id`        | `number`  | -            | Filter berdasarkan role ID         |
| `is_super_admin` | `boolean` | -            | Filter super admin                 |
| `sort_by`        | `string`  | `created_at` | Kolom untuk sorting                |
| `sort_order`     | `asc      | desc`        | `desc`                             | Arah sorting |

### Interface UserListParams

```typescript
// src/Services/Modules/Users/users.types.ts
export interface UserListParams {
  page?: number
  per_page?: number
  search?: string
  isactive?: boolean
  institution_id?: number
  role_id?: number
  is_super_admin?: boolean
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}
```

---

## Implementasi Saat Ini

Di file [`src/Components/Setting/User/MainUser.tsx`](src/Components/Setting/User/MainUser.tsx), berikut state dan handlers yang ada:

### State Params (Line 41-45)

```tsx
const [params, setParams] = useState<UserListParams>({
  page: 1,
  per_page: 10,
  sort_order: 'asc',
})
```

**Masalah:** State params hanya menginisialisasi `page`, `per_page`, dan `sort_order`. Parameter lainnya (`search`, `isactive`, `institution_id`, `role_id`, `sort_by`) tidak diinisialisasi.

### Handler Search (Line 161-163)

```tsx
const handleSearch = (value: string) => {
  setParams((prev) => ({ ...prev, page: 1, search: value || undefined }))
}
```

**Status:** ✅ Sudah diimplementasikan

### Handler Page Change (Line 165-167)

```tsx
const handlePageChange = (page: number) => {
  setParams((prev) => ({ ...prev, page }))
}
```

**Status:** ✅ Sudah diimplementasikan

### API Query Hook (Line 60-66)

```tsx
const {
  data: userData,
  isLoading,
  refetch,
  isFetching,
  error: listError,
} = useGetUserListQuery(params, { skip: !token })
```

**Status:** ✅ Params sudah dikirim ke API

### Data Transformation (Line 126-146)

```tsx
const transformedData = useMemo(() => {
  if (!userData?.data?.data) return []
  return userData.data.data.map((user: UserItem) => {
    const instName =
      institutionsData?.data?.data?.find((inst: any) => inst.id === user.institution_id)?.institutions_name ||
      '-'

    return {
      id: user.id,
      name: user.fullname || '-',
      username: user.username,
      email: user.mail || '-',
      role_id: user.role_id,
      roleName: user.role_id ? roleMap[user.role_id] || `Role #${user.role_id}` : '-',
      institutionId: user.institution_id,
      institutionName: instName,
      status: user.isactive ? 'active' : 'inactive',
      photo_link: user.photo_link ?? null,
    }
  })
}, [userData, institutionsData, roleMap])
```

**Status:** ✅ Data ditransformasi dengan benar dari API response

---

## Masalah yang Ditemukan

### 1. Tidak Ada Filter UI untuk isactive, institution_id, dan role_id

**Lokasi:** [`MainUser.tsx`](src/Components/Setting/User/MainUser.tsx)

**Deskripsi:** Tidak ada komponen UI (dropdown, checkbox, atau filter panel) untuk memfilter data berdasarkan:

- Status aktif/nonaktif (`isactive`)
- Institusi (`institution_id`)
- Role (`role_id`)

**Solusi:** Tambahkan filter panel dengan dropdown filters

### 2. Tidak Ada sort_by Handler

**Lokasi:** [`MainUser.tsx`](src/Components/Setting/User/MainUser.tsx)

**Deskripsi:** Parameter `sort_by` tidak dikirim ke API karena tidak ada handler untuk mengupdate kolom yang diurutkan.

**Solusi:** Tambahkan handler untuk sort_by atau gunakan sorting dari DataTable

### 3. Default sort_order Tidak Sesuai

**Lokasi:** Line 44 di [`MainUser.tsx`](src/Components/Setting/User/MainUser.tsx)

```tsx
sort_order: 'asc',  // Seharusnya 'desc' sesuai default API
```

**Solusi:** Ubah menjadi `sort_order: 'desc'`

### 4. Default per_page Tidak Konsisten

**Lokasi:** Line 43 di [`MainUser.tsx`](src/Components/Setting/User/MainUser.tsx)

```tsx
per_page: 10,  // Default API adalah 15
```

**Solusi:** Ubah menjadi `per_page: 15` agar konsisten dengan API

---

## Solusi yang Direkomendasikan

### 1. Update State Params

```tsx
const [params, setParams] = useState<UserListParams>({
  page: 1,
  per_page: 15,
  sort_by: 'created_at',
  sort_order: 'desc',
})
```

### 2. Tambahkan Filter Handlers

```tsx
// Filter berdasarkan status aktif
const handleFilterByActive = (isActive: boolean | undefined) => {
  setParams((prev) => ({ ...prev, page: 1, isactive: isActive }))
}

// Filter berdasarkan institusi
const handleFilterByInstitution = (institutionId: number | undefined) => {
  setParams((prev) => ({ ...prev, page: 1, institution_id: institutionId }))
}

// Filter berdasarkan role
const handleFilterByRole = (roleId: number | undefined) => {
  setParams((prev) => ({ ...prev, page: 1, role_id: roleId }))
}

// Handle sorting
const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
  setParams((prev) => ({ ...prev, sort_by: sortBy, sort_order: sortOrder }))
}
```

### 3. Contoh Filter Panel UI

```tsx
<div className="flex gap-4 mb-4">
  {/* Search */}
  <input type="text" placeholder="Cari user..." onChange={(e) => handleSearch(e.target.value)} />

  {/* Filter Status */}
  <select
    onChange={(e) => handleFilterByActive(e.target.value === '' ? undefined : e.target.value === 'true')}
  >
    <option value="">Semua Status</option>
    <option value="true">Aktif</option>
    <option value="false">Nonaktif</option>
  </select>

  {/* Filter Institusi */}
  <select onChange={(e) => handleFilterByInstitution(e.target.value ? Number(e.target.value) : undefined)}>
    <option value="">Semua Institusi</option>
    {institutions.map((inst) => (
      <option key={inst.id} value={inst.id}>
        {inst.name}
      </option>
    ))}
  </select>

  {/* Filter Role */}
  <select onChange={(e) => handleFilterByRole(e.target.value ? Number(e.target.value) : undefined)}>
    <option value="">Semua Role</option>
    {roleOptions.map((role) => (
      <option key={role.value} value={role.value}>
        {role.label}
      </option>
    ))}
  </select>
</div>
```

---

## Contoh Implementasi

### Contoh Lengkap State dan Handlers

```tsx
// State dengan semua parameter
const [params, setParams] = useState<UserListParams>({
  page: 1,
  per_page: 15,
  sort_by: 'created_at',
  sort_order: 'desc',
  search: undefined,
  isactive: undefined,
  institution_id: undefined,
  role_id: undefined,
})

// Search handler
const handleSearch = (value: string) => {
  setParams((prev) => ({ ...prev, page: 1, search: value || undefined }))
}

// Page change handler
const handlePageChange = (page: number) => {
  setParams((prev) => ({ ...prev, page }))
}

// Filter by status
const handleFilterByActive = (isActive: boolean | undefined) => {
  setParams((prev) => ({ ...prev, page: 1, isactive: isActive }))
}

// Filter by institution
const handleFilterByInstitution = (institutionId: number | undefined) => {
  setParams((prev) => ({ ...prev, page: 1, institution_id: institutionId }))
}

// Filter by role
const handleFilterByRole = (roleId: number | undefined) => {
  setParams((prev) => ({ ...prev, page: 1, role_id: roleId }))
}

// Sort change handler
const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
  setParams((prev) => ({ ...prev, page: 1, sort_by: sortBy, sort_order: sortOrder }))
}

// Reset semua filter
const handleResetFilters = () => {
  setParams({
    page: 1,
    per_page: 15,
    sort_by: 'created_at',
    sort_order: 'desc',
  })
}
```

---

## Response API Reference

### GET /users Response

```json
{
  "status": "success",
  "message": "Users retrieved successfully.",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 6,
        "username": "admin_puskes",
        "isactive": true,
        "institution_id": 8,
        "role_id": 5,
        "role_name": "SUPER ADMIN",
        "api_key_active": true,
        "fullname": "Puskesmas Cikaso",
        "mail": "admin@klinik.com",
        "phone": null,
        "photo_link": "http://api-sid.indotelemed.web.id/images/default_profile.jpeg"
      },
      {
        "id": 13,
        "username": "admin_INST-022",
        "isactive": true,
        "institution_id": 21,
        "role_id": 3,
        "role_name": "ADMIN",
        "api_key_active": false,
        "fullname": "admin_INST-022",
        "mail": null,
        "phone": null,
        "photo_link": "http://api-sid.indotelemed.web.id/images/default_profile.jpeg"
      }
    ],
    "first_page_url": "http://api-sid.indotelemed.web.id/api/users?page=1",
    "from": 1,
    "last_page": 3,
    "last_page_url": "http://api-sid.indotelemed.web.id/api/users?page=3",
    "links": [
      { "url": null, "label": "&laquo; Previous", "page": null, "active": false },
      {
        "url": "http://api-sid.indotelemed.web.id/api/users?page=1",
        "label": "1",
        "page": 1,
        "active": true
      },
      {
        "url": "http://api-sid.indotelemed.web.id/api/users?page=2",
        "label": "2",
        "page": 2,
        "active": false
      },
      {
        "url": "http://api-sid.indotelemed.web.id/api/users?page=3",
        "label": "3",
        "page": 3,
        "active": false
      },
      {
        "url": "http://api-sid.indotelemed.web.id/api/users?page=2",
        "label": "Next &raquo;",
        "page": 2,
        "active": false
      }
    ],
    "next_page_url": "http://api-sid.indotelemed.web.id/api/users?page=2",
    "path": "http://api-sid.indotelemed.web.id/api/users",
    "per_page": 10,
    "prev_page_url": null,
    "to": 10,
    "total": 27
  }
}
```

### Interface UserListResponse

```typescript
// src/Services/Modules/Users/users.types.ts
export interface UserListResponse {
  status: string
  message: string
  data: {
    data: UserItem[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
```

### Interface UserItem

```typescript
// src/Services/Modules/Users/users.types.ts
export interface UserItem {
  id: number
  username: string
  isactive: boolean
  is_super_admin: boolean
  institution_id: number
  role_id?: number | null
  role_name?: string | null
  api_key_active: boolean
  fullname?: string | null
  mail?: string | null
  phone?: string | null
  photo_link?: string | null
}
```

---

## Kesimpulan

Untuk mengimplementasikan pagination dan filter secara penuh menggunakan API:

1. **Tambahkan filter parameters** ke state params: `isactive`, `institution_id`, `role_id`
2. **Tambahkan sort_by parameter** untuk支持 server-side sorting
3. **Buat UI filter** dengan dropdown untuk status, institusi, dan role
4. **Update handlers** untuk menangani perubahan filter
5. **Sesuaikan defaults** dengan API: `per_page: 15`, `sort_order: 'desc'`

Dengan implementasi ini, data yang ditampilkan akan akurat karena semua filtering dan pagination dilakukan di sisi server melalui API call.
