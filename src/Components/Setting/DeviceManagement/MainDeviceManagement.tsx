/**
 * @file MainDeviceManagement.tsx
 * @description Komponen utama untuk manajemen alat (Device Management).
 *
 * Fitur:
 * - Daftar device dengan search, sort, pagination (server-side)
 * - Tambah device baru (POST)
 * - Edit device (PUT)
 * - Hapus device (DELETE)
 * - Detail view
 *
 * @module Setting/DeviceManagement/MainDeviceManagement
 */

import React, { useState, useMemo, useCallback } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/Components/General/Datatable'
import DeviceFormModal from './DeviceFormModal'
import DeviceDeleteModal from './DeviceDeleteModal'
import type { DeviceItem, DeviceFormData } from './types'
import { DEVICE_STATUS_MAP, DEVICE_STATUS_BADGE_CONFIG } from './types'
import { useNotification } from '@/Components/General/Notification'
import { getErrorMessage, parseFieldErrors, isValidationError } from '@/Helpers/apiErrorParser'
import { usePermission } from '@/Permissions'
import {
  useGetListDeviceQuery,
  usePostDeviceMutation,
  useUpdateDeviceMutation,
  useDeleteDeviceMutation,
} from '@/Services/Modules/device'
import {
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiEye,
  HiCpuChip,
  HiXMark,
  HiWrenchScrewdriver,
  HiBuildingOffice2,
} from 'react-icons/hi2'

// ===================================================================
// STATUS BADGE (reusable helper)
// ===================================================================

/**
 * Render badge status berdasarkan status number.
 * Menggunakan konfigurasi dari DEVICE_STATUS_BADGE_CONFIG.
 */
const DeviceStatusBadge: React.FC<{ status: number; label?: string }> = ({ status, label }) => {
  const config = DEVICE_STATUS_BADGE_CONFIG[status] || DEVICE_STATUS_BADGE_CONFIG[2]
  const statusLabel = label || DEVICE_STATUS_MAP[status] || 'Unknown'

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {statusLabel}
    </span>
  )
}

// ===================================================================
// FORMAT DATE HELPER
// ===================================================================

