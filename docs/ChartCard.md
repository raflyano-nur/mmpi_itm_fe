# 📊 ChartCard — Dokumentasi Komponen Grafik

> Komponen grafik reusable untuk menampilkan data statistik dengan filter tanggal dan toggle tipe chart.

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [File & Struktur](#file--struktur)
- [Instalasi](#instalasi)
- [Quick Start](#quick-start)
- [Komponen: ChartCard](#komponen-chartcard)
- [Hook: useChartDateFilter](#hook-usechartdatefilter)
- [Utility: chartMapper](#utility-chartmapper)
- [Config: chartConfig](#config-chartconfig)
- [Integrasi API](#integrasi-api)
- [Kustomisasi](#kustomisasi)
- [Referensi API Props](#referensi-api-props)

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                    MainDashboard.tsx                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │              useChartDateFilter()                  │  │
│  │  → activePreset, dateRange, chartType, queryParams │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │                                │
│  ┌──────────────────────▼────────────────────────────┐  │
│  │              ChartCard (UI)                        │  │
│  │  ┌─────────────┐  ┌──────────┐  ┌─────────────┐  │  │
│  │  │ Date Filter  │  │ Chart    │  │ Stats       │  │  │
│  │  │ Presets      │  │ Type     │  │ (Total/Avg) │  │  │
│  │  └─────────────┘  │ Toggle   │  └─────────────┘  │  │
│  │                    └──────────┘                    │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │         Recharts (Bar / Line / Area)         │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  Data Flow:                                              │
│  API Response → chartMapper → ChartDataPoint[] → Chart   │
└─────────────────────────────────────────────────────────┘
```

---

## File & Struktur

| File                                         | Deskripsi                                 |
| -------------------------------------------- | ----------------------------------------- |
| `src/Components/General/ChartCard.tsx`       | Komponen UI utama (reusable)              |
| `src/Hooks/useChartDateFilter.ts`            | Hook state management filter & chart type |
| `src/Utils/chartMapper.ts`                   | Utility mapping data API → format chart   |
| `src/Config/chartConfig.ts`                  | Konfigurasi preset, warna, dan default    |
| `src/Components/Dashboard/MainDashboard.tsx` | Contoh implementasi                       |

---

## Instalasi

Library yang dibutuhkan (sudah terinstall):

```bash
yarn add recharts
```

---

## Quick Start

Contoh paling sederhana untuk menampilkan grafik:

```tsx
import React, { useMemo } from 'react'
import ChartCard from '@/Components/General/ChartCard'
import { useChartDateFilter } from '@/Hooks/useChartDateFilter'
import { generateDummyChartData } from '@/Utils/chartMapper'

const MyPage = () => {
  const {
    activePreset,
    dateRange,
    chartType,
    isCustomOpen,
    daysCount,
    setPreset,
    setCustomRange,
    setChartType,
    setIsCustomOpen,
  } = useChartDateFilter()

  const data = useMemo(() => generateDummyChartData(daysCount), [daysCount])

  return (
    <ChartCard
      title="Jumlah Pemeriksaan"
      data={data}
      chartType={chartType}
      activePreset={activePreset}
      isCustomOpen={isCustomOpen}
      customStartDate={dateRange.startDate}
      customEndDate={dateRange.endDate}
      onPresetChange={setPreset}
      onChartTypeChange={setChartType}
      onCustomRangeChange={setCustomRange}
      onCustomOpenChange={setIsCustomOpen}
    />
  )
}
```

---

## Komponen: ChartCard

### Fitur

- ✅ **Filter tanggal preset**: Hari Ini, 3 Hari, 7 Hari, 30 Hari
- ✅ **Custom date range**: Pilih tanggal mulai & selesai
- ✅ **Toggle tipe chart**: Bar (batang) dan Line (garis dengan area fill)
- ✅ **Stats ringkas**: Total dan Rata-rata otomatis dihitung
- ✅ **Loading skeleton**: Animasi loading saat data sedang dimuat
- ✅ **Empty state**: Pesan ketika tidak ada data
- ✅ **Custom tooltip**: Tooltip dengan warna sesuai theme
- ✅ **Responsive**: Menyesuaikan lebar container
- ✅ **Animasi**: Smooth transition antar tipe chart

### Props

| Prop                  | Tipe                                   | Default                        | Wajib | Deskripsi                     |
| --------------------- | -------------------------------------- | ------------------------------ | ----- | ----------------------------- |
| `title`               | `string`                               | -                              | ✅    | Judul chart                   |
| `subtitle`            | `string`                               | -                              | ❌    | Subtitle / deskripsi          |
| `data`                | `ChartDataPoint[]`                     | -                              | ✅    | Data chart                    |
| `chartType`           | `'bar' \| 'line'`                      | -                              | ✅    | Tipe chart aktif              |
| `activePreset`        | `string`                               | -                              | ✅    | Preset filter aktif           |
| `isCustomOpen`        | `boolean`                              | `false`                        | ❌    | Custom picker terbuka?        |
| `customStartDate`     | `string`                               | `''`                           | ❌    | Tanggal mulai custom          |
| `customEndDate`       | `string`                               | `''`                           | ❌    | Tanggal selesai custom        |
| `isLoading`           | `boolean`                              | `false`                        | ❌    | Loading state                 |
| `height`              | `number`                               | `350`                          | ❌    | Tinggi chart (px)             |
| `color`               | `string`                               | `'#0196fe'`                    | ❌    | Warna utama chart             |
| `emptyMessage`        | `string`                               | `'Tidak ada data pemeriksaan'` | ❌    | Pesan data kosong             |
| `icon`                | `ReactNode`                            | -                              | ❌    | Icon di header                |
| `onPresetChange`      | `(key: string) => void`                | -                              | ✅    | Callback ganti preset         |
| `onChartTypeChange`   | `(type: ChartType) => void`            | -                              | ✅    | Callback ganti tipe chart     |
| `onCustomRangeChange` | `(start: string, end: string) => void` | -                              | ❌    | Callback custom range         |
| `onCustomOpenChange`  | `(open: boolean) => void`              | -                              | ❌    | Callback toggle custom picker |

### Contoh dengan Semua Props

```tsx
<ChartCard
  title="Jumlah Pemeriksaan"
  subtitle="Statistik pemeriksaan diagnostik harian"
  data={chartData}
  chartType={chartType}
  activePreset={activePreset}
  isCustomOpen={isCustomOpen}
  customStartDate={dateRange.startDate}
  customEndDate={dateRange.endDate}
  isLoading={false}
  height={400}
  color="#fe7f01"
  emptyMessage="Belum ada data pemeriksaan"
  icon={<MyIcon />}
  onPresetChange={setPreset}
  onChartTypeChange={setChartType}
  onCustomRangeChange={setCustomRange}
  onCustomOpenChange={setIsCustomOpen}
/>
```

---

## Hook: useChartDateFilter

Hook untuk mengelola state filter tanggal dan tipe chart. Dipisah dari komponen agar bisa dipakai ulang.

### Parameter

| Parameter          | Tipe        | Default   | Deskripsi       |
| ------------------ | ----------- | --------- | --------------- |
| `defaultPreset`    | `string`    | `'7days'` | Preset awal     |
| `defaultChartType` | `ChartType` | `'bar'`   | Tipe chart awal |

### Return Value

| Property          | Tipe                                       | Deskripsi                  |
| ----------------- | ------------------------------------------ | -------------------------- |
| `activePreset`    | `string`                                   | Preset filter aktif        |
| `dateRange`       | `{ startDate: string, endDate: string }`   | Range tanggal (YYYY-MM-DD) |
| `chartType`       | `'bar' \| 'line'`                          | Tipe chart aktif           |
| `isCustomOpen`    | `boolean`                                  | Custom picker terbuka?     |
| `daysCount`       | `number`                                   | Jumlah hari dalam range    |
| `setPreset`       | `(key: string) => void`                    | Ganti preset               |
| `setCustomRange`  | `(start: string, end: string) => void`     | Set custom range           |
| `setChartType`    | `(type: ChartType) => void`                | Ganti tipe chart           |
| `setIsCustomOpen` | `(open: boolean) => void`                  | Toggle custom picker       |
| `queryParams`     | `{ start_date: string, end_date: string }` | Params siap kirim ke API   |

### Contoh Penggunaan

```tsx
// Default: 7 hari, bar chart
const filter = useChartDateFilter()

// Custom: 30 hari, line chart
const filter = useChartDateFilter('30days', 'line')

// Kirim ke API
const { data } = useGetPemeriksaanQuery(filter.queryParams)
```

---

## Utility: chartMapper

Utility untuk mapping data API ke format yang dibutuhkan chart.

### Interface ChartDataPoint

```ts
interface ChartDataPoint {
  label: string // Label sumbu X
  value: number // Nilai sumbu Y
  [key: string]: any // Field tambahan
}
```

### mapChartData()

Map response API ke `ChartDataPoint[]`.

```ts
mapChartData(apiData: any, mapping: ChartFieldMapping, extractPath?: string): ChartDataPoint[]
```

**Parameter:**

| Parameter     | Tipe                | Default  | Deskripsi                          |
| ------------- | ------------------- | -------- | ---------------------------------- |
| `apiData`     | `any`               | -        | Response API (object atau array)   |
| `mapping`     | `ChartFieldMapping` | -        | Konfigurasi mapping field          |
| `extractPath` | `string`            | `'data'` | Path untuk extract nested response |

**ChartFieldMapping:**

```ts
interface ChartFieldMapping {
  labelField: string // Field API → label
  valueField: string // Field API → value
  labelFormatter?: (raw: any) => string // Format label (opsional)
  valueFormatter?: (raw: any) => number // Format value (opsional)
}
```

**Contoh:**

```ts
// Response: { data: [{ tanggal: '2026-02-27', jumlah: 15 }] }
const chartData = mapChartData(response, {
  labelField: 'tanggal',
  valueField: 'jumlah',
  labelFormatter: (val) => dayjs(val).format('DD MMM'),
})

// Response nested: { result: { items: [...] } }
const chartData = mapChartData(response, mapping, 'result.items')
```

### pemeriksaanHarianMapping

Preset mapping siap pakai untuk data pemeriksaan harian:

```ts
// Langsung pakai tanpa define mapping manual
import { mapChartData, pemeriksaanHarianMapping } from '@/Utils/chartMapper'

const chartData = mapChartData(apiResponse, pemeriksaanHarianMapping)
```

Mapping ini mengasumsikan response API memiliki field:

- `tanggal` → label (diformat ke `DD MMM`)
- `jumlah` → value

### generateDummyChartData()

Generate data dummy untuk development:

```ts
// 7 hari, max value 50
const dummy = generateDummyChartData(7)

// 30 hari, max value 100
const dummy = generateDummyChartData(30, 100)
```

---

## Config: chartConfig

Konfigurasi deklaratif yang mudah di-maintain.

### dateFilterPresets

```ts
const dateFilterPresets = [
  { key: 'today', label: 'Hari Ini', days: 0 },
  { key: '3days', label: '3 Hari', days: 3 },
  { key: '7days', label: '7 Hari', days: 7 },
  { key: '30days', label: '30 Hari', days: 30 },
  { key: 'custom', label: 'Custom', days: -1 },
]
```

**Menambah preset baru:**

```ts
// Tambahkan di chartConfig.ts
{ key: '90days', label: '90 Hari', days: 90 },
```

### chartTypeOptions

```ts
const chartTypeOptions = [
  { key: 'bar', label: 'Batang', icon: '📊' },
  { key: 'line', label: 'Garis', icon: '📈' },
]
```

### chartColors

Palet warna yang konsisten dengan theme `index.css`:

```ts
const chartColors = {
  primary: '#0196fe', // Bar/line utama
  primaryLight: '#80c5fd', // Skeleton loading
  barGradientStart: '#0196fe',
  barGradientEnd: '#4dadfc',
  lineStroke: '#0196fe',
  grid: '#d9ddef',
  axisText: '#6b7092',
  tooltipBg: '#222536',
  tooltipText: '#f7f8fc',
  // ... dan lainnya
}
```

### chartDefaults

```ts
const chartDefaults = {
  height: 350,
  barRadius: [6, 6, 0, 0],
  barSize: 32,
  lineStrokeWidth: 2.5,
  dotRadius: 4,
  activeDotRadius: 6,
  animationDuration: 800,
  gridStrokeDasharray: '3 3',
}
```

---

## Integrasi API

### Langkah-langkah

#### 1. Buat API Service

```ts
// src/Services/Modules/pemeriksaan/getPemeriksaanStats.ts
import api from '@/Services/api'

export const getPemeriksaanStats = async (params: { start_date: string; end_date: string }) => {
  const response = await api.get('/pemeriksaan/stats', { params })
  return response.data
}
```

#### 2. Gunakan di MainDashboard

```tsx
import { mapChartData, pemeriksaanHarianMapping } from '@/Utils/chartMapper'
import { useChartDateFilter } from '@/Hooks/useChartDateFilter'
import { getPemeriksaanStats } from '@/Services/Modules/pemeriksaan/getPemeriksaanStats'

const MainDashboard = () => {
  const {
    activePreset,
    dateRange,
    chartType,
    isCustomOpen,
    daysCount,
    setPreset,
    setCustomRange,
    setChartType,
    setIsCustomOpen,
    queryParams,
  } = useChartDateFilter()

  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await getPemeriksaanStats(queryParams)
        const mapped = mapChartData(response, pemeriksaanHarianMapping)
        setChartData(mapped)
      } catch (error) {
        console.error('Gagal memuat data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [queryParams])

  return (
    <ChartCard
      title="Jumlah Pemeriksaan"
      data={chartData}
      isLoading={isLoading}
      chartType={chartType}
      activePreset={activePreset}
      isCustomOpen={isCustomOpen}
      customStartDate={dateRange.startDate}
      customEndDate={dateRange.endDate}
      onPresetChange={setPreset}
      onChartTypeChange={setChartType}
      onCustomRangeChange={setCustomRange}
      onCustomOpenChange={setIsCustomOpen}
    />
  )
}
```

#### 3. Jika Format API Berbeda

```ts
// Response: { result: { statistics: [{ date: '2026-02-27', count: 15 }] } }
const chartData = mapChartData(
  response,
  {
    labelField: 'date',
    valueField: 'count',
    labelFormatter: (val) => dayjs(val).format('DD MMM'),
  },
  'result.statistics',
)
```

---

## Kustomisasi

### Mengubah Warna Chart

```tsx
// Warna secondary (oranye)
<ChartCard color="#fe7f01" ... />

// Warna success (hijau)
<ChartCard color="#10b981" ... />

// Warna accent (cyan)
<ChartCard color="#00d4ff" ... />
```

### Mengubah Tinggi Chart

```tsx
<ChartCard height={500} ... />
```

### Menambah Preset Filter Baru

Edit `src/Config/chartConfig.ts`:

```ts
export const dateFilterPresets: DateFilterPreset[] = [
  { key: 'today', label: 'Hari Ini', days: 0 },
  { key: '3days', label: '3 Hari', days: 3 },
  { key: '7days', label: '7 Hari', days: 7 },
  { key: '30days', label: '30 Hari', days: 30 },
  { key: '90days', label: '90 Hari', days: 90 }, // ← Tambah ini
  { key: 'custom', label: 'Custom', days: -1 },
]
```

### Multiple Chart di Satu Halaman

```tsx
const MainDashboard = () => {
  // Setiap chart punya state filter sendiri
  const pemeriksaanFilter = useChartDateFilter('7days', 'bar');
  const rujukanFilter = useChartDateFilter('30days', 'line');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard
        title="Jumlah Pemeriksaan"
        data={pemeriksaanData}
        chartType={pemeriksaanFilter.chartType}
        activePreset={pemeriksaanFilter.activePreset}
        onPresetChange={pemeriksaanFilter.setPreset}
        onChartTypeChange={pemeriksaanFilter.setChartType}
        color="#0196fe"
        ...
      />
      <ChartCard
        title="Jumlah Rujukan"
        data={rujukanData}
        chartType={rujukanFilter.chartType}
        activePreset={rujukanFilter.activePreset}
        onPresetChange={rujukanFilter.setPreset}
        onChartTypeChange={rujukanFilter.setChartType}
        color="#fe7f01"
        ...
      />
    </div>
  );
};
```

---

## Perbandingan Pola dengan DataTable

| Aspek           | DataTable              | ChartCard                       |
| --------------- | ---------------------- | ------------------------------- |
| **Data**        | `data: T[]`            | `data: ChartDataPoint[]`        |
| **Konfigurasi** | `columns: ColumnDef[]` | `chartConfig.ts`                |
| **Mapping**     | `dataMapper.ts`        | `chartMapper.ts`                |
| **Config**      | `columnMap.ts`         | `chartConfig.ts`                |
| **State**       | Internal (react-table) | External (`useChartDateFilter`) |
| **Filter**      | `FilterPanel`          | Built-in preset + custom        |
| **Loading**     | `isLoading` prop       | `isLoading` prop                |
| **Empty**       | `emptyMessage` prop    | `emptyMessage` prop             |

---

## FAQ

**Q: Bagaimana jika API belum ready?**
A: Gunakan `generateDummyChartData(days)` untuk generate data dummy.

**Q: Bisa pakai Redux/RTK Query?**
A: Ya, cukup gunakan `queryParams` dari hook sebagai parameter query, lalu map hasilnya dengan `mapChartData()`.

**Q: Bisa tambah tipe chart lain (pie, donut)?**
A: Bisa, tambahkan di `chartTypeOptions` di `chartConfig.ts` dan tambahkan render logic di `ChartCard.tsx`.

**Q: Bagaimana handle error API?**
A: Tambahkan prop `error` dan `errorMessage` di `ChartCard` jika diperlukan, atau handle di level parent component.
