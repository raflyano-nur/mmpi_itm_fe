/**
 * @file MainInstitution.tsx
 * @description Komponen utama untuk CRUD data institusi dengan integrasi API.
 *
 * Fitur:
 * - Tabel daftar institusi dengan search, sort, pagination
 * - Tambah institusi baru (POST)
 * - Edit institusi (PUT)
 * - Hapus institusi (DELETE)
 * - Detail view
 *
 * @module Setting/Institution/MainInstitution
 */

import React, { useState, useMemo, useCallback } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/Components/General/Datatable'
import InstitutionFormModal from './InstitutionFormModal'
import InstitutionDeleteModal from './InstitutionDeleteModal'
import type { InstitutionItem, InstitutionFormData } from './types'
import { useNotification } from '@/Components/General/Notification'
import { usePermission } from '@/Permissions'
import {
  useGetListInstitutionQuery,
  usePostInstitutionMutation,
  useUpdateInstitutionMutation,
  useDeleteInstitutionMutation,
} from '@/Services/Modules/institution'
import {
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiEye,
  HiBuildingOffice2,
  HiPhone,
  HiEnvelope,
  HiXMark,
  HiMapPin,
} from 'react-icons/hi2'

const MainInstitution: React.FC = () => {
  // ===== NOTIFICATION =====
  const { showNotification, contextHolder } = useNotification()

  // ===== API HOOKS =====
  const [queryParams, setQueryParams] = useState({
    search: '',
    status: '',
    provincies: '',
    per_page: 10,
    sort_by: '',
    sort_order: '',
    page: 1,
  })

  const { data: apiResponse, isLoading, isFetching } = useGetListInstitutionQuery(queryParams)
  const [postInstitution, { isLoading: isCreating }] = usePostInstitutionMutation()
  const [updateInstitution, { isLoading: isUpdating }] = useUpdateInstitutionMutation()
  const [deleteInstitution, { isLoading: isDeletingApi }] = useDeleteInstitutionMutation()

  // ===== DATA =====
  const data = useMemo<InstitutionItem[]>(() => {
    return apiResponse?.data?.data ?? []
  }, [apiResponse])

  const paginationInfo = useMemo(() => {
    if (!apiResponse?.data) return null
    const { current_page, last_page, from, to, total, per_page } = apiResponse.data
    return { current_page, last_page, from, to, total, per_page }
  }, [apiResponse])

  // ===== STATE =====
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedItem, setSelectedItem] = useState<InstitutionItem | null>(null)

  const isSubmitting = isCreating || isUpdating

  // ===== PERMISSION =====
  const { can, canAny } = usePermission('institution')

  // ===== HANDLERS =====

  // Handler untuk perubahan pagination - server-side
  const handlePageChange = useCallback((page: number) => {
    setQueryParams((prev) => ({ ...prev, page: page + 1 })) // API uses 1-based indexing
  }, [])

  // Handler untuk perubahan page size - server-side
  const handlePageSizeChange = useCallback((pageSize: number) => {
    setQueryParams((prev) => ({ ...prev, per_page: pageSize, page: 1 }))
  }, [])

  // Handler untuk perubahan sorting - server-side
  const handleSortChange = useCallback((sortBy: string, sortOrder: string) => {
    setQueryParams((prev) => ({
      ...prev,
      sort_by: sortBy,
      sort_order: sortOrder,
      page: 1, // Reset ke halaman pertama saat sorting berubah
    }))
  }, [])

  // Handler untuk perubahan search - server-side
  const handleSearchChange = useCallback((search: string) => {
    setQueryParams((prev) => ({
      ...prev,
      search,
      page: 1, // Reset ke halaman pertama saat search berubah
    }))
  }, [])

  const handleCreate = useCallback(() => {
    setFormMode('create')
    setSelectedItem(null)
    setIsFormOpen(true)
  }, [])

  const handleEdit = useCallback((item: InstitutionItem) => {
    setFormMode('edit')
    setSelectedItem(item)
    setIsFormOpen(true)
  }, [])

  const handleDelete = useCallback((item: InstitutionItem) => {
    setSelectedItem(item)
    setIsDeleteOpen(true)
  }, [])

  const handleDetail = useCallback((item: InstitutionItem) => {
    setSelectedItem(item)
    setIsDetailOpen(true)
  }, [])

  const handleFormSubmit = async (formData: InstitutionFormData, id?: number) => {
    try {
      let result

      if (id) {
        result = await updateInstitution({ body: formData, id }).unwrap()
      } else {
        result = await postInstitution(formData).unwrap()
      }

      if (result.status === 'success') {
        showNotification({
          title: 'Berhasil!',
          description: result.message,
          type: 'success',
        })
        setIsFormOpen(false)
        setSelectedItem(null)
      } else {
        showNotification({
          title: 'Gagal!',
          description: result.message,
          type: 'error',
        })
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Terjadi kesalahan saat menyimpan data.'
      showNotification({
        title: 'Error!',
        description: errorMessage,
        type: 'error',
      })
    }
  }

  const handleDeleteConfirm = async (id: number) => {
    try {
      const result = await deleteInstitution({ id }).unwrap()

      if (result.status === 'success') {
        showNotification({
          title: 'Berhasil!',
          description: result.message,
          type: 'success',
        })
        setIsDeleteOpen(false)
        setSelectedItem(null)
      } else {
        showNotification({
          title: 'Gagal!',
          description: result.message,
          type: 'error',
        })
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Terjadi kesalahan saat menghapus data.'
      showNotification({
        title: 'Error!',
        description: errorMessage,
        type: 'error',
      })
    }
  }

  // ===== COLUMN DEFINITIONS =====

  const columns: ColumnDef<InstitutionItem, any>[] = useMemo(
    () => [
      {
        accessorKey: 'institutions_code',
        header: 'Kode',
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100">
            {row.original.institutions_code}
          </span>
        ),
      },
      {
        accessorKey: 'institutions_name',
        header: 'Nama Institusi',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {row.original.logo_url ? (
                <img
                  src={row.original.logo_url}
                  alt={row.original.institutions_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                    ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : (
                <HiBuildingOffice2 className="w-4 h-4 text-primary-500" />
              )}
              <HiBuildingOffice2 className="w-4 h-4 text-primary-500 hidden" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-800 truncate">
                {row.original.institutions_name}
              </p>
              <p className="text-xs text-neutral-400 truncate">{row.original.addr1}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'provincies',
        header: 'Wilayah',
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <HiMapPin className="w-3 h-3 text-neutral-400" />
              {row.original.regencies?.trim() || '-'}
            </div>
            <p className="text-xs text-neutral-400 ml-[18px]">{row.original.provincies?.trim() || '-'}</p>
          </div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Kontak',
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <HiPhone className="w-3 h-3 text-neutral-400" />
              {row.original.phone?.trim() || '-'}
            </div>
            {row.original.mail && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <HiEnvelope className="w-3 h-3 text-neutral-400" />
                {row.original.mail?.trim()}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const isActive = row.original.status === true
          return (
            <span
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                ${
                  isActive
                    ? 'bg-success/10 text-success border border-success/20'
                    : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                }
              `}
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
            {can('update') && (
              <button
                onClick={() => handleEdit(row.original)}
                className="p-1.5 text-warning hover:bg-warning/10 rounded-lg transition-colors cursor-pointer"
                title="Edit"
              >
                <HiPencilSquare className="w-4 h-4" />
              </button>
            )}
            {can('delete') && (
              <button
                onClick={() => handleDelete(row.original)}
                className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                title="Hapus"
              >
                <HiTrash className="w-4 h-4" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [handleDetail, handleEdit, handleDelete, can],
  )

  // ===== RENDER =====

  return (
    <div className="my-4">
      {contextHolder}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-neutral-800">Data Institusi</h3>
            <p className="text-sm text-neutral-500">
              Kelola daftar institusi yang terdaftar dalam sistem
              {paginationInfo && (
                <span className="ml-1 text-neutral-400">({paginationInfo.total} total data)</span>
              )}
            </p>
          </div>
          {can('create') && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-all cursor-pointer shadow-sm"
            >
              <HiPlus className="w-4 h-4" />
              Tambah Institusi
            </button>
          )}
        </div>

        {/* Table */}
        <DataTable
          data={data}
          columns={columns}
          pageSize={queryParams.per_page}
          showSearch
          searchPlaceholder="Cari institusi..."
          emptyMessage="Belum ada data institusi"
          isLoading={isLoading || isFetching}
          // Server-side props
          currentPage={paginationInfo?.current_page}
          lastPage={paginationInfo?.last_page}
          totalData={paginationInfo?.total}
          apiFrom={paginationInfo?.from}
          apiTo={paginationInfo?.to}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSortChange={handleSortChange}
          serverSortBy={queryParams.sort_by}
          serverSortOrder={queryParams.sort_order}
          onSearch={handleSearchChange}
        />

        {/* Form Modal (Create/Edit) */}
        <InstitutionFormModal
          isOpen={isFormOpen}
          mode={formMode}
          item={selectedItem}
          isSubmitting={isSubmitting}
          onClose={() => {
            setIsFormOpen(false)
            setSelectedItem(null)
          }}
          onSubmit={handleFormSubmit}
        />

        {/* Delete Confirmation Modal */}
        <InstitutionDeleteModal
          isOpen={isDeleteOpen}
          item={selectedItem}
          isDeleting={isDeletingApi}
          onClose={() => {
            setIsDeleteOpen(false)
            setSelectedItem(null)
          }}
          onConfirm={handleDeleteConfirm}
        />

        {/* Detail Modal */}
        {isDetailOpen && selectedItem && (
          <InstitutionDetailView
            item={selectedItem}
            onClose={() => {
              setIsDetailOpen(false)
              setSelectedItem(null)
            }}
            onEdit={() => {
              setIsDetailOpen(false)
              handleEdit(selectedItem)
            }}
            canUpdate={can('update')}
          />
        )}
      </div>
    </div>
  )
}

// ===================================================================
// DETAIL VIEW (inline component)
// ===================================================================

interface InstitutionDetailViewProps {
  item: InstitutionItem
  onClose: () => void
  onEdit: () => void
  canUpdate?: boolean
}

const InstitutionDetailView: React.FC<InstitutionDetailViewProps> = ({
  item,
  onClose,
  onEdit,
  canUpdate = true,
}) => {
  /** Format alamat lengkap dari field-field terpisah */
  const fullAddress = [
    item.addr1,
    item.addr2,
    `RT ${item.rt}/RW ${item.rw}`,
    item.villages,
    item.districts,
    item.regencies,
    item.provincies,
    item.poscode?.trim(),
  ]
    .filter(Boolean)
    .join(', ')

  const detailFields: { label: string; value: string; icon?: React.ReactNode }[] = [
    { label: 'Kode Institusi', value: item.institutions_code },
    { label: 'Nama Institusi', value: item.institutions_name },
    { label: 'Alamat', value: fullAddress },
    { label: 'Telepon', value: item.phone?.trim() || '-', icon: <HiPhone className="w-4 h-4" /> },
    { label: 'Fax', value: item.fax?.trim() || '-' },
    {
      label: 'Email',
      value: item.mail?.trim() || '-',
      icon: <HiEnvelope className="w-4 h-4" />,
    },
    {
      label: 'Status',
      value: item.status ? 'Aktif' : 'Nonaktif',
    },
    { label: 'Dibuat', value: formatDateTime(item.created_at) },
    { label: 'Terakhir Diupdate', value: formatDateTime(item.updated_at) },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center overflow-hidden">
              {item.logo_url ? (
                <img
                  src={item.logo_url}
                  alt={item.institutions_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <HiBuildingOffice2 className="w-5 h-5 text-primary-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">Detail Institusi</h2>
              <p className="text-xs text-neutral-400">{item.institutions_code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <HiXMark className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {detailFields.map((field, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-neutral-50 last:border-0"
            >
              <span className="text-xs font-medium text-neutral-500 sm:w-40 flex-shrink-0 uppercase tracking-wide">
                {field.label}
              </span>
              <div className="flex items-center gap-2 text-sm text-neutral-800">
                {field.icon && <span className="text-neutral-400">{field.icon}</span>}
                <span>{field.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/40">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all cursor-pointer"
          >
            Tutup
          </button>
          {canUpdate && (
            <button
              onClick={onEdit}
              className="px-4 py-2.5 text-sm font-medium text-white bg-warning rounded-lg hover:bg-warning/90 transition-all cursor-pointer flex items-center gap-2"
            >
              <HiPencilSquare className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

/**
 * Format datetime string dari API ke format yang lebih readable.
 */
function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export default MainInstitution
