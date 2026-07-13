/**
 * @file MainUser.tsx
 * @description Halaman utama manajemen user
 * NOTE: Role diambil dari API roles — tidak ada hardcoded ROLE_MAPPING
 * NOTE: Edit mode menggunakan useGetUserByIdQuery untuk data lengkap (termasuk person)
 */

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/Components/General/Datatable'
import UserFormModal from './UserFormModal'
import UserDeleteModal from './UserDeleteModal'
import type { UserItem, UserFormData } from './types'
import type { UserListParams } from '@/Services/Modules/Users/users.types'
import {
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiUser,
  HiPhoto,
  HiFunnel,
  HiXMark,
  HiArrowDown,
  HiArrowUp,
} from 'react-icons/hi2'
import { convertImageToBase64 } from '@/Helpers/fileToBase64'
import { useNotification } from '@/Components/General/Notification'

import {
  useGetUserListQuery,
  useGetUserByIdQuery,
  usePostUserMutation,
  usePutUserMutation,
  usePatchUserToggleActiveMutation,
  useDeleteUserMutation,
} from '@/Services/Modules/Users'

import { useGetListInstitutionQuery } from '@/Services/Modules/institution'

import { useGetRoleListQuery } from '@/Services/Modules/Roles/rolesApi'

import { useSelector } from 'react-redux'
import { RootState } from '@/Store'
import { usePermission } from '@/Permissions'

const MainUser: React.FC = () => {
  const auth = useSelector((state: RootState) => state.AuthSlicer)
  const userID = useSelector((state: RootState) => state.AuthSlicer.userID)
  const token = auth?.BearerToken
  const authUser = auth?.user
  const { showNotification, contextHolder } = useNotification()

  const [params, setParams] = useState<UserListParams>({
    page: 1,
    per_page: 10,
    sort_by: 'created_at',
    sort_order: 'desc',
    search: undefined,
    isactive: undefined,
    institution_id: undefined,
    role_id: undefined,
  })

  // Permission check
  const { can } = usePermission('users')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<UserItem | any>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // ID user yang sedang diedit — null berarti skip query
  const [editUserId, setEditUserId] = useState<number | null>(null)

  // ── API Queries ───────────────────────────────────────────────────────────────

  const {
    data: userData,
    isLoading,
    refetch,
    isFetching,
    error: listError,
  } = useGetUserListQuery(params, { skip: !token })

  // Pagination info from API response
  const paginationInfo = useMemo(() => {
    if (!userData?.data) return null
    const { current_page, last_page, per_page, total } = userData.data
    // Calculate from/to if not provided by API
    const from = total > 0 ? (current_page - 1) * per_page + 1 : 0
    const to = Math.min(current_page * per_page, total)
    return { current_page, last_page, from, to, total, per_page }
  }, [userData])

  // Fetch detail user saat edit — skip jika editUserId null
  const {
    data: userByIdData,
    isLoading: isUserByIdLoading,
    isFetching: isFetchingUserById,
  } = useGetUserByIdQuery(editUserId as number, {
    skip: !token || editUserId === null,
  })

  const {
    data: institutionsData,
    isLoading: isInstitutionsLoading,
    isFetching: isFetchingInstitutions,
    error: listInstitutionsError,
  } = useGetListInstitutionQuery({ per_page: 100 }, { skip: !token })

  // Fetch semua role dari API
  const { data: rolesData } = useGetRoleListQuery(
    { per_page: 999, page: 1, with_deleted: false },
    { skip: !token },
  )

  const [createUser, { isLoading: isCreating, error: createError }] = usePostUserMutation()
  const [updateUser, { isLoading: isUpdating, error: updateError }] = usePutUserMutation()
  const [toggleActive, { isLoading: isToggling }] = usePatchUserToggleActiveMutation()
  const [deleteUser, { isLoading: isDeleting, error: deleteError }] = useDeleteUserMutation()

  // ── Buka modal edit setelah data by ID berhasil di-fetch ──────────────────────

  useEffect(() => {
    // Tunggu data selesai fetch dan editUserId ter-set
    if (editUserId !== null && !isUserByIdLoading && !isFetchingUserById && userByIdData?.data) {
      // Merge data dari API detail ke selectedItem
      const detail = userByIdData.data
      setSelectedItem(detail as any as UserItem)
      setIsFormOpen(true)
    }
  }, [editUserId, userByIdData, isUserByIdLoading, isFetchingUserById])

  // ── Error handling dengan notification ───────────────────────────────────────────

  // Handle listError - gagal mengambil data user
  useEffect(() => {
    if (listError) {
      showNotification({
        title: 'Gagal!',
        description: 'Gagal mengambil data user.',
        type: 'error',
      })
    }
  }, [listError])

  // Handle listInstitutionsError - gagal mengambil data institusi
  useEffect(() => {
    if (listInstitutionsError) {
      showNotification({
        title: 'Gagal!',
        description: 'Gagal mengambil data institusi.',
        type: 'error',
      })
    }
  }, [listInstitutionsError])

  // Handle createError - gagal membuat user baru
  useEffect(() => {
    if (createError) {
      showNotification({
        title: 'Gagal!',
        description: 'Gagal membuat user baru.',
        type: 'error',
      })
    }
  }, [createError])

  // Handle updateError - gagal mengupdate user
  useEffect(() => {
    if (updateError) {
      showNotification({
        title: 'Gagal!',
        description: 'Gagal mengupdate user.',
        type: 'error',
      })
    }
  }, [updateError])

  // Handle deleteError - gagal menghapus user
  useEffect(() => {
    if (deleteError) {
      showNotification({
        title: 'Gagal!',
        description: 'Gagal menghapus user.',
        type: 'error',
      })
    }
  }, [deleteError])

  // ── Role mapping dari API ─────────────────────────────────────────────────────

  const roleMap = useMemo<Record<number, string>>(() => {
    const roles = rolesData?.data?.data ?? []
    const map: Record<number, string> = {}
    roles.forEach((r: any) => {
      map[r.id] = r.role_name
    })
    return map
  }, [rolesData])

  const roleOptions = useMemo(() => {
    const roles = rolesData?.data?.data ?? []
    return roles
      .filter((r: any) => r.deleted_at === null && r.is_active === true)
      .map((r: any) => ({ label: r.role_name, value: r.id }))
  }, [rolesData])

  // ── Transform data list ───────────────────────────────────────────────────────
  const transformedData = useMemo(() => {
    if (!userData?.data?.data) return []
    return userData.data.data.map((user: UserItem) => {
      const instName =
        institutionsData?.data?.data?.find((inst: any) => inst.id === user.institution_id)
          ?.institutions_name || '-'

      return {
        id: user.id,
        name: user.fullname || '-',
        username: user.username,
        email: user.mail || '-',
        role_id: user.role_id,
        roleName: user.role_id ? roleMap[user.role_id] || `Role #${user.role_id}` : '-',
        institutionId: user.institution_id,
        institutionName: instName,
        status: user.isactive ? 'active' : 'inactive',
        photo_link: user.photo_link ?? null,
      }
    })
  }, [userData, institutionsData, roleMap])

  // ── Institutions untuk form ───────────────────────────────────────────────────

  const institutions = useMemo(() => {
    if (!institutionsData?.data?.data) return []
    return institutionsData.data.data.map((inst: any) => ({
      id: inst.id,
      name: inst.institutions_name,
      code: inst.institutions_code,
    }))
  }, [institutionsData])

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleSearch = (value: string) => {
    setParams((prev) => ({ ...prev, page: 1, search: value || undefined }))
  }

  const handlePageChange = (page: number) => {
    // Convert from 0-based (TanStack) to 1-based (API)
    setParams((prev) => ({ ...prev, page: page + 1 }))
  }

  const handleFilterByActive = (isActive: boolean | undefined) => {
    setParams((prev) => ({ ...prev, page: 1, isactive: isActive }))
  }

  const handleFilterByInstitution = (institutionId: number | undefined) => {
    setParams((prev) => ({ ...prev, page: 1, institution_id: institutionId }))
  }

  const handleFilterByRole = (roleId: number | undefined) => {
    setParams((prev) => ({ ...prev, page: 1, role_id: roleId }))
  }

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setParams((prev) => ({ ...prev, page: 1, sort_by: sortBy, sort_order: sortOrder }))
  }

  const handleResetFilters = () => {
    setParams({
      page: 1,
      per_page: 15,
      sort_by: 'created_at',
      sort_order: 'desc',
    })
  }

  const handleCreate = () => {
    setFormMode('create')
    setSelectedItem(null)
    setEditUserId(null)
    setIsFormOpen(true)
  }

  const handleEdit = (item: { id: number }) => {
    setFormMode('edit')
    setSelectedItem(null) // Reset dulu, modal dibuka setelah fetch selesai
    setIsFormOpen(false)
    setEditUserId(item.id) // Trigger useGetUserByIdQuery
  }

  const handleDelete = (item: UserItem) => {
    setSelectedItem(item)
    setIsDeleteOpen(true)
  }

  const handleStatusToggle = async (item: { id: number }) => {
    try {
      const result = await toggleActive(item.id).unwrap()
      refetch()
      showNotification({
        title: 'Berhasil!',
        description: result?.message ?? 'Status user berhasil diubah.',
        type: 'success',
      })
    } catch (error: any) {
      console.error('Failed to toggle status:', error)
      showNotification({
        title: 'Gagal!',
        description: error?.data?.message ?? 'Gagal mengubah status user.',
        type: 'error',
      })
    }
  }

  // const handleSubmit = async (formData: UserFormData, id?: number) => {
  //   try {
  //     if (id) {
  //       await updateUser({
  //         id,
  //         data: {
  //           ...formData,
  //           password: formData.password || undefined,
  //         },
  //       }).unwrap()
  //     } else {
  //       await createUser(formData).unwrap()
  //     }
  //     setIsFormOpen(false)
  //     setEditUserId(null)
  //     refetch()
  //   } catch (error) {
  //     console.error('Failed to submit form:', error)
  //   }
  // }
  const handleSubmit = async (formData: UserFormData, id?: number) => {
    try {
      let processedData: any = { ...formData }

      // Handle isactive - convert to boolean
      if (processedData.isactive === 'true' || processedData.isactive === true) {
        processedData.isactive = true
      } else if (processedData.isactive === 'false' || processedData.isactive === false) {
        processedData.isactive = false
      } else if (processedData.isactive === '1') {
        processedData.isactive = true
      } else if (processedData.isactive === '0') {
        processedData.isactive = false
      }

      if (processedData.photo_link instanceof File) {
        const result = await convertImageToBase64(processedData.photo_link)
        if ('error' in result) {
          console.error('Photo conversion failed:', result.error)
          showNotification({
            title: 'Gagal!',
            description: 'Gagal memproses foto. Silakan coba lagi.',
            type: 'error',
          })
          return
        }
        processedData.photo_link = result.base64
      } else if (
        typeof processedData.photo_link === 'string' &&
        processedData.photo_link.startsWith('/storage/')
      ) {
        delete processedData.photo_link
      }

      let result: any
      if (id) {
        result = await updateUser({
          id,
          data: {
            ...processedData,
            password: formData.password || undefined,
          },
        }).unwrap()
      } else {
        result = await createUser(processedData).unwrap()
      }

      showNotification({
        title: 'Berhasil!',
        description: result?.message ?? `User berhasil ${id ? 'diperbarui' : 'ditambahkan'}.`,
        type: 'success',
      })

      setIsFormOpen(false)
      setEditUserId(null)
      refetch()
    } catch (error: any) {
      console.error('Failed to submit form:', error)
      showNotification({
        title: 'Gagal!',
        description: error?.data?.message ?? `Gagal ${id ? 'memperbarui' : 'menambahkan'} user.`,
        type: 'error',
      })
    }
  }

  const handleDeleteConfirm = async (id: number) => {
    try {
      const result = await deleteUser(id).unwrap()
      setIsDeleteOpen(false)
      refetch()
      showNotification({
        title: 'Berhasil!',
        description: result?.message ?? 'User berhasil dihapus.',
        type: 'success',
      })
    } catch (error: any) {
      console.error('Failed to delete user:', error)
      showNotification({
        title: 'Gagal!',
        description: error?.data?.message ?? 'Gagal menghapus user.',
        type: 'error',
      })
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditUserId(null)
    setSelectedItem(null)
  }

  // ── Columns ───────────────────────────────────────────────────────────────────

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'photo_link',
      header: 'Photo',
      cell: ({ row }) => {
        const photo = row.original.photo_link
        const [imgError, setImgError] = useState(false)

        return (
          <div className="flex items-center gap-3">
            {photo && !imgError ? (
              <img
                src={photo}
                alt="User Photo"
                className="object-cover w-10 h-10 border rounded-full border-neutral-200"
                onError={() => setImgError(true)}
              />
            ) : photo && imgError ? (
              // Photo link ada, tapi file-nya tidak ditemukan di backend
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100">
                <HiPhoto className="w-8 h-8 text-neutral-300" />
              </div>
            ) : (
              // Tidak ada photo_link sama sekali
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-200">
                <HiUser className="w-5 h-5 text-neutral-500" />
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'fullname',
      header: 'User',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <HiUser className="w-4 h-4 text-primary-500" />
          <div>
            <p className="text-sm font-medium">{row.original.name}</p>
            <p className="text-xs text-neutral-400">@{row.original.username}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: 'mail', header: 'Email' },
    { accessorKey: 'institutionName', header: 'Institusi' },
    {
      accessorKey: 'roleName',
      header: 'Role',
      cell: ({ row }) => <span className="text-sm text-gray-700">{row.original.roleName}</span>,
    },
    {
      accessorKey: 'isactive',
      header: 'Status',
      cell: ({ row }) => (
        <button
          onClick={() => handleStatusToggle(row.original)}
          disabled={isToggling}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5
            ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}
            ${
              row.original.status === 'active'
                ? 'bg-success/10 text-success hover:bg-success/20'
                : 'bg-danger/10 text-danger hover:bg-danger/20'
            }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              row.original.status === 'active' ? 'bg-success' : 'bg-danger'
            }`}
          />
          {row.original.status === 'active' ? 'Aktif' : 'Nonaktif'}
        </button>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex gap-1">
          {can('update') && (
            <button
              onClick={() => handleEdit(row.original)}
              disabled={isUserByIdLoading || isFetchingUserById}
              className="p-1.5 hover:bg-warning/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Edit"
            >
              {(isUserByIdLoading || isFetchingUserById) && editUserId === row.original.id ? (
                <div className="w-4 h-4 border-2 rounded-full border-warning/30 border-t-warning animate-spin" />
              ) : (
                <HiPencilSquare className="w-4 h-4 text-warning" />
              )}
            </button>
          )}
          {can('delete') && (
            <button
              onClick={() => handleDelete(row.original)}
              className="p-1.5 hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
              title="Hapus"
            >
              <HiTrash className="w-4 h-4 text-danger" />
            </button>
          )}
        </div>
      ),
    },
  ]

  // ── Guards ────────────────────────────────────────────────────────────────────

  if (!auth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 border-4 rounded-full border-primary-500 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500">Loading authentication...</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <HiUser className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Belum Login</h3>
          <p className="mt-1 text-sm text-gray-500">Silakan login terlebih dahulu</p>
        </div>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {contextHolder}
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800">Data User</h3>
          <p className="text-sm text-neutral-500">
            Kelola daftar user yang terdaftar dalam sistem
            {/* {authUser && (
              <span className="ml-2 text-xs text-primary-600">
                (Login sebagai: {authUser.name || authUser.username || 'Unknown'})
              </span>
            )} */}
          </p>
        </div>
        {can('create') && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg cursor-pointer bg-primary-500 hover:bg-primary-600"
          >
            <HiPlus className="w-4 h-4" />
            Tambah User
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors cursor-pointer ${
            isFilterOpen
              ? 'bg-primary-50 border-primary-500 text-primary-600'
              : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          <HiFunnel className="w-4 h-4" />
          Filter
          {(params.isactive !== undefined ||
            params.institution_id !== undefined ||
            params.role_id !== undefined) && (
            <span className="flex items-center justify-center w-5 h-5 text-xs font-medium text-white rounded-full bg-primary-500">
              {(params.isactive !== undefined ? 1 : 0) +
                (params.institution_id !== undefined ? 1 : 0) +
                (params.role_id !== undefined ? 1 : 0)}
            </span>
          )}
        </button>

        {(params.isactive !== undefined ||
          params.institution_id !== undefined ||
          params.role_id !== undefined) && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-neutral-500 hover:text-danger transition-colors cursor-pointer"
          >
            <HiXMark className="w-4 h-4" />
            Reset Filter
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      {isFilterOpen && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white border rounded-lg shadow-sm border-neutral-200">
          {/* Filter Status */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-600">Status</label>
            <select
              value={params.isactive === undefined ? '' : params.isactive.toString()}
              onChange={(e) =>
                handleFilterByActive(e.target.value === '' ? undefined : e.target.value === 'true')
              }
              className="px-3 py-2 text-sm border rounded-lg border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Status</option>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </div>

          {/* Filter Institusi */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-600">Institusi</label>
            <select
              value={params.institution_id ?? ''}
              onChange={(e) => handleFilterByInstitution(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 text-sm border rounded-lg border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[180px]"
              disabled={isInstitutionsLoading}
            >
              <option value="">Semua Institusi</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Role */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-600">Role</label>
            <select
              value={params.role_id ?? ''}
              onChange={(e) => handleFilterByRole(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 text-sm border rounded-lg border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[150px]"
            >
              <option value="">Semua Role</option>
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-600">Urutkan</label>
            <div className="flex items-center gap-1">
              <select
                value={params.sort_by ?? 'created_at'}
                onChange={(e) => handleSortChange(e.target.value, params.sort_order ?? 'desc')}
                className="px-3 py-2 text-sm border rounded-lg border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="created_at">Tanggal Dibuat</option>
                <option value="username">Username</option>
                {/* <option value="fullname">Nama Lengkap</option> */}
              </select>
              <button
                onClick={() =>
                  handleSortChange(
                    params.sort_by ?? 'created_at',
                    params.sort_order === 'asc' ? 'desc' : 'asc',
                  )
                }
                className="p-2 border rounded-lg border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
                title={params.sort_order === 'asc' ? 'Ascending' : 'Descending'}
              >
                {params.sort_order === 'asc' ? (
                  <HiArrowUp className="w-4 h-4 text-neutral-600" />
                ) : (
                  <HiArrowDown className="w-4 h-4 text-neutral-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <DataTable
        data={transformedData}
        columns={columns}
        pageSize={params.per_page}
        currentPage={paginationInfo?.current_page}
        lastPage={paginationInfo?.last_page}
        totalItems={paginationInfo?.total}
        apiFrom={paginationInfo?.from}
        apiTo={paginationInfo?.to}
        onPageChange={handlePageChange}
        onPageSizeChange={(size: number) => setParams((prev) => ({ ...prev, per_page: size, page: 1 }))}
        onSortChange={handleSortChange}
        serverSortBy={params.sort_by}
        serverSortOrder={params.sort_order}
        showSearch
        searchPlaceholder="Cari user..."
        emptyMessage="Belum ada data user"
        isLoading={isLoading || isFetching || isInstitutionsLoading}
        onSearch={handleSearch}
      />

      <UserFormModal
        role={userID?.role?.name}
        isOpen={isFormOpen}
        mode={formMode}
        item={selectedItem}
        institutions={institutions}
        roleOptions={roleOptions}
        isInstitutionsLoading={isInstitutionsLoading || isFetchingInstitutions}
        isSubmitting={isCreating || isUpdating}
        onClose={handleFormClose}
        onSubmit={handleSubmit}
      />

      <UserDeleteModal
        isOpen={isDeleteOpen}
        item={selectedItem}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Notifications handled via useEffect */}
    </div>
  )
}

export default MainUser
