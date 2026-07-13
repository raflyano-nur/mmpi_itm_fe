/**
 * @file DiagnostikList.tsx
 * @description Komponen untuk menampilkan daftar hasil diagnostik pasien.
 *
 * Menampilkan tabel dengan kolom:
 * - Waktu pemeriksaan
 * - ID Alat yang digunakan
 * - Nama Pasien
 * - Hasil Singkat
 * - Aksi (Detail, Kirim Ulang, Kirim ke Boyolali, Logs)
 *
 * @module Diagnostik/DiagnostikList
 */

import React, { useState, useMemo, useCallback } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/Components/General/Datatable'
import DiagnostikDetailModal from '../DiagnostikDetailModal'
import DiagnostikResendModal from '../DiagnostikResendModal'
import DiagnostikLogsModal from '../DiagnostikLogsModal'
import type { DiagnostikItem, ListDiagnosticParams } from '../types'
import { QUEUE_STATUS_CONFIG } from '../types'
import { mapDiagnosticsApiList, getGenderLabel, calculateAge } from '../diagnostikMapper'
import {
  useGetListDiagnosticQuery,
  useGetDetailDiagnosticQuery,
  useGetQueueLogDiagnosticQuery,
  useResendDiagnosticMutation,
} from '@/Services/Modules/diagnostics'
import type { ResendDiagnosticBody } from '@/Services/Modules/diagnostics'
import { useNotification } from '@/Components/General/Notification'
import { usePermissionContext } from '@/Permissions'
import {
  HiArrowPath,
  HiPaperAirplane,
  HiQueueList,
  HiEye,
  HiFunnel,
  HiXMark,
  HiBuildingOffice2,
} from 'react-icons/hi2'

// ===================================================================
// STATUS BADGE (reusable helper)
// ===================================================================

/**
 * Render badge status queue berdasarkan status string.
 */
