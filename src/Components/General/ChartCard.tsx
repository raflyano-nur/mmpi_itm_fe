import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  dateFilterPresets,
  chartTypeOptions,
  chartColors,
  chartDefaults,
  type ChartType,
  type DateFilterPreset,
} from '@/Config/chartConfig'
import type { ChartDataPoint } from '@/Utils/chartMapper'

// ===== PROPS INTERFACE =====
interface ChartCardProps {
  /** Judul chart */
  title: string
  /** Subtitle / deskripsi singkat */
  subtitle?: string
  /** Data chart dalam format ChartDataPoint[] */
  data: ChartDataPoint[]
  /** Tipe chart aktif */
  chartType: ChartType
  /** Preset filter tanggal yang aktif */
  activePreset: string
  /** Apakah custom date picker terbuka */
  isCustomOpen?: boolean
  /** Custom date range start */
  customStartDate?: string
  /** Custom date range end */
  customEndDate?: string
  /** Loading state */
  isLoading?: boolean
  /** Tinggi chart (default dari chartDefaults) */
  height?: number
  /** Warna utama chart */
  color?: string
  /** Pesan ketika data kosong */
  emptyMessage?: string
  /** Icon di header (ReactNode) */
  icon?: React.ReactNode

  // ===== CALLBACKS =====
  /** Callback ketika preset filter berubah */
  onPresetChange: (presetKey: string) => void
  /** Callback ketika tipe chart berubah */
  onChartTypeChange: (type: ChartType) => void
  /** Callback ketika custom date range berubah */
  onCustomRangeChange?: (start: string, end: string) => void
  /** Callback ketika custom picker ditutup/dibuka */
  onCustomOpenChange?: (open: boolean) => void
}

// ===== CUSTOM TOOLTIP (Bar/Line/Area) =====
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div
      className="rounded-lg px-4 py-3 shadow-xl border"
      style={{
        backgroundColor: chartColors.tooltipBg,
        borderColor: chartColors.primary,
      }}
    >
      <p className="text-xs font-medium mb-1" style={{ color: chartColors.axisText }}>
        {label}
      </p>
      <p className="text-lg font-bold" style={{ color: chartColors.tooltipText }}>
        {payload[0].value}{' '}
        <span className="text-xs font-normal" style={{ color: chartColors.axisText }}>
          pemeriksaan
        </span>
      </p>
    </div>
  )
}

// ===== CUSTOM TOOLTIP (Pie/Donut) =====
const PieTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null

  const { name, value, payload: entryPayload } = payload[0]
  const percent = entryPayload?.percent ?? 0

  return (
    <div
      className="rounded-lg px-4 py-3 shadow-xl border"
      style={{
        backgroundColor: chartColors.tooltipBg,
        borderColor: payload[0]?.payload?.fill ?? chartColors.primary,
      }}
    >
      <p className="text-xs font-medium mb-1" style={{ color: chartColors.axisText }}>
        {name}
      </p>
      <p className="text-lg font-bold" style={{ color: chartColors.tooltipText }}>
        {value}{' '}
        <span className="text-xs font-normal" style={{ color: chartColors.axisText }}>
          pemeriksaan ({(percent * 100).toFixed(1)}%)
        </span>
      </p>
    </div>
  )
}

// ===== CUSTOM LEGEND (Pie/Donut) =====
const PieLegend: React.FC<any> = ({ payload }) => {
  if (!payload || payload.length === 0) return null

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-neutral-600">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

// ===== CUSTOM ACTIVE SHAPE LABEL (Pie/Donut center label) =====
const RADIAN = Math.PI / 180
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (percent < 0.05) return null // Sembunyikan label jika slice terlalu kecil

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// ===== LOADING SKELETON =====
const ChartSkeleton: React.FC<{ height: number }> = ({ height }) => (
  <div className="animate-pulse flex flex-col justify-end gap-2 px-4" style={{ height }}>
    <div className="flex items-end gap-3 h-full">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md"
          style={{
            height: `${Math.random() * 60 + 20}%`,
            backgroundColor: chartColors.primaryLight,
            opacity: 0.4,
          }}
        />
      ))}
    </div>
    <div className="h-4 bg-neutral-200 rounded w-full" />
  </div>
)

