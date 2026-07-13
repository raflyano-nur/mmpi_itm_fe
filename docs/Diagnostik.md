# 🔬 Diagnostik — Dokumentasi Modul Halaman Diagnostik

> Modul untuk menampilkan daftar hasil diagnostik pasien dari alat laboratorium, lengkap dengan detail parameter pemeriksaan dan aksi (Detail, Kirim Ulang, Kirim ke Boyolali, Logs).

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [File & Struktur](#file--struktur)
- [API Endpoints](#api-endpoints)
- [Komponen: MainDiagnostik](#komponen-maindiagnostik)
- [Komponen: DiagnostikDetailModal](#komponen-diagnostikdetailmodal)
- [Komponen: DiagnostikResendModal](#komponen-diagnostikresendmodal)
- [Komponen: DiagnostikLogsModal](#komponen-diagnostiklogsmodal)
- [Types](#types)
- [Data Mapper](#data-mapper)
- [Integrasi API](#integrasi-api)
- [Kustomisasi](#kustomisasi)

---

## Arsitektur

```
┌──────────────────────────────────────────────────────────────┐
│                   DiagnostikContainer.tsx                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              DiagnostikLayout.tsx                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │           AppLayout (title, subtitle)             │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │          MainDiagnostik.tsx                  │  │  │  │
│  │  │  │                                             │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐   │  │  │  │
│  │  │  │  │  DataTable (tabel utama diagnostik)  │   │  │  │  │
│  │  │  │  │  Kolom: Waktu, ID Alat, Nama Pasien │   │  │  │  │
│  │  │  │  │         Hasil, Aksi                  │   │  │  │
│  │  │  │  └─────────────────────────────────────┘   │  │  │  │
│  │  │  │                                             │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐   │  │  │  │
│  │  │  │  │  DiagnostikDetailModal               │   │  │  │  │
│  │  │  │  │  → Info Pasien + Parameter Table     │   │  │  │  │
│  │  │  │  │  → Aksi: Close, Lihat PDF, Kirim     │   │  │  │  │
│  │  │  │  └─────────────────────────────────────┘   │  │  │  │
│  │  │  │                                             │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐   │  │  │  │
│  │  │  │  │  DiagnostikResendModal               │   │  │  │  │
│  │  │  │  │  → Konfirmasi Kirim Ulang            │   │  │  │  │
│  │  │  │  └─────────────────────────────────────┘   │  │  │  │
│  │  │  │                                             │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐   │  │  │  │
│  │  │  │  │  DiagnostikLogsModal                 │   │  │  │  │
│  │  │  │  │  → Queue Logs Table                  │   │  │  │  │
│  │  │  │  └─────────────────────────────────────┘   │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Alur Data

```
GET /diagnostics (dengan query params)
    │
    ▼
RTK Query (useGetListDiagnosticQuery)
    │
    ▼
mapDiagnosticsApiList()    ← src/Components/Diagnostik/diagnostikMapper.ts
    │
    ▼
DiagnostikItem[]          ← src/Components/Diagnostik/types.ts
    │
    ▼
DataTable                 ← src/Components/General/Datatable.tsx

Modal Detail
    │
    ▼
GET /diagnostics/:id      ← useGetDetailDiagnosticQuery
    │
    ▼
mapDiagnosticApiToItem()  ← diagnostikMapper.ts
    │
    ▼
DiagnostikDetailModal

Modal Kirim Ulang
    │
    ▼
POST /diagnostics/:id/resend  ← usePostResendDiagnosticMutation

Modal Logs
    │
    ▼
GET /diagnostics/:id/queue-logs  ← useGetQueueLogDiagnosticQuery
    │
    ▼
DiagnostikLogsModal
```

---

## File & Struktur

```
src/
├── Components/Diagnostik/
│   ├── types.ts                    # Type definitions (DiagnostikItem, DiagnostikParameter, dll)
│   ├── diagnostikMapper.ts         # Utility mapping API → UI
│   ├── DiagnostikLayout.tsx        # Layout wrapper dengan AppLayout
│   ├── MainDiagnostik.tsx          # Komponen utama: tabel + handlers + API hooks
│   ├── DiagnostikDetailModal.tsx   # Modal detail parameter pemeriksaan
│   ├── DiagnostikResendModal.tsx   # Modal konfirmasi kirim ulang
│   └── DiagnostikLogsModal.tsx     # Modal queue logs
│
├── Containers/Diagnostik/
│   └── DiagnostikContainer.tsx    # Container (Redux connection)
│
└── Services/Modules/diagnostics/
    ├── index.ts                    # RTK Query hooks export
    ├── getListDiagnostic.ts        # GET /diagnostics
    ├── getDetailDiagnostic.ts       # GET /diagnostics/:id
    ├── getQueueLogDiagnostic.ts    # GET /diagnostics/:id/queue-logs
    └── postResendDiagnostic.ts      # POST /diagnostics/:id/resend
```

---

## API Endpoints

| Endpoint                | Method | URL                           | Deskripsi                      |
| ----------------------- | ------ | ----------------------------- | ------------------------------ |
| `getListDiagnostic`     | GET    | `/diagnostics`                | Daftar diagnostik + pagination |
| `getDetailDiagnostic`   | GET    | `/diagnostics/:id`            | Detail diagnostik by ID        |
| `getQueueLogDiagnostic` | GET    | `/diagnostics/:id/queue-logs` | Queue logs diagnostik          |
| `postResendDiagnostic`  | POST   | `/diagnostics/:id/resend`     | Kirim ulang diagnostik         |

### Query Parameters (GET /diagnostics)

| Parameter           | Tipe     | Default | Deskripsi               |
| ------------------- | -------- | ------- | ----------------------- |
| `search`            | `string` | `''`    | Pencarian global        |
| `devices_code`      | `string` | -       | Filter kode device      |
| `institutions_code` | `string` | -       | Filter kode institusi   |
| `queue_status`      | `string` | -       | Filter status queue     |
| `date_from`         | `string` | -       | Filter tanggal mulai    |
| `date_to`           | `string` | -       | Filter tanggal selesai  |
| `per_page`          | `number` | `15`    | Jumlah data per halaman |
| `page`              | `number` | `1`     | Halaman yang diminta    |
| `sort_by`           | `string` | -       | Field sorting           |
| `sort_dir`          | `string` | -       | Arah sorting (asc/desc) |

### Response Format (GET /diagnostics)

```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 8,
        "device_id": "YS03022500901",
        "username": "siti khadijah",
        "sex": "Female",
        "id_number": "12001",
        "establish_time": "2026-03-03 08:21:10",
        "height": "158.2",
        "weight": "55.4",
        "bmi": "22.1",
        "sys": "118",
        "dia": "76",
        "result": "Normal",
        "received_at": "2026-03-05 08:32:34",
        "devices_code": "YS03022500138",
        "institutions_code": "INST-002",
        "latest_queue_log": {
          "id": 4,
          "status": "success",
          "attempt": 1,
          "response_code": 200
        }
      }
    ],
    "total": 2
  }
}
```

---

## Komponen: MainDiagnostik

**File:** `src/Components/Diagnostik/MainDiagnostik.tsx`

Komponen utama yang menampilkan tabel daftar hasil diagnostik pasien.

### Fitur

| Fitur             | Deskripsi                                      |
| ----------------- | ---------------------------------------------- |
| 🔍 Search         | Pencarian global (nama pasien, ID alat, hasil) |
| 📄 Pagination     | Navigasi halaman dengan pilihan per halaman    |
| 👁️ Detail         | Buka modal detail parameter pemeriksaan        |
| 🔄 Kirim Ulang    | Kirim ulang data diagnostik ke server          |
| 📤 Kirim Boyolali | Kirim data ke Boyolali (fitur placeholder)     |
| 📋 Logs           | Lihat queue logs diagnostik                    |

### Kolom Tabel

| Kolom       | Accessor       | Deskripsi                                     |
| ----------- | -------------- | --------------------------------------------- |
| Waktu       | `waktu`        | Waktu pemeriksaan                             |
| ID Alat     | `devices_code` | Badge dengan kode device                      |
| Nama Pasien | `namaPasien`   | Avatar inisial + nama lengkap + No. Identitas |
| Hasil       | `result`       | Hasil + status queue badge                    |
| Aksi        | -              | Detail, Kirim Ulang, Kirim Boyolali, Logs     |

### State Management

```tsx
// Query params (server-side pagination)
const [queryParams, setQueryParams] = useState<ListDiagnosticParams>({
  page: 1,
  per_page: 10,
  search: '',
  sort_by: 'created_at',
  sort_dir: 'desc',
})

// Modal states
const [selectedItem, setSelectedItem] = useState<DiagnostikItem | null>(null)
const [selectedId, setSelectedId] = useState<number | null>(null)
const [isDetailOpen, setIsDetailOpen] = useState(false)
const [isResendOpen, setIsResendOpen] = useState(false)
const [isLogsOpen, setIsLogsOpen] = useState(false)
```

### RTK Query Hooks

```tsx
// Fetch list
const { data: listData, isLoading, isFetching, refetch } = useGetListDiagnosticQuery(queryParams)

// Fetch detail
const { data: detailData } = useGetDetailDiagnosticQuery({ id: selectedId }, { skip: !selectedId })

// Fetch logs
const { data: logsData } = useGetQueueLogDiagnosticQuery({ id: selectedId }, { skip: !selectedId })

// Mutation
const [postResend, { isLoading: isResending }] = usePostResendDiagnosticMutation()
```

---

## Komponen: DiagnostikDetailModal

**File:** `src/Components/Diagnostik/DiagnostikDetailModal.tsx`

Modal overlay yang menampilkan detail lengkap parameter hasil pemeriksaan.

### Struktur Modal

```
┌─────────────────────────────────────────┐
│ 📄 Header (clean, minimalis)             │
│   [icon] Detail Hasil Diagnostik   [✕]  │
├─────────────────────────────────────────┤
│ 📋 Info Pasien (grid 2-4 kolom)         │
│   Nama  |  No. Identitas  |  Jenis Kel  │
│   Waktu |  ID Alat        |  Kode Device │
│   Hasil |  Kode Institusi               │
├─────────────────────────────────────────┤
│ 📊 Tabel Parameter                       │
│   Parameter | Hasil | Satuan | Rujukan  │
│   Tekanan D  118    mmHg     90-140    │
│   ...                                   │
├─────────────────────────────────────────┤
│ 🔘 Footer Aksi                           │
│     [Close] [Lihat PDF] [Kirim Boyolali]│
└─────────────────────────────────────────┘
```

### Fitur

- ✅ Info pasien lengkap (nama, No. Identitas, Jenis Kelamin, Umur)
- ✅ Info device & institution
- ✅ Tabel parameter pemeriksaan denganauto-keterangan (Normal/Tinggi/Rendah)
- ✅ Tombol Lihat PDF (buka `/diagnostics/{id}/pdf`)
- ✅ Tombol Kirim ke Boyolali (placeholder)

### Props

```tsx
interface DiagnostikDetailModalProps {
  isOpen: boolean
  item: DiagnosticApiItem | null | undefined
  onClose: () => void
  onPrint: (item: any) => void
  onKirimBoyolali: (item: any) => void
}
```

---

## Komponen: DiagnostikResendModal

**File:** `src/Components/Diagnostik/DiagnostikResendModal.tsx`

Modal konfirmasi sebelum mengirim ulang data diagnostik.

### Struktur Modal

```
┌─────────────────────────────────────────┐
│ 🔄 Header                                │
│   [icon] Kirim Ulang Diagnostik   [✕]  │
├─────────────────────────────────────────┤
│ ⚠️ Warning                               │
│   Apakah Anda yakin? Data akan dikirim  │
│   ulang ke server.                      │
├─────────────────────────────────────────┤
│ 📋 Data Info Card                        │
│   Nama Pasien : siti khadijah           │
│   ID Alat     : YS03022500138           │
│   Waktu       : 03 Mar 2026, 08:21      │
│   Hasil       : Normal                   │
│   Status Queue: Berhasil                │
├─────────────────────────────────────────┤
│ 🔘 Footer                                │
│              [Batal] [Kirim Ulang]      │
└─────────────────────────────────────────┘
```

### Props

```tsx
interface DiagnostikResendModalProps {
  isOpen: boolean
  item: DiagnostikItem | null
  isLoading?: boolean
  onClose: () => void
  onConfirm: () => void
}
```

---

## Komponen: DiagnostikLogsModal

**File:** `src/Components/Diagnostik/DiagnostikLogsModal.tsx`

Modal untuk menampilkan riwayat queue logs diagnostik.

### Struktur Modal

```
┌─────────────────────────────────────────┐
│ 📋 Header                                │
│   [icon] Queue Logs Diagnostik    [✕]  │
├─────────────────────────────────────────┤
│ 📊 Summary Info                          │
│   Nama Pasien    | ID Diagnostik        │
│   Total Attempt  | Status Terakhir      │
├─────────────────────────────────────────┤
│ 📋 Tabel Logs                            │
│   Attempt | Status | Response | Waktu   │
│   #1      | Berhasil| 200     | 08:32  │
│   #2      | Gagal   | 500     | 08:30  │
├─────────────────────────────────────────┤
│ 🔘 Footer                                │
│                            [Tutup]       │
└─────────────────────────────────────────┘
```

### Fitur

- ✅ Summary info (nama pasien, total attempt, status terakhir)
- ✅ Tabel logs dengan status badge
- ✅ Response code dengan warna berbeda (hijau=success, merah=error)
- ✅ Waktu kirim
- ✅ Error message jika ada

### Props

```tsx
interface DiagnostikLogsModalProps {
  isOpen: boolean
  item: DiagnostikItem | null
  logsData: QueueLogResponse | undefined
  isLoading?: boolean
  onClose: () => void
}
```

---

## Types

**File:** `src/Components/Diagnostik/types.ts`

### Key Types

```tsx
// API Response Item
interface DiagnosticApiItem {
  id: number
  device_id: string
  username: string
  sex: string
  id_number: string
  establish_time: string
  height: string
  weight: string
  bmi: string
  sys: string | number | null
  dia: string | number | null
  result: string
  received_at: string
  devices_code: string
  institutions_code: string
  latest_queue_log?: LatestQueueLog
}

// UI Item
interface DiagnostikItem {
  id: number
  waktu: string
  idAlat: string
  devices_code: string
  namaPasien: string
  sex: string
  idNumber: string
  birthTime: string
  height: string
  weight: string
  bmi: string
  hasilSingkat: string
  result: string
  parameters: DiagnostikParameter[]
  queueStatus?: string
  latestQueueLog?: LatestQueueLog
}

// Parameter
interface DiagnostikParameter {
  parameter: string
  hasil: string | number | null
  satuan: string
  nilaiRujukan?: string
  keterangan: string
}
```

---

## Data Mapper

**File:** `src/Components/Diagnostik/diagnostikMapper.ts`

### Functions

```tsx
// Map single API item ke UI item
mapDiagnosticApiToItem(apiItem: DiagnosticApiItem): DiagnostikItem

// Map array of API items
mapDiagnosticsApiList(apiItems: DiagnosticApiItem[]): DiagnostikItem[]

// Format date
formatDateTime(dateStr: string | null | undefined): string
formatDateShort(dateStr: string | null | undefined): string

// Format gender
getGenderLabel(sex: string | null | undefined): string

// Calculate age
calculateAge(birthDate: string | null | undefined): string

// Format response body (JSON string)
formatResponseBody(responseBody: string): string
```

### Auto-Keterangan Logic

Parameter automaticamente diberikan keterangan berdasarkan nilai:

| Parameter       | Normal    | Rendah | Tinggi |
| --------------- | --------- | ------ | ------ |
| BMI             | 18.5-25   | < 18.5 | > 25   |
| Sys (Sistolik)  | 90-140    | < 90   | > 140  |
| Dia (Diastolik) | 60-90     | < 60   | > 90   |
| PR/Nadi         | 60-100    | < 60   | > 100  |
| Suhu            | 36.1-37.2 | < 36.1 | > 37.2 |
| SpO2            | 95-100    | < 95   | -      |
| Respiratory     | 12-20     | < 12   | > 20   |

---

## Integrasi API

### Langkah 1: Import hooks

```tsx
import {
  useGetListDiagnosticQuery,
  useGetDetailDiagnosticQuery,
  useGetQueueLogDiagnosticQuery,
  usePostResendDiagnosticMutation,
} from '@/Services/Modules/diagnostics'
```

### Langkah 2: Gunakan di component

```tsx
const MainDiagnostik = () => {
  const [queryParams, setQueryParams] = useState({ page: 1, per_page: 10 })

  const { data, isLoading } = useGetListDiagnosticQuery(queryParams)

  const [postResend] = usePostResendDiagnosticMutation()

  const handleResend = async (id: number) => {
    try {
      await postResend({ id }).unwrap()
      // Success
    } catch (error) {
      // Error handling
    }
  }

  // ... render
}
```

---

## Kustomisasi

### Menambah Parameter Baru

Edit `diagnostikMapper.ts` → `mapDiagnosticApiToItem()`:

```tsx
// Tambah parameter baru
if (apiItem.new_field) {
  parameters.push({
    parameter: 'Nama Parameter Baru',
    hasil: apiItem.new_field,
    satuan: 'satuan',
    nilaiRujukan: 'rentang normal',
    keterangan: getKeterangan(apiItem.new_field),
  })
}
```

### Ubah Queue Status Colors

Edit `types.ts` → `QUEUE_STATUS_CONFIG`:

```tsx
export const QUEUE_STATUS_CONFIG: Record<string, ...> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', label: 'Menunggu' },
  // ... custom colors
}
```

### Custom PDF URL

Di `DiagnostikDetailModal.tsx`, ubah URL PDF:

```tsx
<button onClick={() => window.open(`/custom/path/${item.id}/pdf`, '_blank')}>Lihat PDF</button>
```

---

## Troubleshooting

### Error: "Cannot find module"

Pastikan semua file sudah di-import dengan benar:

```tsx
// MainDiagnostik.tsx
import DiagnostikDetailModal from './DiagnostikDetailModal'
import DiagnostikResendModal from './DiagnostikResendModal'
import DiagnostikLogsModal from './DiagnostikLogsModal'
```

### Error: Type mismatch

Pastikan data dari API sudah di-map dengan `mapDiagnosticsApiList()` sebelum passed ke DataTable.

### Logs modal empty

Pastikan `selectedId` tidak null sebelum memanggil `useGetQueueLogDiagnosticQuery`.
