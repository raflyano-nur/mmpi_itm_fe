# 🔌 Diagnostik API Integration — Dokumentasi Integrasi API untuk Modul Diagnostik

> Dokumentasi ini menjelaskan bagaimana data diagnostik diambil dari API, diproses, dan ditampilkan di halaman utama Diagnostik (DataTable), termasuk detail kolom, mapping data, dan struktur response API.

---

## Daftar Isi

- [Query Parameters](#query-parameters)
- [Response API Reference](#response-api-reference)
- [Data Mapping](#data-mapping)
- [Kolom DataTable](#kolom-datatable)
- [Implementasi](#implementasi)
- [Interface Reference](#interface-reference)

---

## Query Parameters

Berdasarkan file [`src/Services/Modules/diagnostics/getListDiagnostic.ts`](src/Services/Modules/diagnostics/getListDiagnostic.ts) dan [`src/Components/Diagnostik/types.ts`](src/Components/Diagnostik/types.ts):

| Parameter           | Tipe                                                 | Default      | Deskripsi                           |
| ------------------- | ---------------------------------------------------- | ------------ | ----------------------------------- |
| `search`            | `string`                                             | `''`         | Pencarian global                    |
| `devices_code`      | `string`                                             | -            | Filter kode device                  |
| `institutions_code` | `string`                                             | -            | Filter kode institusi               |
| `queue_status`      | `'pending' \| 'processing' \| 'success' \| 'failed'` | -            | Filter status queue                 |
| `date_from`         | `string`                                             | -            | Filter tanggal mulai (YYYY-MM-DD)   |
| `date_to`           | `string`                                             | -            | Filter tanggal selesai (YYYY-MM-DD) |
| `per_page`          | `number`                                             | `15`         | Jumlah data per halaman             |
| `page`              | `number`                                             | `1`          | Halaman yang diminta                |
| `sort_by`           | `string`                                             | `created_at` | Kolom untuk sorting                 |
| `sort_dir`          | `'asc' \| 'desc'`                                    | `desc`       | Arah sorting                        |

### Interface ListDiagnosticParams

```typescript
// src/Services/Modules/diagnostics/getListDiagnostic.ts
export interface ListDiagnosticParams {
  search?: string
  devices_code?: string
  institutions_code?: string
  queue_status?: 'pending' | 'processing' | 'success' | 'failed'
  date_from?: string // format: YYYY-MM-DD
  date_to?: string // format: YYYY-MM-DD
  per_page?: number
  page?: number
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
}
```

---

## Response API Reference

### GET /diagnostics Response

```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 8,
        "created_by": null,
        "created_at": "2026-03-05T08:32:34.000000Z",
        "updated_by": null,
        "updated_at": "2026-03-05T08:32:34.000000Z",
        "device_id": "YS03022500901",
        "username": "siti khadijah",
        "sex": "Female",
        "id_number": "12001",
        "establish_time": "2026-03-03 08:21:10",
        "phone": "081234567890",
        "address": "jl merpati 12, solo",
        "birth_time": "1990-05-14",
        "nation": "Indonesia",
        "shebao_id": null,
        "height": "158.2",
        "weight": "55.4",
        "bmi": "22.1",
        "left_vision": null,
        "righe_vision": null,
        "left_correct": null,
        "righe_correct": null,
        "sys": "118",
        "dia": "76",
        "map": "90",
        "pr": "72",
        "blood_unit": "mmHg",
        "heart_r": "72",
        "temp": "36.5",
        "temp_unit": "℃",
        "blood_o": "97",
        "res": "16",
        "blood_s": null,
        "uric_a": null,
        "cho": null,
        "colo_result": null,
        "result": "Normal",
        "received_at": "2026-03-05 08:32:34",
        "devices_code": "YS03022500138",
        "institutions_code": "INST-002",
        "latest_queue_log": {
          "id": 4,
          "diagnostic_id": 8,
          "status": "success",
          "attempt": 1,
          "response_code": 200,
          "response_body": "{\"message\":\"DEV MODE - data disimpan ke file JSON lokal.\",\"file\":\"diagnostic_dev\\/8.json\"}",
          "error_message": null,
          "sent_at": "2026-03-05T08:32:41.000000Z",
          "created_at": "2026-03-05T08:32:34.000000Z",
          "updated_at": "2026-03-05T08:32:41.000000Z",
          "institution_id": 7
        }
      }
    ],
    "first_page_url": "http://192.168.18.80:3001/api/diagnostics?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://192.168.18.80:3001/api/diagnostics?page=1",
    "links": [
      { "url": null, "label": "&laquo; Previous", "page": null, "active": false },
      { "url": "http://192.168.18.80:3001/api/diagnostics?page=1", "label": "1", "page": 1, "active": true },
      { "url": null, "label": "Next &raquo;", "page": null, "active": false }
    ],
    "next_page_url": null,
    "path": "http://192.168.18.80:3001/api/diagnostics",
    "per_page": 15,
    "prev_page_url": null,
    "to": 2,
    "total": 2
  }
}
```

### Interface ListDiagnosticData

```typescript
// src/Services/Modules/diagnostics/getListDiagnostic.ts
export interface ListDiagnosticData {
  current_page: number
  data: ListDiagnosticItem[]
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
}
```

### Interface ListDiagnosticItem

```typescript
// src/Services/Modules/diagnostics/getListDiagnostic.ts
export interface ListDiagnosticItem {
  id: number
  created_by: number
  created_at: string
  updated_by: number
  updated_at: string
  device_id: string
  username: string
  sex: string
  id_number: string
  establish_time: string
  phone: string
  address: string
  birth_time: string
  nation: string
  shebao_id: number
  height: string
  weight: string
  bmi: string
  left_vision: string | number
  righe_vision: string | number
  left_correct: string | number
  righe_correct: string | number
  sys: string | number
  dia: string | number
  map: string | number
  pr: string | number
  blood_unit: string
  heart_r: string | number
  temp: string
  temp_unit: string
  blood_o: string | number
  res: string | number
  blood_s: string | number
  uric_a: string | number
  cho: string | number
  colo_result: string | number
  result: string
  received_at: string
  devices_code: string
  institutions_code: string
  latest_queue_log: {
    id: number
    diagnostic_id: number
    status: string
    attempt: number
    response_code: number
    response_body: string
    error_message: null | string
    sent_at: string
    created_at: string
    updated_at: string
    institution_id: number
  }
}
```

---

## Data Mapping

### Mapper Function

Data dari API ditransformasi ke format UI menggunakan fungsi di [`src/Components/Diagnostik/diagnostikMapper.ts`](src/Components/Diagnostik/diagnostikMapper.ts):

```typescript
// src/Components/Diagnostik/diagnostikMapper.ts
import type { DiagnostikItem, DiagnostikParameter, DiagnosticApiItem } from './types'
import { DIAGNOSTIC_PARAMETERS } from './types'

/**
 * Map single API item ke UI item
 */
export const mapDiagnosticApiToItem = (apiItem: DiagnosticApiItem): DiagnostikItem => {
  // Extract parameters from API fields
  const parameters: DiagnostikParameter[] = DIAGNOSTIC_PARAMETERS.map((param) => {
    const fieldMap: Record<string, string> = {
      'Tinggi Badan': 'height',
      'Berat Badan': 'weight',
      BMI: 'bmi',
      'Tekanan Darah Sistolik (Sys)': 'sys',
      'Tekanan Darah Diastolik (Dia)': 'dia',
      'Mean Arterial Pressure (MAP)': 'map',
      'Denyut Nadi (PR)': 'pr',
      'Detak Jantung (Heart Rate)': 'heart_r',
      'Suhu Tubuh': 'temp',
      'Oksigen Darah (SpO2)': 'blood_o',
      'Respiratory Rate': 'res',
      'Gula Darah Sewaktu': 'blood_s',
      'Asam Urat': 'uric_a',
      'Kolesterol Total': 'cho',
      'Vision Kiri': 'left_vision',
      'Vision Kanan': 'righe_vision',
    }

    const field = fieldMap[param.parameter]
    const value = field ? apiItem[field as keyof DiagnosticApiItem] : null

    return {
      ...param,
      hasil: value,
      keterangan: calculateKeterangan(param.parameter, value),
    }
  })

  return {
    id: apiItem.id,
    waktu: formatDateTime(apiItem.received_at),
    idAlat: apiItem.device_id,
    devices_code: apiItem.devices_code,
    namaPasien: apiItem.username,
    sex: apiItem.sex,
    idNumber: apiItem.id_number,
    birthTime: apiItem.birth_time,
    height: apiItem.height,
    weight: apiItem.weight,
    bmi: apiItem.bmi,
    hasilSingkat: apiItem.result,
    result: apiItem.result,
    parameters,
    queueStatus: apiItem.latest_queue_log?.status,
    institutions_code: apiItem.institutions_code,
    latestQueueLog: apiItem.latest_queue_log,
  }
}

/**
 * Map array of API items
 */
export const mapDiagnosticsApiList = (apiItems: DiagnosticApiItem[]): DiagnostikItem[] => {
  return apiItems.map(mapDiagnosticApiToItem)
}
```

### Helper Functions

```typescript
// Format datetime dari API
export const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format gender label
export const getGenderLabel = (sex: string | null | undefined): string => {
  if (!sex) return '-'
  return sex === 'Female' ? 'Perempuan' : sex === 'Male' ? 'Laki-laki' : sex
}

// Calculate age dari birth_time
export const calculateAge = (birthDate: string | null | undefined): string => {
  if (!birthDate) return '-'
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return `${age} tahun`
}
```

---

## Kolom DataTable

### Kolom yang Ditampilkan

Di [`src/Components/Diagnostik/List/DiagnostikList.tsx`](src/Components/Diagnostik/List/DiagnostikList.tsx), berikut kolom-kolom yang ditampilkan di DataTable:

| #   | Kolom         | Field               | Render                                    |
| --- | ------------- | ------------------- | ----------------------------------------- |
| 1   | Waktu         | `waktu`             | Format: "05 Mar 2026, 08:32"              |
| 2   | ID Alat       | `devices_code`      | Badge primary (YS03022500138)             |
| 3   | Nama Pasien   | `namaPasien`        | Avatar inisial + nama + No. Identitas     |
| 4   | No. Identitas | `idNumber`          | teks biasa (12001)                        |
| 5   | Jenis Kelamin | `sex`               | "Perempuan" / "Laki-laki"                 |
| 6   | Umur          | `birthTime`         | "35 tahun" (dihitung dari birth_time)     |
| 7   | Hasil         | `result`            | "Normal" (hijau) / "Abnormal" (kuning)    |
| 8   | Institusi     | `institutions_code` | Badge blue (INST-002)                     |
| 9   | Aksi          | -                   | Detail, Kirim Ulang, Kirim Boyolali, Logs |

### Definisi Kolom (ColumnDef)

```typescript
// src/Components/Diagnostik/List/DiagnostikList.tsx
const columns: ColumnDef<DiagnostikItem>[] = useMemo(
  () => [
    {
      accessorKey: 'created_at',
      header: 'Waktu',
      cell: ({ row }) => <span className="text-sm text-neutral-600">{row.original.waktu}</span>,
    },
    {
      accessorKey: 'devices_code',
      header: 'ID Alat',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
          {row.original.devices_code}
        </span>
      ),
    },
    {
      accessorKey: 'username',
      header: 'Nama Pasien',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-primary-600">
              {row.original.namaPasien.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-800">{row.original.namaPasien}</p>
            <p className="text-xs text-neutral-400">{row.original.idNumber}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'idNumber',
      header: 'No. Identitas',
      cell: ({ row }) => <span className="text-sm text-neutral-600">{row.original.idNumber || '-'}</span>,
    },
    {
      accessorKey: 'sex',
      header: 'Jenis Kelamin',
      cell: ({ row }) => (
        <span className="text-sm text-neutral-600">{getGenderLabel(row.original.sex)}</span>
      ),
    },
    {
      accessorKey: 'birthTime',
      header: 'Umur',
      cell: ({ row }) => (
        <span className="text-sm text-neutral-600">{calculateAge(row.original.birthTime)}</span>
      ),
    },
    {
      accessorKey: 'result',
      header: 'Hasil',
      cell: ({ row }) => (
        <div>
          <span
            className={`text-sm font-medium ${row.original.result === 'Normal' ? 'text-emerald-600' : 'text-amber-600'}`}
          >
            {row.original.result}
          </span>
          <div className="mt-1">
            <QueueStatusBadge status={row.original.queueStatus} />
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'institutions_code',
      header: 'Institusi',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          {row.original.institutions_code || '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {/* Detail Button */}
          <button onClick={() => handleDetail(row.original)} ... />
          {/* Kirim Ulang Button */}
          <button onClick={() => handleResend(row.original)} ... />
          {/* Kirim ke Boyolali Button */}
          <button onClick={() => handleKirimBoyolali(row.original)} ... />
          {/* Logs Button */}
          <button onClick={() => handleLogs(row.original)} ... />
        </div>
      ),
    },
  ],
  [],
)
```

### Queue Status Badge

```typescript
// Konfigurasi badge status queue
export const QUEUE_STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    dot: 'bg-amber-500',
    label: 'Menunggu',
  },
  processing: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    dot: 'bg-blue-500',
    label: 'Diproses',
  },
  success: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    dot: 'bg-emerald-500',
    label: 'Berhasil',
  },
  failed: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-500',
    label: 'Gagal',
  },
}
```

---

## Implementasi

### State Management

```typescript
// src/Components/Diagnostik/List/DiagnostikList.tsx
const [queryParams, setQueryParams] = useState<ListDiagnosticParams>({
  page: 1,
  per_page: 10,
  search: '',
  sort_by: 'created_at',
  sort_dir: 'desc',
})
```

### API Hooks

```typescript
// Fetch list
const { data: listData, isLoading, isFetching, refetch } = useGetListDiagnosticQuery(queryParams)

// Fetch detail (untuk modal)
const { data: detailData } = useGetDetailDiagnosticQuery(
  { id: selectedId! },
  { skip: !selectedId || !isDetailOpen },
)

// Fetch logs (untuk modal)
const { data: logsData } = useGetQueueLogDiagnosticQuery(
  { id: selectedId! },
  { skip: !selectedId || !isLogsOpen },
)

// Mutation
const [postResend, { isLoading: isResending }] = usePostResendDiagnosticMutation()
```

### Data Transformation

```typescript
const mappedData = useMemo(() => {
  if (!listData?.data?.data) return []
  return mapDiagnosticsApiList(listData.data.data)
}, [listData])
```

### Pagination Info

```typescript
const paginationInfo = useMemo(() => {
  if (!listData?.data) return null
  const { current_page, last_page, from, to, total, per_page } = listData.data
  return { current_page, last_page, from, to, total, per_page }
}, [listData])
```

---

## Interface Reference

### DiagnostikItem (UI)

```typescript
// src/Components/Diagnostik/types.ts
export interface DiagnostikItem {
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
  institutions_code?: string
}
```

### DiagnostikParameter

```typescript
// src/Components/Diagnostik/types.ts
export interface DiagnostikParameter {
  parameter: string
  hasil: string | number | null
  satuan: string
  nilaiRujukan?: string
  keterangan: string
}
```

### DiagnosticApiItem (dari API)

```typescript
// src/Components/Diagnostik/types.ts
export interface DiagnosticApiItem {
  id: number
  created_by: number | null
  created_at: string
  updated_by: number | null
  updated_at: string
  device_id: string
  username: string
  sex: string
  id_number: string
  establish_time: string
  phone: string
  address: string
  birth_time: string
  nation: string
  shebao_id: number | null
  height: string
  weight: string
  bmi: string
  left_vision: string | number | null
  righe_vision: string | number | null
  left_correct: string | number | null
  righe_correct: string | number | null
  sys: string | number | null
  dia: string | number | null
  map: string | number | null
  pr: string | number | null
  blood_unit: string
  heart_r: string | number | null
  temp: string
  temp_unit: string
  blood_o: string | number | null
  res: string | number | null
  blood_s: string | number | null
  uric_a: string | number | null
  cho: string | number | null
  colo_result: string | number | null
  result: string
  received_at: string
  devices_code: string
  institutions_code: string
  latest_queue_log?: LatestQueueLog
  queue_logs?: QueueLogItem[]
}
```

---

## Kesimpulan

Modul Diagnostik menggunakan integrasi API dengan pola berikut:

1. **Query Parameters**: Server-side pagination, search, sort, dan filter
2. **Response Mapping**: Data dari API ditransformasi menggunakan `mapDiagnosticsApiList()` di `diagnostikMapper.ts`
3. **UI Display**: Data ditampilkan di DataTable dengan 9 kolom (Waktu, ID Alat, Nama Pasien, No. Identitas, Jenis Kelamin, Umur, Hasil, Institusi, Aksi)
4. **Detail Modal**: Data lengkap parameter pemeriksaan ditampilkan di `DiagnostikDetailModal`
5. **Queue Status**: Status queue (pending/processing/success/f badge

Denganailed) ditampilkan sebagai implementasi ini, data diagnostik ditampilkan secara akurat karena semua filtering dan pagination dilakukan di sisi server melalui API call.
