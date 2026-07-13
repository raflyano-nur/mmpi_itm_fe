/**
 * @file MainPermissions.tsx
 * @description Komponen utama untuk modul Hak Akses.
 *
 * Alur:
 * 1. Tampilkan tabel daftar role
 * 2. User klik "Pilih" → panggil API getRolePermission
 * 3. Jika berhasil → tampilkan UserPermissionPanel dengan data permissions
 * 4. Panel menampilkan nama role + daftar resource/permissions dengan toggle
 * 5. Simpan perubahan
 *
 * @module Setting/Permissions/MainPermissions
 */

import React, { useState, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/Components/General/Datatable'
import UserPermissionPanel from './UserPermissionPanel'
import type { RoleItem } from './types'
import { HiHandRaised } from 'react-icons/hi2'
import {
  useGetListRoleQuery,
  useLazyGetRolePermissionQuery,
  usePostRolePermissionMutation,
} from '@/Services/Modules/permissions'
import { extractData } from '@/Utils/dataMapper'
import type { RoleResourceItem } from '@/Services/Modules/permissions/getRolePermission'
import type { ResourcePermissionPayload } from './permissionsUtils'
import { useNotification } from '@/Components/General/Notification'

// ============================================================
// TYPES
// ============================================================

/** State untuk menyimpan role yang sedang dipilih beserta data permissions-nya */
interface SelectedRoleState {
  role: RoleItem
  resources: RoleResourceItem[]
}

// ============================================================
// COMPONENT
// ============================================================

const MainPermissions: React.FC = () => {
  // ===== STATE =====
  const [selectedRole, setSelectedRole] = useState<SelectedRoleState | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingSelected, setIsLoadingSelected] = useState<boolean>(false)

  // ===== API HOOKS =====
  const { data: roleData, isLoading: isLoadingListRole } = useGetListRoleQuery()
  const [getRolePermissions] = useLazyGetRolePermissionQuery()
  const [postRolePermission] = usePostRolePermissionMutation()

  // ===== NOTIFICATION =====
  const { showNotification, contextHolder } = useNotification()

  /** Daftar role dari API, di-extract dari nested response */
  const roleList = useMemo(() => extractData(roleData, 'data.data') as RoleItem[], [roleData])

  // ===== HANDLERS =====

  /**
   * Handler saat user klik tombol "Pilih" pada baris role.
   * Memanggil API untuk mendapatkan permissions role tersebut,
   * lalu menyimpan hasilnya ke state untuk ditampilkan di panel.
   */
  const handleSelectRole = async (role: RoleItem) => {
    try {
      setIsLoadingSelected(true)
      const res = await getRolePermissions({ id: role?.id }).unwrap()

      if (res?.status === 'success') {
        setSelectedRole({
          role,
          resources: res.data ?? [],
        })
      } else {
        setSelectedRole(null)
      }
    } catch (error) {
      console.error('Gagal memuat permissions role:', error)
      setSelectedRole(null)
    } finally {
      setTimeout(() => setIsLoadingSelected(false), 500)
    }
  }

  /** Handler kembali ke tabel daftar role */
  const handleBack = () => {
    setSelectedRole(null)
  }

  /**
   * Handler simpan perubahan permissions.
   * Mengirim data ke API postRolePermission dengan:
   * - id: role.id (dari data role yang dipilih)
   * - body: array ResourcePermissionPayload (format sesuai RolePermissionBodyRequest[])
   *
   * @param roleId - ID role yang diupdate
   * @param payload - Array ResourcePermissionPayload (hanya resource yang berubah)
   */
  const handleSavePermissions = async (
    roleId: number,
    payload: ResourcePermissionPayload[],
  ): Promise<boolean> => {
    setIsSaving(true)
    try {
      const res = await postRolePermission({ id: roleId, body: payload }).unwrap()

      if (res?.status === 'success') {
        showNotification({
          title: 'Berhasil',
          description: res?.message ?? 'Hak akses berhasil disimpan',
          type: 'success',
        })

        // Refetch data permissions terbaru agar state ter-update
        const refetchRes = await getRolePermissions({ id: roleId }).unwrap()
        if (refetchRes?.status === 'success' && selectedRole) {
          setSelectedRole({
            role: selectedRole.role,
            resources: refetchRes.data ?? [],
          })
        }

        return true
      } else {
        showNotification({
          title: 'Gagal',
          description: res?.message ?? 'Gagal menyimpan hak akses',
          type: 'error',
        })
        return false
      }
    } catch (error: any) {
      console.error('Gagal menyimpan permissions:', error)
      showNotification({
        title: 'Error',
        description: error?.data?.message ?? 'Terjadi kesalahan saat menyimpan hak akses',
        type: 'error',
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  // ===== COLUMN DEFINITIONS =====

  const columns: ColumnDef<RoleItem, any>[] = useMemo(
    () => [
      {
        accessorKey: 'role_name',
        header: 'Role',
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2.5 py-1 uppercase rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100">
            {row.original.role_name}
          </span>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => {
          const isActive = row.original.is_active === true
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isActive
                  ? 'bg-success/10 text-success border-success/20'
                  : 'bg-neutral-100 text-neutral-500 border-neutral-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success' : 'bg-neutral-400'}`} />
              {isActive ? 'Aktif' : 'Nonaktif'}
            </span>
          )
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => (
          <button
            onClick={() => handleSelectRole(row.original)}
            disabled={isLoadingSelected}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-all cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoadingSelected ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <HiHandRaised className="w-3.5 h-3.5" />
            )}
            Pilih
          </button>
        ),
      },
    ],
    [isLoadingSelected],
  )

  // ===== RENDER =====

  // Jika role sudah dipilih, tampilkan panel permissions
  if (selectedRole) {
    return (
      <>
        {contextHolder}
        <UserPermissionPanel
          role={selectedRole.role}
          resources={selectedRole.resources}
          isSaving={isSaving}
          onBack={handleBack}
          onSave={handleSavePermissions}
        />
      </>
    )
  }

  // Default: tampilkan tabel daftar role
  return (
    <div className="space-y-4">
      {contextHolder}
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-800">Hak Akses Role</h3>
        <p className="text-sm text-neutral-500">
          Pilih role untuk mengatur hak akses resource yang dapat diakses
        </p>
      </div>

      {/* Table */}
      <DataTable
        data={roleList}
        columns={columns}
        isLoading={isLoadingListRole}
        pageSize={10}
        showSearch
        searchPlaceholder="Cari role..."
        emptyMessage="Belum ada data role"
      />
    </div>
  )
}

export default MainPermissions
