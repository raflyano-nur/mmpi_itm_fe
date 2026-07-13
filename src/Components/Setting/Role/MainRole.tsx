/**
 * @file MainRole.tsx
 * @description Halaman utama manajemen role dengan API integration
 * NOTE: Tidak ada field "type" dari API — badge & filter dinamis dari role_name
 */

import React, { useState, useMemo, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/Components/General/Datatable'
import RoleFormModal from './RoleFormModal'
import RoleDeleteModal from './RoleDeleteModal'
import RoleDetailModal from './RoleDetailModal'
import type { Role, RoleFormData, RoleListParams, ApiRole } from './types'
import { transformApiRole, getRoleBadgeColor, getRoleIconColor } from './types'
import { useNotification } from '@/Components/General/Notification'

import {
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiEye,
  HiShieldCheck,
  HiUserGroup,
  HiArrowPath,
} from 'react-icons/hi2'

// Import API hooks
import {
  useGetRoleListQuery,
  useGetRoleByIdQuery,
  usePostRoleMutation,
  usePutRoleMutation,
  useDeleteRoleMutation,
  usePatchRoleToggleActiveMutation,
  usePatchRoleRestoreMutation,
} from '@/Services/Modules/Roles/rolesApi'
import { useGetUserListQuery } from '@/Services/Modules/Users'

// Import dari Redux
import { useSelector } from 'react-redux'
import { RootState } from '@/Store'
import { usePermission } from '@/Permissions'

const MainRole: React.FC = () => {
  // 🔐 Ambil data dari Redux store
  const auth = useSelector((state: RootState) => state.AuthSlicer)
  const token = auth?.BearerToken
  const authUser = auth?.user
  const { showNotification, contextHolder } = useNotification()

  // Permission check
  const { can } = usePermission('roles')

  // State untuk filter dan pagination
  const [params, setParams] = useState<RoleListParams>({
    page: 1,
    per_page: 10,
    sort_by: 'role_name',
    sort_order: 'asc',
    with_deleted: false,
  })

  // State untuk filter name (client-side)
  const [roleNameFilter, setRoleNameFilter] = useState<string>('all')

  // State untuk modal
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Role | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  // 📥 API Hooks
  const {
    data: roleData,
    isLoading,
    refetch,
    isFetching,
    error: listError,
  } = useGetRoleListQuery(params, {
    skip: !token,
  })

  const { data: roleDetail, isLoading: isLoadingDetail }: any = useGetRoleByIdQuery(selectedItem?.id!, {
    skip: !selectedItem?.id || !isDetailOpen,
  })

  // 📥 Fetch semua user untuk hitung jumlah per role
  const { data: userData } = useGetUserListQuery({ per_page: 9999, page: 1 }, { skip: !token })

  // Hitung jumlah user per role_id
  const userCountByRoleId = useMemo(() => {
    const users = userData?.data?.data ?? []
    const countMap: Record<number, number> = {}
    users.forEach((user: any) => {
      const roleId = user.role_id ?? user.role?.id
      if (roleId !== undefined && roleId !== null) {
        countMap[roleId] = (countMap[roleId] ?? 0) + 1
      }
    })
    return countMap
  }, [userData])

  const [createRole, { isLoading: isCreating, error: createError }] = usePostRoleMutation()
  const [updateRole, { isLoading: isUpdating, error: updateError }] = usePutRoleMutation()
  const [toggleActive, { isLoading: isToggling }] = usePatchRoleToggleActiveMutation()
  const [deleteRole, { isLoading: isDeleting, error: deleteError }] = useDeleteRoleMutation()
  const [restoreRole, { isLoading: isRestoring, error: restoreError }] = usePatchRoleRestoreMutation()

  // Handle error
  useEffect(() => {
    if (listError) {
      console.error('Error fetching roles:', listError)
    }
  }, [listError])

  // Transform API data ke format UI
  const transformedData = useMemo(() => {
    if (!roleData?.data?.data) return []

    return roleData.data.data
      .filter((apiRole: ApiRole) => {
        if (!params.with_deleted) {
          return apiRole.deleted_at === null || apiRole.deleted_at === undefined
        }
        return true
      })
      .map((apiRole: ApiRole) => {
        const role = transformApiRole(apiRole)
        return {
          ...role,
          deletedAt: apiRole.deleted_at ?? null,
          usersCount: userCountByRoleId[apiRole.id] ?? 0,
        }
      })
  }, [roleData, params.with_deleted, userCountByRoleId])

  // Filter data
  const filteredData = useMemo(() => {
    let data = transformedData

    // Kalau mode "tampilkan terhapus" aktif, hanya tampilkan yang terhapus
    if (params.with_deleted) {
      data = data.filter((role) => role.deletedAt !== null && role.deletedAt !== undefined)
    }

    // Filter berdasarkan nama role
    if (roleNameFilter !== 'all') {
      data = data.filter((role) => role.name === roleNameFilter)
    }

    return data
  }, [transformedData, roleNameFilter, params.with_deleted])

  // Filter tabs — dinamis dari data yang ada
  const filterTabs = useMemo(() => {
    const uniqueNames = [...new Set(transformedData.map((r) => r.name))]
    return [{ label: 'Semua', value: 'all' }, ...uniqueNames.map((name) => ({ label: name, value: name }))]
  }, [transformedData])

  // Handlers
  const handleSearch = (value: string) => {
    setParams((prev) => ({ ...prev, page: 1, search: value || undefined }))
  }

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }))
  }

  const handleIncludeDeleted = (include: boolean) => {
    setParams((prev) => ({ ...prev, page: 1, with_deleted: include }))
    setRoleNameFilter('all')
  }

  const handleCreate = () => {
    setFormMode('create')
    setSelectedItem(null)
    setIsFormOpen(true)
  }

  const handleEdit = (item: Role) => {
    setFormMode('edit')
    setSelectedItem(item)
    setIsFormOpen(true)
  }

  const handleDelete = (item: Role) => {
    setSelectedItem(item)
    setIsDeleteOpen(true)
  }

  const handleDetail = (item: Role) => {
    setSelectedItem(item)
    setIsDetailOpen(true)
  }

  const handleRestore = async (item: Role) => {
    try {
      const result = await restoreRole(item.id).unwrap()
      refetch()
      showNotification({
        title: 'Berhasil!',
        description: result?.message ?? 'Role berhasil dipulihkan.',
        type: 'success',
      })
    } catch (error: any) {
      console.error('Failed to restore role:', error)
      showNotification({
        title: 'Gagal!',
        description: error?.data?.message ?? 'Gagal memulihkan role.',
        type: 'error',
      })
    }
  }

  const handleStatusToggle = async (item: Role) => {
    try {
      const result = await toggleActive(item.id).unwrap()
      refetch()
      showNotification({
        title: 'Berhasil!',
        description: result?.message ?? 'Status role berhasil diubah.',
        type: 'success',
      })
    } catch (error: any) {
      console.error('Failed to toggle status:', error)
      showNotification({
        title: 'Gagal!',
        description: error?.data?.message ?? 'Gagal mengubah status role.',
        type: 'error',
      })
    }
  }

  const handleSubmit = async (formData: RoleFormData, id?: number) => {
    try {
      let result: any
      if (id) {
        result = await updateRole({
          id,
          role_name: formData.role_name,
          description: formData.description,
          is_active: formData.is_active,
        }).unwrap()
      } else {
        result = await createRole({
          role_name: formData.role_name,
          description: formData.description,
          is_active: formData.is_active,
        }).unwrap()
      }
      showNotification({
        title: 'Berhasil!',
        description: result?.message ?? `Role berhasil ${id ? 'diperbarui' : 'ditambahkan'}.`,
        type: 'success',
      })
      setIsFormOpen(false)
      refetch()
    } catch (error: any) {
      console.error('Failed to submit form:', error)
      showNotification({
        title: 'Gagal!',
        description: error?.data?.message ?? `Gagal ${id ? 'memperbarui' : 'menambahkan'} role.`,
        type: 'error',
      })
    }
  }

  const handleDeleteConfirm = async (id: number) => {
    try {
      const result = await deleteRole(id).unwrap()
      setIsDeleteOpen(false)
      refetch()
      showNotification({
        title: 'Berhasil!',
        description: result?.message ?? 'Role berhasil dihapus.',
        type: 'success',
      })
    } catch (error: any) {
      console.error('Failed to delete role:', error)
      showNotification({
        title: 'Gagal!',
        description: error?.data?.message ?? 'Gagal menghapus role.',
        type: 'error',
      })
    }
  }

  // Kolom tabel
  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: 'name',
      header: 'Role',
      cell: ({ row }) => {
        const iconColor = getRoleIconColor(row.original.name)
        return (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor.bg}`}>
              <HiShieldCheck className={`w-4 h-4 ${iconColor.icon}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{row.original.name}</p>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                {row.original.description || '—'}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'usersCount',
      header: 'Jumlah User',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <HiUserGroup className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{row.original.usersCount} user</span>
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isDeleted = row.original.deletedAt !== null && row.original.deletedAt !== undefined

        if (isDeleted) {
          return (
            <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 flex items-center gap-1.5 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              Terhapus
            </span>
          )
        }

        return (
          <button
            onClick={() => handleStatusToggle(row.original)}
            disabled={isToggling}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-full
              transition-all duration-200 cursor-pointer
              flex items-center gap-1.5
              ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}
              ${
                row.original.isActive
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }
            `}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${row.original.isActive ? 'bg-green-600' : 'bg-red-600'}`}
            />
            {row.original.isActive ? 'Aktif' : 'Nonaktif'}
          </button>
        )
      },
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const isDeleted = row.original.deletedAt !== null && row.original.deletedAt !== undefined

        return (
          <div className="flex gap-1">
            {/* Detail */}
            {can('view') && (
              <button
                onClick={() => handleDetail(row.original)}
                className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Detail"
              >
                <HiEye className="w-4 h-4 text-blue-600" />
              </button>
            )}

            {/* Edit — hanya untuk yang tidak terhapus */}
            {!isDeleted && can('update') && (
              <button
                onClick={() => handleEdit(row.original)}
                className="p-1.5 hover:bg-yellow-50 rounded-lg transition-colors cursor-pointer"
                title="Edit"
              >
                <HiPencilSquare className="w-4 h-4 text-yellow-600" />
              </button>
            )}

            {/* Restore / Delete */}
            {isDeleted ? (
              can('create') ? (
                <button
                  onClick={() => handleRestore(row.original)}
                  disabled={isRestoring}
                  className="p-1.5 hover:bg-green-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  title="Restore"
                >
                  <HiArrowPath className="w-4 h-4 text-green-600" />
                </button>
              ) : null
            ) : can('delete') ? (
              <button
                onClick={() => handleDelete(row.original)}
                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Hapus"
              >
                <HiTrash
                  className={`w-4 h-4 ${row.original.usersCount > 0 ? 'text-red-600' : 'text-red-600'}`}
                />
              </button>
            ) : null}
          </div>
        )
      },
    },
  ]

  // Jika belum login
  if (!token) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <HiShieldCheck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Belum Login</h3>
          <p className="mt-1 text-sm text-gray-500">
            Silakan login terlebih dahulu untuk mengakses halaman ini
          </p>
        </div>
      </div>
    )
  }

  // Render
  return (
    <div className="space-y-4">
      {contextHolder}
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manajemen Role</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola role dan hak akses pengguna dalam sistem
            {/* {authUser && (
              <span className="ml-2 text-xs text-primary-600">
                (Login sebagai: {authUser.name || authUser.username || 'Unknown'})
              </span>
            )} */}
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <button
            onClick={() => handleIncludeDeleted(!params.with_deleted)}
            className={`
              px-3 py-2 border rounded-lg flex items-center gap-2 text-sm transition-colors whitespace-nowrap
              ${
                params.with_deleted
                  ? 'border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            <HiTrash className="w-4 h-4" />
            <span>Terhapus</span>
          </button>
          {can('create') && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg shadow-sm cursor-pointer bg-primary-600 hover:bg-primary-700 whitespace-nowrap"
            >
              <HiPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Role</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs — Dinamis dari data */}
      <div className="flex gap-2 pb-1 overflow-x-auto border-b border-gray-200">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setRoleNameFilter(tab.value)}
            className={`
              px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
              ${
                roleNameFilter === tab.value
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        pageSize={params.per_page}
        currentPage={params.page}
        totalItems={roleData?.data?.total}
        onPageChange={handlePageChange}
        showSearch
        searchPlaceholder="Cari role..."
        emptyMessage="Belum ada data Role"
        isLoading={isLoading || isFetching}
        onSearch={handleSearch}
      />

      {/* Modals */}
      <RoleFormModal
        isOpen={isFormOpen}
        mode={formMode}
        item={selectedItem}
        isSubmitting={isCreating || isUpdating}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <RoleDeleteModal
        isOpen={isDeleteOpen}
        item={selectedItem}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <RoleDetailModal
        isOpen={isDetailOpen}
        item={roleDetail?.data ? transformApiRole(roleDetail?.data) : selectedItem}
        isLoading={isLoadingDetail}
        onClose={() => setIsDetailOpen(false)}
      />

      {/* Error Toast */}
      {(listError || createError || updateError || deleteError || restoreError) && (
        <div className="fixed z-50 max-w-md px-4 py-3 text-red-800 border border-red-200 rounded-lg shadow-lg bottom-4 right-4 bg-red-50">
          <p className="text-sm font-medium">Terjadi kesalahan:</p>
          <p className="mt-1 text-xs">
            {listError && 'Gagal mengambil data role. '}
            {createError && 'Gagal membuat role baru. '}
            {updateError && 'Gagal mengupdate role. '}
            {deleteError && 'Gagal menghapus role. '}
            {restoreError && 'Gagal memulihkan role.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default MainRole