// ===== EMPTY STATE =====
const EmptyState: React.FC<{ message: string; height: number }> = ({ message, height }) => (
  <div className="flex flex-col items-center justify-center text-neutral-400" style={{ height }}>
    <svg className="w-16 h-16 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
    <p className="text-sm">{message}</p>
  </div>
)

// ===== MAIN COMPONENT =====
/**
 * ChartCard - Komponen grafik reusable dengan filter tanggal dan toggle tipe chart.
 *
 * Pola penggunaan mirip DataTable:
 * - Terima data yang sudah di-map via chartMapper
 * - Konfigurasi via props deklaratif
 * - State management via useChartDateFilter hook
 *
 * @example
 * const { activePreset, chartType, setPreset, setChartType } = useChartDateFilter();
 * const chartData = mapChartData(apiResponse, pemeriksaanHarianMapping);
 *
 * <ChartCard
 *   title="Jumlah Pemeriksaan"
 *   data={chartData}
 *   chartType={chartType}
 *   activePreset={activePreset}
 *   onPresetChange={setPreset}
 *   onChartTypeChange={setChartType}
 * />
 */
const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  data,
  chartType,
  activePreset,
  isCustomOpen = false,
  customStartDate = '',
  customEndDate = '',
  isLoading = false,
  height = chartDefaults.height,
  color = chartColors.primary,
  emptyMessage = 'Tidak ada data pemeriksaan',
  icon,
  onPresetChange,
  onChartTypeChange,
  onCustomRangeChange,
  onCustomOpenChange,
}) => {
  // Hitung total & rata-rata
  const stats = useMemo(() => {
    if (!data || data.length === 0) return { total: 0, average: 0, max: 0 }
    const total = data.reduce((sum, d) => sum + d.value, 0)
    const max = Math.max(...data.map((d) => d.value))
    return {
      total,
      average: Math.round(total / data.length),
      max,
    }
  }, [data])

  // Hitung min-width untuk scroll horizontal pada mobile/tablet
  // Hanya berlaku untuk chart tipe bar dan line/area yang punya axis
  const chartMinWidth = useMemo(() => {
    if (!data || data.length === 0) return 0
    // Pie/donut tidak perlu min-width karena tidak punya axis
    if (chartType === 'pie' || chartType === 'donut') return 0
    // Minimal lebar per data point agar bar/label tetap proporsional
    // Semakin banyak data, semakin kecil per-point (diminishing)
    const minPerPoint = data.length <= 7 ? 0 : data.length <= 14 ? 35 : 25
    const calculated = data.length * minPerPoint
    // Hanya aktifkan jika calculated > 0 (artinya data cukup banyak)
    return calculated
  }, [data, chartType])

  // Render chart berdasarkan tipe
  const renderChart = () => {
    if (isLoading) return <ChartSkeleton height={height} />
    if (!data || data.length === 0) return <EmptyState message={emptyMessage} height={height} />

    const commonAxisProps = {
      tick: { fontSize: 12, fill: chartColors.axisText },
      axisLine: { stroke: chartColors.grid },
      tickLine: false,
    }

    // ===== BAR CHART =====
    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray={chartDefaults.gridStrokeDasharray}
              stroke={chartColors.grid}
              vertical={false}
            />
            <XAxis dataKey="label" {...commonAxisProps} />
            <YAxis {...commonAxisProps} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(1, 150, 254, 0.08)' }} />
            <Bar
              dataKey="value"
              fill="url(#barGradient)"
              radius={chartDefaults.barRadius}
              maxBarSize={chartDefaults.barSize}
              animationDuration={chartDefaults.animationDuration}
            />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    // ===== PIE CHART =====
    if (chartType === 'pie') {
      const sliceColors = chartColors.pieSlices
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={Math.min(height * 0.35, 140)}
              labelLine={false}
              label={renderPieLabel}
              animationDuration={chartDefaults.animationDuration}
              stroke="#fff"
              strokeWidth={2}
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={sliceColors[index % sliceColors.length]} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
            <Legend content={<PieLegend />} />
          </PieChart>
        </ResponsiveContainer>
      )
    }

    // ===== DONUT CHART =====
    if (chartType === 'donut') {
      const sliceColors = chartColors.pieSlices
      const outerR = Math.min(height * 0.35, 140)
      const innerR = outerR * 0.55
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={innerR}
              outerRadius={outerR}
              labelLine={false}
              label={renderPieLabel}
              animationDuration={chartDefaults.animationDuration}
              stroke="#fff"
              strokeWidth={2}
              paddingAngle={2}
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={sliceColors[index % sliceColors.length]} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
            <Legend content={<PieLegend />} />
          </PieChart>
        </ResponsiveContainer>
      )
    }

    // ===== LINE CHART (dengan area fill) — default =====
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="lineAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray={chartDefaults.gridStrokeDasharray}
            stroke={chartColors.grid}
            vertical={false}
          />
          <XAxis dataKey="label" {...commonAxisProps} />
          <YAxis {...commonAxisProps} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={chartDefaults.lineStrokeWidth}
            fill="url(#lineAreaGradient)"
            dot={{ r: chartDefaults.dotRadius, fill: color, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: chartDefaults.activeDotRadius, fill: color, strokeWidth: 2, stroke: '#fff' }}
            animationDuration={chartDefaults.animationDuration}
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden animate-fadeIn">
      {/* ===== HEADER ===== */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-sm">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-base font-semibold text-neutral-800">{title}</h3>
              {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>

          {/* Stats ringkas */}
          {!isLoading && data.length > 0 && (
            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="text-xs text-neutral-400">Total</p>
                <p className="text-lg font-bold text-primary-600">{stats.total}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Rata-rata</p>
                <p className="text-lg font-bold text-neutral-700">{stats.average}</p>
              </div>
            </div>
          )}
        </div>

        {/* ===== FILTER BAR ===== */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Date filter presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {dateFilterPresets.map((preset: DateFilterPreset) => (
              <button
                key={preset.key}
                onClick={() => onPresetChange(preset.key)}
                disabled={isLoading}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200
                  ${
                    activePreset === preset.key
                      ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-primary-50 hover:text-primary-600'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Chart type toggle */}
          <div className="flex items-center bg-neutral-100 rounded-lg p-0.5">
            {chartTypeOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => onChartTypeChange(option.key)}
                disabled={isLoading}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
                  ${
                    chartType === option.key
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <span>{option.icon}</span>
                <span className="hidden sm:inline">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ===== CUSTOM DATE RANGE PICKER ===== */}
        {isCustomOpen && activePreset === 'custom' && (
          <div className="mt-3 flex flex-wrap items-center gap-3 p-3 bg-primary-50 rounded-lg border border-primary-200 animate-fadeIn">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-neutral-600">Dari</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => onCustomRangeChange?.(e.target.value, customEndDate)}
                className="px-3 py-1.5 text-xs border border-primary-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-700"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-neutral-600">Sampai</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => onCustomRangeChange?.(customStartDate, e.target.value)}
                className="px-3 py-1.5 text-xs border border-primary-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-neutral-700"
              />
            </div>
            <button
              onClick={() => onCustomOpenChange?.(false)}
              className="ml-auto text-xs text-neutral-400 hover:text-danger transition-colors"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ===== CHART AREA ===== */}
      <div className="px-2 pb-4 overflow-x-auto">
        <div style={chartMinWidth > 0 ? { minWidth: chartMinWidth } : undefined}>{renderChart()}</div>
      </div>
    </div>
  )
}

export default ChartCard
