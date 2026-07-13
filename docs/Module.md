# 🧩 Module — Dokumentasi Modul Manajemen Module

> Modul untuk manajemen Module (Fitur/Menu Aplikasi) pada halaman Settings, dilengkapi dengan CRUD, toggle aktif/nonaktif, dan restore data.

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [File & Struktur](#file--struktur)
- [Quick Start](#quick-start)
- [Komponen: MainModule](#komponen-mainmodule)
- [Types](#types)
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
│  │  │                 MainModule.tsx                     │  │  │
│  │  │                                                   │  │  │
│  │  │  ┌─────────────────────────────────────────────┐  │  │  │
│  │  │  │  DataTable (tabel daftar module)             │  │  │  │
│  │  │  │  Kolom: Kode, Nama, Path, Ikon              │  │  │  │
│  │  │  │         Urutan, Status, Aksi                 │  │  │  │
│  │  │  └─────────────────────────────────────────────┘  │  │  │
│  │  │                                                   │  │  │
│  │  │  ┌──────────────────┐  ┌───────────────────────┐  │  │  │
│  │  │  │ ModuleFormModal  │  │  ModuleDetailModal     │  │  │  │
│  │  │  │  (create/edit)   │  │  (read-only)           │  │  │  │
│  │  │  └──────────────────┘  └───────────────────────┘  │  │  │
│  │  │                                                   │  │  │
│  │  │  ┌─────────────────────────────────────────────┐  │  │  │
│  │  │  │  ModuleDeleteModal (konfirmasi hapus)        │  │  │  │
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
getModuleList() / getModuleById()   ← src/Services/Modules/modules/
    │
    ▼
Redux Store (state.Module)
    │
    ▼
MainModule.tsx                      ← useSelector()
    │
    ▼
DataTable                           ← src/Components/General/Datatable.tsx
    │
    ▼
ModuleFormModal / ModuleDetailModal / ModuleDeleteModal
```

---

## File & Struktur

```
src/
└── Services/Modules/modules/
    ├── modules.types.ts              # Type API request/response
    ├── index.ts                      # Re-export semua service Module
    ├── getModuleList.ts              # GET /modules
    ├── getModuleById.ts              # GET /modules/:id
    ├── postModule.ts                 # POST /modules
    ├── putModule.ts                  # PUT /modules/:id        ⚠️ pending staged
    ├── deleteModule.ts               # DELETE /modules/:id
    ├── patchModuleToggleActive.ts    # PATCH /modules/:id/toggle-active
    └── patchModuleRestore.ts         # PATCH /modules/:id/restore  ⚠️ pending staged
```

> ⚠️ **Catatan:** `putModule.ts` dan `patchModuleRestore.ts` belum di-stage. Jalankan perintah berikut sebelum commit:
> ```bash
> git add src/Services/Modules/modules/putModule.ts
> git add src/Services/Modules/modules/patchModuleRestore.ts
> ```

---

## Quick Start

### 1. Registrasi di MainSetting

```tsx
// src/Components/Setting/MainSetting.tsx
import MainModule from './Module/MainModule'

const MainSetting = () => {
  const [activeTab, setActiveTab] = useState('module')

  return (
    <AppLayout title="Setting" subtitle="Manajemen Role, User & Module">
      <TabNav activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === 'module' && <MainModule />}
    </AppLayout>
  )
}
```

---

## Komponen: MainModule

**File:** `src/Components/Setting/Module/MainModule.tsx`

Komponen utama yang menampilkan daftar module/fitur aplikasi beserta aksi CRUD dan toggle status.

### Fitur

| Fitur           | Deskripsi                                          |
| --------------- | -------------------------------------------------- |
| 🔍 Search       | Pencarian global (nama module, kode, path)         |
| ↕️ Sorting      | Klik header kolom untuk sort ascending/descending  |
| 📄 Pagination   | Navigasi halaman dengan pilihan jumlah per halaman |
| ➕ Tambah       | Buka modal form tambah module baru                 |
| 👁️ Detail       | Lihat detail lengkap module                        |
| ✏️ Edit         | Buka modal form edit module                        |
| 🔄 Toggle Aktif | Aktifkan / nonaktifkan module                      |
| 🗑️ Hapus        | Konfirmasi hapus module (soft delete)              |
| ♻️ Restore      | Pulihkan module yang telah dihapus                 |

### Kolom Tabel

| Kolom       | Accessor      | Deskripsi                               |
| ----------- | ------------- | --------------------------------------- |
| Kode Module | `kodeModule`  | Badge primary dengan kode unik          |
| Nama Module | `namaModule`  | Nama modul/fitur                        |
| Path/Route  | `path`        | URL route modul (monospace)             |
| Ikon        | `icon`        | Preview ikon modul                      |
| Urutan      | `urutan`      | Nomor urutan tampil di menu             |
| Status      | `isActive`    | Badge: emerald (Aktif), red (Nonaktif)  |
| Aksi        | -             | Tombol Detail, Edit, Toggle, Hapus      |

### State Management

```tsx
const [selectedModule, setSelectedModule] = useState<ModuleItem | null>(null)
const [isFormOpen, setIsFormOpen]         = useState(false)
const [isDetailOpen, setIsDetailOpen]     = useState(false)
const [isDeleteOpen, setIsDeleteOpen]     = useState(false)
const [formMode, setFormMode]             = useState<'create' | 'edit'>('create')
```

### Handlers

| Handler                    | Deskripsi                               |
| -------------------------- | --------------------------------------- |
| `handleCreate()`           | Buka modal form kosong (mode: create)   |
| `handleEdit(item)`         | Buka modal form dengan data module      |
| `handleDetail(item)`       | Buka modal detail module                |
| `handleDelete(item)`       | Buka modal konfirmasi hapus             |
| `handleToggleActive(item)` | Toggle status aktif/nonaktif module     |
| `handleRestore(item)`      | Restore module yang sudah dihapus       |
| `handleCloseAll()`         | Tutup semua modal                       |

---

## Types

**File:** `src/Services/Modules/modules/modules.types.ts`

### ModuleItem

```tsx
interface ModuleItem {
  id: string           // ID unik
  kodeModule: string   // Kode module (e.g. 'DIAGNOSTIK', 'SETTING')
  namaModule: string   // Nama modul (e.g. 'Diagnostik', 'Pengaturan')
  path: string         // URL route (e.g. '/diagnostik', '/setting')
  icon: string         // Nama ikon (e.g. 'BeakerIcon', 'CogIcon')
  urutan: number       // Urutan tampil di menu sidebar
  isActive: boolean    // Status aktif
  createdAt: string    // Tanggal dibuat
  updatedAt: string    // Tanggal diperbarui
}
```

### ModuleFormValues

```tsx
interface ModuleFormValues {
  kodeModule: string
  namaModule: string
  path: string
  icon: string
  urutan: number
  isActive: boolean
}
```

### API Types

```tsx
// src/Services/Modules/modules/modules.types.ts

interface GetModuleListParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

interface ModuleApiResponse {
  data: {
    items: ModuleItem[]
    total: number
    page: number
    limit: number
  }
  message: string
  success: boolean
}
```

---

## Services API

**Directory:** `src/Services/Modules/modules/`

| File                         | Method | Endpoint                      | Deskripsi                      |
| ---------------------------- | ------ | ----------------------------- | ------------------------------ |
| `getModuleList.ts`           | GET    | `/modules`                    | Ambil semua module             |
| `getModuleById.ts`           | GET    | `/modules/:id`                | Ambil detail satu module       |
| `postModule.ts`              | POST   | `/modules`                    | Buat module baru               |
| `putModule.ts`               | PUT    | `/modules/:id`                | Update module ⚠️ pending       |
| `deleteModule.ts`            | DELETE | `/modules/:id`                | Hapus module (soft delete)     |
| `patchModuleToggleActive.ts` | PATCH  | `/modules/:id/toggle-active`  | Toggle aktif/nonaktif          |
| `patchModuleRestore.ts`      | PATCH  | `/modules/:id/restore`        | Restore module ⚠️ pending      |

### Contoh Service

```tsx
// src/Services/Modules/modules/getModuleList.ts
import api from '@/Services/api'
import { GetModuleListParams, ModuleApiResponse } from './modules.types'

export const getModuleList = async (params?: GetModuleListParams): Promise<ModuleApiResponse> => {
  const response = await api.get('/modules', { params })
  return response.data
}

// src/Services/Modules/modules/patchModuleToggleActive.ts
export const patchModuleToggleActive = async (id: string) => {
  const response = await api.patch(`/modules/${id}/toggle-active`)
  return response.data
}
```

### Re-export (index.ts)

```tsx
// src/Services/Modules/modules/index.ts
export { getModuleList }          from './getModuleList'
export { getModuleById }          from './getModuleById'
export { postModule }             from './postModule'
export { putModule }              from './putModule'
export { deleteModule }           from './deleteModule'
export { patchModuleToggleActive } from './patchModuleToggleActive'
export { patchModuleRestore }     from './patchModuleRestore'
```

---

## Design System & Warna

| Token         | Hex       | Penggunaan                               |
| ------------- | --------- | ---------------------------------------- |
| `primary-50`  | `#e6f4ff` | Background badge, hover state            |
| `primary-100` | `#b3dcfe` | Border badge kode module                 |
| `primary-500` | `#0196fe` | Tombol utama, ikon aktif, spinner        |
| `primary-600` | `#017fd6` | Hover tombol utama                       |
| `primary-700` | `#0165ac` | Teks badge kode module                   |
| `neutral-50`  | `#f7f8fc` | Background section info modal            |
| `neutral-100` | `#eef0f7` | Border tabel, separator                  |
| `neutral-500` | `#6b7092` | Teks path/route (monospace)              |
| `neutral-800` | `#222536` | Nama module, teks utama                  |
| `success`     | `#10b981` | Badge Aktif, tombol Toggle ON            |
| `danger`      | `#ef4444` | Badge Nonaktif, tombol Hapus, toggle OFF |

### Badge Status

```tsx
const statusVariant = isActive
  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
  : 'bg-red-50 text-red-600 border-red-100'
```

### Path Display

```tsx
// Path ditampilkan dengan font monospace
<span className="font-mono text-xs text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded">
  {path}
</span>
```

---

## Integrasi API

### Langkah 1: Buat Redux Slice

```tsx
// src/Store/redux/Module/index.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getModuleList, patchModuleToggleActive, patchModuleRestore } from '@/Services/Modules/modules'

export const fetchModules = createAsyncThunk(
  'module/fetchList',
  async (params?: Record<string, any>) => {
    const response = await getModuleList(params)
    return response.data.items as ModuleItem[]
  },
)

export const toggleModuleActive = createAsyncThunk(
  'module/toggleActive',
  async (id: string) => {
    await patchModuleToggleActive(id)
    return id
  },
)

export const restoreModule = createAsyncThunk(
  'module/restore',
  async (id: string) => {
    await patchModuleRestore(id)
    return id
  },
)

const moduleSlice = createSlice({
  name: 'module',
  initialState: {
    data: [] as ModuleItem[],
    isLoading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.pending, (state) => { state.isLoading = true })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Gagal memuat data module'
      })
  },
})
```

### Langkah 2: Update MainModule

```tsx
import { useSelector, useDispatch } from 'react-redux'
import { fetchModules, toggleModuleActive, restoreModule } from '@/Store/redux/Module'

const MainModule = () => {
  const dispatch = useDispatch()
  const { data, isLoading } = useSelector((state: RootState) => state.Module)

  useEffect(() => {
    dispatch(fetchModules())
  }, [dispatch])

  const handleToggleActive = async (item: ModuleItem) => {
    await dispatch(toggleModuleActive(item.id))
    dispatch(fetchModules())
  }

  const handleRestore = async (item: ModuleItem) => {
    await dispatch(restoreModule(item.id))
    dispatch(fetchModules())
  }

  return (
    <DataTable
      data={data}
      isLoading={isLoading}
      columns={columns}
    />
  )
}
```

### Langkah 3: Handler Submit Form

```tsx
const handleSubmit = async (values: ModuleFormValues) => {
  if (formMode === 'create') {
    await postModule(values)
  } else {
    await putModule(selectedModule!.id, values) // ⚠️ putModule masih pending
  }
  setIsFormOpen(false)
  dispatch(fetchModules())
}
```

---

## Referensi Props

### MainModule — tidak menerima props eksternal (self-contained)

### ModuleFormModal

| Prop          | Type                                 | Required | Deskripsi                    |
| ------------- | ------------------------------------ | -------- | ---------------------------- |
| `isOpen`      | `boolean`                            | ✅       | Status modal                 |
| `mode`        | `'create' \| 'edit'`                 | ✅       | Mode form                    |
| `initialData` | `ModuleItem \| null`                 | ❌       | Data awal untuk mode edit    |
| `onClose`     | `() => void`                         | ✅       | Callback tutup               |
| `onSubmit`    | `(values: ModuleFormValues) => void` | ✅       | Callback submit form         |

### ModuleDetailModal

| Prop      | Type                 | Required | Deskripsi                |
| --------- | -------------------- | -------- | ------------------------ |
| `isOpen`  | `boolean`            | ✅       | Status modal             |
| `item`    | `ModuleItem \| null` | ✅       | Data module yang dipilih |
| `onClose` | `() => void`         | ✅       | Callback tutup           |

### ModuleDeleteModal

| Prop        | Type                         | Required | Deskripsi                 |
| ----------- | ---------------------------- | -------- | ------------------------- |
| `isOpen`    | `boolean`                    | ✅       | Status modal              |
| `item`      | `ModuleItem \| null`         | ✅       | Data yang akan dihapus    |
| `onClose`   | `() => void`                 | ✅       | Callback tutup            |
| `onConfirm` | `(item: ModuleItem) => void` | ✅       | Callback konfirmasi hapus |

---

## TODO

- [ ] ⚠️ Stage dan implementasi `putModule.ts`
- [ ] ⚠️ Stage dan implementasi `patchModuleRestore.ts`
- [ ] Buat komponen `MainModule.tsx`, `ModuleFormModal.tsx`, `ModuleDetailModal.tsx`, `ModuleDeleteModal.tsx`
- [ ] Buat `types.ts` di `src/Components/Setting/Module/`
- [ ] Integrasi Redux store + API backend
- [ ] Tambahkan filter panel (by status)
- [ ] Tambahkan notifikasi sukses/gagal (toast)
- [ ] Tambahkan validasi form (Zod / Yup)
- [ ] Tambahkan konfirmasi dialog sebelum toggle aktif/nonaktif
- [ ] Drag-and-drop untuk mengubah urutan module di menu
- [ ] Unit test untuk service layer