const formatDateTime = (dateStr: string | null | undefined): string => {
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

// ===================================================================
// MAIN COMPONENT
// ===================================================================

const MainDeviceManagement: React.FC = () => {
  // ===== PERMISSION CHECK =====
  // Resource: "device" sesuai request user
  const { can, canAny } = usePermission('devices')

  // ===== NOTIFICATION =====
  const { showNotification, contextHolder } = useNotification()

  // ===== API HOOKS =====
  const [queryParams, setQueryParams] = useState({
    page: 1,
    per_page: 10,
    search: '',
    sort_by: '',
    sort_order: '',
  })

  const { data: apiResponse, isLoading, isFetching } = useGetListDeviceQuery(queryParams)
  const [postDevice, { isLoading: isCreating }] = usePostDeviceMutation()
  const [updateDevice, { isLoading: isUpdating }] = useUpdateDeviceMutation()
  const [deleteDevice, { isLoading: isDeletingApi }] = useDeleteDeviceMutation()

  // ===== DATA =====
  const data = useMemo<DeviceItem[]>(() => {
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
  const [selectedItem, setSelectedItem] = useState<DeviceItem | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const isSubmitting = isCreating || isUpdating

  // ===== HANDLERS =====

  const handleCreate = useCallback(() => {
    setFormMode('create')
    setSelectedItem(null)
    setFormErrors({})
    setIsFormOpen(true)
  }, [])

  const handleEdit = useCallback((item: DeviceItem) => {
    setFormMode('edit')
    setSelectedItem(item)
    setFormErrors({})
    setIsFormOpen(true)
  }, [])

  const handleDelete = useCallback((item: DeviceItem) => {
    setSelectedItem(item)
    setIsDeleteOpen(true)
  }, [])

  const handleDetail = useCallback((item: DeviceItem) => {
    setSelectedItem(item)
    setIsDetailOpen(true)
  }, [])

  const handleFormSubmit = async (formData: DeviceFormData, id?: number) => {
    try {
      setFormErrors({})
      let result

      if (id) {
        result = await updateDevice({ body: formData, id }).unwrap()
      } else {
        result = await postDevice(formData).unwrap()
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
      if (isValidationError(error)) {
        const fieldErrors = parseFieldErrors(error)
        setFormErrors(fieldErrors)
        showNotification({
          title: error?.data?.title || 'Validasi Gagal',
          description: getErrorMessage(error, 'Data yang dikirim tidak valid.'),
          type: 'error',
        })
      } else {
        showNotification({
          title: 'Error!',
          description: getErrorMessage(error, 'Terjadi kesalahan saat menyimpan data.'),
          type: 'error',
        })
      }
    }
  }

  const handleDeleteConfirm = async (id: number) => {
    try {
      const result = await deleteDevice({ id }).unwrap()

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
      showNotification({
        title: 'Error!',
        description: getErrorMessage(error, 'Terjadi kesalahan saat menghapus data.'),
        type: 'error',
      })
    }
  }

  // Handler untuk pagination (konversi 0-based ke 1-based)
  const handlePageChange = useCallback((page: number) => {
    setQueryParams((prev) => ({ ...prev, page: page + 1 }))
  }, [])

  // Handler untuk perubahan jumlah item per halaman
  const handlePageSizeChange = useCallback((size: number) => {
    setQueryParams((prev) => ({ ...prev, per_page: size, page: 1 }))
  }, [])

  // Handler untuk sorting
  const handleSortChange = useCallback((sortBy: string, sortOrder: string) => {
    setQueryParams((prev) => ({
      ...prev,
      sort_by: sortBy,
      sort_order: sortOrder,
      page: 1,
    }))
  }, [])

  // Handler untuk search
  const handleSearchChange = useCallback((search: string) => {
    setQueryParams((prev) => ({
      ...prev,
      search: search,
      page: 1,
    }))
  }, [])
  // ===== COLUMN DEFINITIONS =====

  const columns: ColumnDef<DeviceItem, any>[] = useMemo(
    () => [
      {
        accessorKey: 'devices_code',
        header: 'Kode Alat',
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100 font-mono">
            {row.original.devices_code}
          </span>
        ),
      },
      {
        accessorKey: 'devices_name',
        header: 'Nama Alat',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
              <HiCpuChip className="w-4 h-4 text-primary-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-800 truncate">{row.original.devices_name}</p>
              {row.original.description && (
                <p className="text-xs text-neutral-400 truncate max-w-[200px]">{row.original.description}</p>
              )}
            </div>
          </div>
        ),
      },
      // add field NAMA INSTITUSI
      {
        accessorKey: 'institution.institutions_name',
        header: 'Nama Institusi',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {row.original.institution?.logo_url ? (
                <img
                  src={row.original.institution?.logo_url}
                  alt={row.original.institution?.institutions_name}
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
                {row.original.institution?.institutions_name || '-'}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <DeviceStatusBadge status={row.original.status} label={row.original.status_label} />
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Dibuat',
        cell: ({ row }) => (
          <span className="text-xs text-neutral-500">{formatDateTime(row.original.created_at)}</span>
        ),
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
    [handleDetail, handleEdit, handleDelete],
  )

  // ===== RENDER =====

  return (
    <div className="my-4">
      {contextHolder}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-neutral-800">Manajemen Alat</h3>
            <p className="text-sm text-neutral-500">
              Daftar alat yang terdaftar dalam sistem diagnostik
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
              Tambah Alat
            </button>
          )}
        </div>

        {/* Table */}
        <DataTable
          data={data}
          columns={columns}
          pageSize={queryParams.per_page}
          currentPage={paginationInfo?.current_page}
          lastPage={paginationInfo?.last_page}
          totalItems={paginationInfo?.total}
          apiFrom={paginationInfo?.from}
          apiTo={paginationInfo?.to}
          onPageChange={handlePageChange}           
          onPageSizeChange={handlePageSizeChange}   
          onSortChange={handleSortChange}           
          onSearchChange={handleSearchChange}       
          serverSortBy={queryParams.sort_by}      
          serverSortOrder={queryParams.sort_order}
          showSearch
          searchPlaceholder="Cari alat (kode, nama)..."
          emptyMessage="Belum ada data alat terdaftar"
          isLoading={isLoading || isFetching}
        />

        {/* Form Modal (Create/Edit) */}
        <DeviceFormModal
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
          onSubmit={handleFormSubmit}
        />

        {/* Delete Confirmation Modal */}
        <DeviceDeleteModal
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
          <DeviceDetailView
            item={selectedItem}
            onClose={() => {
              setIsDetailOpen(false)
              setSelectedItem(null)
            }}
            onEdit={() => {
              setIsDetailOpen(false)
              handleEdit(selectedItem)
            }}
          />
        )}
      </div>
    </div>
  )
}

// ===================================================================
// DETAIL VIEW
// ===================================================================

interface DeviceDetailViewProps {
  item: DeviceItem
  onClose: () => void
  onEdit: () => void
}

const DeviceDetailView: React.FC<DeviceDetailViewProps> = ({ item, onClose, onEdit }) => {
  // Permission check untuk detail view
  const { can } = usePermission('device')

  const detailFields = [
    { label: 'Kode Alat', value: item.devices_code },
    { label: 'Nama Alat', value: item.devices_name },
    {
      label: 'Status',
      value: <DeviceStatusBadge status={item.status} label={item.status_label} />,
    },
    { label: 'Deskripsi', value: item.description || '-' },
    { label: 'Dibuat', value: formatDateTime(item.created_at) },
    { label: 'Terakhir Diupdate', value: formatDateTime(item.updated_at) },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
              <HiCpuChip className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">Detail Alat</h2>
              <p className="text-xs text-neutral-400 font-mono">{item.devices_code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <HiXMark className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

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
                {typeof field.value === 'string' ? <span>{field.value}</span> : field.value}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/40">
          {can('update') && (
            <button
              onClick={onEdit}
              className="px-4 py-2.5 text-sm font-medium text-white bg-warning rounded-lg hover:bg-warning/90 transition-all cursor-pointer flex items-center gap-2"
            >
              <HiPencilSquare className="w-4 h-4" />
              Edit
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

export default MainDeviceManagement
