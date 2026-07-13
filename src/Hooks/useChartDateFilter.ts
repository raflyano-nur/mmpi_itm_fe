import { useState, useCallback, useMemo } from 'react'
import dayjs from 'dayjs'
import { dateFilterPresets, type ChartType } from '@/Config/chartConfig'

export interface DateRange {
  startDate: string // Format: YYYY-MM-DD
  endDate: string // Format: YYYY-MM-DD
}

export interface UseChartDateFilterReturn {
  /** Preset filter yang aktif saat ini */
  activePreset: string
  /** Range tanggal yang aktif */
  dateRange: DateRange
  /** Tipe chart yang aktif (bar/line) */
  chartType: ChartType
  /** Apakah custom date picker sedang terbuka */
  isCustomOpen: boolean
  /** Jumlah hari dalam range aktif */
  daysCount: number
  /** Handler untuk ganti preset */
  setPreset: (presetKey: string) => void
  /** Handler untuk set custom date range */
  setCustomRange: (start: string, end: string) => void
  /** Handler untuk ganti tipe chart */
  setChartType: (type: ChartType) => void
  /** Handler untuk toggle custom date picker */
  setIsCustomOpen: (open: boolean) => void
  /** Query params siap kirim ke API */
  queryParams: Record<string, string>
}

/**
 * Hook reusable untuk mengelola state filter tanggal dan tipe chart.
 * Bisa dipakai di komponen chart manapun.
 *
 * @param defaultPreset - Preset awal (default: '7days')
 * @param defaultChartType - Tipe chart awal (default: 'bar')
 * @returns Object berisi state dan handler
 *
 * @example
 * const { activePreset, dateRange, chartType, setPreset, setChartType, queryParams } = useChartDateFilter();
 *
 * // Kirim ke API
 * fetchData({ ...queryParams });
 */
export const useChartDateFilter = (
  defaultPreset = '7days',
  defaultChartType: ChartType = 'bar',
): UseChartDateFilterReturn => {
  const [activePreset, setActivePreset] = useState(defaultPreset)
  const [chartType, setChartType] = useState<ChartType>(defaultChartType)
  const [isCustomOpen, setIsCustomOpen] = useState(false)
  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  })

  /** Hitung date range berdasarkan preset aktif */
  const dateRange = useMemo<DateRange>(() => {
    if (activePreset === 'custom') {
      return customRange
    }

    const preset = dateFilterPresets.find((p) => p.key === activePreset)
    if (!preset) {
      return {
        startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
      }
    }

    const endDate = dayjs().format('YYYY-MM-DD')
    const startDate =
      preset.days === 0
        ? endDate // Hari ini
        : dayjs().subtract(preset.days, 'day').format('YYYY-MM-DD')

    return { startDate, endDate }
  }, [activePreset, customRange])

  /** Jumlah hari dalam range */
  const daysCount = useMemo(() => {
    const start = dayjs(dateRange.startDate)
    const end = dayjs(dateRange.endDate)
    return end.diff(start, 'day') + 1
  }, [dateRange])

  /** Handler ganti preset */
  const setPreset = useCallback((presetKey: string) => {
    setActivePreset(presetKey)
    if (presetKey === 'custom') {
      setIsCustomOpen(true)
    } else {
      setIsCustomOpen(false)
    }
  }, [])

  /** Handler set custom range */
  const setCustomRangeHandler = useCallback((start: string, end: string) => {
    setCustomRange({ startDate: start, endDate: end })
  }, [])

  /** Query params siap kirim ke API */
  const queryParams = useMemo<Record<string, string>>(
    () => ({
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
    }),
    [dateRange],
  )

  return {
    activePreset,
    dateRange,
    chartType,
    isCustomOpen,
    daysCount,
    setPreset,
    setCustomRange: setCustomRangeHandler,
    setChartType,
    setIsCustomOpen,
    queryParams,
  }
}

export default useChartDateFilter