const QueueStatusBadge: React.FC<{ status: string | undefined }> = ({ status }) => {
  if (!status) return null

  const config = QUEUE_STATUS_CONFIG[status] || QUEUE_STATUS_CONFIG.pending

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${config.bg} ${config.text} border`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

// ===================================================================
// MAIN COMPONENT
// ===================================================================

const DiagnostikList: React.FC = () => {
  // ===== PERMISSION CHECK =====
  const { can } = usePermissionContext()

  // Permission untuk melihat (view only)
  const canView = can('diagnostics', 'view')
  // Permission untuk mengirim ulang
  const canResend = can('diagnostics', 'resend')

  // ===== STATE =====
  const [queryParams, setQueryParams] = useState<ListDiagnosticParams>({
    page: 1,
    per_page: 10,
    search: '',
    sort_by: 'created_at',
    sort_dir: 'desc',
  })

  // Filter states
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [deviceCode, setDeviceCode] = useState<string>('')
  const [institutionName, setInstitutionName] = useState<string>('')
  const [sexFilter, setSexFilter] = useState<string>('')
  const [queueStatus, setQueueStatus] = useState<'pending' | 'processing' | 'success' | 'failed' | ''>('')
  const [searchName, setSearchName] = useState<string>('')
  const [idNumberFilter, setIdNumberFilter] = useState<string>('')
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  // states
  const [logsPage, setLogsPage] = useState(1)
  // Modal states
  const [selectedItem, setSelectedItem] = useState<DiagnostikItem | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isResendOpen, setIsResendOpen] = useState(false)
  const [isLogsOpen, setIsLogsOpen] = useState(false)

  // ===== API HOOKS =====
  const { data: listData, isLoading, isFetching, refetch } = useGetListDiagnosticQuery(queryParams)
  const { data: detailData } = useGetDetailDiagnosticQuery(
    { id: selectedId! },
    { skip: !selectedId || !isDetailOpen },
  )
  const { data: logsData, isLoading: isLogsLoading } = useGetQueueLogDiagnosticQuery(
    { id: selectedId!, page: logsPage },
    { skip: !selectedId || !isLogsOpen },
  )

  const [resendDiagnostic, { isLoading: isResending }] = useResendDiagnosticMutation()

  // ===== NOTIFICATION =====
  const { showNotification, contextHolder } = useNotification()

  // ===== DERIVED DATA =====
  const mappedData = useMemo(() => {
    if (!listData?.data?.data) return []
    return mapDiagnosticsApiList(listData.data.data)
  }, [listData])

  // Extract pagination info from API response
  const paginationInfo = useMemo(() => {
    if (!listData?.data) return null
    const { current_page, last_page, from, to, total, per_page } = listData.data
    return { current_page, last_page, from, to, total, per_page }
  }, [listData])

  // ===== COLUMN DEFINITIONS =====
  const columns: ColumnDef<DiagnostikItem>[] = useMemo(
    () => [
      {
        id: 'actions',
        header: 'Aksi',
        size: 100,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {/* Detail Button */}
            <button
              onClick={() => handleDetail(row.original)}
              className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors cursor-pointer"
              title="Detail"
            >
              <HiEye className="w-4 h-4" />
            </button>

            {/* Kirim Ulang Button - Requires 'resend' permission */}
            {canResend && (
              <button
                onClick={() => handleResend(row.original)}
                className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors cursor-pointer"
                title="Kirim Ulang"
              >
                <HiArrowPath className="w-4 h-4" />
              </button>
            )}

            {/* Logs Button */}
            <button
              onClick={() => handleLogs(row.original)}
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
              title="Logs"
            >
              <HiQueueList className="w-4 h-4" />
            </button>
          </div>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Waktu',
        size: 140,
        cell: ({ row }) => (
          <span className="text-sm text-neutral-600 whitespace-nowrap">{row.original.waktu}</span>
        ),
      },
      {
        accessorKey: 'devices_code',
        header: 'ID Alat',
        size: 120,
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100 whitespace-nowrap">
            {row.original.devices_code}
          </span>
        ),
      },
      {
        accessorKey: 'username',
        header: 'Nama Pasien',
        size: 140,
        cell: ({ row }) => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="flex items-center justify-center flex-shrink-0 rounded-full w-7 h-7 bg-primary-50">
              <span className="text-xs font-semibold text-primary-600">
                {row.original.namaPasien?.charAt(0)?.toUpperCase() || ''}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-800">{row.original.namaPasien}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'id_number',
        header: 'No. Identitas',
        size: 100,
        cell: ({ row }) => (
          <span className="text-sm text-neutral-600 whitespace-nowrap">{row.original.idNumber || '-'}</span>
        ),
      },
      {
        accessorKey: 'sex',
        header: 'JK',
        size: 70,
        cell: ({ row }) => (
          <span className="text-sm text-neutral-600 whitespace-nowrap">
            {getGenderLabel(row.original.sex)}
          </span>
        ),
      },
      {
        accessorKey: 'birth_time',
        header: 'Umur',
        size: 70,
        cell: ({ row }) => (
          <span className="text-sm text-neutral-600 whitespace-nowrap">
            {calculateAge(row.original.birthTime)}
          </span>
        ),
      },
      {
        accessorKey: 'result',
        header: 'Hasil',
        size: 100,
        cell: ({ row }) => (
          <div className="whitespace-nowrap">
            <span
              className={`text-sm font-medium ${row.original.result === 'Normal' ? 'text-emerald-600' : 'text-amber-600'}`}
            >
              {row.original.result}
            </span>
            <div className="mt-0.5">
              <QueueStatusBadge status={row.original.queueStatus} />
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'institutions_name',
        header: 'Nama Institusi',
        size: 80,
        cell: ({ row }) => {
          const inst = row.original.institutions

          return (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 overflow-hidden rounded-lg bg-primary-50">
                {inst?.logo_url ? (
                  <img
                    src={inst.logo_url}
                    alt={inst.institutions_name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).src = ''
                    }}
                  />
                ) : (
                  <HiBuildingOffice2 className="w-4 h-4 text-primary-500" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium truncate text-neutral-800">
                  {inst?.institutions_name ?? '-'}
                </p>
              </div>
            </div>
          )
        },
      },
      // ===== KOLOM PARAMETER PEMERIKSAAN =====
      // Tinggi Badan
      {
        accessorKey: 'height',
        header: 'Tbg',
        size: 60,
        cell: ({ row }) => {
          const val = row.original.height
          if (val) return <span className="text-sm text-neutral-700 whitespace-nowrap">{val}</span>
          return <span className="text-sm text-neutral-400">-</span>
        },
      },
      // Berat Badan
      {
        accessorKey: 'weight',
        header: 'Bbr',
        size: 55,
        cell: ({ row }) => {
          const val = row.original.weight
          if (val) return <span className="text-sm text-neutral-700 whitespace-nowrap">{val}</span>
          return <span className="text-sm text-neutral-400">-</span>
        },
      },
      // BMI
      {
        accessorKey: 'bmi',
        header: 'BMI',
        size: 50,
        cell: ({ row }) => {
          const val = row.original.bmi
          if (val) {
            const bmiNum = Number(val)
            const isHigh = bmiNum > 25
            const isLow = bmiNum < 18.5
            return (
              <span
                className={`text-sm font-medium whitespace-nowrap ${isHigh ? 'text-amber-600' : isLow ? 'text-amber-600' : 'text-neutral-700'}`}
              >
                {val}
              </span>
            )
          }
          return <span className="text-sm text-neutral-400">-</span>
        },
      },
      // Tekanan Darah (Sys/Dia)
      {
        id: 'bloodPressure',
        header: 'TD',
        size: 70,
        cell: ({ row }) => {
          const sys = row.original.sys
          const dia = row.original.dia
          if (sys || dia) {
            return (
              <span className="text-sm font-medium text-neutral-700 whitespace-nowrap">
                {sys}/{dia}
              </span>
            )
          }
          return <span className="text-sm text-neutral-400">-</span>
        },
      },
      // Denyut Nadi (PR)
      {
        accessorKey: 'pr',
        header: 'Nadi',
        size: 60,
        cell: ({ row }) => {
          const val = row.original.pr
          if (val) {
            const prNum = Number(val)
            const isHigh = prNum > 100
            const isLow = prNum < 60
            return (
              <span
                className={`text-sm font-medium whitespace-nowrap ${isHigh || isLow ? 'text-amber-600' : 'text-neutral-700'}`}
              >
                {val}
              </span>
            )
          }
          return <span className="text-sm text-neutral-400">-</span>
        },
      },
      // SpO2 (Oksigen Darah)
      {
        accessorKey: 'blood_o',
        header: 'SpO2',
        size: 50,
        cell: ({ row }) => {
          const val = row.original.bloodO
          if (val) {
            const spo2 = Number(val)
            const isLow = spo2 < 95
            return (
              <span
                className={`text-sm font-medium whitespace-nowrap ${isLow ? 'text-amber-600' : 'text-neutral-700'}`}
              >
                {val}
              </span>
            )
          }
          return <span className="text-sm text-neutral-400">-</span>
        },
      },
      // Suhu Tubuh
      {
        accessorKey: 'temp',
        header: 'Suhu',
        size: 50,
        cell: ({ row }) => {
          const val = row.original.temp
          if (val) return <span className="text-sm text-neutral-700 whitespace-nowrap">{val}</span>
          return <span className="text-sm text-neutral-400">-</span>
        },
      },
      // Respiratory Rate
      {
        accessorKey: 'res',
        header: 'Res',
        size: 50,
        cell: ({ row }) => {
          const val = row.original.res
          if (val) {
            const resNum = Number(val)
            const isHigh = resNum > 20
            const isLow = resNum < 12
            return (
              <span
                className={`text-sm font-medium whitespace-nowrap ${isHigh || isLow ? 'text-amber-600' : 'text-neutral-700'}`}
              >
                {val}
              </span>
            )
          }
          return <span className="text-sm text-neutral-400">-</span>
        },
      },
      // Gula Darah Sewaktu
      {
        accessorKey: 'blood_s',
        header: 'GDS',
        size: 60,
        cell: ({ row }) => {
          const val = row.original.bloodSugar
          if (val) {
            const bs = Number(val)
            const isHigh = bs > 200
            return (
              <span
                className={`text-sm font-medium whitespace-nowrap ${isHigh ? 'text-amber-600' : 'text-neutral-700'}`}
              >
                {val}
              </span>
            )
          }
          return <span className="text-sm text-neutral-400">-</span>
        },
      },
      // Asam Urat
      {
        accessorKey: 'uric_a',
        header: 'AU',
        size: 50,
        cell: ({ row }) => {
          const val = row.original.uricAcid
          if (val) {
            const ua = Number(val)
            const isHigh = ua > 7
            return (
              <span
                className={`text-sm font-medium whitespace-nowrap ${isHigh ? 'text-amber-600' : 'text-neutral-700'}`}
              >
                {val}
              </span>
            )
          }
          return <span className="text-sm text-neutral-400">-</span>
        },
      },
      // Kolesterol Total
      {
        accessorKey: 'cho',
        header: 'Kol',
        size: 50,
        cell: ({ row }) => {
          const val = row.original.cholesterol
          if (val) {
            const chol = Number(val)
            const isHigh = chol > 200
            return (
              <span
                className={`text-sm font-medium whitespace-nowrap ${isHigh ? 'text-amber-600' : 'text-neutral-700'}`}
              >
                {val}
              </span>
            )
          }
          return <span className="text-sm text-neutral-400">-</span>
        },
      },
    ],
    [],
  )

  // ===== HANDLERS =====

  /**
   * Handler untuk perubahan pagination - server-side
   */
  const handlePageChange = useCallback((page: number) => {
    setQueryParams((prev) => ({ ...prev, page: page + 1 })) // API uses 1-based indexing
  }, [])

  /**
   * Handler untuk perubahan page size - server-side
   */
  const handlePageSizeChange = useCallback((pageSize: number) => {
    setQueryParams((prev) => ({ ...prev, per_page: pageSize, page: 1 }))
  }, [])

  /**
   * Handler untuk perubahan sorting - server-side
   */
  const handleSortChange = useCallback((sortBy: string, sortOrder: string) => {
    setQueryParams((prev) => ({
      ...prev,
      sort_by: sortBy,
      sort_dir: sortOrder as 'asc' | 'desc',
      page: 1, // Reset ke halaman pertama saat sorting berubah
    }))
  }, [])

  /**
   * Handler untuk perubahan search - server-side
   */
  const handleSearchChange = useCallback((search: string) => {
    setQueryParams((prev) => ({
      ...prev,
      search,
      page: 1, // Reset ke halaman pertama saat search berubah
    }))
  }, [])

  /**
   * Handler untuk filter tanggal - apply
   */
  const handleApplyDateFilter = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      devices_code: deviceCode || undefined,
      institutions_Name: institutionName || undefined,
      queue_status: queueStatus || undefined,
      search: searchName || undefined,
      page: 1,
    }))
  }, [dateFrom, dateTo, deviceCode, institutionName, queueStatus, searchName])

  /**
   * Handler untuk filter tanggal mulai - langsung refetch
   */
  const handleDateFromChange = useCallback((value: string) => {
    setDateFrom(value)
    setQueryParams((prev) => ({
      ...prev,
      date_from: value || undefined,
      page: 1,
    }))
  }, [])

  /**
   * Handler untuk filter tanggal akhir - langsung refetch
   */
  const handleDateToChange = useCallback((value: string) => {
    setDateTo(value)
    setQueryParams((prev) => ({
      ...prev,
      date_to: value || undefined,
      page: 1,
    }))
  }, [])

  /**
   * Handler untuk filter device code - langsung refetch
   */
  const handleDeviceCodeChange = useCallback((value: string) => {
    setDeviceCode(value)
    setQueryParams((prev) => ({
      ...prev,
      devices_code: value || undefined,
      page: 1,
    }))
  }, [])

  /**
   * Handler untuk filter institusi - langsung refetch
   */
  const handleInstitutionNameChange = useCallback((value: string) => {
    setInstitutionName(value)
    setQueryParams((prev) => ({
      ...prev,
      institutions_name: value || undefined,
      page: 1,
    }))
  }, [])

  /**
   * Handler untuk filter jenis kelamin - langsung refetch
   */
  const handleSexFilterChange = useCallback((value: string) => {
    setSexFilter(value)
    setQueryParams((prev) => ({
      ...prev,
      sex: value || undefined,
      page: 1,
    }))
  }, [])

  /**
   * Handler untuk filter queue status - langsung refetch
   */
  const handleQueueStatusChange = useCallback(
    (value: 'pending' | 'processing' | 'success' | 'failed' | '') => {
      setQueueStatus(value)
      setQueryParams((prev) => ({
        ...prev,
        queue_status: value || undefined,
        page: 1,
      }))
    },
    [],
  )

  /**
   * Handler untuk filter nama pasien - langsung refetch
   */
  const handleSearchNameChange = useCallback((value: string) => {
    setSearchName(value)
    setQueryParams((prev) => ({
      ...prev,
      search: value || undefined,
      page: 1,
    }))
  }, [])

  /**
   * Handler untuk filter nomor identitas - langsung refetch
   */
  const handleIdNumberFilterChange = useCallback((value: string) => {
    setIdNumberFilter(value)
    setQueryParams((prev) => ({
      ...prev,
      id_number: value || undefined,
      page: 1,
    }))
  }, [])

  /**
   * Reset semua filter
   */
  const handleResetFilters = useCallback(() => {
    setDateFrom('')
    setDateTo('')
    setDeviceCode('')
    setInstitutionName('')
    setSexFilter('')
    setQueueStatus('')
    setSearchName('')
    setIdNumberFilter('')
    setQueryParams((prev) => ({
      ...prev,
      search: '',
      devices_code: undefined,
      institutions_code: undefined,
      queue_status: undefined,
      date_from: undefined,
      date_to: undefined,
      page: 1,
    }))
  }, [])

  /**
   * Toggle filter panel
   */
  const toggleFilter = useCallback(() => {
    setIsFilterOpen((prev) => !prev)
  }, [])

  /**
   * Buka modal detail
   */
  const handleDetail = (item: DiagnostikItem) => {
    setSelectedItem(item)
    setSelectedId(Number(item.id))
    setIsDetailOpen(true)
  }

  /**
   * Tutup modal detail
   */
  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedItem(null)
    setSelectedId(null)
  }

  /**
   * Buka modal kirimi ulang
   */
  const handleResend = (item: DiagnostikItem) => {
    setSelectedItem(item)
    setSelectedId(Number(item.id))
    setIsResendOpen(true)
  }

  /**
   * Tutup modal kirim ulang
   */
  const handleCloseResend = () => {
    setIsResendOpen(false)
    setSelectedItem(null)
    setSelectedId(null)
  }

  /**
   * Konfirmasi kirim ulang
   */
  const handleConfirmResend = async (body: ResendDiagnosticBody) => {
    if (!selectedId) return

    try {
      const result = await resendDiagnostic({
        diagnostic_id: selectedId,
        body,
      }).unwrap()
      showNotification({
        title: 'Berhasil',
        description: result.message || 'Data diagnostik berhasil dikirim ulang',
        type: 'success',
      })
      handleCloseResend()
      refetch()
    } catch (error: any) {
      showNotification({
        title: 'Gagal',
        description: error?.data?.message || 'Gagal mengirim ulang data diagnostik',
        type: 'error',
      })
    }
  }

  /**
   * Buka modal logs
   * Reset ke page 1 jika buka item berbeda
   */
  const handleLogs = (item: DiagnostikItem) => {
    if (selectedId !== Number(item.id)) {
      setLogsPage(1)
    }
    setSelectedItem(item)
    setSelectedId(Number(item.id))
    setIsLogsOpen(true)
  }

  /**
   * Tutup modal logs
   */
  const handleCloseLogs = () => {
    setIsLogsOpen(false)
    setSelectedItem(null)
    setSelectedId(null)
    // Tidak reset logsPage di sini agar tidak flash saat close
  }

  /**
   * Handler kirim ke Boyolali
   */
  const handleKirimBoyolali = (item: DiagnostikItem) => {
    // TODO: Implementasi Kirim ke Boyolali API
    showNotification({
      title: 'Fitur dalam pengembangan',
      description: `Mengirim data diagnostik ${item.namaPasien} ke Boyolali...`,
      type: 'info',
    })
  }

  // ===== RENDER =====
  // Jika tidak punya permission 'view' untuk diagnostics, jangan render apapun
  if (!canView) {
    return null
  }

  return (
    <div className="w-full">
      {contextHolder}

      {/* Filter Panel */}
      <div className="mb-4">
        {/* Filter Toggle Button */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={toggleFilter}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors bg-white border rounded-lg cursor-pointer text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
          >
            <HiFunnel className="w-4 h-4" />
            Filter
            {(dateFrom ||
              dateTo ||
              deviceCode ||
              institutionName ||
              sexFilter ||
              queueStatus ||
              searchName ||
              idNumberFilter) && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full bg-primary-500">
                {(dateFrom ? 1 : 0) +
                  (dateTo ? 1 : 0) +
                  (deviceCode ? 1 : 0) +
                  (institutionName ? 1 : 0) +
                  (sexFilter ? 1 : 0) +
                  (queueStatus ? 1 : 0) +
                  (searchName ? 1 : 0) +
                  (idNumberFilter ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Reset Filter Button */}
          {(dateFrom ||
            dateTo ||
            deviceCode ||
            institutionName ||
            sexFilter ||
            queueStatus ||
            searchName ||
            idNumberFilter) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 transition-colors border border-red-100 rounded-lg cursor-pointer bg-red-50 hover:bg-red-100"
            >
              <HiXMark className="w-4 h-4" />
              Reset Filter
            </button>
          )}
        </div>

        {/* Filter Form */}
        {isFilterOpen && (
          <div className="p-4 bg-white border shadow-sm border-neutral-200 rounded-xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Tanggal Mulai */}
              <div>
                <label className="block mb-1 text-xs font-medium text-neutral-500">Tanggal Mulai</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Tanggal Akhir */}
              <div>
                <label className="block mb-1 text-xs font-medium text-neutral-500">Tanggal Akhir</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* ID Alat */}
              <div>
                <label className="block mb-1 text-xs font-medium text-neutral-500">ID Alat</label>
                <input
                  type="text"
                  value={deviceCode}
                  onChange={(e) => handleDeviceCodeChange(e.target.value)}
                  placeholder="Cari ID Alat..."
                  className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Nama Pasien */}
              <div>
                <label className="block mb-1 text-xs font-medium text-neutral-500">Nama Pasien</label>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => handleSearchNameChange(e.target.value)}
                  placeholder="Cari nama pasien..."
                  className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Kode Institusi */}
              <div>
                <label className="block mb-1 text-xs font-medium text-neutral-500">Nama Institusi</label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => handleInstitutionNameChange(e.target.value)}
                  placeholder="Cari nama institusi..."
                  className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block mb-1 text-xs font-medium text-neutral-500">Jenis Kelamin</label>
                <select
                  value={sexFilter}
                  onChange={(e) => handleSexFilterChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Semua</option>
                  <option value="Male">Laki-laki</option>
                  <option value="Female">Perempuan</option>
                </select>
              </div>

              {/* Status Queue */}
              <div>
                <label className="block mb-1 text-xs font-medium text-neutral-500">Status Queue</label>
                <select
                  value={queueStatus}
                  onChange={(e) =>
                    handleQueueStatusChange(
                      e.target.value as 'pending' | 'processing' | 'success' | 'failed' | '',
                    )
                  }
                  className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Semua</option>
                  <option value="pending">Menunggu</option>
                  <option value="processing">Diproses</option>
                  <option value="success">Berhasil</option>
                  <option value="failed">Gagal</option>
                </select>
              </div>

              {/* No. Identitas */}
              <div>
                <label className="block mb-1 text-xs font-medium text-neutral-500">No. Identitas</label>
                <input
                  type="text"
                  value={idNumberFilter}
                  onChange={(e) => handleIdNumberFilterChange(e.target.value)}
                  placeholder="Cari No. Identitas..."
                  className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <DataTable<DiagnostikItem>
        data={mappedData}
        columns={columns}
        pageSize={queryParams.per_page}
        showSearch
        searchPlaceholder="Cari pasien, ID alat, atau hasil..."
        isLoading={isLoading || isFetching}
        emptyMessage="Tidak ada data diagnostik"
        // Server-side props
        currentPage={paginationInfo?.current_page}
        lastPage={paginationInfo?.last_page}
        totalData={paginationInfo?.total}
        apiFrom={paginationInfo?.from}
        apiTo={paginationInfo?.to}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSortChange={handleSortChange}
        serverSortBy={queryParams.sort_by}
        serverSortOrder={queryParams.sort_dir}
        onSearch={handleSearchChange}
      />

      {/* Detail Modal */}
      <DiagnostikDetailModal isOpen={isDetailOpen} item={detailData?.data} onClose={handleCloseDetail} />

      {/* Resend Modal */}
      <DiagnostikResendModal
        isOpen={isResendOpen}
        item={selectedItem}
        isLoading={isResending}
        onClose={handleCloseResend}
        onConfirm={handleConfirmResend}
      />

      {/* Logs Modal */}
      <DiagnostikLogsModal
        isOpen={isLogsOpen}
        item={selectedItem}
        logsData={logsData}
        isLoading={isLogsLoading} // ← fix: pakai isLogsLoading, bukan isLoading
        currentPage={logsPage} // ← tambah
        onPageChange={setLogsPage} // ← tambah
        onClose={handleCloseLogs}
      />
    </div>
  )
}

export default DiagnostikList
