/**
 * @file DiagnostikResendModal.tsx
 * @description Modal untuk resend diagnostik ke semua target atau target tertentu.
 *
 * Mendukung 2 mode payload:
 * - Resend semua target => {}
 * - Resend target tertentu => { target_ids: [1, 2] }
 *
 * @module Diagnostik/DiagnostikResendModal
 */

import React, { useEffect, useMemo, useState } from 'react'
import { HiArrowPath, HiCheckCircle, HiEye, HiEyeSlash, HiPaperAirplane, HiXMark } from 'react-icons/hi2'
import type { ResendDiagnosticBody } from '@/Services/Modules/diagnostics'
import { useGetListDispatchTargetQuery } from '@/Services/Modules/dispatchTargets'
import type { DispatchTargetItem } from '@/Services/Modules/dispatchTargets'
import type { DiagnostikItem } from './types'

type ResendMode = 'all' | 'specific'

interface DiagnostikResendModalProps {
  isOpen: boolean
  item: DiagnostikItem | null
  isLoading?: boolean
  onClose: () => void
  onConfirm: (body: ResendDiagnosticBody) => void
}

const AUTH_BADGE_MAP: Record<DispatchTargetItem['auth_type'], string> = {
  bearer: 'bg-blue-50 text-blue-700 border-blue-200',
  api_key_header: 'bg-amber-50 text-amber-700 border-amber-200',
  basic_auth: 'bg-violet-50 text-violet-700 border-violet-200',
  none: 'bg-neutral-100 text-neutral-600 border-neutral-200',
}

const AUTH_LABEL_MAP: Record<DispatchTargetItem['auth_type'], string> = {
  bearer: 'Bearer',
  api_key_header: 'API Key',
  basic_auth: 'Basic Auth',
  none: 'Tanpa Auth',
}

const DiagnostikResendModal: React.FC<DiagnostikResendModalProps> = ({
  isOpen,
  item,
  isLoading = false,
  onClose,
  onConfirm,
}) => {
  const [mode, setMode] = useState<ResendMode>('all')
  const [selectedTargetIds, setSelectedTargetIds] = useState<number[]>([])
  const [showPayloadPreview, setShowPayloadPreview] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { data: dispatchTargetsResponse, isLoading: isLoadingTargets } = useGetListDispatchTargetQuery(
    {
      page: 1,
      per_page: 100,
      is_active: true,
      with_deleted: false,
      sort_by: 'name',
      sort_dir: 'asc',
    },
    { skip: !isOpen },
  )

  const dispatchTargets = useMemo(
    () => dispatchTargetsResponse?.data?.data?.filter((target) => !target.deleted_at) ?? [],
    [dispatchTargetsResponse],
  )

  const payloadPreview = useMemo<ResendDiagnosticBody>(
    () => (mode === 'all' ? {} : { target_ids: selectedTargetIds }),
    [mode, selectedTargetIds],
  )

  useEffect(() => {
    if (!isOpen) return

    setMode('all')
    setSelectedTargetIds([])
    setShowPayloadPreview(false)
    setErrorMessage('')
  }, [isOpen, item?.id])

  if (!isOpen || !item) return null

  const toggleTarget = (targetId: number) => {
    setSelectedTargetIds((prev) =>
      prev.includes(targetId) ? prev.filter((id) => id !== targetId) : [...prev, targetId],
    )
    setErrorMessage('')
  }

  const handleConfirm = () => {
    if (mode === 'specific' && selectedTargetIds.length === 0) {
      setErrorMessage('Pilih minimal satu dispatch target untuk mode target tertentu.')
      return
    }

    onConfirm(payloadPreview)
  }

  const allSelected = dispatchTargets.length > 0 && selectedTargetIds.length === dispatchTargets.length

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn">
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <HiArrowPath className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-800">Resend Diagnostik</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Pilih semua target atau tentukan target pengiriman ulang
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <HiXMark className="w-4.5 h-4.5 text-neutral-400" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5 max-h-[72vh] overflow-y-auto">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <HiPaperAirplane className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Data akan dikirim ulang</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Gunakan mode semua target atau pilih target tertentu.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-xl border border-neutral-100 p-4">
              <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">
                Data Diagnostik
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-neutral-500">Nama Pasien</span>
                  <span className="font-medium text-neutral-800 text-right">{item.namaPasien}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-neutral-500">ID Alat</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
                    {item.devices_code}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-neutral-500">Hasil</span>
                  <span
                    className={`font-medium ${item.result === 'Normal' ? 'text-emerald-600' : 'text-amber-600'}`}
                  >
                    {item.result}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-neutral-500">Status Queue</span>
                  <span className="text-neutral-700">{item.queueStatus || 'Belum ada status'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-neutral-800">Mode Resend</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode('all')
                    setErrorMessage('')
                  }}
                  className={`
                    rounded-xl border p-4 text-left transition-all cursor-pointer
                    ${mode === 'all' ? 'border-primary-300 bg-primary-50 shadow-sm' : 'border-neutral-200 hover:border-primary-200 hover:bg-neutral-50'}
                  `}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">Resend - Semua Target</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Kirim ke semua dispatch target aktif dengan body kosong.
                      </p>
                    </div>
                    {mode === 'all' && <HiCheckCircle className="w-5 h-5 text-primary-500" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('specific')
                    setErrorMessage('')
                  }}
                  className={`
                    rounded-xl border p-4 text-left transition-all cursor-pointer
                    ${mode === 'specific' ? 'border-primary-300 bg-primary-50 shadow-sm' : 'border-neutral-200 hover:border-primary-200 hover:bg-neutral-50'}
                  `}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">Resend - Target Tertentu</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Pilih target yang ingin menerima resend secara spesifik.
                      </p>
                    </div>
                    {mode === 'specific' && <HiCheckCircle className="w-5 h-5 text-primary-500" />}
                  </div>
                </button>
              </div>
            </div>

            {mode === 'specific' && (
              <div className="rounded-xl border border-neutral-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Pilih Dispatch Target</p>
                    <p className="text-xs text-neutral-400">
                      Hanya target aktif yang ditampilkan untuk resend manual
                    </p>
                  </div>
                  {dispatchTargets.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTargetIds(allSelected ? [] : dispatchTargets.map((target) => target.id))
                      }
                      className="text-xs font-medium text-primary-600 hover:text-primary-700 cursor-pointer"
                    >
                      {allSelected ? 'Batal Pilih Semua' : 'Pilih Semua'}
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
                  {isLoadingTargets ? (
                    <div className="px-4 py-8 text-center text-sm text-neutral-500">
                      <div className="w-6 h-6 mx-auto border-2 border-neutral-200 border-t-primary-500 rounded-full animate-spin" />
                      <p className="mt-2">Memuat dispatch target...</p>
                    </div>
                  ) : dispatchTargets.length > 0 ? (
                    dispatchTargets.map((target) => {
                      const checked = selectedTargetIds.includes(target.id)

                      return (
                        <label
                          key={target.id}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTarget(target.id)}
                            className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-neutral-800">{target.name}</p>
                              <span
                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${AUTH_BADGE_MAP[target.auth_type]}`}
                              >
                                {AUTH_LABEL_MAP[target.auth_type]}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-neutral-500 break-all">{target.url}</p>
                            {target.description && (
                              <p className="mt-1 text-xs text-neutral-400">{target.description}</p>
                            )}
                          </div>
                        </label>
                      )
                    })
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-neutral-500">
                      Belum ada dispatch target aktif yang bisa dipilih.
                    </div>
                  )}
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            <div className="hidden rounded-xl border border-neutral-200 bg-neutral-950 text-neutral-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowPayloadPreview((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-white/10 text-left"
              >
                <div>
                  <p className="text-sm font-semibold">Preview Body Resend</p>
                  <p className="text-xs text-neutral-400">Payload yang akan dikirim ke endpoint resend</p>
                </div>
                {showPayloadPreview ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
              </button>
              {showPayloadPreview && (
                <pre className="px-4 py-4 text-xs leading-6 overflow-x-auto">
                  {JSON.stringify(payloadPreview, null, 2)}
                </pre>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-neutral-100 bg-neutral-50/40">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <HiXMark className="w-4 h-4" />
              Batal
            </button>

            <button
              onClick={handleConfirm}
              disabled={isLoading || (mode === 'specific' && isLoadingTargets)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <HiArrowPath className="w-4 h-4" />
                  Kirim Ulang
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiagnostikResendModal
