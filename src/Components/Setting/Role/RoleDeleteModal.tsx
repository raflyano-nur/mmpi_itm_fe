/**
 * @file RoleDeleteModal.tsx
 * @description Modal konfirmasi hapus role
 */

import React from 'react'
import { HiExclamationTriangle, HiXMark } from 'react-icons/hi2'
import type { Role } from './types'
import { getRoleBadgeColor } from './types'

interface Props {
  isOpen: boolean
  item: Role | null
  isDeleting?: boolean
  onClose: () => void
  onConfirm: (id: number) => void
}

const RoleDeleteModal: React.FC<Props> = ({
  isOpen,
  item,
  isDeleting = false,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !item) return null

  const isRoleUsed = item.usersCount > 0
  const badgeColor = getRoleBadgeColor(item.name)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md mx-4 bg-white shadow-2xl rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50">
              <HiExclamationTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Hapus Role</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <HiXMark className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {isRoleUsed ? (
            <>
              <div className="p-4 mb-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">⚠️ Role sedang digunakan</span>
                  <br />
                  Role ini memiliki {item.usersCount} user yang masih aktif.
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Tidak dapat menghapus role yang masih memiliki user.
                Silakan pindahkan atau hapus user terlebih dahulu.
              </p>
            </>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-600">
                Apakah Anda yakin ingin menghapus role berikut?
              </p>
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {item.description || <span className="italic">Tidak ada deskripsi</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${badgeColor}`}>
                      {item.name}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-red-600">
                ⚠️ Tindakan ini tidak dapat dibatalkan. Semua data role akan dihapus permanen.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Batal
          </button>
          {!isRoleUsed && (
            <button
              onClick={() => onConfirm(item.id)}
              disabled={isDeleting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isDeleting && (
                <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
              )}
              Hapus Role
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default RoleDeleteModal