/**
 * @file UserPermissionPanel.tsx
 * @description Panel untuk menampilkan dan mengelola hak akses per role.
 *
 * Menampilkan:
 * - Info role yang dipilih (nama role)
 * - Daftar resource dikelompokkan per resource_id (label dari field `description`)
 * - Toggle switch per permission (berdasarkan field `granted`)
 * - Tombol simpan perubahan
 *
 * Data bersumber dari API response `getRolePermission` (RoleResourceItem[]).
 * Transformasi data menggunakan utility functions dari `permissionsUtils.ts`.
 *
 * @module Setting/Permissions/UserPermissionPanel
 */

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { HiUser, HiCheck, HiArrowLeft, HiShieldCheck, HiSquares2X2 } from 'react-icons/hi2'
import type { RoleItem } from './types'
import type { RoleResourceItem } from '@/Services/Modules/permissions/getRolePermission'
import {
  flattenPermissions,
  groupPermissionsByResource,
  countGranted,
  isAllGranted,
  isSomeGranted,
  togglePermissionById,
  togglePermissionsByResource,
  toggleAllPermissions,
  buildChangedResourcesPayload,
  type FlatPermissionItem,
  type ResourcePermissionPayload,
} from './permissionsUtils'

// ============================================================
// TOGGLE SWITCH COMPONENT (reusable)
// ============================================================

interface ToggleSwitchProps {
  enabled: boolean
  indeterminate?: boolean
  onClick: () => void
  title?: string
}

/**
 * Komponen toggle switch reusable.
 * Ukuran: 36px x 20px, bulat 16px x 16px, padding 2px.
 */
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, indeterminate = false, onClick, title }) => {
  const bgColor = enabled ? 'bg-primary-500' : indeterminate ? 'bg-primary-300' : 'bg-neutral-300'
  // Track: w-9 (36px), h-5 (20px). Knob: w-4 (16px), h-4 (16px).
  // OFF position: left-0.5 (2px). ON position: left-[18px] (36 - 16 - 2 = 18px).
  const knobPosition = enabled || indeterminate ? 'left-[18px]' : 'left-0.5'

  return (
    <button
      onClick={onClick}
      className={`relative shrink-0 w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer ${bgColor}`}
      title={title}
      type="button"
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${knobPosition}`}
      />
    </button>
  )
}

// ============================================================
// PROPS INTERFACE
// ============================================================

interface UserPermissionPanelProps {
  /** Data role yang dipilih */
  role: RoleItem
  /** Data resources + permissions dari API */
  resources: RoleResourceItem[]
  /** Loading state saat simpan */
  isSaving?: boolean
  /** Callback kembali ke daftar role */
  onBack: () => void
  /** Callback simpan perubahan permissions (mengembalikan true jika berhasil) */
  onSave: (roleId: number, payload: ResourcePermissionPayload[]) => Promise<boolean>
}

// ============================================================
// COMPONENT
// ============================================================

const UserPermissionPanel: React.FC<UserPermissionPanelProps> = ({
  role,
  resources,
  isSaving = false,
  onBack,
  onSave,
}) => {
  // ===== STATE =====

  /** State lokal permissions (flat array untuk kemudahan manipulasi) */
  const [permissions, setPermissions] = useState<FlatPermissionItem[]>([])
  /** Apakah ada perubahan yang belum disimpan */
  const [hasChanges, setHasChanges] = useState(false)

  /** Ref untuk menyimpan state awal (dari API) agar bisa dibandingkan saat save */
  const originalPermissionsRef = useRef<FlatPermissionItem[]>([])

  // ===== EFFECTS =====

  /**
   * Inisialisasi permissions dari data API saat resources berubah.
   * Menggunakan flattenPermissions untuk mengubah nested structure ke flat array.
   */
  useEffect(() => {
    const flat = flattenPermissions(resources)
    setPermissions(flat)
    originalPermissionsRef.current = flat
    setHasChanges(false)
  }, [resources])

  // ===== DERIVED STATE =====

  /** Permissions dikelompokkan berdasarkan resource_id */
  const permissionGroups = useMemo(() => groupPermissionsByResource(permissions), [permissions])

  console.log('PERMISSION GROUP : ', permissionGroups)

  /** Jumlah permission yang aktif */
  const grantedCount = useMemo(() => countGranted(permissions), [permissions])

  /** Total permission */
  const totalCount = permissions.length

  // ===== HANDLERS =====

  /**
   * Toggle satu permission berdasarkan resource_id + permission id.
   * Menggunakan kombinasi resource_id + id sebagai unique key.
   */
  const handleToggle = (resourceId: number, permissionId: number) => {
    setPermissions((prev) => togglePermissionById(prev, resourceId, permissionId))
    setHasChanges(true)
  }

  /**
   * Toggle semua permission dalam satu resource.
   * Jika semua aktif → nonaktifkan semua. Jika ada yang nonaktif → aktifkan semua.
   */
  const handleToggleResource = (resourceId: number) => {
    setPermissions((prev) => togglePermissionsByResource(prev, resourceId))
    setHasChanges(true)
  }

  /**
   * Toggle semua permission sekaligus.
   * Jika semua aktif → nonaktifkan semua. Jika ada yang nonaktif → aktifkan semua.
   */
  const handleToggleAll = () => {
    setPermissions((prev) => toggleAllPermissions(prev))
    setHasChanges(true)
  }

  /**
   * Simpan perubahan permissions ke API.
   * Hanya mengirim resource yang memiliki perubahan.
   */
  const handleSave = async () => {
    const payload = buildChangedResourcesPayload(permissions, originalPermissionsRef.current)
    console.log('Changed resources payload:', JSON.stringify(payload, null, 2))
    const success = await onSave(role.id, payload)
    if (success) {
      setHasChanges(false)
    }
  }

  /**
   * Reset permissions ke state awal (dari data API).
   */
  const handleReset = () => {
    setPermissions(flattenPermissions(resources))
    setHasChanges(false)
  }

  // ===== RENDER =====

  return (
    <div className="space-y-4">
      {/* ── Header: Role Info + Back ── */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Back button + Role info */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              title="Kembali ke daftar role"
            >
              <HiArrowLeft className="w-5 h-5 text-neutral-500" />
            </button>

            <div className="w-11 h-11 rounded-full bg-primary-50 flex items-center justify-center">
              <HiUser className="w-6 h-6 text-primary-500" />
            </div>

            <div>
              <h3 className="text-base font-bold text-neutral-800 uppercase">{role.role_name}</h3>
              {role.description && <p className="text-xs text-neutral-400 mt-0.5">{role.description}</p>}
            </div>
          </div>

          {/* Right: Counter + Toggle All */}
          <div className="flex items-center gap-3">
            {/* Counter aktif/total */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <HiShieldCheck className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-neutral-600">
                <span className="font-semibold text-primary-600">{grantedCount}</span>
                <span className="text-neutral-400"> / {totalCount}</span>
                <span className="text-neutral-400 ml-1 hidden sm:inline">permission aktif</span>
              </span>
            </div>

            {/* Toggle All button */}
            <button
              onClick={handleToggleAll}
              className="px-3 py-1.5 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all cursor-pointer"
            >
              {isAllGranted(permissions) ? 'Nonaktifkan Semua' : 'Aktifkan Semua'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Permission Groups ── */}
      {permissionGroups.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-10 text-center">
          <HiShieldCheck className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-400">Tidak ada data permission untuk role ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
          {permissionGroups.map((group) => {
            const allEnabled = isAllGranted(group.items)
            const someEnabled = isSomeGranted(group.items)
            const enabledInGroup = countGranted(group.items)

            return (
              <div
                key={group.resource_id}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-50/60 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <HiSquares2X2 className="w-4 h-4 text-primary-500" />
                    {/* Gunakan description resource sebagai label kategori */}
                    <span className="text-sm font-semibold text-neutral-700">{group.category}</span>
                    <span className="text-xs text-neutral-400">
                      ({enabledInGroup}/{group.items.length})
                    </span>
                  </div>

                  {/* Toggle resource */}
                  <ToggleSwitch
                    enabled={allEnabled}
                    indeterminate={someEnabled}
                    onClick={() => handleToggleResource(group.resource_id)}
                    title={allEnabled ? 'Nonaktifkan semua' : 'Aktifkan semua'}
                  />
                </div>

                {/* Permission Items */}
                <div className="divide-y divide-neutral-50">
                  {group.items.map((perm) => (
                    <div
                      key={`${perm.resource_id}_${perm.id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-primary-50/20 transition-colors"
                    >
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-medium text-neutral-700 capitalize">
                          {perm.permission_name}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">{perm.resource_name}</p>
                      </div>

                      {/* Toggle Switch */}
                      <ToggleSwitch
                        enabled={perm.granted}
                        onClick={() => handleToggle(perm.resource_id, perm.id)}
                        title={perm.granted ? 'Nonaktifkan' : 'Aktifkan'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Save Bar (sticky, muncul saat ada perubahan) ── */}
      {hasChanges && (
        <div className="sticky bottom-5 bg-white rounded-xl border border-primary-200 shadow-lg p-4 flex items-center justify-between animate-fadeIn">
          <p className="text-sm text-neutral-600">Anda memiliki perubahan yang belum disimpan</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all cursor-pointer disabled:opacity-50"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <HiCheck className="w-4 h-4" />
              )}
              Simpan Perubahan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserPermissionPanel
