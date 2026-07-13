/**
 * @file DiagnostikLogsModal.tsx
 * @description Modal untuk menampilkan queue logs data diagnostik.
 *
 * Ditampilkan ketika user mengklik tombol "Logs" pada tabel utama.
 * Berisi:
 * - Info diagnostik
 * - Tabel history queue (attempts, status, response, dll)
 *
 * @module Diagnostik/DiagnostikLogsModal
 */

import React, { useMemo, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/Components/General/Datatable'
import type { DiagnostikItem, QueueLogResponse, QueueLogItem } from './types'
import { QUEUE_STATUS_CONFIG } from './types'
import { formatDateTime, formatResponseBody } from './diagnostikMapper'

interface DiagnostikLogsModalProps {
  /** Apakah modal sedang terbuka */
  isOpen: boolean
  /** Data diagnostik */
  item: DiagnostikItem | null
  /** Data logs dari API */
  logsData: QueueLogResponse | undefined
  /** Status loading */
  isLoading?: boolean
  /** Halaman aktif saat ini */
  currentPage: number
  /** Callback ketika user ganti halaman */
  onPageChange: (page: number) => void
  /** Callback ketika modal ditutup */
  onClose: () => void
}

const DiagnostikLogsModal: React.FC<DiagnostikLogsModalProps> = ({
  isOpen,
  item,
  logsData,
  isLoading,
  currentPage,
  onPageChange,
  onClose,
}) => {
  const [detailState, setDetailState] = useState<{
    title: string
    content: string
    tone: 'default' | 'danger'
  } | null>(null)

  // Extract items dari paginated object
  const logs = useMemo(() => {
    return logsData?.data?.logs?.data ?? []
  }, [logsData])

  // Meta pagination dari server
  const paginatedMeta = logsData?.data?.logs

  // Column definitions
  const columns: ColumnDef<QueueLogItem>[] = useMemo(
    () => [
      {
        accessorKey: 'attempt',
        header: 'Attempt',
        cell: ({ row }) => (
          <span className="text-sm font-medium text-neutral-800">#{row.original.attempt}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status
          const config = QUEUE_STATUS_CONFIG[status] || QUEUE_STATUS_CONFIG.pending
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${config.bg} ${config.text} border`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              {config.label}
            </span>
          )
        },
      },
      {
        accessorKey: 'response_code',
        header: 'Response Code',
        cell: ({ row }) => {
          const code = row.original.response_code
          if (code === null || code === undefined) {
            return <span className="text-sm text-neutral-400">-</span>
          }
          const isSuccess = code >= 200 && code < 300
          return (
            <span
              className={`text-sm font-mono ${
                isSuccess ? 'text-emerald-600' : code >= 400 ? 'text-red-600' : 'text-amber-600'
              }`}
            >
              {code}
            </span>
          )
        },
      },
      {
        accessorKey: 'sent_at',
        header: 'Waktu Kirim',
        cell: ({ row }) => (
          <span className="text-sm text-neutral-600">
            {row.original.sent_at ? formatDateTime(row.original.sent_at) : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'response_body',
        header: 'Response',
        cell: ({ row }) => {
          const body = row.original.response_body
          const error = row.original.error_message

          if (error || !body) return <span className="text-sm text-neutral-400">-</span>

          const formatted = formatResponseBody(body)

          return (
            <div className="max-w-xs">
              <button
                onClick={() => {
                  setDetailState({
                    title: `Response Attempt #${row.original.attempt}`,
                    content: formatted,
                    tone: 'default',
                  })
                }}
                className="text-xs text-primary-600 hover:text-primary-700 underline cursor-pointer"
              >
                Lihat Detail
              </button>
            </div>
          )
        },
      },
      {
        accessorKey: 'error_message',
        header: 'Error Message',
        cell: ({ row }) => {
          const error = row.original.error_message
          if (!error) return <span className="text-sm text-neutral-400">-</span>

          const formatted = formatResponseBody(error)

          return (
            <button
              onClick={() =>
                setDetailState({
                  title: `Error Message Attempt #${row.original.attempt}`,
                  content: formatted,
                  tone: 'danger',
                })
              }
              className="text-xs text-primary-600 hover:text-primary-700 underline cursor-pointer"
            >
              Lihat Detail
            </button>
          )
        },
      },
    ],
    [],
  )

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl transform transition-all border border-neutral-100 max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-neutral-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-800">History Logs Diagnostik</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Riwayat pengiriman data ke server</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <svg
                className="w-4.5 h-4.5 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Summary Info */}
          <div className="px-6 py-4 border-b border-neutral-50 bg-neutral-50/50 flex-shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Nama Pasien</p>
                <p className="text-sm font-medium text-neutral-800 mt-0.5">{item.namaPasien}</p>
              </div>
              <div>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wide">ID Diagnostik</p>
                <p className="text-sm font-medium text-neutral-800 mt-0.5">#{item.id}</p>
              </div>
              <div>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Total Attempt</p>
                <p className="text-sm font-medium text-neutral-800 mt-0.5">
                  {logsData?.data?.total_attempt ?? 0} kali
                </p>
              </div>
              <div>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Status Terakhir</p>
                <div className="mt-0.5">
                  {(() => {
                    const status = logsData?.data?.latest_status || item.queueStatus || 'pending'
                    const config = QUEUE_STATUS_CONFIG[status] || QUEUE_STATUS_CONFIG.pending
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${config.bg} ${config.text} border`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                        {config.label}
                      </span>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Logs Table — server-side pagination */}
          <div className="px-6 py-4 overflow-auto flex-1">
            <h4 className="text-sm font-semibold text-neutral-800 mb-3">Riwayat Pengiriman</h4>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-3 border-neutral-200 border-t-primary-500 rounded-full animate-spin" />
              </div>
            ) : logs.length > 0 ? (
              <DataTable<QueueLogItem>
                data={logs}
                columns={columns}
                pageSize={paginatedMeta?.per_page ?? 5}
                showSearch={false}
                isLoading={false}
                emptyMessage="Tidak ada logs"
                // Server-side pagination mengikuti kontrak DataTable (callback menerima 0-based page index)
                currentPage={paginatedMeta?.current_page ?? currentPage}
                lastPage={paginatedMeta?.last_page}
                totalData={paginatedMeta?.total}
                apiFrom={paginatedMeta?.from}
                apiTo={paginatedMeta?.to}
                onPageChange={(pageIndex) => onPageChange(pageIndex + 1)}
              />
            ) : (
              <div className="text-center py-12 text-neutral-400">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-neutral-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-sm">Tidak ada queue logs</p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-neutral-100 bg-neutral-50/40 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Detail Sub-modal */}
      {detailState && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            onClick={() => setDetailState(null)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <div>
                <h4 className="text-base font-semibold text-neutral-800">{detailState.title}</h4>
                <p className="text-xs text-neutral-400 mt-0.5">Detail isi log pengiriman</p>
              </div>
              <button
                onClick={() => setDetailState(null)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <svg
                  className="w-4.5 h-4.5 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="px-5 py-4 max-h-[60vh] overflow-auto">
              <pre
                className={`whitespace-pre-wrap break-words rounded-xl border p-4 text-xs leading-6 ${
                  detailState.tone === 'danger'
                    ? 'bg-red-50 border-red-100 text-red-700'
                    : 'bg-neutral-950 border-neutral-900 text-neutral-100'
                }`}
              >
                {detailState.content}
              </pre>
            </div>
            <div className="flex justify-end px-5 py-3 border-t border-neutral-100 bg-neutral-50/40">
              <button
                onClick={() => setDetailState(null)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DiagnostikLogsModal
