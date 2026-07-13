import React from 'react'
import { HiExclamationTriangle, HiXMark } from 'react-icons/hi2'
import type { DispatchTargetItem } from './types'

interface DispatchTargetDeleteModalProps {
  isOpen: boolean
  item: DispatchTargetItem | null
  isDeleting?: boolean
  onClose: () => void
  onConfirm: (id: number) => void
}

const DispatchTargetDeleteModal: React.FC<DispatchTargetDeleteModalProps> = ({
  isOpen,
  item,
  isDeleting = false,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center">
              <HiExclamationTriangle className="w-5 h-5 text-danger" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-800">Hapus Dispatch Target</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <HiXMark className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-neutral-600">Apakah Anda yakin ingin menghapus target berikut?</p>
          <div className="mt-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <p className="text-sm font-semibold text-neutral-800">{item.name}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{item.url}</p>
          </div>
          <p className="mt-3 text-xs text-danger/80">
            Tindakan ini akan memindahkan data ke arsip terhapus sampai dipulihkan kembali.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/40">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm(item.id)}
            disabled={isDeleting}
            className="px-5 py-2.5 text-sm font-medium text-white bg-danger rounded-lg hover:bg-danger/90 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}

export default DispatchTargetDeleteModal
