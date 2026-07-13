# 🏢 Institution — Dokumentasi Modul CRUD Institusi

> Modul untuk mengelola data institusi (rumah sakit, puskesmas, klinik) dengan fitur Create, Read, Update, Delete, terintegrasi penuh dengan API backend menggunakan RTK Query, termasuk upload logo dengan konversi base64, validasi form, notifikasi, search, sort, dan pagination.

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [File & Struktur](#file--struktur)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Komponen: MainInstitution](#komponen-maininstitution)
- [Komponen: InstitutionFormModal](#komponen-institutionformmodal)
- [Komponen: InstitutionDeleteModal](#komponen-institutiondeletemodal)
- [Komponen: InstitutionDetailView](#komponen-institutiondetailview)
- [Types](#types)
- [Utility: fileToBase64](#utility-filetobase64)
- [API Service (RTK Query)](#api-service-rtk-query)
- [Cache Invalidation](#cache-invalidation)
- [Error Handling & Validasi](#error-handling--validasi)
- [Design System & Warna](#design-system--warna)
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
│  │  │  │  │  TabMenu (tab: Institusi)             │  │  │  │  │
│  │  │  │  └──────────────────────────────────────┘  │  │  │  │
│  │  │  │                                             │  │  │  │
│  │  │  │  ┌──────────────────────────────────────┐  │  │  │  │
│  │  │  │  │  MainInstitution.tsx                   │  │  │  │  │
│  │  │  │  │                                       │  │  │  │  │
│  │  │  │  │  ┌────────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │  [+ Tambah Institusi]           │  │  │  │  │  │
│  │  │  │  │  └────────────────────────────────┘  │  │  │  │  │
│  │  │  │  │                                       │  │  │  │  │
│  │  │  │  │  ┌────────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │  DataTable (daftar institusi)   │  │  │  │  │  │
│  │  │  │  │  │  Kolom: Kode, Nama+Logo,       │  │  │  │  │  │
│  │  │  │  │  │  Wilayah, Kontak, Status, Aksi  │  │  │  │  │  │
│  │  │  │  │  └────────────────────────────────┘  │  │  │  │  │
│  │  │  │  │                                       │  │  │  │  │
│  │  │  │  │  ┌────────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │  InstitutionFormModal           │  │  │  │  │  │
│  │  │  │  │  │  → Create / Edit form           │  │  │  │  │  │
│  │  │  │  │  │  → Upload logo (base64)         │  │  │  │  │  │
│  │  │  │  │  └────────────────────────────────┘  │  │  │  │  │
│  │  │  │  │                                       │  │  │  │  │
│  │  │  │  │  ┌────────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │  InstitutionDeleteModal         │  │  │  │  │  │
│  │  │  │  │  │  → Konfirmasi hapus             │  │  │  │  │  │
│  │  │  │  │  └────────────────────────────────┘  │  │  │  │  │
│  │  │  │  │                                       │  │  │  │  │
│  │  │  │  │  ┌────────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │  InstitutionDetailView          │  │  │  │  │  │
│  │  │  │  │  │  → Detail lengkap institusi     │  │  │  │  │  │
│  │  │  │  │  └────────────────────────────────┘  │  │  │  │  │
│  │  │  │  └──────────────────────────────────────┘  │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Alur Data

```
GET /institutions (dengan query params)
    │
    ▼
RTK Query (useGetListInstitutionQuery)
    │
    ▼
apiResponse.data.data → ListInstitutionItem[]
    │
    ▼
DataTable (kolom sesuai field API)

Form Submit
    │
    ▼
InstitutionFormData (logo dikonversi ke base64)
    │
    ▼
RTK Query Mutation (POST /institutions atau PUT /institutions/:id)
    │
    ▼
invalidatesTags: ['Institution'] → auto-refetch list
```

---

## File & Struktur

```
src/
├── Components/Setting/
│   ├── MainSetting.tsx                        # Tab menu + render MainInstitution
│   ├── SettingLayout.tsx                       # Layout wrapper
│   └── Institution/
│       ├── types.ts                           # Type definitions + form field config
│       ├── MainInstitution.tsx                # Komponen utama CRUD + Detail View
│       ├── InstitutionFormModal.tsx            # Modal form Create/Edit + upload logo
│       └── InstitutionDeleteModal.tsx          # Modal konfirmasi hapus
│
├── Helpers/
│   └── fileToBase64.ts                        # Utility reusable: konversi file → base64
│
├── Components/General/
│   └── Notification.tsx                       # Hook useNotification (Ant Design)
│
└── Services/Modules/
    └── institution/
        ├── index.ts                           # RTK Query endpoints + hooks export
        ├── getListInstitution.ts              # GET /institutions (list + pagination)
        ├── postInstitution.ts                 # POST /institutions (create)
        ├── updateInstitution.ts               # PUT /institutions/:id (update)
        └── deleteInstitution.ts               # DELETE /institutions/:id (delete)
```

---

## Quick Start

### 1. Navigasi ke halaman Pengaturan

Tab "Institusi" sudah terintegrasi di `MainSetting.tsx`:

```tsx
// src/Components/Setting/MainSetting.tsx
import MainInstitution from './Institution/MainInstitution'

// Di dalam renderContent():
case 'institution':
  return <MainInstitution />
```

### 2. Akses via browser

```
http://localhost:5174/setting → Klik tab "Institusi"
```

Data akan otomatis di-fetch dari API saat komponen dimount.

---

## API Endpoints

| Endpoint             | Method | URL                 | Deskripsi                     |
| -------------------- | ------ | ------------------- | ----------------------------- |
| `getListInstitution` | GET    | `/institutions`     | Daftar institusi + pagination |
| `postInstitution`    | POST   | `/institutions`     | Tambah institusi baru         |
| `updateInstitution`  | PUT    | `/institutions/:id` | Update institusi              |
| `deleteInstitution`  | DELETE | `/institutions/:id` | Hapus institusi               |

### Query Parameters (GET)

| Parameter    | Tipe     | Default | Deskripsi                  |
| ------------ | -------- | ------- | -------------------------- |
| `search`     | `string` | `''`    | Pencarian global           |
| `status`     | `string` | `''`    | Filter status (true/false) |
| `provincies` | `string` | `''`    | Filter provinsi            |
| `per_page`   | `number` | `10`    | Jumlah data per halaman    |
| `sort_by`    | `string` | `''`    | Field untuk sorting        |
| `sort_order` | `string` | `''`    | Arah sorting (asc/desc)    |
| `page`       | `number` | `1`     | Halaman yang diminta       |

### Response Format (GET)

```json
{
  "status": "success",
  "message": "Institutions retrieved successfully.",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 7,
        "created_by": 6,
        "created_at": "2026-03-04T03:29:02.000000Z",
        "updated_by": 6,
        "updated_at": "2026-03-04T03:29:02.000000Z",
        "institutions_code": "INST-002",
        "institutions_name": "Puskes Cikaso",
        "addr1": "Jl. Sudirman No. 1",
        "addr2": "Lantai 5",
        "rt": "001",
        "rw": "002",
        "villages": "Menteng",
        "districts": "Menteng",
        "regencies": "Jakarta Pusat",
        "provincies": "DKI Jakarta",
        "poscode": "10310",
        "phone": "02112345678",
        "fax": "02187654321",
        "mail": "info@lembaga.com",
        "status": true,
        "logo": "institutions/logos/d4b44546-aace-4949-83da-4ecb72689fa3.jpg",
        "deleted_at": null,
        "logo_url": "http://192.168.18.208:8000/storage/institutions/logos/..."
      }
    ],
    "from": 1,
    "last_page": 2,
    "per_page": 10,
    "to": 10,
    "total": 15
  }
}
```

### Request Body (POST/PUT)

```json
{
  "institutions_code": "INST-001",
  "institutions_name": "Lembaga Contoh",
  "addr1": "Jl. Sudirman No. 1",
  "addr2": "Lantai 5",
  "rt": "001",
  "rw": "002",
  "villages": "Menteng",
  "districts": "Menteng",
  "regencies": "Jakarta Pusat",
  "provincies": "DKI Jakarta",
  "poscode": "10310",
  "phone": "02112345678",
  "fax": "02187654321",
  "mail": "info@lembaga.com",
  "logo": "data:image/png;base64,iVBORw0KGgo...",
  "status": true
}
```

### Error Responses

```json
// Invalid Logo Format
{
  "status": "error",
  "message": "Logo must be a valid base64 image string (jpeg, jpg, png, gif, webp, svg).",
  "data": null
}

// Duplicate Institution Code
{
  "status": "error",
  "message": "Institution code 'INST-001' already exists.",
  "data": null
}
```

---

## Komponen: MainInstitution

**File:** `src/Components/Setting/Institution/MainInstitution.tsx`

Komponen utama yang mengelola seluruh operasi CRUD institusi, terintegrasi penuh dengan API.

### Fitur

| Fitur            | Deskripsi                                              |
| ---------------- | ------------------------------------------------------ |
| 🔍 Search        | Pencarian global via DataTable                         |
| ↕️ Sorting       | Klik header kolom untuk sort ascending/descending      |
| 📄 Pagination    | Navigasi halaman dengan pilihan 5/10/20/50 per halaman |
| ➕ Create        | Tombol "Tambah Institusi" → buka form modal            |
| ✏️ Edit          | Tombol edit per baris → buka form modal (pre-filled)   |
| 🗑️ Delete        | Tombol hapus per baris → buka konfirmasi modal         |
| 👁️ Detail        | Tombol detail per baris → buka detail view modal       |
| ⏳ Loading State | Spinner saat data sedang dimuat dari API               |
| 📭 Empty State   | Pesan "Belum ada data institusi" saat data kosong      |
| 🔔 Notifikasi    | Success/error notification setelah CRUD operation      |
| 🔄 Auto-refetch  | Data otomatis di-refresh setelah create/update/delete  |

### Kolom Tabel

| Kolom          | Accessor            | Deskripsi                                          |
| -------------- | ------------------- | -------------------------------------------------- |
| Kode           | `institutions_code` | Badge primary dengan kode institusi                |
| Nama Institusi | `institutions_name` | Logo (jika ada) + nama + alamat (truncated)        |
| Wilayah        | `provincies`        | Kabupaten/Kota + Provinsi dengan icon pin          |
| Kontak         | `phone`             | Telepon + email dengan icon                        |
| Status         | `status`            | Badge: hijau (Aktif) / abu-abu (Nonaktif)          |
| Aksi           | -                   | Tombol Detail (biru), Edit (kuning), Hapus (merah) |

### RTK Query Hooks

```tsx
// Fetch data list
const { data: apiResponse, isLoading, isFetching } = useGetListInstitutionQuery(queryParams)

// Mutations
const [postInstitution, { isLoading: isCreating }] = usePostInstitutionMutation()
const [updateInstitution, { isLoading: isUpdating }] = useUpdateInstitutionMutation()
const [deleteInstitution, { isLoading: isDeletingApi }] = useDeleteInstitutionMutation()
```

### Data Extraction

```tsx
// Data diambil dari nested response: apiResponse.data.data
const data = useMemo<InstitutionItem[]>(() => {
  return apiResponse?.data?.data ?? []
}, [apiResponse])

// Info pagination
const paginationInfo = useMemo(() => {
  if (!apiResponse?.data) return null
  const { current_page, last_page, from, to, total, per_page } = apiResponse.data
  return { current_page, last_page, from, to, total, per_page }
}, [apiResponse])
```

### Query Parameters State

```tsx
const [queryParams, setQueryParams] = useState({
  search: '',
  status: '',
  provincies: '',
  per_page: 10,
  sort_by: '',
  sort_order: '',
  page: 1,
})
```

### DataTable Server-Side Integration

Komponen MainInstitution menggunakan DataTable dengan server-side pagination dan sorting:

```tsx
<DataTable
  data={data}
  columns={columns}
  pageSize={queryParams.per_page}
  showSearch
  searchPlaceholder="Cari institusi..."
  emptyMessage="Belum ada data institusi"
  isLoading={isLoading || isFetching}
  // Server-side props
  currentPage={paginationInfo?.current_page}
  lastPage={paginationInfo?.last_page}
  totalData={paginationInfo?.total}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  onSortChange={handleSortChange}
  serverSortBy={queryParams.sort_by}
  serverSortOrder={queryParams.sort_order}
  onSearch={handleSearchChange}
/>
```

**Fitur Server-Side:**

- **Pagination**: Data diambil dari API berdasarkan `page` dan `per_page`
- **Sorting**: Klik header kolom untuk mengurutkan (asc/desc) via `sort_by` dan `sort_order`
- **Search**: Pencarian global via `search` query parameter
- **Info Jumlah Data**: Menampilkan "Menampilkan X - Y dari Z data""

### Handlers

| Handler                               | Deskripsi                                                        |
| ------------------------------------- | ---------------------------------------------------------------- |
| `handleCreate()`                      | Buka form modal mode create                                      |
| `handleEdit(item)`                    | Buka form modal mode edit (pre-filled dari data API)             |
| `handleDelete(item)`                  | Buka modal konfirmasi hapus                                      |
| `handleDetail(item)`                  | Buka modal detail view                                           |
| `handleFormSubmit()`                  | Submit form → POST/PUT API → notifikasi → auto-refetch           |
| `handleDeleteConfirm()`               | Konfirmasi hapus → DELETE API → notifikasi → auto-refetch        |
| `handlePageChange(page)`              | Server-side: update page → refetch dari API (0-based ke 1-based) |
| `handlePageSizeChange(size)`          | Server-side: update per_page → refetch dari API                  |
| `handleSortChange(sortBy, sortOrder)` | Server-side: update sort_by & sort_order → refetch dari API      |
| `handleSearchChange(search)`          | Server-side: update search → refetch dari API                    |

---

## Komponen: InstitutionFormModal

**File:** `src/Components/Setting/Institution/InstitutionFormModal.tsx`

Modal form untuk menambah dan mengedit data institusi, termasuk upload logo dengan konversi base64.

### Struktur Modal

```
┌─────────────────────────────────────────┐
│ 🏢 Header                                │
│   [icon] Tambah/Edit Institusi     [✕]  │
├─────────────────────────────────────────┤
│ 🖼️ Logo Upload                           │
│   [Preview] [Pilih Gambar] [Hapus]      │
│   Format: JPEG, PNG, GIF, WebP, SVG    │
├─────────────────────────────────────────┤
│ 📝 Form (grid 2 kolom, config-driven)    │
│   Kode Institusi*  |  Nama Institusi*   │
│   Alamat 1* (full width)                │
│   Alamat 2 (full width)                 │
│   RT               |  RW               │
│   Kelurahan/Desa*  |  Kecamatan*       │
│   Kabupaten/Kota*  |  Provinsi*        │
│   Kode Pos         |  Telepon*         │
│   Fax              |  Email            │
│   Status [Toggle Switch]                │
├─────────────────────────────────────────┤
│ 🔘 Footer                                │
│                    [Batal] [Simpan/Update]│
└─────────────────────────────────────────┘
```

### Props

```tsx
interface InstitutionFormModalProps {
  isOpen: boolean // Modal terbuka?
  mode: 'create' | 'edit' // Mode form
  item?: InstitutionItem | null // Data untuk edit
  isSubmitting?: boolean // Loading state
  onClose: () => void // Callback tutup
  onSubmit: (data: InstitutionFormData, id?: number) => void // Callback submit
}
```

### Form Fields (Config-Driven)

Form fields didefinisikan sebagai array config di `types.ts` (`INSTITUTION_FORM_FIELDS`), bukan hardcode JSX. Ini memudahkan penambahan/pengurangan field tanpa mengubah komponen form.

```tsx
const INSTITUTION_FORM_FIELDS: FormFieldConfig[] = [
  { key: 'institutions_code', label: 'Kode Institusi', type: 'text', required: true },
  { key: 'institutions_name', label: 'Nama Institusi', type: 'text', required: true },
  { key: 'addr1', label: 'Alamat 1', type: 'text', required: true, colSpan: 2 },
  { key: 'addr2', label: 'Alamat 2', type: 'text', colSpan: 2 },
  { key: 'rt', label: 'RT', type: 'text' },
  { key: 'rw', label: 'RW', type: 'text' },
  { key: 'villages', label: 'Kelurahan/Desa', type: 'text', required: true },
  { key: 'districts', label: 'Kecamatan', type: 'text', required: true },
  { key: 'regencies', label: 'Kabupaten/Kota', type: 'text', required: true },
  { key: 'provincies', label: 'Provinsi', type: 'text', required: true },
  { key: 'poscode', label: 'Kode Pos', type: 'text' },
  { key: 'phone', label: 'Telepon', type: 'text', required: true },
  { key: 'fax', label: 'Fax', type: 'text' },
  { key: 'mail', label: 'Email', type: 'email' },
  { key: 'status', label: 'Status', type: 'toggle' },
]
```

### Upload Logo

Logo dikonversi ke base64 sebelum dikirim ke API menggunakan utility `convertImageToBase64()`:

```tsx
import { convertImageToBase64 } from '@/Helpers/fileToBase64'

const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  const result = await convertImageToBase64(file)

  if ('error' in result) {
    setLogoError(result.error)
    return
  }

  setFormData((prev) => ({ ...prev, logo: result.base64 }))
  setLogoPreview(result.base64)
}
```

**Fitur upload:**

- Preview gambar sebelum submit
- Validasi format file (JPEG, PNG, GIF, WebP, SVG)
- Validasi ukuran file (maks 2MB)
- Tombol hapus logo
- Loading state saat konversi
- Saat edit, menampilkan logo yang sudah ada dari `logo_url`

### Validasi

| Field          | Aturan                                  |
| -------------- | --------------------------------------- |
| Kode Institusi | Wajib diisi                             |
| Nama Institusi | Wajib diisi                             |
| Alamat 1       | Wajib diisi                             |
| Kelurahan/Desa | Wajib diisi                             |
| Kecamatan      | Wajib diisi                             |
| Kabupaten/Kota | Wajib diisi                             |
| Provinsi       | Wajib diisi                             |
| Telepon        | Wajib diisi                             |
| Email          | Opsional, tapi harus format email valid |
| Logo           | Opsional, format & ukuran divalidasi    |
| Status         | Default: `true` (Aktif)                 |

### Contoh Penggunaan

```tsx
<InstitutionFormModal
  isOpen={isFormOpen}
  mode={formMode}
  item={selectedItem}
  isSubmitting={isCreating || isUpdating}
  onClose={() => setIsFormOpen(false)}
  onSubmit={handleFormSubmit}
/>
```

---

## Komponen: InstitutionDeleteModal

**File:** `src/Components/Setting/Institution/InstitutionDeleteModal.tsx`

Modal konfirmasi sebelum menghapus data institusi.

### Struktur Modal

```
┌─────────────────────────────────────────┐
│ ⚠️ Header                                │
│   [icon] Hapus Institusi           [✕]  │
├─────────────────────────────────────────┤
│ 📋 Content                               │
│   Apakah Anda yakin ingin menghapus?    │
│   ┌─────────────────────────────────┐   │
│   │ Puskes Cikaso                    │   │
│   │ Kode: INST-002                   │   │
│   └─────────────────────────────────┘   │
│   ⚠️ Tindakan ini tidak dapat dibatalkan │
├─────────────────────────────────────────┤
│ 🔘 Footer                                │
│                       [Batal] [Hapus]   │
└─────────────────────────────────────────┘
```

### Props

```tsx
interface InstitutionDeleteModalProps {
  isOpen: boolean // Modal terbuka?
  item: InstitutionItem | null // Data yang akan dihapus
  isDeleting?: boolean // Loading state
  onClose: () => void // Callback tutup
  onConfirm: (id: number) => void // Callback konfirmasi hapus (id: number)
}
```

### Contoh Penggunaan

```tsx
<InstitutionDeleteModal
  isOpen={isDeleteOpen}
  item={selectedItem}
  isDeleting={isDeletingApi}
  onClose={() => setIsDeleteOpen(false)}
  onConfirm={handleDeleteConfirm}
/>
```

---

## Komponen: InstitutionDetailView

Komponen inline di `MainInstitution.tsx` untuk menampilkan detail lengkap institusi.

### Struktur Modal

```
┌─────────────────────────────────────────┐
│ 🏢 Header                                │
│   [logo] Detail Institusi          [✕]  │
│          INST-002                        │
├─────────────────────────────────────────┤
│ 📋 Detail Fields                         │
│   KODE INSTITUSI      INST-002          │
│   NAMA INSTITUSI      Puskes Cikaso     │
│   ALAMAT              Jl. Sudirman No.1,│
│                       Lantai 5, RT 001/ │
│                       RW 002, Menteng,  │
│                       Jakarta Pusat,    │
│                       DKI Jakarta, 10310│
│   TELEPON             📞 02112345678    │
│   FAX                 02187654321       │
│   EMAIL               ✉️ info@lembaga.. │
│   STATUS              Aktif             │
│   DIBUAT              04 Maret 2026     │
│   TERAKHIR DIUPDATE   04 Maret 2026    │
├─────────────────────────────────────────┤
│ 🔘 Footer                                │
│                       [Tutup] [✏️ Edit] │
└─────────────────────────────────────────┘
```

### Props

```tsx
interface InstitutionDetailViewProps {
  item: InstitutionItem // Data institusi dari API
  onClose: () => void // Callback tutup
  onEdit: () => void // Callback edit (buka form modal)
}
```

### Fitur

- Menampilkan logo institusi dari `logo_url` (fallback ke icon jika tidak ada)
- Alamat lengkap digabung dari field-field terpisah (`addr1`, `addr2`, `rt`, `rw`, `villages`, `districts`, `regencies`, `provincies`, `poscode`)
- Tanggal diformat ke format Indonesia (`04 Maret 2026, 10:29`)
- Status ditampilkan sebagai teks "Aktif" / "Nonaktif"

---

## Types

**File:** `src/Components/Setting/Institution/types.ts`

### InstitutionItem

Re-export dari `ListInstitutionItem` di API service:

```tsx
// Dari src/Services/Modules/institution/getListInstitution.ts
interface ListInstitutionItem {
  id: number
  created_by: number
  created_at: string
  updated_by: number
  updated_at: string
  institutions_code: string
  institutions_name: string
  addr1: string
  addr2: string
  rt: string
  rw: string
  villages: string
  districts: string
  regencies: string
  provincies: string
  poscode: string
  phone: string
  fax: string
  mail: string
  status: boolean // true = Aktif, false = Nonaktif
  logo: string // Path relatif logo di server
  deleted_at: null | string
  logo_url: string // URL lengkap logo
}

export type InstitutionItem = ListInstitutionItem
```

### InstitutionFormData

Re-export dari `CreateInstitutionRequest` di API service:

```tsx
// Dari src/Services/Modules/institution/postInstitution.ts
interface CreateInstitutionRequest {
  institutions_code: string
  institutions_name: string
  addr1: string
  addr2: string
  rt: string
  rw: string
  villages: string
  districts: string
  regencies: string
  provincies: string
  poscode: string
  phone: string
  fax: string
  mail: string
  logo: string // Base64 encoded image string
  status: boolean
}

export type InstitutionFormData = CreateInstitutionRequest
```

### INSTITUTION_FORM_INITIAL

Default value untuk form:

```tsx
const INSTITUTION_FORM_INITIAL: InstitutionFormData = {
  institutions_code: '',
  institutions_name: '',
  addr1: '',
  addr2: '',
  rt: '',
  rw: '',
  villages: '',
  districts: '',
  regencies: '',
  provincies: '',
  poscode: '',
  phone: '',
  fax: '',
  mail: '',
  logo: '',
  status: true,
}
```

### FormFieldConfig

Konfigurasi untuk render form secara dinamis:

```tsx
interface FormFieldConfig {
  key: keyof InstitutionFormData
  label: string
  type: 'text' | 'email' | 'textarea' | 'select' | 'file' | 'toggle'
  placeholder: string
  required?: boolean
  options?: { label: string; value: string | boolean }[]
  colSpan?: number
}
```

---

## Utility: fileToBase64

**File:** `src/Helpers/fileToBase64.ts`

Utility reusable untuk konversi file gambar menjadi base64 string. Bisa digunakan di modul lain yang membutuhkan upload gambar.

### Fungsi

| Fungsi                                 | Deskripsi                                                 |
| -------------------------------------- | --------------------------------------------------------- |
| `fileToBase64(file)`                   | Konversi File ke base64 string (termasuk data URI prefix) |
| `validateImageFile(file, maxSize?)`    | Validasi ekstensi, MIME type, dan ukuran file             |
| `convertImageToBase64(file, maxSize?)` | Gabungan validasi + konversi (recommended)                |

### Konstanta

| Konstanta                  | Nilai                                          |
| -------------------------- | ---------------------------------------------- |
| `ALLOWED_IMAGE_EXTENSIONS` | `['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg']` |
| `MAX_FILE_SIZE`            | `2 * 1024 * 1024` (2MB)                        |

### Contoh Penggunaan

```tsx
import { convertImageToBase64 } from '@/Helpers/fileToBase64'

// Konversi dengan validasi
const result = await convertImageToBase64(file)

if ('error' in result) {
  console.error(result.error)
  // "Format file tidak didukung. Gunakan: jpeg, jpg, png, gif, webp, svg"
  // "Ukuran file terlalu besar. Maksimal 2.0MB."
} else {
  console.log(result.base64)
  // "data:image/png;base64,iVBORw0KGgo..."
}
```

```tsx
import { fileToBase64, validateImageFile } from '@/Helpers/fileToBase64'

// Validasi saja
const validation = validateImageFile(file)
if (!validation.isValid) {
  console.error(validation.error)
}

// Konversi saja (tanpa validasi)
const base64 = await fileToBase64(file)
```

---

## API Service (RTK Query)

**File:** `src/Services/Modules/institution/index.ts`

### Hooks

```tsx
import {
  useGetListInstitutionQuery,
  usePostInstitutionMutation,
  useUpdateInstitutionMutation,
  useDeleteInstitutionMutation,
} from '@/Services/Modules/institution'
```

### Endpoint Details

#### getListInstitution

```tsx
// Query dengan parameter
const { data, isLoading, isFetching } = useGetListInstitutionQuery({
  search: '',
  status: '',
  provincies: '',
  per_page: 10,
  sort_by: '',
  sort_order: '',
  page: 1,
})

// Semua parameter opsional (ada default values)
const { data } = useGetListInstitutionQuery({})
```

#### postInstitution

```tsx
const [postInstitution, { isLoading }] = usePostInstitutionMutation()

const result = await postInstitution({
  institutions_code: 'INST-001',
  institutions_name: 'Lembaga Contoh',
  addr1: 'Jl. Sudirman No. 1',
  // ... field lainnya
  logo: 'data:image/png;base64,...', // Base64 string
  status: true,
}).unwrap()
```

#### updateInstitution

```tsx
const [updateInstitution, { isLoading }] = useUpdateInstitutionMutation()

const result = await updateInstitution({
  id: 7,
  body: {
    institutions_code: 'INST-002',
    // ... field lainnya
  },
}).unwrap()
```

#### deleteInstitution

```tsx
const [deleteInstitution, { isLoading }] = useDeleteInstitutionMutation()

const result = await deleteInstitution({ id: 7 }).unwrap()
```

---

## Cache Invalidation

Semua mutation endpoints menggunakan `invalidatesTags: ['Institution']` dan query endpoint menggunakan `providesTags: ['Institution']`. Ini berarti:

1. **Setelah POST** (create) → list otomatis di-refetch
2. **Setelah PUT** (update) → list otomatis di-refetch
3. **Setelah DELETE** → list otomatis di-refetch

Tidak perlu manual refetch atau state management tambahan.

```tsx
// Di getListInstitution.ts
providesTags: ['Institution']

// Di postInstitution.ts, updateInstitution.ts, deleteInstitution.ts
invalidatesTags: ['Institution']
```

Tag `'Institution'` sudah didaftarkan di `api.tsx`:

```tsx
export const api = createApi({
  tagTypes: ['Auth', 'Institution', 'Device', 'Permission'],
  // ...
})
```

---

## Error Handling & Validasi

### Client-Side Validation

Validasi dilakukan di `InstitutionFormModal` sebelum submit:

```tsx
const validate = (): boolean => {
  const newErrors = {}

  if (!formData.institutions_code.trim()) newErrors.institutions_code = 'Kode institusi wajib diisi'
  if (!formData.institutions_name.trim()) newErrors.institutions_name = 'Nama institusi wajib diisi'
  if (!formData.addr1.trim()) newErrors.addr1 = 'Alamat 1 wajib diisi'
  // ... validasi field lainnya

  if (formData.mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mail)) {
    newErrors.mail = 'Format email tidak valid'
  }

  return Object.keys(newErrors).length === 0
}
```

### Server-Side Error Handling

Error dari API ditangani di `handleFormSubmit` dan `handleDeleteConfirm`:

```tsx
const handleFormSubmit = async (formData, id?) => {
  try {
    const result = await postInstitution(formData).unwrap()

    if (result.status === 'success') {
      showNotification({ title: 'Berhasil!', description: result.message, type: 'success' })
    } else {
      // API mengembalikan error (misal: duplicate code, invalid logo)
      showNotification({ title: 'Gagal!', description: result.message, type: 'error' })
    }
  } catch (error) {
    // Network error atau error lainnya
    const errorMessage = error?.data?.message || 'Terjadi kesalahan saat menyimpan data.'
    showNotification({ title: 'Error!', description: errorMessage, type: 'error' })
  }
}
```

### Error Scenarios yang Ditangani

| Skenario                   | Sumber  | Handling                                      |
| -------------------------- | ------- | --------------------------------------------- |
| Field wajib kosong         | Client  | Error message di bawah field                  |
| Format email tidak valid   | Client  | Error message di bawah field email            |
| Format logo tidak valid    | Client  | Error message di area upload logo             |
| Ukuran logo > 2MB          | Client  | Error message di area upload logo             |
| Duplicate institution code | Server  | Notifikasi error dari API message             |
| Invalid base64 logo        | Server  | Notifikasi error dari API message             |
| Network error              | Network | Notifikasi error generic                      |
| 401 Unauthorized           | Server  | Ditangani oleh API interceptor (auto-refresh) |

---

## Design System & Warna

Semua komponen menggunakan **design token** dari `src/index.css`.

### Palet Warna yang Digunakan

| Token         | Hex       | Penggunaan                                  |
| ------------- | --------- | ------------------------------------------- |
| `primary-50`  | `#e6f4ff` | Background badge kode, hover state          |
| `primary-100` | `#b3dcfe` | Border badge kode                           |
| `primary-500` | `#0196fe` | Tombol utama, ikon aktif, toggle aktif      |
| `primary-600` | `#017fd6` | Hover tombol utama                          |
| `primary-700` | `#0165ac` | Teks badge kode institusi                   |
| `neutral-50`  | `#f7f8fc` | Background section                          |
| `neutral-100` | `#eef0f7` | Border tabel, separator                     |
| `neutral-200` | `#d9ddef` | Border input, border card                   |
| `neutral-300` | `#b4b9d4` | Toggle nonaktif                             |
| `neutral-400` | `#8b91b5` | Teks placeholder, label kecil               |
| `neutral-500` | `#6b7092` | Teks header tabel                           |
| `neutral-800` | `#222536` | Teks utama                                  |
| `success`     | `#10b981` | Badge status aktif                          |
| `warning`     | `#f59e0b` | Tombol edit                                 |
| `danger`      | `#ef4444` | Tombol hapus, error message, badge nonaktif |

---

## Kustomisasi

### Menambah Field Baru

1. Tambah field di `CreateInstitutionRequest` (`postInstitution.ts`)
2. Tambah field di `ListInstitutionItem` (`getListInstitution.ts`)
3. Tambah field config di `INSTITUTION_FORM_FIELDS` (`types.ts`)
4. Update `INSTITUTION_FORM_INITIAL` (`types.ts`)
5. Tambah validasi di `validate()` (`InstitutionFormModal.tsx`) jika required
6. Tambah kolom di `columns` array (`MainInstitution.tsx`) jika perlu ditampilkan di tabel
7. Tambah di detail view fields (`MainInstitution.tsx`)

### Mengubah Validasi

Edit fungsi `validate()` di `InstitutionFormModal.tsx`:

```tsx
const validate = (): boolean => {
  const newErrors = {}

  // Tambah validasi custom
  if (formData.poscode && !/^\d{5}$/.test(formData.poscode)) {
    newErrors.poscode = 'Kode pos harus 5 digit angka'
  }

  // ...
}
```

### Mengubah Ukuran Maksimal Logo

Edit konstanta di `fileToBase64.ts`:

```tsx
// Ubah dari 2MB ke 5MB
export const MAX_FILE_SIZE = 5 * 1024 * 1024
```

Atau pass parameter saat memanggil:

```tsx
const result = await convertImageToBase64(file, 5 * 1024 * 1024)
```

### Menambah Format Logo yang Diizinkan

Edit konstanta di `fileToBase64.ts`:

```tsx
export const ALLOWED_IMAGE_EXTENSIONS = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg', 'bmp']
```

### Mengubah Query Parameters Default

Edit state `queryParams` di `MainInstitution.tsx`:

```tsx
const [queryParams, setQueryParams] = useState({
  search: '',
  status: '',
  provincies: '',
  per_page: 20, // Ubah default per_page
  sort_by: 'created_at', // Default sort
  sort_order: 'desc', // Default order
  page: 1,
})
```
