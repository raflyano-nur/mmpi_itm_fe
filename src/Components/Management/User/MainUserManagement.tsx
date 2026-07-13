/**
 * @file MainUserManagement.tsx
 * @description Komponen utama halaman Manajemen User.
 *
 * Menampilkan tabel daftar user dengan kolom:
 * - Nama Lengkap & Username
 * - Institusi
 * - Role
 * - Status (Aktif / Nonaktif)
 * - Aksi (Edit, Toggle Status)
 *
 * Hak akses berdasarkan role:
 * - Super Admin : melihat & mengelola semua user, semua role tersedia
 * - IT Institusi : hanya melihat & mengelola user di institusinya sendiri,
 *                  role yang tersedia hanya Admin & IT
 *
 * Menggunakan komponen reusable:
 * - {@link DataTable} untuk tabel dengan search, sort, dan pagination
 * - {@link UserDetailModal} untuk modal tambah/edit user
 *
 * Data diambil dari API melalui RTK Query.
 *
 * @module UserManagement/MainUserManagement
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/Components/General/Datatable'
import UserDetailModal from './UserDetailModal'
import type { UserItem as LocalUserItem, UserRole } from './types'
import type { UserItem as ApiUserItem, UserListParams } from '@/Services/Modules/Users/users.types'
import { useGetUserListQuery, usePatchUserToggleActiveMutation } from '@/Services/Modules/Users'
import { useGetListInstitutionQuery } from '@/Services/Modules/institution'
import { HiMagnifyingGlass, HiFunnel, HiXMark } from 'react-icons/hi2'

// ============================================================
// TIPE DATA
// ============================================================

/**
 * Mapping dari API User ke Local User untuk UI
 */
const mapApiUserToLocalUser = (apiUser: ApiUserItem): LocalUserItem => {
  return {
    id: String(apiUser.id),
    username: apiUser.username,
    namaLengkap: apiUser.fullname || apiUser.username,
    phone: apiUser.phone || '',
    email: apiUser.mail || '',
    role: (apiUser.role_name?.toLowerCase().replace(' ', '_') as UserRole) || 'it',
    institutionId: apiUser.institution_id ? String(apiUser.institution_id) : null,
    namaInstitusi: apiUser.institution_id ? `Institution #${apiUser.institution_id}` : '-',
    status: apiUser.isactive ? 'aktif' : 'nonaktif',
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  }
}

// ============================================================
// SIMULASI SESSION USER YANG LOGIN
// Nantinya diganti dari Redux auth state
// ============================================================
const currentUser = {
  role: 'super_admin' as 'super_admin' | 'admin' | 'it',
  institutionId: 9, // Number type for API
  namaInstitusi: 'Puskesmas Boyolali 1',
  isSuperAdmin: false,
}

// ============================================================
// HELPERS
// ============================================================

