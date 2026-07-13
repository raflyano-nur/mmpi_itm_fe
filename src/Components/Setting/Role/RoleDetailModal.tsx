/**
 * @file RoleDetailModal.tsx
 * @description Modal untuk melihat detail role
 */

import React from 'react'
import {
  HiXMark,
  HiShieldCheck,
  HiUserGroup,
  HiCalendar,
  HiClock,
  HiOutlineCog
} from 'react-icons/hi2'
import type { Role } from './types'
import { PERMISSION_LABELS, PERMISSION_GROUPS, getRoleBadgeColor, getRoleIconColor } from './types'

interface Props {
  isOpen: boolean
  item: Role | null
  isLoading?: boolean
  onClose: () => void
}

const RoleDetailModal: React.FC<Props> = ({
  isOpen,
  item,
  isLoading = false,
  onClose,
}) => {
  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative w-full max-w-2xl p-8 mx-4 bg-white shadow-2xl rounded-xl">
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 rounded-full border-primary-500 border-t-transparent animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (!item) return null

  const iconColor = getRoleIconColor(item.name)
  const badgeColor = getRoleBadgeColor(item.name)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor.bg}`}>
              <HiShieldCheck className={`w-5 h-5 ${iconColor.icon}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Detail Role</h2>
              <p className="text-sm text-gray-500">
                Informasi lengkap role {item.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-lg hover:bg-gray-100"
          >
            <HiXMark className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto max-h-[70vh]">
          {/* Role Info Card */}
          <div className="p-4 mb-6 border border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {item.description || <span className="italic text-gray-400">Tidak ada deskripsi</span>}
                </p>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <span className={`px-3 py-1.5 text-xs font-medium rounded-full border ${badgeColor}`}>
                  {item.name}
                </span>
                <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                  item.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {item.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-blue-50">
              <HiUserGroup className="w-5 h-5 mb-2 text-blue-600" />
              <p className="text-xs text-gray-500">Total User</p>
              <p className="text-lg font-semibold text-gray-900">{item.usersCount} user</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <HiCalendar className="w-5 h-5 mb-2 text-green-600" />
              <p className="text-xs text-gray-500">Dibuat</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(item.createdAt)}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <HiClock className="w-5 h-5 mb-2 text-yellow-600" />
              <p className="text-xs text-gray-500">Diupdate</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(item.updatedAt)}</p>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
              <HiOutlineCog className="w-4 h-4" />
              Hak Akses ({item.permissions.length})
            </h3>

            {item.permissions.length === 0 ? (
              <p className="text-sm italic text-gray-500">Tidak ada hak akses yang ditetapkan</p>
            ) : (
              <div className="space-y-3">
                {PERMISSION_GROUPS.map((group) => {
                  const groupPermissions = group.permissions.filter(p =>
                    item.permissions.includes(p)
                  )

                  if (groupPermissions.length === 0) return null

                  return (
                    <div key={group.name} className="overflow-hidden border border-gray-200 rounded-lg">
                      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                        <h4 className="text-xs font-medium text-gray-600">{group.name}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2 p-3">
                        {groupPermissions.map((permission) => (
                          <div
                            key={permission}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                            {PERMISSION_LABELS[permission]}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoleDetailModal