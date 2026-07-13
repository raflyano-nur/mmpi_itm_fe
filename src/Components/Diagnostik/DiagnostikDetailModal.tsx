/**
 * @file DiagnostikDetailModal.tsx
 * @description Modal untuk menampilkan detail parameter hasil pemeriksaan diagnostik.
 *
 * Ditampilkan ketika user mengklik tombol "Detail" pada tabel utama.
 * Berisi:
 * - Informasi pasien (nama, waktu pemeriksaan, ID alat)
 * - Tabel semua parameter hasil pemeriksaan
 * - Aksi: Close, Lihat PDF
 *
 * @module Diagnostik/DiagnostikDetailModal
 */

import React, { useMemo, useState } from 'react'
import type { DiagnostikParameter, DiagnosticApiItem } from './types'
import { mapDiagnosticApiToItem, getGenderLabel, calculateAge } from './diagnostikMapper'
import { useGetDiagnosticPdfMutation } from '@/Services/Modules/diagnostics'
import { usePermissionContext } from '@/Permissions'

interface DiagnostikDetailModalProps {
  /** Apakah modal sedang terbuka */
  isOpen: boolean
  /** Data diagnostik dari API */
  item: DiagnosticApiItem | null | undefined
  /** Callback ketika modal ditutup */
  onClose: () => void
}

const DiagnostikDetailModal: React.FC<DiagnostikDetailModalProps> = ({ isOpen, item, onClose }) => {
  // ===== PERMISSION CHECK =====
  const { can } = usePermissionContext()

  // Permission untuk export PDF
  const canExport = can('diagnostics', 'export')

  // Convert API data ke UI format
  const mappedItem = useMemo(() => {
    if (!item) return null
    return mapDiagnosticApiToItem(item)
  }, [item])

  // State untuk PDF download
  const [getPdf, { isLoading: isPdfLoading }] = useGetDiagnosticPdfMutation()

  if (!isOpen || !mappedItem) return null

  // Handler untuk mendownload PDF dengan autentikasi
  const handleLihatPdf = async () => {
    if (!item?.id) return

    try {
      const blob = await getPdf(item.id).unwrap()
      // Create object URL from blob
      const url = window.URL.createObjectURL(blob)
      // Open in new tab
      window.open(url, '_blank')
      // Clean up URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } catch (error) {
      console.error('Gagal mendownload PDF:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity bg-neutral-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="flex items-center justify-center min-h-full p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl transform transition-all border border-neutral-100 max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between flex-shrink-0 px-6 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-lg w-9 h-9 bg-primary-50">
                <svg
                  className="w-5 h-5 text-primary-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-800">Detail Hasil Diagnostik</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Parameter pemeriksaan lengkap</p>
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

          {/* Patient Info - Lebih lengkap dari API */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-neutral-50 bg-neutral-50/50">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Nama Pasien */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center flex-shrink-0 rounded-full w-9 h-9 bg-primary-50">
                  <span className="text-sm font-semibold text-primary-600">
                    {/* {mappedItem.namaPasien.charAt(0).toUpperCase()} */}
                    {mappedItem.namaPasien?.charAt(0)?.toUpperCase() || ''}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Nama Pasien</p>
                  <p className="text-sm font-medium text-neutral-800">{mappedItem.namaPasien}</p>
                </div>
              </div>

              {/* No. Identitas */}
              <div>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wide">No. Identitas</p>
                <p className="text-sm font-medium text-neutral-800">{mappedItem.idNumber || '-'}</p>
              </div>

              {/* Jenis Kelamin & Umur */}
              <div>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Jenis Kelamin</p>
                <p className="text-sm font-medium text-neutral-800">
                  {getGenderLabel(item?.sex)} {item?.birth_time && `(${calculateAge(item.birth_time)})`}
                </p>
              </div>

              {/* Waktu Pemeriksaan */}
              <div>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Waktu Pemeriksaan</p>
                <p className="text-sm font-medium text-neutral-800 flex items-center gap-1.5 mt-0.5">
                  <svg
                    className="w-3.5 h-3.5 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {mappedItem.waktu}
                </p>
              </div>

              {/* ID Alat */}
              <div>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wide">ID Alat</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100 mt-0.5">
                  {mappedItem.idAlat}
                </span>
              </div>

              {/* Kode Device */}
              <div>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Kode Device</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 mt-0.5">
                  {mappedItem.devices_code}
                </span>
              </div>

              {/* Hasil */}
              <div>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Hasil</p>
                <p
                  className={`text-sm font-semibold mt-0.5 ${mappedItem.result === 'Normal' ? 'text-emerald-600' : 'text-amber-600'}`}
                >
                  {mappedItem.result}
                </p>
              </div>

              {/* Institusi */}
              <div>
                <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Nama Institusi</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 mt-0.5">
                  {mappedItem?.institutions?.institutions_name || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Parameter Table - Scrollable */}
          <div className="flex-1 px-6 py-4 overflow-auto">
            <h4 className="mb-3 text-sm font-semibold text-neutral-800">Parameter Pemeriksaan</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="px-3 py-2 font-semibold text-left text-neutral-600">Parameter</th>
                    <th className="px-3 py-2 font-semibold text-left text-neutral-600">Hasil</th>
                    <th className="px-3 py-2 font-semibold text-left text-neutral-600">Satuan</th>
                    <th className="px-3 py-2 font-semibold text-left text-neutral-600">Nilai Rujukan</th>
                    <th className="px-3 py-2 font-semibold text-left text-neutral-600">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {mappedItem.parameters.map((param, index) => {
                    const isAbnormal = param.keterangan !== 'Normal' && param.keterangan !== '-'
                    const keterangan = param.keterangan || '-'
                    const variant =
                      keterangan === 'Normal'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : keterangan === 'Tinggi'
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : keterangan === 'Rendah'
                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                            : 'bg-neutral-50 text-neutral-500 border-neutral-100'
                    return (
                      <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-3 py-2 font-medium text-neutral-800">{param.parameter}</td>
                        <td
                          className={`py-2 px-3 font-semibold ${isAbnormal ? 'text-danger' : 'text-neutral-800'}`}
                        >
                          {param.hasil ?? '-'}
                        </td>
                        <td className="px-3 py-2 text-neutral-400">{param.satuan || '-'}</td>
                        <td className="px-3 py-2 text-neutral-500">{param.nilaiRujukan || '-'}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${variant}`}
                          >
                            {keterangan}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {mappedItem.parameters.length === 0 && (
                <p className="py-4 text-center text-neutral-400">Tidak ada parameter pemeriksaan</p>
              )}
            </div>
          </div>

          {/* Modal Footer - Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 px-6 py-3.5 border-t border-neutral-100 bg-neutral-50/40 flex-shrink-0">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>

            {/* Lihat PDF Button - Requires 'export' permission */}
            {canExport && (
              <button
                onClick={handleLihatPdf}
                disabled={isPdfLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPdfLoading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
                {isPdfLoading ? 'Memuat...' : 'Lihat PDF'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiagnostikDetailModal
