# 🔧 Device Management — Dokumentasi Modul Manajemen Alat

> Modul untuk mengelola data alat diagnostik (device) dengan fitur Create, Read, Update, Delete, terintegrasi penuh dengan API backend menggunakan RTK Query, termasuk validasi server-side, notifikasi, search, sort, dan pagination.

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [File & Struktur](#file--struktur)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Komponen: MainDeviceManagement](#komponen-maindevicemanagement)
- [Komponen: DeviceFormModal](#komponen-deviceformmodal)
- [Komponen: DeviceDeleteModal](#komponen-devicedeletemodal)
- [Komponen: DeviceDetailView](#komponen-devicedetailview)
- [Komponen: DeviceStatusBadge](#komponen-devicestatusbadge)
- [Types & Constants](#types--constants)
- [Helper: apiErrorParser](#helper-apierrorparser)
- [API Service (RTK Query)](#api-service-rtk-query)
- [Cache Invalidation](#cache-invalidation)
- [Error Handling & Validasi](#error-handling--validasi)
- [Kustomisasi](#kustomisasi)

---

## Arsitektur

```
┌──────────────────────────────────────────────────────────────┐
│                   SettingContainer.tsx                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              SettingLayout.tsx                           │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │           AppLayout (title, subtitle)             │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │          MainSetting.tsx                     │  │  │  │
│  │  │  │  ┌──────────────────────────────────────┐  │  │  │  │
│  │  │  │  │  TabMenu (tab: Manajemen Alat)       │  │  │  │  │
│  │  │  │  └──────────────────────────────────────┘  │  │  │  │
│  │  │  │                                             │  │  │  │
│  │  │  │  ┌──────────────────────────────────────┐  │  │  │  │
│  │  │  │  │  MainDeviceManagement.tsx             │  │  │  │  │
│  │  │  │  │                                       │  │  │  │  │
│  │  │  │  │  ┌────────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │  [+ Tambah Alat]               │  │  │  │  │  │
│  │  │  │  │  └────────────────────────────────┘  │  │  │  │  │
│  │  │  │  │                                       │  │  │  │  │
│  │  │  │  │  ┌────────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │  DataTable (daftar device)     │  │  │  │  │  │
│  │  │  │  │  │  Kolom: Kode Alat, Nama Alat, │  │  │  │  │  │
│  │  │  │  │  │  Status, Dibuat, Aksi          │  │  │  │  │  │
│  │  │  │  │  └────────────────────────────────┘  │  │  │  │  │
│  │  │  │  │                                       │  │  │  │  │
│  │  │  │  │  ┌────────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │  DeviceFormModal               │  │  │  │  │  │
│  │  │  │  │  │  → Create / Edit form          │  │  │  │  │  │
│  │  │  │  │  │  → Server-side validation      │  │  │  │  │  │
│  │  │  │  │  └────────────────────────────────┘  │  │  │  │  │
│  │  │  │  │                                       │  │  │  │  │
│  │  │  │  │  ┌────────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │  DeviceDeleteModal             │  │  │  │  │  │
│  │  │  │  │  │  → Konfirmasi hapus            │  │  │  │  │  │
│  │  │  │  │  └────────────────────────────────┘  │  │  │  │  │
│  │  │  │  │                                       │  │  │  │  │
│  │  │  │  │  ┌────────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │  DeviceDetailView              │  │  │  │  │  │
│  │  │  │  │  │  → Detail lengkap device       │  │  │  │  │  │
│  │  │  │  │  └────────────────────────────────┘  │  │  │  │  │
│  │  │  │  └──────────────────────────────────────┘  │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Alur Data

```
GET /master/devices (dengan query params: page, per_page, search)
    │
    ▼
RTK Query (useGetListDeviceQuery)
    │
    ▼
apiResponse.data.data → DeviceItem[]
    │
    ▼
DataTable (kolom sesuai field API)

Form Submit
    │
    ▼
DeviceFormData (CreateDeviceRequest)
    │
    ▼
RTK Query Mutation (POST /master/devices atau PUT /master/devices/:id)
    │
    ▼
invalidatesTags: ['Device'] → auto-refetch list
    │
    ├─ Success → showNotification (success)
    └─ Error → parseFieldErrors() → tampilkan di form + showNotification (error)
```

---

## File & Struktur

```
src/
├── Components/Setting/
│   ├── MainSetting.tsx                        # Tab menu + render MainDeviceManagement
│   ├── SettingLayout.tsx                       # Layout wrapper
│   └── DeviceManagement/
│       ├── types.ts                           # Type definitions + constants + form field config
│       ├── deviceData.ts                      # [DEPRECATED] Dummy data tidak lagi digunakan
│       ├── MainDeviceManagement.tsx            # Komponen utama CRUD + Detail View + StatusBadge
│       ├── DeviceFormModal.tsx                 # Modal form Create/Edit + server validation
│       └── DeviceDeleteModal.tsx               # Modal konfirmasi hapus
│
├── Helpers/
│   └── apiErrorParser.ts                      # ⭐ Utility reusable: parse API validation errors
│
├── Components/General/
│   └── Notification.tsx                       # Hook useNotification (Ant Design)
│
└── Services/Modules/
    └── device/
        ├── index.ts                           # RTK Query endpoints + hooks export
        ├── getListDevice.ts                   # GET /master/devices (list + pagination)
        ├── postDevice.ts                      # POST /master/devices (create)
        ├── updateDevice.ts                    # PUT /master/devices/:id (update)
        └── deleteDevice.ts                    # DELETE /master/devices/:id (delete)
```

---

## Quick Start

### 1. Navigasi ke halaman Pengaturan

Tab "Manajemen Alat" sudah terintegrasi di `MainSetting.tsx`:

```tsx
// src/Components/Setting/MainSetting.tsx
import MainDeviceManagement from './DeviceManagement/MainDeviceManagement'

// Di dalam renderContent():
case 'device-management':
  return <MainDeviceManagement />
```

### 2. Akses via browser

```
http://localhost:5174/setting → Klik tab "Manajemen Alat"
```

Data akan otomatis di-fetch dari API saat komponen dimount.

---

## API Endpoints

| Endpoint        | Method | URL                   | Deskripsi                  |
| --------------- | ------ | --------------------- | -------------------------- |
| `getListDevice` | GET    | `/master/devices`     | Daftar device + pagination |
| `postDevice`    | POST   | `/master/devices`     | Tambah device baru         |
| `updateDevice`  | PUT    | `/master/devices/:id` | Update device              |
| `deleteDevice`  | DELETE | `/master/devices/:id` | Hapus device               |

### Query Parameters (GET)

| Parameter  | Tipe     | Default | Deskripsi               |
| ---------- | -------- | ------- | ----------------------- |
| `page`     | `number` | `1`     | Halaman yang diminta    |
| `per_page` | `number` | `10`    | Jumlah data per halaman |
| `search`   | `string` | `''`    | Pencarian global        |

### Response Format (GET)

```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "created_by": 1,
        "created_at": "2026-03-04T10:34:21.076690Z",
        "updated_by": 1,
        "updated_at": "2026-03-04T10:34:21.076690Z",
        "devices_code": "YS03022500136",
        "devices_name": "Health Diagnostic Device YS-01",
        "institution_id": 6,
        "status": 1,
        "description": "Perangkat diagnostic: BMI, tekanan darah, nadi, suhu tubuh, oksigen darah",
        "deleted_at": null,
        "status_label": "Aktif"
      }
    ],
    "from": 1,
    "last_page": 1,
    "per_page": 15,
    "to": 6,
    "total": 6
  },
  "status_labels": {
    "1": "Aktif",
    "2": "Tidak Aktif",
    "3": "Maintenance"
  }
}
```

### Request Body (POST/PUT)

```json
{
  "devices_code": "YS03022500136",
  "devices_name": "Health Diagnostic Device YS-01",
  "status": 1,
  "description": "Perangkat diagnostic: BMI, tekanan darah, nadi, suhu tubuh"
}
```

### Status Values

| Value | Label       | Badge Color |
| ----- | ----------- | ----------- |
| `1`   | Aktif       | Hijau       |
| `2`   | Tidak Aktif | Abu-abu     |
| `3`   | Maintenance | Kuning      |

### Error Responses

```json
// Validation Error — devices_name required
{
  "status": "error",
  "title": "Validasi Gagal",
  "message": "Data yang dikirim tidak valid.",
  "errors": {
    "devices_name": ["The devices name field is required."]
  }
}

// Validation Error — status invalid
{
  "status": "error",
  "title": "Validasi Gagal",
  "message": "Data yang dikirim tidak valid.",
  "errors": {
    "status": ["The selected status is invalid."]
  }
}

// Validation Error — devices_code already taken
{
  "status": "error",
  "title": "Validasi Gagal",
  "message": "Data yang dikirim tidak valid.",
  "errors": {
    "devices_code": ["The devices code has already been taken."]
  }
}
```

---

## Komponen: MainDeviceManagement

**File:** `src/Components/Setting/DeviceManagement/MainDeviceManagement.tsx`

Komponen utama yang mengelola seluruh operasi CRUD device, terintegrasi penuh dengan API.

### Fitur

| Fitur            | Deskripsi                                              |
| ---------------- | ------------------------------------------------------ |
| 🔍 Search        | Pencarian global via DataTable                         |
| ↕️ Sorting       | Klik header kolom untuk sort ascending/descending      |
| 📄 Pagination    | Navigasi halaman dengan pilihan 5/10/20/50 per halaman |
| ➕ Create        | Tombol "Tambah Alat" → buka form modal                 |
| ✏️ Edit          | Tombol edit per baris → buka form modal (pre-filled)   |
| 🗑️ Delete        | Tombol hapus per baris → buka konfirmasi modal         |
| 👁️ Detail        | Tombol detail per baris → buka detail view modal       |
| ⏳ Loading State | Spinner saat data sedang dimuat dari API               |
| 📭 Empty State   | Pesan "Belum ada data alat terdaftar" saat data kosong |
| 🔔 Notifikasi    | Success/error notification setelah CRUD operation      |
| 🔄 Auto-refetch  | Data otomatis di-refresh setelah create/update/delete  |
| ⚠️ Validasi API  | Error validasi dari API ditampilkan di form fields     |

### Kolom Tabel

| Kolom     | Accessor       | Deskripsi                                                     |
| --------- | -------------- | ------------------------------------------------------------- |
| Kode Alat | `devices_code` | Badge monospace (YS03022500136)                               |
| Nama Alat | `devices_name` | Icon chip + nama + deskripsi (truncated)                      |
| Status    | `status`       | Badge: hijau (Aktif), abu (Tidak Aktif), kuning (Maintenance) |
| Dibuat    | `created_at`   | Tanggal format Indonesia (DD MMMM YYYY, HH:mm)                |
| Aksi      | -              | Tombol Detail (biru), Edit (kuning), Hapus (merah)            |

### RTK Query Hooks

```tsx
// Fetch data list dengan pagination
const { data: apiResponse, isLoading, isFetching } = useGetListDeviceQuery(queryParams)

// Mutations
const [postDevice, { isLoading: isCreating }] = usePostDeviceMutation()
const [updateDevice, { isLoading: isUpdating }] = useUpdateDeviceMutation()
const [deleteDevice, { isLoading: isDeletingApi }] = useDeleteDeviceMutation()
```

### Data Extraction

```tsx
// Data diambil dari nested response: apiResponse.data.data
const data = useMemo<DeviceItem[]>(() => {
  return apiResponse?.data?.data ?? []
}, [apiResponse])

// Info pagination
const paginationInfo = useMemo(() => {
  if (!apiResponse?.data) return null
  const { current_page, last_page, from, to, total, per_page } = apiResponse.data
  return { current_page, last_page, from, to, total, per_page }
}, [apiResponse])
```

### Query Params State

```tsx
const [queryParams, setQueryParams] = useState({
  page: 1,
  per_page: 10,
  search: '',
})
```

### Handlers

| Handler                 | Deskripsi                                                                |
| ----------------------- | ------------------------------------------------------------------------ |
| `handleCreate()`        | Buka form modal mode create, reset errors                                |
| `handleEdit(item)`      | Buka form modal mode edit (pre-filled dari data API), reset errors       |
| `handleDelete(item)`    | Buka modal konfirmasi hapus                                              |
| `handleDetail(item)`    | Buka modal detail view                                                   |
| `handleFormSubmit()`    | Submit form → POST/PUT API → notifikasi → auto-refetch / tampilkan error |
| `handleDeleteConfirm()` | Konfirmasi hapus → DELETE API → notifikasi → auto-refetch                |

### Error Handling pada Submit

```tsx
const handleFormSubmit = async (formData: DeviceFormData, id?: number) => {
  try {
    setFormErrors({})
    let result
    if (id) {
      result = await updateDevice({ body: formData, id }).unwrap()
    } else {
      result = await postDevice(formData).unwrap()
    }
    // Success handling...
  } catch (error: any) {
    if (isValidationError(error)) {
      // Parse field-level errors dan tampilkan di form
      const fieldErrors = parseFieldErrors(error)
      setFormErrors(fieldErrors)
      showNotification({ title: 'Validasi Gagal', description: '...', type: 'error' })
    } else {
      // Generic error
      showNotification({ title: 'Error!', description: '...', type: 'error' })
    }
  }
}
```

---

## Komponen: DeviceFormModal

**File:** `src/Components/Setting/DeviceManagement/DeviceFormModal.tsx`

Modal form untuk menambah dan mengedit data device, dengan dukungan server-side validation errors.

### Struktur Modal

```
┌─────────────────────────────────────────┐
│ 🔧 Header                                │
│   [icon] Tambah Alat / Edit Alat   [✕]  │
├─────────────────────────────────────────┤
│ 📝 Form (grid 2 kolom, config-driven)    │
│   Kode Alat*        |  Nama Alat*        │
│   Status (select)   |                    │
│   Deskripsi (full width, textarea)       │
├─────────────────────────────────────────┤
│ 🔘 Footer                                │
│                    [Batal] [Simpan/Update]│
└─────────────────────────────────────────┘
```

### Props

```tsx
interface DeviceFormModalProps {
  isOpen: boolean // Modal terbuka?
  mode: 'create' | 'edit' // Mode form
  item?: DeviceItem | null // Data untuk edit
  isSubmitting?: boolean // Loading state
  serverErrors?: Record<string, string> // Error validasi dari API
  onClose: () => void // Callback tutup
  onSubmit: (data: DeviceFormData, id?: number) => void // Callback submit
}
```

### Form Fields (Config-Driven)

Form fields didefinisikan sebagai array config di `types.ts` (`DEVICE_FORM_FIELDS`), bukan hardcode JSX:

```tsx
const DEVICE_FORM_FIELDS: FormFieldConfig[] = [
  { key: 'devices_code', label: 'Kode Alat', type: 'text', required: true },
  { key: 'devices_name', label: 'Nama Alat', type: 'text', required: true },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Aktif', value: 1 },
      { label: 'Tidak Aktif', value: 2 },
      { label: 'Maintenance', value: 3 },
    ],
  },
  { key: 'description', label: 'Deskripsi', type: 'textarea', colSpan: 2 },
]
```

### Validasi

#### Client-Side

| Field     | Aturan               |
| --------- | -------------------- |
| Kode Alat | Wajib diisi          |
| Nama Alat | Wajib diisi          |
| Status    | Default: `1` (Aktif) |
| Deskripsi | Opsional             |

#### Server-Side (dari API)

Error validasi dari API secara otomatis ditampilkan di bawah field yang bermasalah melalui prop `serverErrors`. Contoh error yang ditangani:

- `devices_name`: "The devices name field is required."
- `devices_code`: "The devices code has already been taken."
- `status`: "The selected status is invalid."

### Contoh Penggunaan

```tsx
<DeviceFormModal
  isOpen={isFormOpen}
  mode={formMode}
  item={selectedItem}
  isSubmitting={isCreating || isUpdating}
  serverErrors={formErrors}
  onClose={() => {
    setIsFormOpen(false)
    setFormErrors({})
  }}
  onSubmit={handleFormSubmit}
/>
```

---

## Komponen: DeviceDeleteModal

**File:** `src/Components/Setting/DeviceManagement/DeviceDeleteModal.tsx`

Modal konfirmasi sebelum menghapus data device.

### Struktur Modal

```
┌─────────────────────────────────────────┐
│ ⚠️ Header                                │
│   [icon] Hapus Alat                [✕]  │
├─────────────────────────────────────────┤
│ 📋 Content                               │
│   Apakah Anda yakin ingin menghapus?    │
│   ┌─────────────────────────────────┐   │
│   │ Health Diagnostic Device YS-01   │   │
│   │ Kode: YS03022500136             │   │
│   └─────────────────────────────────┘   │
│   ⚠️ Tindakan ini tidak dapat dibatalkan │
├─────────────────────────────────────────┤
│ 🔘 Footer                                │
│                       [Batal] [Hapus]   │
└─────────────────────────────────────────┘
```

### Props

```tsx
interface DeviceDeleteModalProps {
  isOpen: boolean // Modal terbuka?
  item: DeviceItem | null // Data device yang akan dihapus
  isDeleting?: boolean // Loading state saat proses delete
  onClose: () => void // Callback tutup
  onConfirm: (id: number) => void // Callback konfirmasi hapus
}
```

### Contoh Penggunaan

```tsx
<DeviceDeleteModal
  isOpen={isDeleteOpen}
  item={selectedItem}
  isDeleting={isDeletingApi}
  onClose={() => {
    setIsDeleteOpen(false)
    setSelectedItem(null)
  }}
  onConfirm={handleDeleteConfirm}
/>
```

---

## Komponen: DeviceDetailView

Komponen inline di `MainDeviceManagement.tsx` untuk menampilkan detail lengkap device.

### Fields yang Ditampilkan

| Field             | Deskripsi                                  |
| ----------------- | ------------------------------------------ |
| Kode Alat         | Kode unik device (font mono)               |
| Nama Alat         | Nama lengkap device                        |
| Status            | Badge status (DeviceStatusBadge)           |
| Deskripsi         | Deskripsi device atau "-" jika kosong      |
| Dibuat            | Tanggal registrasi (format Indonesia)      |
| Terakhir Diupdate | Tanggal update terakhir (format Indonesia) |

### Contoh Penggunaan

```tsx
{
  isDetailOpen && selectedItem && (
    <DeviceDetailView
      item={selectedItem}
      onClose={() => {
        setIsDetailOpen(false)
        setSelectedItem(null)
      }}
      onEdit={() => {
        setIsDetailOpen(false)
        handleEdit(selectedItem)
      }}
    />
  )
}
```

---

## Komponen: DeviceStatusBadge

Komponen reusable untuk menampilkan badge status device dengan warna yang sesuai.

### Props

```tsx
interface DeviceStatusBadgeProps {
  status: number // Status number (1, 2, 3)
  label?: string // Label override (opsional, fallback ke DEVICE_STATUS_MAP)
}
```

### Konfigurasi Warna

| Status | Label       | Background       | Text Color         | Dot Color        |
| ------ | ----------- | ---------------- | ------------------ | ---------------- |
| `1`    | Aktif       | `bg-success/10`  | `text-success`     | `bg-success`     |
| `2`    | Tidak Aktif | `bg-neutral-100` | `text-neutral-500` | `bg-neutral-400` |
| `3`    | Maintenance | `bg-warning/10`  | `text-warning`     | `bg-warning`     |

### Contoh Penggunaan

```tsx
<DeviceStatusBadge status={1} />                    // "Aktif" (hijau)
<DeviceStatusBadge status={2} />                    // "Tidak Aktif" (abu)
<DeviceStatusBadge status={3} />                    // "Maintenance" (kuning)
<DeviceStatusBadge status={1} label="Active" />     // "Active" (hijau, label override)
```

---

## Types & Constants

**File:** `src/Components/Setting/DeviceManagement/types.ts`

### DeviceItem

Re-export dari API type (`src/Services/Modules/device/getListDevice.ts`):

```tsx
interface DeviceItem {
  id: number
  created_by: number
  created_at: string
  updated_by: number
  updated_at: string
  devices_code: string
  devices_name: string
  institution_id: number
  status: number // 1 = Aktif, 2 = Tidak Aktif, 3 = Maintenance
  description: string
  deleted_at: string | null
  status_label: string // "Aktif" | "Tidak Aktif" | "Maintenance"
}
```

### DeviceFormData (CreateDeviceRequest)

```tsx
interface DeviceFormData {
  devices_code: string
  devices_name: string
  status: number
  description: string
}
```

### DEVICE_FORM_INITIAL

```tsx
const DEVICE_FORM_INITIAL: DeviceFormData = {
  devices_code: '',
  devices_name: '',
  status: 1,
  description: '',
}
```

### DEVICE_STATUS_OPTIONS

Opsi untuk select input di form:

```tsx
const DEVICE_STATUS_OPTIONS = [
  { label: 'Aktif', value: 1 },
  { label: 'Tidak Aktif', value: 2 },
  { label: 'Maintenance', value: 3 },
]
```

### DEVICE_STATUS_MAP

Map status number ke label string:

```tsx
const DEVICE_STATUS_MAP: Record<number, string> = {
  1: 'Aktif',
  2: 'Tidak Aktif',
  3: 'Maintenance',
}
```

### DEVICE_STATUS_BADGE_CONFIG

Konfigurasi warna badge per status:

```tsx
const DEVICE_STATUS_BADGE_CONFIG: Record<number, { bg: string; text: string; dot: string }> = {
  1: { bg: 'bg-success/10 border-success/20', text: 'text-success', dot: 'bg-success' },
  2: { bg: 'bg-neutral-100 border-neutral-200', text: 'text-neutral-500', dot: 'bg-neutral-400' },
  3: { bg: 'bg-warning/10 border-warning/20', text: 'text-warning', dot: 'bg-warning' },
}
```

### FormFieldConfig

```tsx
interface FormFieldConfig {
  key: keyof DeviceFormData
  label: string
  type: 'text' | 'textarea' | 'select'
  placeholder: string
  required?: boolean
  options?: { label: string; value: string | number }[]
  colSpan?: number
}
```

---

## Helper: apiErrorParser

**File:** `src/Helpers/apiErrorParser.ts`

Utility reusable untuk parsing error response dari API (format Laravel). Dapat digunakan di semua modul, bukan hanya Device.

### parseFieldErrors(error)

Parse validation errors dari API response ke format `Record<string, string>` (field → pesan error pertama).

```tsx
import { parseFieldErrors } from '@/Helpers/apiErrorParser'

try {
  await postDevice(data).unwrap()
} catch (error) {
  const fieldErrors = parseFieldErrors(error)
  // { devices_name: "The devices name field is required." }
  setErrors(fieldErrors)
}
```

### getErrorMessage(error, fallback?)

Ambil pesan error umum dari API response dengan fallback.

```tsx
import { getErrorMessage } from '@/Helpers/apiErrorParser'

try {
  await deleteDevice({ id }).unwrap()
} catch (error) {
  const message = getErrorMessage(error, 'Gagal menghapus data.')
  showNotification({ title: 'Error!', description: message, type: 'error' })
}
```

### isValidationError(error)

Cek apakah error merupakan validation error (memiliki field-level errors).

```tsx
import { isValidationError } from '@/Helpers/apiErrorParser'

try {
  await postDevice(data).unwrap()
} catch (error) {
  if (isValidationError(error)) {
    // Tampilkan error per field
    const fieldErrors = parseFieldErrors(error)
    setFormErrors(fieldErrors)
  } else {
    // Tampilkan error umum
    showNotification({ title: 'Error!', description: getErrorMessage(error), type: 'error' })
  }
}
```

---

## API Service (RTK Query)

**File:** `src/Services/Modules/device/index.ts`

### Endpoints

| Endpoint        | Method | URL                   | Type       | Tags                      |
| --------------- | ------ | --------------------- | ---------- | ------------------------- |
| `getListDevice` | GET    | `/master/devices`     | `query`    | `providesTags: Device`    |
| `postDevice`    | POST   | `/master/devices`     | `mutation` | `invalidatesTags: Device` |
| `updateDevice`  | PUT    | `/master/devices/:id` | `mutation` | `invalidatesTags: Device` |
| `deleteDevice`  | DELETE | `/master/devices/:id` | `mutation` | `invalidatesTags: Device` |

### Hooks

```tsx
import {
  useGetListDeviceQuery,
  useLazyGetListDeviceQuery,
  usePostDeviceMutation,
  useUpdateDeviceMutation,
  useDeleteDeviceMutation,
} from '@/Services/Modules/device'
```

### Contoh Penggunaan

```tsx
// Fetch list dengan pagination
const { data, isLoading, isFetching } = useGetListDeviceQuery({
  page: 1,
  per_page: 10,
  search: '',
})

// Create device
const [postDevice, { isLoading: isCreating }] = usePostDeviceMutation()
const result = await postDevice({
  devices_code: 'YS03022500136',
  devices_name: 'Health Diagnostic Device YS-01',
  status: 1,
  description: 'Perangkat diagnostic',
}).unwrap()

// Update device
const [updateDevice, { isLoading: isUpdating }] = useUpdateDeviceMutation()
const result = await updateDevice({
  id: 1,
  body: {
    devices_code: 'YS03022500136',
    devices_name: 'Updated Name',
    status: 3,
    description: 'Updated description',
  },
}).unwrap()

// Delete device
const [deleteDevice, { isLoading: isDeleting }] = useDeleteDeviceMutation()
const result = await deleteDevice({ id: 1 }).unwrap()
```

---

## Cache Invalidation

Menggunakan RTK Query tag system untuk auto-refetch:

```
Tag: 'Device' (didefinisikan di src/Services/api.tsx)

getListDevice  → providesTags: ['Device']
postDevice     → invalidatesTags: ['Device']  → auto-refetch getListDevice
updateDevice   → invalidatesTags: ['Device']  → auto-refetch getListDevice
deleteDevice   → invalidatesTags: ['Device']  → auto-refetch getListDevice
```

Setelah setiap operasi create/update/delete berhasil, daftar device akan otomatis di-refresh tanpa perlu manual refetch.

---

## Error Handling & Validasi

### Alur Error Handling

```
API Response Error (4xx)
    │
    ▼
catch (error) di handleFormSubmit
    │
    ├─ isValidationError(error)?
    │   │
    │   ├─ YES → parseFieldErrors(error)
    │   │         → setFormErrors(fieldErrors)
    │   │         → Error ditampilkan di bawah field form
    │   │         → showNotification({ type: 'error', title: 'Validasi Gagal' })
    │   │
    │   └─ NO → getErrorMessage(error)
    │           → showNotification({ type: 'error', title: 'Error!' })
    │
    ▼
DeviceFormModal menerima serverErrors prop
    │
    ▼
useEffect sync serverErrors → local errors state
    │
    ▼
Error ditampilkan di bawah field yang bermasalah
    │
    ▼
User mengetik di field → error untuk field tersebut di-clear
```

### Contoh Error di Form

```
┌─────────────────────────────────────────┐
│ Kode Alat*                               │
│ ┌─────────────────────────────────────┐ │
│ │ YS03022500136                        │ │
│ └─────────────────────────────────────┘ │
│ ❌ The devices code has already been taken. │
│                                          │
│ Nama Alat*                               │
│ ┌─────────────────────────────────────┐ │
│ │                                      │ │
│ └─────────────────────────────────────┘ │
│ ❌ The devices name field is required.   │
└─────────────────────────────────────────┘
```

---

## Kustomisasi

### Menambah Status Baru

1. Tambah di `DEVICE_STATUS_OPTIONS` (`types.ts`):

   ```tsx
   { label: 'Kalibrasi', value: 4 }
   ```

2. Tambah di `DEVICE_STATUS_MAP` (`types.ts`):

   ```tsx
   4: 'Kalibrasi'
   ```

3. Tambah di `DEVICE_STATUS_BADGE_CONFIG` (`types.ts`):

   ```tsx
   4: { bg: 'bg-info/10 border-info/20', text: 'text-info', dot: 'bg-info' }
   ```

Semua komponen (tabel, detail, form) akan otomatis mendukung status baru karena menggunakan config-driven approach.

### Menambah Field Baru di Form

1. Tambah di `CreateDeviceRequest` (`postDevice.ts`):

   ```tsx
   export interface CreateDeviceRequest {
     devices_code: string
     devices_name: string
     status: number
     description: string
     serial_number: string // ← field baru
   }
   ```

2. Tambah di `DEVICE_FORM_INITIAL` (`types.ts`):

   ```tsx
   serial_number: ''
   ```

3. Tambah di `DEVICE_FORM_FIELDS` (`types.ts`):

   ```tsx
   { key: 'serial_number', label: 'Serial Number', type: 'text', placeholder: 'Contoh: SN-001' }
   ```

4. Tambah kolom di `columns` array (`MainDeviceManagement.tsx`) jika ingin ditampilkan di tabel.

5. Tambah di detail view fields (`MainDeviceManagement.tsx`) jika ingin ditampilkan di detail.

### Menambah Kolom Tabel

Tambah entry baru di array `columns` di `MainDeviceManagement.tsx`:

```tsx
{
  accessorKey: 'institution_id',
  header: 'Institusi',
  cell: ({ row }) => (
    <span className="text-sm text-neutral-600">
      {row.original.institution_id}
    </span>
  ),
},
```

### Mengubah Jumlah Data Per Halaman

Ubah `per_page` di initial state `queryParams`:

```tsx
const [queryParams, setQueryParams] = useState({
  page: 1,
  per_page: 15, // ← ubah dari 10 ke 15
  search: '',
})
```