const roleLabel: Record<string, { label: string; className: string }> = {
  super_admin: {
    label: 'Super Admin',
    className: 'bg-violet-50 text-violet-700 border-violet-100',
  },
  admin: {
    label: 'Admin',
    className: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  it: {
    label: 'IT',
    className: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  staff_it: {
    label: 'IT Staff',
    className: 'bg-amber-50 text-amber-700 border-amber-100',
  },
}

// ============================================================
// COMPONENT
// ============================================================

const MainUserManagement = () => {
  // ===== STATE =====
  // Query params untuk server-side pagination, sort, dan filter
  const [queryParams, setQueryParams] = useState<UserListParams>({
    page: 1,
    per_page: 15,
    search: '',
    sort_by: 'created_at',
    sort_order: 'desc',
    isactive: undefined,
    institution_id: undefined,
    role_id: undefined,
  })

  // Filter states untuk UI
  const [showFilters, setShowFilters] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterInstitution, setFilterInstitution] = useState<string>('')
  const [filterRole, setFilterRole] = useState<string>('')
  const [searchInput, setSearchInput] = useState('')

  // Modal states
  const [selectedItem, setSelectedItem] = useState<LocalUserItem | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // ===== API HOOKS =====
  const { data: apiResponse, isLoading, isFetching, refetch } = useGetUserListQuery(queryParams)
  const [toggleActive, { isLoading: isToggling }] = usePatchUserToggleActiveMutation()

  // Fetch institutions list for filter
  const { data: institutionsResponse } = useGetListInstitutionQuery({ per_page: 1000 })
  const institutions = useMemo(() => institutionsResponse?.data?.data ?? [], [institutionsResponse])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setQueryParams((prev) => ({ ...prev, search: searchInput, page: 1 }))
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  // ===== DATA EXTRACTION & MAPPING =====
  const data = useMemo<LocalUserItem[]>(() => {
    const apiData = apiResponse?.data?.data ?? []
    return apiData.map(mapApiUserToLocalUser)
  }, [apiResponse])

  const paginationInfo = useMemo(() => {
    if (!apiResponse?.data) return null
    const apiData = apiResponse.data as any
    const { current_page, last_page, per_page, total } = apiData
    // Use from/to from API if available, otherwise calculate
    const from = apiData.from ?? (total > 0 ? (current_page - 1) * per_page + 1 : 0)
    const to = apiData.to ?? Math.min(current_page * per_page, total)
    return { current_page, last_page, from, to, total, per_page }
  }, [apiResponse])

  // ===== HANDLERS =====

  /** Handle page change - server-side pagination */
  const handlePageChange = useCallback((page: number) => {
    // Convert from 0-based (TanStack) to 1-based (API)
    setQueryParams((prev) => ({ ...prev, page: page + 1 }))
  }, [])

  /** Handle page size change */
  const handlePageSizeChange = useCallback((pageSize: number) => {
    setQueryParams((prev) => ({ ...prev, per_page: pageSize, page: 1 }))
  }, [])

  /** Handle sort change - server-side sorting */
  const handleSortChange = useCallback((sortBy: string, sortOrder: string) => {
    setQueryParams((prev) => ({
      ...prev,
      sort_by: sortBy,
      sort_order: sortOrder as 'asc' | 'desc',
    }))
  }, [])

  /** Handle search change - update local state for debounce */
  const handleSearchChange = useCallback((search: string) => {
    setSearchInput(search)
  }, [])

  /** Handle filter change - server-side filter */
  const handleFilterChange = useCallback(
    (filterType: 'status' | 'institution' | 'role', value: string) => {
      let newParams: UserListParams = { ...queryParams, page: 1 }

      if (filterType === 'status') {
        setFilterStatus(value)
        newParams.isactive = value === '' ? undefined : value === 'aktif'
      } else if (filterType === 'institution') {
        setFilterInstitution(value)
        newParams.institution_id = value === '' ? undefined : parseInt(value, 10)
      } else if (filterType === 'role') {
        setFilterRole(value)
        newParams.role_id = value === '' ? undefined : parseInt(value, 10)
      }

      setQueryParams(newParams)
    },
    [queryParams],
  )

  /** Clear all filters */
  const handleClearFilters = useCallback(() => {
    setFilterStatus('')
    setFilterInstitution('')
    setFilterRole('')
    setSearchInput('')
    setQueryParams((prev) => ({
      ...prev,
      page: 1,
      search: '',
      isactive: undefined,
      institution_id: undefined,
      role_id: undefined,
    }))
  }, [])

  /** Buka modal tambah user baru */
  const handleTambahUser = () => {
    setSelectedItem(null)
    setIsEditMode(false)
    setIsFormOpen(true)
  }

  /** Buka modal edit user */
  const handleEdit = (item: LocalUserItem) => {
    setSelectedItem(item)
    setIsEditMode(true)
    setIsFormOpen(true)
  }

  /** Tutup modal form */
  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedItem(null)
    setIsEditMode(false)
  }

  /** Toggle status aktif / nonaktif */
  const handleToggleStatus = async (item: LocalUserItem) => {
    try {
      // Convert local ID to API ID (number)
      const apiId = parseInt(item.id, 10)
      await toggleActive(apiId).unwrap()
      refetch()
    } catch (error) {
      console.error('Gagal toggle status:', error)
    }
  }

  /** Simpan data user (tambah / edit) - handled by UserDetailModal */
  const handleSave = () => {
    // Refresh data after save
    refetch()
    handleCloseForm()
  }

  // ===== COLUMN DEFINITIONS =====
  const columns: ColumnDef<LocalUserItem, any>[] = useMemo(
    () => [
      {
        accessorKey: 'namaLengkap',
        header: 'Pengguna',
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-primary-50">
              <span className="text-sm font-semibold text-primary-600">
                {(row.original.namaLengkap || row.original.username || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium leading-tight text-neutral-800">
                {row.original.namaLengkap || '-'}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">@{row.original.username}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'namaInstitusi',
        header: 'Institusi',
        cell: ({ row }) => (
          <span className="text-sm text-neutral-600">
            {row.original.institutionId ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                {row.original.namaInstitusi}
              </span>
            ) : (
              <span className="italic text-neutral-400">—</span>
            )}
          </span>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => {
          const r = roleLabel[row.original.role] || roleLabel.it
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${r.className}`}
            >
              {r.label}
            </span>
          )
        },
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <span className="text-sm text-neutral-500">{row.original.email || '-'}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const isAktif = row.original.status === 'aktif'
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${
                isAktif
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-neutral-100 text-neutral-500 border-neutral-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isAktif ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
                }`}
              />
              {isAktif ? 'Aktif' : 'Nonaktif'}
            </span>
          )
        },
      },
      {
        id: 'aksi',
        header: 'Aksi',
        enableSorting: false,
        cell: ({ row }) => {
          const isSelf = row.original.username === 'superadmin' && currentUser.role !== 'super_admin'
          return (
            <div className="flex items-center gap-1.5">
              {/* Edit Button */}
              <button
                onClick={() => handleEdit(row.original)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>

              {/* Toggle Status Button */}
              {!isSelf && (
                <button
                  onClick={() => handleToggleStatus(row.original)}
                  disabled={isToggling}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    row.original.status === 'aktif'
                      ? 'text-neutral-600 bg-neutral-100 hover:bg-neutral-200'
                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {row.original.status === 'aktif' ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      </svg>
                      Nonaktifkan
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Aktifkan
                    </>
                  )}
                </button>
              )}
            </div>
          )
        },
      },
    ],
    [isToggling],
  )

  // Check if any filter is active
  const hasActiveFilters = filterStatus !== '' || filterInstitution !== '' || filterRole !== ''

  // ===== RENDER =====
  return (
    <div className="p-4 space-y-5 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 text-primary-600 border border-primary-100">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2" />
            {paginationInfo?.total || 0} Pengguna
          </span>
          {currentUser.role !== 'super_admin' && (
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-500 border border-neutral-200">
              {currentUser.namaInstitusi}
            </span>
          )}
        </div>

        {/* Tombol Tambah User */}
        <button
          onClick={handleTambahUser}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg cursor-pointer bg-primary-500 hover:bg-primary-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah User
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {/* Filter Toggle */}
        <div
          className="flex items-center justify-between px-4 py-3 bg-neutral-50/60 border-b border-neutral-100 cursor-pointer"
          onClick={() => setShowFilters(!showFilters)}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <HiFunnel className="w-4 h-4" />
            Filter
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                Aktif
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-neutral-400 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                >
                  <option value="">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>

              {/* Institution Filter */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Institusi</label>
                <select
                  value={filterInstitution}
                  onChange={(e) => handleFilterChange('institution', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                  disabled={currentUser.role !== 'super_admin'}
                >
                  <option value="">Semua Institusi</option>
                  {currentUser.role === 'super_admin' &&
                    institutions.map((inst: any) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.institutions_name}
                      </option>
                    ))}
                  {currentUser.role !== 'super_admin' && (
                    <option value={currentUser.institutionId}>{currentUser.namaInstitusi}</option>
                  )}
                </select>
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                >
                  <option value="">Semua Role</option>
                  {currentUser.role === 'super_admin' && (
                    <>
                      <option value="1">Super Admin</option>
                      <option value="2">Admin</option>
                      <option value="3">IT</option>
                      <option value="4">IT Staff</option>
                    </>
                  )}
                  {(currentUser.role === 'admin' || currentUser.role === 'it') && (
                    <>
                      <option value="2">Admin</option>
                      <option value="3">IT</option>
                      <option value="4">IT Staff</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <HiXMark className="w-3.5 h-3.5" />
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Data Table - Server-side */}
      <DataTable<LocalUserItem>
        data={data}
        columns={columns}
        pageSize={queryParams.per_page}
        showSearch={true}
        searchPlaceholder="Cari berdasarkan nama, username, atau email..."
        isLoading={isLoading || isFetching}
        emptyMessage="Belum ada data pengguna"
        // Server-side pagination props
        currentPage={paginationInfo?.current_page}
        lastPage={paginationInfo?.last_page}
        totalData={paginationInfo?.total}
        apiFrom={paginationInfo?.from}
        apiTo={paginationInfo?.to}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        // Server-side sorting props
        onSortChange={handleSortChange}
        serverSortBy={queryParams.sort_by}
        serverSortOrder={queryParams.sort_order}
        // Server-side search props
        onSearchChange={handleSearchChange}
      />

      {/* Form Modal */}
      <UserDetailModal
        isOpen={isFormOpen}
        item={selectedItem}
        isEditMode={isEditMode}
        currentUserRole={currentUser.role}
        onClose={handleCloseForm}
        onSave={handleSave}
      />
    </div>
  )
}

export default MainUserManagement
