# 📊 MainDashboard — Dokumentasi Komponen Dashboard Utama

> Komponen dashboard utama yang menampilkan statistik pemeriksaan diagnostik harian dengan filter tanggal dan tipe chart.

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [File & Struktur](#file--struktur)
- [API Endpoint](#api-endpoint)
- [Integrasi API](#integrasi-api)
- [Filter Tanggal](#filter-tanggal)
- [Response Format](#response-format)
- [Komponen: MainDashboard](#komponen-maindashboard)
- [Penggunaan Ulang (Reusable)](#penggunaan-ulang-reusable)
- [Kustomisasi](#kustomisasi)
- [Referensi API Props](#referensi-api-props)

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                      MainDashboard.tsx                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              useChartDateFilter()                     │  │
│  │  → activePreset, dateRange, chartType, queryParams   │  │
│  └───────────────────────┬─────────────────────────────┘  │
│                           │                                  │
│  ┌───────────────────────▼─────────────────────────────┐  │
│  │         useGetTotalPemeriksaanQuery(queryParams)       │  │
│  │  → API call dengan start_date & end_date             │  │
│  └───────────────────────┬─────────────────────────────┘  │
│                           │                                  │
│  ┌───────────────────────▼─────────────────────────────┐  │
│  │              mapChartData()                           │  │
│  │  → Mapping API response → ChartDataPoint[]           │  │
│  └───────────────────────┬─────────────────────────────┘  │
│                           │                                  │
│  ┌───────────────────────▼─────────────────────────────┐  │
│  │                   ChartCard (UI)                     │  │
│  │  ┌─────────────┐  ┌──────────┐  ┌─────────────┐   │  │
│  │  │ Date Filter │  │ Chart    │  │ Stats       │   │  │
│  │  │ Presets     │  │ (Bar/Line)│  │ (Total)    │   │  │
│  │  └─────────────┘  │ Toggle   │  └─────────────┘   │  │
│  │                    └──────────┘                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Alur Data

```
API Request (queryParams: { start_date, end_date })
    │
    ▼
GET /diagnostics/pemeriksaan?start_date=...&end_date=...
    │
    ▼
RTK Query (useGetTotalPemeriksaanQuery)
    │
    ▼
Response: { result: [...], total_data_pemeriksaan: number, filter: {...} }
    │
    ▼
mapChartData(apiResponse.data, pemeriksaanHarianMapping, 'result')
    │
    ▼
ChartDataPoint[] → ChartCard
```

---

## File & Struktur

| File                                                      | Deskripsi                                    |
| --------------------------------------------------------- | -------------------------------------------- |
| `src/Components/Dashboard/MainDashboard.tsx`              | Komponen utama dashboard (hasil integrasi)   |
| `src/Services/Modules/diagnostics/getTotalPemeriksaan.ts` | API endpoint definition (RTK Query)          |
| `src/Services/Modules/diagnostics/index.ts`               | Export hooks (`useGetTotalPemeriksaanQuery`) |
| `src/Hooks/useChartDateFilter.ts`                         | Hook untuk filter tanggal & tipe chart       |
| `src/Utils/chartMapper.ts`                                | Utility mapping API → ChartDataPoint[]       |
| `src/Components/General/ChartCard.tsx`                    | Komponen chart reusable                      |
| `src/Config/chartConfig.ts`                               | Konfigurasi preset tanggal & warna           |

---

## API Endpoint

### GET /diagnostics/pemeriksaan

Mengambil statistik jumlah pemeriksaan diagnostik berdasarkan range tanggal.

**Query Parameters:**

| Parameter    | Tipe     | Required | Format       | Deskripsi              |
| ------------ | -------- | -------- | ------------ | ---------------------- |
| `start_date` | `string` | ✅       | `YYYY-MM-DD` | Tanggal mulai filter   |
| `end_date`   | `string` | ✅       | `YYYY-MM-DD` | Tanggal selesai filter |

**Response Format:**

```json
{
  "status": "success",
  "data": {
    "result": [
      {
        "tanggal": "2026-03-05",
        "jumlah": 2
      },
      {
        "tanggal": "2026-03-06",
        "jumlah": 5
      }
    ],
    "total_data_pemeriksaan": 7,
    "filter": {
      "start_date": "2026-03-05",
      "end_date": "2026-03-06"
    }
  },
  "message": "Data retrieved successfully"
}
```

**Interface Types:**

```typescript
// Response type dari API
interface ResponseDefault {
  status: string
  data: StatisticDashboard
  message: string
}

interface StatisticDashboard {
  result: [
    {
      tanggal: string // Format: YYYY-MM-DD
      jumlah: number
    },
  ]
  total_data_periksaan: number
  filter: {
    start_date: string // Format: YYYY-MM-DD
    end_date: string // Format: YYYY-MM-DD
  }
}
```

---

## Integrasi API

### Langkah 1: Import Hooks dan Utilities

```typescript
import { useGetTotalPemeriksaanQuery } from '@/Services/Modules/diagnostics'
import { mapChartData, pemeriksaanHarianMapping, type ChartDataPoint } from '@/Utils/chartMapper'
import { useChartDateFilter } from '@/Hooks/useChartDateFilter'
```

### Langkah 2: Setup Filter Tanggal

```typescript
const {
  activePreset,
  dateRange,
  chartType,
  isCustomOpen,
  setPreset,
  setCustomRange,
  setChartType,
  setIsCustomOpen,
  queryParams,
} = useChartDateFilter('7days', 'bar')
```

### Langkah 3: Fetch Data dari API

```typescript
// Type assertion karena queryParams berupa Record<string, string>
const {
  data: apiResponse,
  isLoading,
  isFetching,
} = useGetTotalPemeriksaanQuery(queryParams as { start_date: string; end_date: string })
```

### Langkah 4: Map Data ke Format Chart

```typescript
const chartData = useMemo<ChartDataPoint[]>(() => {
  if (!apiResponse?.data) return []
  return mapChartData(apiResponse.data, pemeriksaanHarianMapping, 'result')
}, [apiResponse])

// Total dari response API
const totalPemeriksaan = apiResponse?.data?.total_data_pemeriksaan ?? 0
```

### Langkah 5: Render ChartCard

```tsx
<ChartCard
  title="Jumlah Pemeriksaan"
  subtitle={`Total: ${totalPemeriksaan} pemeriksaan`}
  data={chartData}
  chartType={chartType}
  activePreset={activePreset}
  isCustomOpen={isCustomOpen}
  customStartDate={dateRange.startDate}
  customEndDate={dateRange.endDate}
  isLoading={isLoading || isFetching}
  onPresetChange={setPreset}
  onChartTypeChange={setChartType}
  onCustomRangeChange={setCustomRange}
  onCustomOpenChange={setIsCustomOpen}
  icon={<Icon />}
/>
```

---

## Filter Tanggal

### Cara Kerja

Filter tanggal dikelola oleh hook [`useChartDateFilter`](./ChartCard.md#hook-usechartdatefilter) yang menyediakan:

| Property       | Tipe                                       | Deskripsi                  |
| -------------- | ------------------------------------------ | -------------------------- |
| `activePreset` | `string`                                   | Preset filter aktif        |
| `dateRange`    | `{ startDate: string, endDate: string }`   | Range tanggal (YYYY-MM-DD) |
| `queryParams`  | `{ start_date: string, end_date: string }` | Params siap kirim ke API   |

### Preset yang Tersedia

| Key      | Label    | Deskripsi                    |
| -------- | -------- | ---------------------------- |
| `today`  | Hari Ini | Tanggal hari ini             |
| `3days`  | 3 Hari   | 3 hari ke belakang           |
| `7days`  | 7 Hari   | 7 hari ke belakang (default) |
| `30days` | 30 Hari  | 30 hari ke belakang          |
| `custom` | Custom   | Pilih tanggal manual         |

### Respon Perubahan Filter

Ketika user mengubah preset atau custom date range:

1. `queryParams` diperbarui secara otomatis
2. `useGetTotalPemeriksaanQuery` melakukan refetch dengan params baru
3. Chart di-update dengan data baru
4. Total pemeriksaan diperbarui

---

## Response Format

### API Response Structure

```typescript
// Response dari API
{
  status: 'success',
  data: {
    result: [
      { tanggal: '2026-03-01', jumlah: 5 },
      { tanggal: '2026-03-02', jumlah: 12 },
      // ...
    ],
    total_data_pemeriksaan: 150,
    filter: {
      start_date: '2026-03-01',
      end_date: '2026-03-07'
    }
  },
  message: 'Data retrieved successfully'
}
```

### Chart Data Point Structure

```typescript
// Setelah di-map menggunakan mapChartData
interface ChartDataPoint {
  label: string // Format: '01 Mar'
  value: number // Jumlah pemeriksaan
  _original: { tanggal: string; jumlah: number } // Data asli
}

// Contoh hasil mapping:
;[
  { label: '01 Mar', value: 5, _original: { tanggal: '2026-03-01', jumlah: 5 } },
  { label: '02 Mar', value: 12, _original: { tanggal: '2026-03-02', jumlah: 12 } },
]
```

---

## Komponen: MainDashboard

**File:** `src/Components/Dashboard/MainDashboard.tsx`

### Fitur

| Fitur               | Deskripsi                                                  |
| ------------------- | ---------------------------------------------------------- |
| 📊 Chart Statistics | Menampilkan grafik jumlah pemeriksaan diagnostik harian    |
| 📅 Filter Tanggal   | Filter preset (Hari Ini, 3 Hari, 7 Hari, 30 Hari) + custom |
| 📈 Tipe Chart       | Toggle antara Bar chart dan Line chart                     |
| 🔄 Auto-fetch       | Data otomatis diambil ulang saat filter berubah            |
| ⏳ Loading State    | Skeleton loading saat data sedang dimuat                   |
| 📋 Total Count      | Menampilkan total pemeriksaan dari response API            |

### State Management

```typescript
// Filter & API State
const { queryParams } = useChartDateFilter('7days', 'bar')
const { data: apiResponse, isLoading, isFetching } = useGetTotalPemeriksaanQuery(...)

// Derived State
const chartData = mapChartData(apiResponse, pemeriksaanHarianMapping, 'result')
const totalPemeriksaan = apiResponse?.data?.total_data_pemeriksaan ?? 0
const isChartLoading = isLoading || isFetching
```

### Props

Komponen ini tidak menerima props eksternal karena bersifat self-contained. Semua state dikelola secara internal menggunakan hooks.

---

## Penggunaan Ulang (Reusable)

Kode ini dirancang agar dapat digunakan kembali (reusable) dengan prinsip berikut:

### 1. Hook Terpisah

[`useChartDateFilter`](./ChartCard.md#hook-usechartdatefilter) dapat dipakai di komponen chart manapun:

```typescript
const { activePreset, dateRange, chartType, queryParams, ... } = useChartDateFilter()
```

### 2. Preset Mapping

[`pemeriksaanHarianMapping`](./ChartCard.md#pemeriksaanharianmapping) adalah preset siap pakai:

```typescript
// Tidak perlu define mapping manual
const chartData = mapChartData(apiResponse, pemeriksaanHarianMapping, 'result')
```

### 3. Komponen ChartCard

[`ChartCard`](./ChartCard.md#komponen-chartcard) adalah komponen reusable yang dapat menerima berbagai tipe data chart.

---

## Kustomisasi

### Mengubah Preset Default

```typescript
// Default: 7 hari, bar chart
const filter = useChartDateFilter()

// Custom: 30 hari, line chart
const filter = useChartDateFilter('30days', 'line')
```

### Mengubah Judul dan Subtitle

```tsx
<ChartCard
  title="Jumlah Pemeriksaan"
  subtitle={`Total: ${totalPemeriksaan} pemeriksaan`}
  // ...props lain
/>
```

### Mengubah Warna Chart

```tsx
<ChartCard
  color="#10b981" // Emerald green
  // ...props lain
/>
```

### Menambah Chart Lain

Untuk menambah chart baru di dashboard:

1. Copy paste komponen `MainDashboard`
2. Ubah title dan API endpoint
3. Sesuaikan mapping jika response format berbeda

---

## Referensi API Props

### useGetTotalPemeriksaanQuery

```typescript
// Hook yang di-export dari Services
import { useGetTotalPemeriksaanQuery } from '@/Services/Modules/diagnostics'

// Parameter
const queryParams = { start_date: '2026-03-01', end_date: '2026-03-07' }
const { data, isLoading, isFetching, refetch } = useGetTotalPemeriksaanQuery(queryParams)

// Return values:
{
  data: ResponseDefault | undefined          // Response dari API
  error: FetchBaseQueryError | undefined    // Error jika gagal
  isLoading: boolean                         // Initial load
  isFetching: boolean                        // Background fetch
  refetch: () => void                        // Manual refetch
}
```

### mapChartData

```typescript
import { mapChartData, pemeriksaanHarianMapping } from '@/Utils/chartMapper'

// Parameters:
mapChartData(
  apiData: any,                                    // Response dari API
  mapping: ChartFieldMapping,                     // Konfigurasi mapping
  extractPath: string = 'result'                  // Path untuk extract nested response
)

// Menggunakan preset:
const chartData = mapChartData(apiResponse, pemeriksaanHarianMapping, 'result')
```

### useChartDateFilter

```typescript
import { useChartDateFilter } from '@/Hooks/useChartDateFilter'

// Parameters:
const filter = useChartDateFilter(
  defaultPreset: string = '7days',    // Preset awal
  defaultChartType: ChartType = 'bar' // Tipe chart awal
)

// Return values:
{
  activePreset: string
  dateRange: { startDate: string, endDate: string }
  chartType: 'bar' | 'line'
  isCustomOpen: boolean
  daysCount: number
  setPreset: (key: string) => void
  setCustomRange: (start: string, end: string) => void
  setChartType: (type: ChartType) => void
  setIsCustomOpen: (open: boolean) => void
  queryParams: { start_date: string, end_date: string }
}
```

---

## Contoh Lengkap

```tsx
import React, { useMemo } from 'react'
import ChartCard from '@/Components/General/ChartCard'
import { useChartDateFilter } from '@/Hooks/useChartDateFilter'
import { mapChartData, pemeriksaanHarianMapping, type ChartDataPoint } from '@/Utils/chartMapper'
import { useGetTotalPemeriksaanQuery } from '@/Services/Modules/diagnostics'

const MainDashboard: React.FC = () => {
  // Setup filter tanggal
  const {
    activePreset,
    dateRange,
    chartType,
    isCustomOpen,
    setPreset,
    setCustomRange,
    setChartType,
    setIsCustomOpen,
    queryParams,
  } = useChartDateFilter('7days', 'bar')

  // Fetch data dari API
  const {
    data: apiResponse,
    isLoading,
    isFetching,
  } = useGetTotalPemeriksaanQuery(queryParams as { start_date: string; end_date: string })

  // Map data ke format chart
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!apiResponse?.data) return []
    return mapChartData(apiResponse.data, pemeriksaanHarianMapping, 'result')
  }, [apiResponse])

  // Total dari response
  const totalPemeriksaan = apiResponse?.data?.total_data_pemeriksaan ?? 0

  // Loading state
  const isChartLoading = isLoading || isFetching

  return (
    <div className="m-5">
      <ChartCard
        title="Jumlah Pemeriksaan"
        subtitle={`Total: ${totalPemeriksaan} pemeriksaan`}
        data={chartData}
        chartType={chartType}
        activePreset={activePreset}
        isCustomOpen={isCustomOpen}
        customStartDate={dateRange.startDate}
        customEndDate={dateRange.endDate}
        isLoading={isChartLoading}
        onPresetChange={setPreset}
        onChartTypeChange={setChartType}
        onCustomRangeChange={setCustomRange}
        onCustomOpenChange={setIsCustomOpen}
        icon={<ChartIcon />}
      />
    </div>
  )
}

export default MainDashboard
```

---

## Catatan

- **Auto-refetch**: Data akan otomatis diambil ulang ketika user mengubah filter tanggal
- **Error handling**: Untuk menambahkan error handling, gunakan `error` dari return value `useGetTotalPemeriksaanQuery`
- **Cache**: RTK Query secara otomatis caching hasil request, subsequent fetch akan lebih cepat
- **TypeScript**: Type assertion pada `queryParams` diperlukan karena `useChartDateFilter` mengembalikan `Record<string, string>`
