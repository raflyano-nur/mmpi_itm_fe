/**
 * Konfigurasi chart untuk project diagnostik-app
 * Pola mirip columnMap.ts — deklaratif dan mudah di-maintain
 */

// ===== TIPE CHART =====
export type ChartType = 'bar' | 'line' | 'pie' | 'donut'

// ===== DATE FILTER PRESETS =====
export interface DateFilterPreset {
  key: string
  label: string
  days: number // 0 = hari ini, -1 = custom
}

/**
 * Preset filter tanggal yang tersedia
 * days: 0 = hari ini, 1 = 1 hari, dst. -1 = custom range
 */
export const dateFilterPresets: DateFilterPreset[] = [
  { key: 'today', label: 'Hari Ini', days: 0 },
  { key: '3days', label: '3 Hari', days: 3 },
  { key: '7days', label: '7 Hari', days: 7 },
  { key: '30days', label: '30 Hari', days: 30 },
  { key: 'custom', label: 'Custom', days: -1 },
]

// ===== CHART TYPE OPTIONS =====
export interface ChartTypeOption {
  key: ChartType
  label: string
  icon: string // Emoji atau icon identifier
}

export const chartTypeOptions: ChartTypeOption[] = [
  { key: 'bar', label: 'Batang', icon: '📊' },
  { key: 'line', label: 'Garis', icon: '📈' },
  { key: 'pie', label: 'Pie', icon: '🥧' },
  { key: 'donut', label: 'Donut', icon: '🍩' },
]

// ===== WARNA CHART =====
/**
 * Palet warna chart yang konsisten dengan theme project
 * Menggunakan CSS variable dari index.css
 */
export const chartColors = {
  // Warna utama untuk bar/line
  primary: '#0196fe', // --color-primary-500
  primaryLight: '#80c5fd', // --color-primary-200
  primaryDark: '#0165ac', // --color-primary-700

  // Warna gradient untuk bar chart
  barGradientStart: '#0196fe', // --color-primary-500
  barGradientEnd: '#4dadfc', // --color-primary-300

  // Warna gradient untuk line chart
  lineStroke: '#0196fe', // --color-primary-500
  lineAreaStart: 'rgba(1, 150, 254, 0.3)',
  lineAreaEnd: 'rgba(1, 150, 254, 0.02)',

  // Warna aksen
  secondary: '#fe7f01', // --color-secondary-500
  accent: '#00d4ff', // --color-accent-cyan
  success: '#10b981', // --color-success
  warning: '#f59e0b', // --color-warning

  // Warna grid & axis
  grid: '#d9ddef', // --color-neutral-200
  axisText: '#6b7092', // --color-neutral-500
  tooltipBg: '#222536', // --color-neutral-800
  tooltipText: '#f7f8fc', // --color-neutral-50

  // Warna card
  cardBg: '#ffffff',
  cardBorder: '#d9ddef', // --color-neutral-200

  // Palet warna untuk Pie/Donut chart (per-slice)
  pieSlices: [
    '#0196fe', // primary
    '#fe7f01', // secondary
    '#10b981', // success
    '#f59e0b', // warning
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#00d4ff', // cyan
    '#0165ac', // primary-dark
    '#f43f5e', // rose
    '#14b8a6', // teal
  ] as string[],
}

// ===== CHART STYLE DEFAULTS =====
export const chartDefaults = {
  height: 350,
  barRadius: [6, 6, 0, 0] as [number, number, number, number],
  barSize: 32,
  lineStrokeWidth: 2.5,
  dotRadius: 4,
  activeDotRadius: 6,
  animationDuration: 800,
  gridStrokeDasharray: '3 3',
}

export default {
  dateFilterPresets,
  chartTypeOptions,
  chartColors,
  chartDefaults,
}
