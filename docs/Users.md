# 👤 User — Dokumentasi Modul Manajemen User

> Modul untuk manajemen User (Pengguna Aplikasi) pada halaman Settings, dilengkapi dengan CRUD, toggle aktif/nonaktif, dan integrasi dropdown institusi.

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [File & Struktur](#file--struktur)
- [Quick Start](#quick-start)
- [Komponen: MainUser](#komponen-mainuser)
- [Komponen: UserFormModal](#komponen-userformmodal)
- [Komponen: UserDetailModal](#komponen-userdetailmodal)
- [Komponen: UserDeleteModal](#komponen-userdeletemodal)
- [Types](#types)
- [Dummy Data](#dummy-data)
- [Services API](#services-api)
- [Design System & Warna](#design-system--warna)
- [Integrasi API](#integrasi-api)
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
│  │  │                  MainUser.tsx                      │  │  │
│  │  │                                                   │  │  │
│  │  │  ┌─────────────────────────────────────────────┐  │  │  │
│  │  │  │  DataTable (tabel daftar user)               │  │  │  │
│  │  │  │  Kolom: Nama, Username, Email               │  │  │  │
│  │  │  │         Institusi, Role, Status, Aksi        │  │  │  │
│  │  │  └─────────────────────────────────────────────┘  │  │  │
│  │  │                                                   │  │  │
│  │  │  ┌────────────────┐  ┌─────────────────────────┐  │  │  │
│  │  │  │ UserFormModal  │  │   UserDetailModal        │  │  │  │
│  │  │  │ (create/edit)  │  │   (read-only)            │  │  │  │
│  │  │  └────────────────┘  └─────────────────────────┘  │  │  │
│  │  │                                                   │  │  │
│  │  │  ┌─────────────────────────────────────────────┐  │  │  │
│  │  │  │  UserDeleteModal (konfirmasi hapus)          │  │  │  │
│  │  │  └─────────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Alur Data

```
API Response
    │
    ▼
getUserList() / getUserById()       ← src/Services/Modules/Users/
getInstitutionsList()               ← src/Services/Modules/Users/
    │
    ▼
Redux Store (state.User)
    │
    ▼
MainUser.tsx                        ← useSelector()
    │
    ▼
DataTable                           ← src/Components/General/Datatable.tsx
    │
    ▼
UserFormModal / UserDetailModal / UserDeleteModal
```

---

## File & Struktur

```
src/
├── Components/Setting/User/
│   ├── types.ts                    # Type definitions (UserItem, UserFormValues)
│   ├── userData.ts                 # Dummy data untuk development
│   ├── MainUser.tsx                # Komponen utama: tabel + handlers
│   ├── UserFormModal.tsx           # Modal tambah / edit user
│   ├── UserDetailModal.tsx         # Modal detail user
│   └── UserDeleteModal.tsx         # Modal konfirmasi hapus user
│
└── Services/Modules/Users/
    ├── users.types.ts              # Type API request/response
    ├── index.ts                    # Re-export semua service User
    ├── getUserList.ts              # GET /users
    ├── getUserById.ts              # GET /users/:id
    ├── getInstitutionsList.ts      # GET /institutions (untuk dropdown)
    ├── postUser.ts                 # POST /users
    ├── putUser.ts                  # PUT /users/:id
    ├── deleteUser.ts               # DELETE /users/:id
    └── patchUserToggleActive.ts    # PATCH /users/:id/toggle-active
```

---

## Quick Start

### 1. Registrasi di MainSetting

```tsx
// src/Components/Setting/MainSetting.tsx
import MainUser from './User/MainUser'

const MainSetting = () => {
  const [activeTab, setActiveTab] = useState('user')

  return (
    <AppLayout title="Setting" subtitle="Manajemen Role, User & Module">
      <TabNav activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === 'user' && <MainUser />}
    </AppLayout>
  )
}
```

---

## Komponen: MainUser

**File:** `src/Components/Setting/User/MainUser.tsx`

Komponen utama yang menampilkan daftar pengguna aplikasi beserta aksi CRUD dan toggle status.

### Fitur

| Fitur           | Deskripsi                                           |
| --------------- | --------------------------------------------------- |
| 🔍 Search       | Pencarian global (nama, username, email, institusi) |
| ↕️ Sorting      | Klik header kolom untuk sort ascending/descending   |
| 📄 Pagination   | Navigasi halaman dengan pilihan jumlah per halaman  |
| ➕ Tambah       | Buka modal form tambah user baru                    |
| 👁️ Detail       | Lihat detail lengkap user                           |
| ✏️ Edit         | Buka modal form edit user                           |
| 🔄 Toggle Aktif | Aktifkan / nonaktifkan akun user                    |
| 🗑️ Hapus        | Konfirmasi hapus user (soft delete)                 |

### Kolom Tabel

| Kolom     | Accessor        | Deskripsi                              |
| --------- | --------------- | -------------------------------------- |
| Nama      | `namaUser`      | Avatar inisial + nama lengkap          |
| Username  | `username`      | Badge neutral dengan username          |
| Email     | `email`         | Teks email dengan ikon                 |
| Institusi | `institusiName` | Nama institusi asal user               |
| Role      | `roleName`      | Badge primary dengan nama role         |
| Status    | `isActive`      | Badge: emerald (Aktif), red (Nonaktif) |
| Aksi      | -               | Tombol Detail, Edit, Toggle, Hapus     |

### State Management

```tsx
const [selectedUser, setSelectedUser] = useState<UserItem | null>(null)
const [isFormOpen, setIsFormOpen] = useState(false)
const [isDetailOpen, setIsDetailOpen] = useState(false)
const [isDeleteOpen, setIsDeleteOpen] = useState(false)
const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
```

### Handlers

| Handler                    | Deskripsi                             |
| -------------------------- | ------------------------------------- |
| `handleCreate()`           | Buka modal form kosong (mode: create) |
| `handleEdit(item)`         | Buka modal form dengan data user      |
| `handleDetail(item)`       | Buka modal detail user                |
| `handleDelete(item)`       | Buka modal konfirmasi hapus           |
| `handleToggleActive(item)` | Toggle status aktif/nonaktif user     |
| `handleCloseAll()`         | Tutup semua modal                     |

---

## Komponen: UserFormModal

**File:** `src/Components/Setting/User/UserFormModal.tsx`

Modal form untuk tambah dan edit user. Dropdown **Institusi** mengambil data dari `getInstitutionsList`, dropdown **Role** mengambil dari daftar role yang tersedia.

### Struktur Modal

```
┌─────────────────────────────────────────┐
│ ✏️ Header                                │
│  [icon] Tambah User / Edit User    [✕]  │
├─────────────────────────────────────────┤
│ 📋 Form Fields                           │
│   Nama User   : [input text]            │
│   Username    : [input text]            │
│   Email       : [input email]           │
│   Password    : [input password] *      │
│   Role        : [select dropdown]       │
│   Institusi   : [select dropdown]       │
│   Status      : [toggle]               │
├─────────────────────────────────────────┤
│ * Password hanya tampil saat mode create │
├─────────────────────────────────────────┤
│ 🔘 Footer Aksi                           │
│              [Batal]  [Simpan]          │
└─────────────────────────────────────────┘
```

### Props

```tsx
interface UserFormModalProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  initialData?: UserItem | null
  onClose: () => void
  onSubmit: (values: UserFormValues) => void
}
```

### Contoh Penggunaan

```tsx
<UserFormModal
  isOpen={isFormOpen}
  mode={formMode}
  initialData={selectedUser}
  onClose={handleCloseAll}
  onSubmit={handleSubmit}
/>
```

---

## Komponen: UserDetailModal

**File:** `src/Components/Setting/User/UserDetailModal.tsx`

Modal read-only yang menampilkan informasi lengkap pengguna.

### Struktur Modal

```
┌─────────────────────────────────────────┐
│ 📄 Header                                │
│   [icon] Detail User               [✕]  │
├─────────────────────────────────────────┤
│ 👤 Info User (bg neutral-50)             │
│   [Avatar] Nama  |  Username  |  Email  │
├─────────────────────────────────────────┤
│ 📋 Detail Lainnya                        │
│   Role       : [badge primary]          │
│   Institusi  : [text]                   │
│   Status     : [badge emerald/red]      │
│   Dibuat     : [tanggal]               │
│   Diperbarui : [tanggal]               │
├─────────────────────────────────────────┤
│ 🔘 Footer                                │
│                           [Tutup]       │
└─────────────────────────────────────────┘
```

### Props

```tsx
interface UserDetailModalProps {
  isOpen: boolean
  item: UserItem | null
  onClose: () => void
}
```

### Contoh Penggunaan

```tsx
<UserDetailModal isOpen={isDetailOpen} item={selectedUser} onClose={handleCloseAll} />
```

---

## Komponen: UserDeleteModal

**File:** `src/Components/Setting/User/UserDeleteModal.tsx`

Modal konfirmasi sebelum menghapus akun pengguna.

### Props

```tsx
interface UserDeleteModalProps {
  isOpen: boolean
  item: UserItem | null
  onClose: () => void
  onConfirm: (item: UserItem) => void
}
```

### Contoh Penggunaan

```tsx
<UserDeleteModal
  isOpen={isDeleteOpen}
  item={selectedUser}
  onClose={handleCloseAll}
  onConfirm={handleConfirmDelete}
/>
```

---

## Types

**File:** `src/Components/Setting/User/types.ts`

### UserItem

```tsx
interface UserItem {
  id: string // ID unik
  namaUser: string // Nama lengkap user
  username: string // Username login
  email: string // Email user
  roleId: string // ID role yang dimiliki
  roleName: string // Nama role (untuk display)
  institusiId: string // ID institusi
  institusiName: string // Nama institusi (untuk display)
  isActive: boolean // Status aktif
  createdAt: string // Tanggal dibuat
  updatedAt: string // Tanggal diperbarui
}
```

### UserFormValues

```tsx
interface UserFormValues {
  namaUser: string
  username: string
  email: string
  password?: string // Opsional saat mode edit
  roleId: string
  institusiId: string
  isActive: boolean
}
```

---

## Dummy Data

**File:** `src/Components/Setting/User/userData.ts`

Data dummy berisi contoh pengguna dari berbagai institusi:

| #   | Nama           | Username    | Role     | Institusi       | Status   |
| --- | -------------- | ----------- | -------- | --------------- | -------- |
| 1   | Ahmad Fauzi    | ahmad.fauzi | ADMIN    | RSUD Boyolali   | Aktif    |
| 2   | Siti Rahayu    | siti.rahayu | OPERATOR | Puskesmas Ampel | Aktif    |
| 3   | Budi Prasetyo  | budi.p      | VIEWER   | Klinik Sinar    | Aktif    |
| 4   | Dewi Anggraini | dewi.a      | MANAGER  | RSUD Boyolali   | Nonaktif |

### Penggunaan

```tsx
import { dummyUserData } from './userData'

;<DataTable data={dummyUserData} columns={columns} />
```

---

## Services API

**Directory:** `src/Services/Modules/Users/`

| File                       | Method | Endpoint                   | Deskripsi                |
| -------------------------- | ------ | -------------------------- | ------------------------ |
| `getUserList.ts`           | GET    | `/users`                   | Ambil semua user         |
| `getUserById.ts`           | GET    | `/users/:id`               | Ambil detail satu user   |
| `getInstitutionsList.ts`   | GET    | `/institutions`            | Ambil daftar institusi   |
| `postUser.ts`              | POST   | `/users`                   | Buat user baru           |
| `putUser.ts`               | PUT    | `/users/:id`               | Update user              |
| `deleteUser.ts`            | DELETE | `/users/:id`               | Hapus user (soft delete) |
| `patchUserToggleActive.ts` | PATCH  | `/users/:id/toggle-active` | Toggle aktif/nonaktif    |

### Contoh Service

```tsx
// src/Services/Modules/Users/getUserList.ts
import api from '@/Services/api'

export const getUserList = async (params?: Record<string, any>) => {
  const response = await api.get('/users', { params })
  return response.data
}

// src/Services/Modules/Users/getInstitutionsList.ts
export const getInstitutionsList = async () => {
  const response = await api.get('/institutions')
  return response.data
}
```

---

## Design System & Warna

| Token         | Hex       | Penggunaan                               |
| ------------- | --------- | ---------------------------------------- |
| `primary-50`  | `#e6f4ff` | Background avatar inisial, hover state   |
| `primary-100` | `#b3dcfe` | Border badge role                        |
| `primary-500` | `#0196fe` | Tombol utama, ikon aktif, spinner        |
| `primary-600` | `#017fd6` | Hover tombol utama                       |
| `primary-700` | `#0165ac` | Teks badge role                          |
| `neutral-50`  | `#f7f8fc` | Background section info modal            |
| `neutral-100` | `#eef0f7` | Border tabel, separator                  |
| `neutral-400` | `#8b91b5` | Inisial avatar, label kecil              |
| `neutral-800` | `#222536` | Nama user, teks utama                    |
| `success`     | `#10b981` | Badge Aktif, tombol Toggle ON            |
| `danger`      | `#ef4444` | Badge Nonaktif, tombol Hapus, toggle OFF |

### Avatar Inisial

```tsx
// Inisial dari nama user
const initials = namaUser
  .split(' ')
  .map((n) => n[0])
  .join('')
  .toUpperCase()
  .slice(0, 2)
```

### Badge Status

```tsx
const statusVariant = isActive
  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
  : 'bg-red-50 text-red-600 border-red-100'
```

---

## Integrasi API

### Langkah 1: Buat Redux Slice

```tsx
// src/Store/redux/User/index.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getUserList } from '@/Services/Modules/Users/getUserList'

export const fetchUsers = createAsyncThunk('user/fetchList', async (params?: Record<string, any>) => {
  const response = await getUserList(params)
  return response.data.items as UserItem[]
})

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: [] as UserItem[],
    isLoading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Gagal memuat data user'
      })
  },
})
```

### Langkah 2: Update MainUser

```tsx
import { useSelector, useDispatch } from 'react-redux'
import { fetchUsers } from '@/Store/redux/User'

const MainUser = () => {
  const dispatch = useDispatch()
  const { data, isLoading } = useSelector((state: RootState) => state.User)

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  return <DataTable data={data} isLoading={isLoading} columns={columns} />
}
```

### Langkah 3: Load Dropdown Institusi

```tsx
const [institutionOptions, setInstitutionOptions] = useState([])

useEffect(() => {
  getInstitutionsList().then((res) => {
    setInstitutionOptions(res.data.items)
  })
}, [])

// Kirim ke UserFormModal
<UserFormModal
  institutionOptions={institutionOptions}
  ...
/>
```

---

## Referensi Props

### MainUser — tidak menerima props eksternal (self-contained)

### UserFormModal

| Prop                 | Type                               | Required | Deskripsi                 |
| -------------------- | ---------------------------------- | -------- | ------------------------- |
| `isOpen`             | `boolean`                          | ✅       | Status modal              |
| `mode`               | `'create' \| 'edit'`               | ✅       | Mode form                 |
| `initialData`        | `UserItem \| null`                 | ❌       | Data awal untuk mode edit |
| `institutionOptions` | `{ id: string; name: string }[]`   | ❌       | Opsi dropdown institusi   |
| `roleOptions`        | `{ id: string; name: string }[]`   | ❌       | Opsi dropdown role        |
| `onClose`            | `() => void`                       | ✅       | Callback tutup            |
| `onSubmit`           | `(values: UserFormValues) => void` | ✅       | Callback submit form      |

### UserDetailModal

| Prop      | Type               | Required | Deskripsi              |
| --------- | ------------------ | -------- | ---------------------- |
| `isOpen`  | `boolean`          | ✅       | Status modal           |
| `item`    | `UserItem \| null` | ✅       | Data user yang dipilih |
| `onClose` | `() => void`       | ✅       | Callback tutup         |

### UserDeleteModal

| Prop        | Type                       | Required | Deskripsi                 |
| ----------- | -------------------------- | -------- | ------------------------- |
| `isOpen`    | `boolean`                  | ✅       | Status modal              |
| `item`      | `UserItem \| null`         | ✅       | Data yang akan dihapus    |
| `onClose`   | `() => void`               | ✅       | Callback tutup            |
| `onConfirm` | `(item: UserItem) => void` | ✅       | Callback konfirmasi hapus |

---

## TODO

- [ ] Integrasi Redux store + API backend
- [ ] Load institusi dari API untuk dropdown
- [ ] Tambahkan filter panel (by role, by institusi, by status)
- [ ] Tambahkan notifikasi sukses/gagal (toast)
- [ ] Tambahkan validasi form (Zod / Yup)
- [ ] Field password dengan toggle show/hide
- [ ] Tambahkan konfirmasi dialog sebelum toggle aktif/nonaktif
- [ ] Unit test untuk service layer
