import React, { useCallback, useMemo, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/Components/General/Datatable'
import { useNotification } from '@/Components/General/Notification'
import { getErrorMessage, isValidationError, parseFieldErrors } from '@/Helpers/apiErrorParser'
import { usePermission, usePermissionContext } from '@/Permissions'
import {
  useDeleteDispatchTargetMutation,
  useGetDetailDispatchTargetQuery,
  useGetListDispatchTargetQuery,
  usePostDispatchTargetMutation,
  useRestoreDispatchTargetMutation,
  useToggleActiveDispatchTargetMutation,
  useUpdateDispatchTargetMutation,
} from '@/Services/Modules/dispatchTargets'
import type { GetListDispatchTargetParams } from '@/Services/Modules/dispatchTargets/getListDispatchTarget'
import {
  HiArrowPath,
  HiArrowTopRightOnSquare,
  HiBolt,
  HiEye,
  HiKey,
  HiPencilSquare,
  HiPlus,
  HiShieldCheck,
  HiTrash,
} from 'react-icons/hi2'
import DispatchTargetDeleteModal from './DispatchTargetDeleteModal'
import DispatchTargetDetailModal from './DispatchTargetDetailModal'
import DispatchTargetFormModal from './DispatchTargetFormModal'
import {
  AUTH_TYPE_OPTIONS,
  DISPATCH_TARGET_AUTH_META,
  buildDispatchTargetPayload,
  formatDispatchTargetDateTime,
  type AuthType,
  type DispatchTargetFormData,
  type DispatchTargetItem,
} from './types'

const DISPATCH_TARGET_PERMISSION_CANDIDATES = [
  'dispatch-targets',
  'dispatchTargets',
  'dispatch_targets',
  'dispatchtarget',
]

interface DispatchTargetQueryState extends GetListDispatchTargetParams {
  page: number
  per_page: number
  search: string
  with_deleted: boolean
  sort_by: NonNullable<GetListDispatchTargetParams['sort_by']>
  sort_dir: NonNullable<GetListDispatchTargetParams['sort_dir']>
}

const MainDispatchTargets: React.FC = () => {
  const { permissions } = usePermissionContext()
  const permissionResource = useMemo(
    () =>
      DISPATCH_TARGET_PERMISSION_CANDIDATES.find((resource) =>
        Object.prototype.hasOwnProperty.call(permissions, resource),
      ) || 'dispatch-targets',
    [permissions],
  )
  const { can } = usePermission(permissionResource)
  const { showNotification, contextHolder } = useNotification()

  const [params, setParams] = useState<DispatchTargetQueryState>({
    page: 1,
    per_page: 10,
    search: '',
    with_deleted: false,
    sort_by: 'created_at',
    sort_dir: 'desc',
  })
  const [authTypeFilter, setAuthTypeFilter] = useState<'all' | AuthType>('all')
  const [selectedItem, setSelectedItem] = useState<DispatchTargetItem | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const queryParams = useMemo(
    () => ({
      ...params,
      auth_type: authTypeFilter === 'all' ? undefined : authTypeFilter,
    }),
    [authTypeFilter, params],
  )

  const { data: apiResponse, isLoading, isFetching, refetch } = useGetListDispatchTargetQuery(queryParams)
  const { data: detailResponse, isLoading: isLoadingDetail } = useGetDetailDispatchTargetQuery(selectedItem?.id ?? 0, {
    skip: !selectedItem?.id || !isDetailOpen,
  })

  const [postDispatchTarget, { isLoading: isCreating }] = usePostDispatchTargetMutation()
  const [updateDispatchTarget, { isLoading: isUpdating }] = useUpdateDispatchTargetMutation()
  const [deleteDispatchTarget, { isLoading: isDeleting }] = useDeleteDispatchTargetMutation()
  const [toggleActiveDispatchTarget, { isLoading: isToggling }] = useToggleActiveDispatchTargetMutation()
  const [restoreDispatchTarget, { isLoading: isRestoring }] = useRestoreDispatchTargetMutation()

  const isSubmitting = isCreating || isUpdating

  const data = useMemo<DispatchTargetItem[]>(() => {
    const rawData = apiResponse?.data?.data ?? []

    if (params.with_deleted) {
      return rawData.filter((item) => !!item.deleted_at)
    }

    return rawData
  }, [apiResponse, params.with_deleted])

  const paginationInfo = useMemo(() => {
    if (!apiResponse?.data) return null
    const { current_page, last_page, from, to, total, per_page } = apiResponse.data
    return { current_page, last_page, from, to, total, per_page }
  }, [apiResponse])

  const authTabs = useMemo(
    () => [
      { label: 'Semua', value: 'all' as const },
      ...AUTH_TYPE_OPTIONS.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    ],
    [],
  )

  const handleCreate = useCallback(() => {
    setFormMode('create')
    setSelectedItem(null)
    setFormErrors({})
    setIsFormOpen(true)
  }, [])

  const handleEdit = useCallback((item: DispatchTargetItem) => {
    setFormMode('edit')
    setSelectedItem(item)
    setFormErrors({})
    setIsFormOpen(true)
  }, [])

  const handleDelete = useCallback((item: DispatchTargetItem) => {
    setSelectedItem(item)
    setIsDeleteOpen(true)
  }, [])

  const handleDetail = useCallback((item: DispatchTargetItem) => {
    setSelectedItem(item)
    setIsDetailOpen(true)
  }, [])

  const handleSearch = useCallback((search: string) => {
    setParams((prev) => ({ ...prev, search, page: 1 }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page: page + 1 }))
  }, [])

  const handlePageSizeChange = useCallback((perPage: number) => {
    setParams((prev) => ({ ...prev, per_page: perPage, page: 1 }))
  }, [])

  const handleSortChange = useCallback((sortBy: string, sortDir: string) => {
    const nextSortBy = ['id', 'name', 'url', 'auth_type', 'is_active', 'created_at'].includes(sortBy)
      ? (sortBy as 'id' | 'name' | 'url' | 'auth_type' | 'is_active' | 'created_at')
      : 'created_at'
    const nextSortDir = sortDir === 'asc' ? 'asc' : 'desc'

    setParams((prev) => ({
      ...prev,
      page: 1,
      sort_by: nextSortBy,
      sort_dir: nextSortDir,
    }))
  }, [])

  const handleSubmit = async (formData: DispatchTargetFormData, id?: number) => {
    try {
      setFormErrors({})
      const result = id
        ? await updateDispatchTarget({
            id,
            body: buildDispatchTargetPayload(formData, 'edit', selectedItem),
          }).unwrap()
        : await postDispatchTarget(buildDispatchTargetPayload(formData, 'create')).unwrap()

      showNotification({
        title: 'Berhasil!',
        description: result?.message ?? `Dispatch target berhasil ${id ? 'diperbarui' : 'ditambahkan'}.`,
        type: 'success',
      })

      setIsFormOpen(false)
      setSelectedItem(null)
    } catch (error: any) {
      if (isValidationError(error)) {
        setFormErrors(parseFieldErrors(error))
        showNotification({
          title: error?.data?.title || 'Validasi Gagal',
          description: getErrorMessage(error, 'Periksa kembali field yang diisi.'),
          type: 'error',
        })
        return
      }

      showNotification({
        title: 'Error!',
        description: getErrorMessage(error, 'Terjadi kesalahan saat menyimpan dispatch target.'),
        type: 'error',
      })
    }
  }

  const handleDeleteConfirm = async (id: number) => {
    try {
      const result = await deleteDispatchTarget(id).unwrap()
      showNotification({
        title: 'Berhasil!',
        description: result?.message ?? 'Dispatch target berhasil dihapus.',
        type: 'success',
      })
      setIsDeleteOpen(false)
      setSelectedItem(null)
    } catch (error: any) {
      showNotification({
        title: 'Error!',
        description: getErrorMessage(error, 'Terjadi kesalahan saat menghapus dispatch target.'),
        type: 'error',
      })
    }
  }

  const handleToggleStatus = async (item: DispatchTargetItem) => {
    try {
      const result = await toggleActiveDispatchTarget(item.id).unwrap()
      showNotification({
        title: 'Berhasil!',
        description: result?.message ?? 'Status dispatch target berhasil diubah.',
        type: 'success',
      })
    } catch (error: any) {
      showNotification({
        title: 'Error!',
        description: getErrorMessage(error, 'Terjadi kesalahan saat mengubah status dispatch target.'),
        type: 'error',
      })
    }
  }

  const handleRestore = async (item: DispatchTargetItem) => {
    try {
      const result = await restoreDispatchTarget(item.id).unwrap()
      showNotification({
        title: 'Berhasil!',
        description: result?.message ?? 'Dispatch target berhasil dipulihkan.',
        type: 'success',
      })
      refetch()
    } catch (error: any) {
      showNotification({
        title: 'Error!',
        description: getErrorMessage(error, 'Terjadi kesalahan saat memulihkan dispatch target.'),
        type: 'error',
      })
    }
  }

  const columns: ColumnDef<DispatchTargetItem, any>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Target',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <HiBolt className="w-4 h-4 text-primary-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-800 truncate">{row.original.name}</p>
              <p className="text-xs text-neutral-400 truncate">
                {row.original.description || 'Tidak ada deskripsi'}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'url',
        header: 'Endpoint',
        cell: ({ row }) => (
          <a
            href={row.original.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 max-w-[280px]"
          >
            <span className="truncate">{row.original.url}</span>
            <HiArrowTopRightOnSquare className="w-4 h-4 flex-shrink-0" />
          </a>
        ),
      },
      {
        accessorKey: 'auth_type',
        header: 'Auth',
        cell: ({ row }) => {
          const authMeta = DISPATCH_TARGET_AUTH_META[row.original.auth_type]

          return (
            <div className="space-y-1">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${authMeta.badgeClassName}`}
              >
                <HiShieldCheck className="w-3.5 h-3.5" />
                {authMeta.label}
              </span>
              <p className="text-xs text-neutral-400">
                {row.original.auth_type === 'api_key_header'
                  ? row.original.auth_header_name || '-'
                  : row.original.auth_type === 'none'
                    ? 'Tanpa credential'
                    : 'Credential tersembunyi'}
              </p>
            </div>
          )
        },
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => {
          const isDeleted = !!row.original.deleted_at

          if (isDeleted) {
            return (
              <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 border-neutral-200">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                Terhapus
              </span>
            )
          }

          return (
            <button
              onClick={() => handleToggleStatus(row.original)}
              disabled={isToggling}
              className={`
                inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer
                ${row.original.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}
                ${isToggling ? 'opacity-60 cursor-not-allowed' : ''}
              `}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${row.original.is_active ? 'bg-success' : 'bg-warning'}`}
              />
              {row.original.is_active ? 'Aktif' : 'Nonaktif'}
            </button>
          )
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Dibuat',
        cell: ({ row }) => (
          <div>
            <p className="text-sm text-neutral-700">{formatDispatchTargetDateTime(row.original.created_at)}</p>
            <p className="text-xs text-neutral-400">
              {row.original.deleted_at ? 'Sudah dihapus' : 'Masih aktif di master data'}
            </p>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const isDeleted = !!row.original.deleted_at

          return (
            <div className="flex items-center gap-1.5">
              {can('view') && (
                <button
                  onClick={() => handleDetail(row.original)}
                  className="p-1.5 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                  title="Detail"
                >
                  <HiEye className="w-4 h-4" />
                </button>
              )}

              {!isDeleted && can('update') && (
                <button
                  onClick={() => handleEdit(row.original)}
                  className="p-1.5 text-warning hover:bg-warning/10 rounded-lg transition-colors cursor-pointer"
                  title="Edit"
                >
                  <HiPencilSquare className="w-4 h-4" />
                </button>
              )}

              {isDeleted ? (
                can('create') && (
                  <button
                    onClick={() => handleRestore(row.original)}
                    disabled={isRestoring}
                    className="p-1.5 text-success hover:bg-success/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    title="Pulihkan"
                  >
                    <HiArrowPath className="w-4 h-4" />
                  </button>
                )
              ) : (
                can('delete') && (
                  <button
                    onClick={() => handleDelete(row.original)}
                    className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                )
              )}
            </div>
          )
        },
      },
    ],
    [can, handleDetail, handleDelete, handleEdit, isRestoring, isToggling],
  )

  return (
    <div className="my-4">
      {contextHolder}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-800">Dispatch Targets</h3>
            <p className="text-sm text-neutral-500">
              Kelola tujuan pengiriman hasil diagnostik ke sistem eksternal
              {paginationInfo && <span className="ml-1 text-neutral-400">({paginationInfo.total} total data)</span>}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setParams((prev) => ({ ...prev, page: 1, with_deleted: !prev.with_deleted }))}
              className={`
                inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium rounded-lg border transition-all cursor-pointer
                ${params.with_deleted ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'}
              `}
            >
              <HiTrash className="w-4 h-4" />
              {params.with_deleted ? 'Melihat Terhapus' : 'Lihat Terhapus'}
            </button>

            {can('create') && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-all cursor-pointer shadow-sm"
              >
                <HiPlus className="w-4 h-4" />
                Tambah Target
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 pb-1 overflow-x-auto border-b border-neutral-200">
          {authTabs.map((tab) => {
            const isActive = authTypeFilter === tab.value
            const badgeClassName =
              tab.value === 'all' ? 'border-transparent' : DISPATCH_TARGET_AUTH_META[tab.value].badgeClassName

            return (
              <button
                key={tab.value}
                onClick={() => {
                  setAuthTypeFilter(tab.value)
                  setParams((prev) => ({ ...prev, page: 1 }))
                }}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all whitespace-nowrap
                  ${isActive ? 'border-primary-500 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'}
                `}
              >
                {tab.value !== 'all' && (
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${badgeClassName}`}
                  >
                    <HiKey className="w-3 h-3" />
                  </span>
                )}
                {tab.label}
              </button>
            )
          })}
        </div>

        <DataTable
          data={data}
          columns={columns}
          pageSize={params.per_page}
          showSearch
          searchPlaceholder="Cari nama target atau URL..."
          emptyMessage="Belum ada data dispatch target"
          isLoading={isLoading || isFetching}
          currentPage={paginationInfo?.current_page}
          lastPage={paginationInfo?.last_page}
          totalData={paginationInfo?.total}
          apiFrom={paginationInfo?.from}
          apiTo={paginationInfo?.to}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSortChange={handleSortChange}
          serverSortBy={params.sort_by}
          serverSortOrder={params.sort_dir}
          onSearch={handleSearch}
        />

        <DispatchTargetFormModal
          isOpen={isFormOpen}
          mode={formMode}
          item={selectedItem}
          isSubmitting={isSubmitting}
          serverErrors={formErrors}
          onClose={() => {
            setIsFormOpen(false)
            setSelectedItem(null)
            setFormErrors({})
          }}
          onSubmit={handleSubmit}
        />

        <DispatchTargetDeleteModal
          isOpen={isDeleteOpen}
          item={selectedItem}
          isDeleting={isDeleting}
          onClose={() => {
            setIsDeleteOpen(false)
            setSelectedItem(null)
          }}
          onConfirm={handleDeleteConfirm}
        />

        <DispatchTargetDetailModal
          isOpen={isDetailOpen}
          item={detailResponse?.data ?? selectedItem}
          isLoading={isLoadingDetail}
          canUpdate={can('update')}
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedItem(null)
          }}
          onEdit={() => {
            setIsDetailOpen(false)
            if (selectedItem) {
              handleEdit(detailResponse?.data ?? selectedItem)
            }
          }}
        />
      </div>
    </div>
  )
}

export default MainDispatchTargets
