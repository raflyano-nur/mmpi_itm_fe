# 🔬 Diagnostic Filter — Dokumentasi Fitur Filter Diagnostik

> Dokumentasi ini menjelaskan fitur filter yang tersedia di halaman Daftar Diagnostik, termasuk kolom-kolom yang dapat difilter, parameter API, dan implementasi kode.

---

## Daftar Isi

- [Ringkasan Fitur](#ringkasan-fitur)
- [Kolom Filter](#kolom-filter)
- [Parameter API](#parameter-api)
- [Implementasi](#implementasi)
- [State Management](#state-management)
- [Handler Functions](#handler-functions)
- [UI Filter Panel](#ui-filter-panel)
- [Contoh Penggunaan](#contoh-penggunaan)
- [Troubleshooting](#troubleshooting)

---

## Ringkasan Fitur

Halaman Daftar Diagnostik (`DiagnostikList.tsx`) menyediakan fitur filter yang memungkinkan pengguna menyaring data diagnostik berdasarkan kriteria tertentu. Filter ini bekerja secara **server-side**, artinya penyaringan data dilakukan oleh API backend.

### Fitur Utama

| Fitur              | Deskripsi                                                            |
| ------------------ | -------------------------------------------------------------------- |
| 🔍 Pencarian       | Filter berdasarkan kata kunci (nama pasien, ID alat, hasil)          |
| 📅 Rentang Tanggal | Filter berdasarkan tanggal pemeriksaan                               |
| 🏥 Kode Institusi  | Filter berdasarkan kode institusi                                    |
| ⚧ Jenis Kelamin    | Filter berdasarkan jenis kelamin pasien                              |
| 📊 Status Queue    | Filter berdasarkan status antrean (Menunggu/Diproses/Berhasil/Gagal) |
| 🆔 No. Identitas   | Filter berdasarkan nomor identitas pasien                            |
| 📱 ID Alat         | Filter berdasarkan kode device                                       |

---

## Kolom Filter

### 1. Tanggal Mulai (`date_from`)

- **Tipe:** `string` (format: `YYYY-MM-DD`)
- **Deskripsi:** Tanggal awal pemeriksaan diagnostik
- **Contoh:** `2026-01-01`

### 2. Tanggal Akhir (`date_to`)

- **Tipe:** `string` (format: `YYYY-MM-DD`)
- **Deskripsi:** Tanggal akhir pemeriksaan diagnostik
- **Contoh:** `2026-03-10`

### 3. ID Alat (`devices_code`)

- **Tipe:** `string`
- **Deskripsi:** Kode device alat diagnostik
- **Contoh:** `YS03022500138`

### 4. Kode Institusi (`institutions_code`)

- **Tipe:** `string`
- **Deskripsi:** Kode institusi tempat pemeriksaan
- **Contoh:** `INST-002`

### 5. Jenis Kelamin (`sex`)

- **Tipe:** `string`
- **Deskripsi:** Jenis kelamin pasien
- **Nilai yang didukung:** `Male` / `Female`

### 6. Status Queue (`queue_status`)

- **Tipe:** `'pending' | 'processing' | 'success' | 'failed'`
- **Deskripsi:** Status antrean pengiriman data diagnostik
- **Nilai:**
  - `pending` - Menunggu
  - `processing` - Diproses
  - `success` - Berhasil
  - `failed` - Gagal

### 7. Nama Pasien (`search_name`)

- **Tipe:** `string`
- **Deskripsi:** Pencarian berdasarkan nama pasien
- **Contoh:** `siti khadijah`

### 8. No. Identitas (`id_number`)

- **Tipe:** `string`
- **Deskripsi:** Nomor identitas (KTP/SIM) pasien
- **Contoh:** `12001`

---

## Parameter API

### Query Parameters (GET /diagnostics)

Berdasarkan file [`src/Services/Modules/diagnostics/getListDiagnostic.ts`](src/Services/Modules/diagnostics/getListDiagnostic.ts) dan [`src/Components/Diagnostik/types.ts`](src/Components/Diagnostik/types.ts):

| Parameter           | Tipe     | Default      | Deskripsi                           |
| ------------------- | -------- | ------------ | ----------------------------------- |
| `page`              | `number` | `1`          | Halaman yang diminta                |
| `per_page`          | `number` | `15`         | Jumlah data per halaman             |
| `search`            | `string` | `''`         | Pencarian global                    |
| `devices_code`      | `string` | -            | Filter kode device                  |
| `institutions_code` | `string` | -            | Filter kode institusi               |
| `queue_status`      | `string` | -            | Filter status queue                 |
| `date_from`         | `string` | -            | Filter tanggal mulai (YYYY-MM-DD)   |
| `date_to`           | `string` | -            | Filter tanggal selesai (YYYY-MM-DD) |
| `sort_by`           | `string` | `created_at` | Kolom untuk sorting                 |
| `sort_dir`          | `string` | `desc`       | Arah sorting (asc/desc)             |

### Interface ListDiagnosticParams

```typescript
// src/Components/Diagnostik/types.ts
export interface ListDiagnosticParams {
  page?: number
  per_page?: number
  search?: string
  devices_code?: string
  institutions_code?: string
  queue_status?: 'pending' | 'processing' | 'success' | 'failed'
  date_from?: string
  date_to?: string
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
}
```

---

## Implementasi

### Lokasi File

- **Main Component:** `src/Components/Diagnostik/List/DiagnostikList.tsx`
- **Types:** `src/Components/Diagnostik/types.ts`
- **API Service:** `src/Services/Modules/diagnostics/getListDiagnostic.ts`

### Struktur Komponen

```
DiagnostikList.tsx
├── State (queryParams, filter states)
├── API Hooks (useGetListDiagnosticQuery)
├── DataTable
├── FilterPanel
│   ├── Tanggal Mulai
│   ├── Tanggal Akhir
│   ├── ID Alat
│   ├── Kode Institusi
│   ├── Jenis Kelamin
│   ├── Status Queue
│   ├── Nama Pasien
│   └── No. Identitas
├── Modals
│   ├── DiagnostikDetailModal
│   ├── DiagnostikResendModal
│   └── DiagnostikLogsModal
└── Handlers
    ├── handleApplyDateFilter
    ├── handleResetFilters
    ├── handleDeviceCodeChange
    └── ...
```

---

## State Management

### Query Params State

```typescript
// Baris 70-76: src/Components/Diagnostik/List/DiagnostikList.tsx
const [queryParams, setQueryParams] = useState<ListDiagnosticParams>({
  page: 1,
  per_page: 10,
  search: '',
  sort_by: 'created_at',
  sort_dir: 'desc',
})
```

### Filter States

```typescript
// Baris 79-86: Filter states
const [dateFrom, setDateFrom] = useState<string>('')
const [dateTo, setDateTo] = useState<string>('')
const [deviceCode, setDeviceCode] = useState<string>('')
const [institutionCode, setInstitutionCode] = useState<string>('')
const [sexFilter, setSexFilter] = useState<string>('')
const [queueStatus, setQueueStatus] = useState<'pending' | 'processing' | 'success' | 'failed' | ''>('')
const [searchName, setSearchName] = useState<string>('')
const [idNumberFilter, setIdNumberFilter] = useState<string>('')
const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
```

---

## Handler Functions

### handleApplyDateFilter

Menerapkan semua filter ke query params:

```typescript
// Baris 519-536
const handleApplyDateFilter = useCallback(() => {
  setQueryParams((prev) => ({
    ...prev,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    devices_code: deviceCode || undefined,
    institutions_code: institutionCode || undefined,
    queue_status: queueStatus || undefined,
    search: searchName ? `${prev.search} ${searchName}`.trim() : prev.search,
    page: 1,
  }))
  setIsFilterOpen(false)
}, [dateFrom, dateTo, deviceCode, institutionCode, queueStatus, searchName])
```

### handleResetFilters

Mereset semua filter ke nilai awal:

```typescript
// Baris 555-575
const handleResetFilters = useCallback(() => {
  setDateFrom('')
  setDateTo('')
  setDeviceCode('')
  setInstitutionCode('')
  setSexFilter('')
  setQueueStatus('')
  setSearchName('')
  setIdNumberFilter('')
  setQueryParams((prev) => ({
    ...prev,
    date_from: undefined,
    devices_code: undefined,
    institutions_code: undefined,
    queue_status: undefined,
    search: '',
    page: 1,
  }))
  setIsFilterOpen(false)
}, [])
```

### handleSortChange

Mengubah urutan kolom:

```typescript
// Baris 483-490
const handleSortChange = useCallback((sortBy: string, sortOrder: string) => {
  setQueryParams((prev) => ({
    ...prev,
    sort_by: sortBy,
    sort_dir: sortOrder as 'asc' | 'desc',
    page: 1,
  }))
}, [])
```

### Kolom Sorting yang Tersedia

Berdasarkan permintaan user, berikut kolom yang dapat digunakan untuk sorting:

| Kolom               | Deskripsi                 |
| ------------------- | ------------------------- |
| `id`                | ID diagnostik             |
| `username`          | Nama pasien               |
| `id_number`         | Nomor identitas           |
| `sex`               | Jenis kelamin             |
| `birth_time`        | Tanggal lahir             |
| `devices_code`      | Kode device               |
| `institutions_code` | Kode institusi            |
| `received_at`       | Waktu penerimaan          |
| `sys`               | Tekanan darah sistolik    |
| `dia`               | Tekanan darah diastolik   |
| `map`               | Mean Arterial Pressure    |
| `pr`                | Pulse Rate (Denyut nadi)  |
| `heart_r`           | Heart Rate                |
| `temp`              | Suhu tubuh                |
| `blood_o`           | Oksigen darah (SpO2)      |
| `height`            | Tinggi badan              |
| `weight`            | Berat badan               |
| `bmi`               | BMI (Body Mass Index)     |
| `res`               | Respiratory Rate          |
| `blood_s`           | Gula darah sewaktu        |
| `blood_s`           | Blood Sugar               |
| `uric_a`            | Asam urat                 |
| `cho`               | Kolesterol                |
| `created_at`        | Waktu pembuatan (default) |

---

## UI Filter Panel

### Struktur Filter Panel

Filter panel terletak di dalam komponen `DiagnostikList.tsx` dan diakses melalui tombol "Filter" dengan badge jumlah filter aktif:

```tsx
// Toggle filter button
<button onClick={() => setIsFilterOpen(!isFilterOpen)} className="...">
  <HiFunnel className="w-4 h-4" />
  Filter
  {activeFilterCount > 0 && (
    <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">
      {activeFilterCount}
    </span>
  )}
</button>
```

### Komponen Filter

| #   | Komponen       | Tipe Input  | Opsi                                       |
| --- | -------------- | ----------- | ------------------------------------------ |
| 1   | Tanggal Mulai  | Date Picker | -                                          |
| 2   | Tanggal Akhir  | Date Picker | -                                          |
| 3   | ID Alat        | Text Input  | -                                          |
| 4   | Kode Institusi | Text Input  | -                                          |
| 5   | Jenis Kelamin  | Select      | Semua, Laki-laki, Perempuan                |
| 6   | Status Queue   | Select      | Semua, Menunggu, Diproses, Berhasil, Gagal |
| 7   | Nama Pasien    | Text Input  | -                                          |
| 8   | No. Identitas  | Text Input  | -                                          |

### Badge Counter

Jumlah filter aktif dihitung dengan:

```typescript
const activeFilterCount = useMemo(() => {
  let count = 0
  if (dateFrom) count++
  if (dateTo) count++
  if (deviceCode) count++
  if (institutionCode) count++
  if (sexFilter) count++
  if (queueStatus) count++
  if (searchName) count++
  if (idNumberFilter) count++
  return count
}, [dateFrom, dateTo, deviceCode, institutionCode, sexFilter, queueStatus, searchName, idNumberFilter])
```

---

## Contoh Penggunaan

### 1. Filter Tanggal Saja

````typescript
setDateFrom('2026-01-01')
setDateTo('2026-03-10')
handleApplyDateFilter()
// API: GET /diagnostics?date_from=2026-01-01&date_to03-10
=2026-```

### 2. Filter Tanggal + ID Alat

```typescript
setDateFrom('2026-01-01')
setDateTo('2026-03-10')
setDeviceCode('YS03022500138')
handleApplyDateFilter()
// API: GET /diagnostics?date_from=2026-01-01&date_to=2026-03-10&devices_code=YS03022500138
````

### 3. Filter Status Queue

```typescript
setQueueStatus('success')
handleApplyDateFilter()
// API: GET /diagnostics?queue_status=success
```

### 4. Filter multiple dengan Reset

```typescript
// Pertama, apply beberapa filter
setDateFrom('2026-01-01')
setDeviceCode('YS03022500138')
setSexFilter('Female')
handleApplyDateFilter()

// Kemudian, reset semua filter
handleResetFilters()
```

---

## Troubleshooting

### Filter Tidak Berfungsi

1. **Cek parameter API**: Pastikan parameter yang dikirim sesuai dengan yang didukung backend
2. **Cek format tanggal**: Tanggal harus dalam format `YYYY-MM-DD`
3. **Cek tipe data**: `queue_status` harus menggunakan nilai yang valid (`pending`, `processing`, `success`, `failed`)

### Error TypeScript

Jika mengalami error TypeScript dengan `queue_status`:

```typescript
// Salah
const [queueStatus, setQueueStatus] = useState<string>('')

// Benar
const [queueStatus, setQueueStatus] = useState<'pending' | 'processing' | 'success' | 'failed' | ''>('')
```

### Filter Tidak Tampil di UI

Pastikan filter panel sudah di-render dengan benar:

```tsx
{
  isFilterOpen && <div className="filter-panel">{/* Filter form fields */}</div>
}
```

---

## Catatan Penting

> ⚠️ **Catatan:** Berdasarkan type `ListDiagnosticParams` di backend, tidak semua kolom yang Anda minta didukung secara langsung. Kolom yang didukung API saat ini adalah: `search`, `devices_code`, `institutions_code`, `queue_status`, `date_from`, `date_to`. Untuk kolom lain seperti `sex`, `id_number`, dll, mungkin perlu update di backend API agar filter berfungsi.

---

## Referensi

- [Dokumentasi API Diagnostik](./DiagnostikAPIIntegration.md)
- [Dokumentasi Modul Diagnostik](./Diagnostik.md)
- [Dokumentasi Types](./Diagnostik.md#types)
