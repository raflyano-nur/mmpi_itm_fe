import dayjs from 'dayjs'
import { extractData } from './dataMapper'

/**
 * Interface untuk data point chart standar
 * Semua chart di project ini menggunakan format ini
 */
export interface ChartDataPoint {
  label: string // Label sumbu X (tanggal, kategori, dll)
  value: number // Nilai sumbu Y
  [key: string]: any // Field tambahan jika diperlukan
}

/**
 * Konfigurasi mapping field dari API response ke ChartDataPoint
 */
export interface ChartFieldMapping {
  labelField: string // Field API yang jadi label (misal: 'tanggal')
  valueField: string // Field API yang jadi value (misal: 'jumlah')
  labelFormatter?: (raw: any) => string // Opsional: format label
  valueFormatter?: (raw: any) => number // Opsional: format value
}

/**
 * Map data API ke format ChartDataPoint[]
 * Mirip pola mapKonsultasiData di dataMapper.ts
 *
 * @param apiData - Raw data dari API (bisa array langsung atau nested object)
 * @param mapping - Konfigurasi mapping field
 * @param extractPath - Path untuk extract nested response (default: 'data')
 * @returns ChartDataPoint[]
 *
 * @example
 * // Response API: { data: [{ tanggal: '2026-02-27', jumlah: 15 }] }
 * const chartData = mapChartData(response, {
 *   labelField: 'tanggal',
 *   valueField: 'jumlah',
 *   labelFormatter: (val) => dayjs(val).format('DD MMM'),
 * }, 'data');
 */
export const mapChartData = (
  apiData: any,
  mapping: ChartFieldMapping,
  extractPath = 'data',
): ChartDataPoint[] => {
  const rawArray = extractData(apiData, extractPath)

  if (!rawArray || !Array.isArray(rawArray) || rawArray.length === 0) return []

  return rawArray.map((item) => {
    const rawLabel = item[mapping.labelField]
    const rawValue = item[mapping.valueField]

    return {
      label: mapping.labelFormatter ? mapping.labelFormatter(rawLabel) : String(rawLabel ?? ''),
      value: mapping.valueFormatter ? mapping.valueFormatter(rawValue) : Number(rawValue ?? 0),
      _original: item,
    }
  })
}

/**
 * Preset mapping untuk pemeriksaan harian
 * Langsung pakai tanpa perlu define mapping manual
 *
 * @example
 * const data = mapChartData(apiResponse, pemeriksaanHarianMapping);
 */
export const pemeriksaanHarianMapping: ChartFieldMapping = {
  labelField: 'tanggal',
  valueField: 'jumlah',
  labelFormatter: (val: string) => dayjs(val).format('DD MMM'),
}

/**
 * Generate dummy data untuk development/testing
 * Berguna sebelum API ready
 *
 * @param days - Jumlah hari ke belakang
 * @param maxValue - Nilai maksimum random
 * @returns ChartDataPoint[]
 */
export const generateDummyChartData = (days: number, maxValue = 50): ChartDataPoint[] => {
  const data: ChartDataPoint[] = []
  const today = dayjs()

  for (let i = days - 1; i >= 0; i--) {
    const date = today.subtract(i, 'day')
    data.push({
      label: date.format('DD MMM'),
      value: Math.floor(Math.random() * maxValue) + 5,
    })
  }

  return data
}

export default {
  mapChartData,
  pemeriksaanHarianMapping,
  generateDummyChartData,
}
