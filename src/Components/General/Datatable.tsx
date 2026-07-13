import React, { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table'

interface DataTableProps<T extends object> {
  data?: T[]
  columns?: ColumnDef<T, any>[]
  pageSize?: number
  showSearch?: boolean
  searchPlaceholder?: string
  isLoading?: boolean
  emptyMessage?: string
  // Server-side pagination props
  totalData?: number
  totalItems?: number // Alias for totalData for backward compatibility
  currentPage?: number
  lastPage?: number
  apiFrom?: number // from API response
  apiTo?: number // to API response
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  // Server-side sorting props
  onSortChange?: (sortBy: string, sortOrder: string) => void
  serverSortBy?: string
  serverSortOrder?: string
  // Server-side search props
  onSearchChange?: (search: string) => void
  onSearch?: (search: string) => void // Alias for backward compatibility
}

/**
 * Reusable DataTable Component untuk Redux Toolkit
 *
 * @param {Array} data - Data dari Redux store
 * @param {Array} columns - Column definitions
 * @param {number} pageSize - Items per page (default: 10)
 * @param {boolean} showSearch - Show search bar (default: true)
 * @param {string} searchPlaceholder - Search placeholder text
 * @param {boolean} isLoading - Loading state dari Redux
 * @param {string} emptyMessage - Message ketika data kosong
 */
export default function DataTable<T extends object>({
  data = [],
  columns = [],
  pageSize = 10,
  showSearch = true,
  searchPlaceholder = 'Cari...',
  isLoading = false,
  emptyMessage = 'Tidak ada data',
  // Server-side props
  totalData,
  totalItems,
  currentPage,
  lastPage,
  apiFrom,
  apiTo,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  serverSortBy,
  serverSortOrder,
  onSearchChange,
  onSearch,
}: DataTableProps<T>) {
  // Use totalItems if totalData is not provided (backward compatibility)
  const total = totalData ?? totalItems

  // Use onSearch if onSearchChange is not provided (backward compatibility)
  const handleSearch = onSearchChange ?? onSearch

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Server-side features can be enabled independently.
  const isServerPagination = !!onPageChange
  const isServerSorting = !!onSortChange
  const isServerSearch = !!handleSearch

  // Use API's from/to values directly for server-side pagination info
  // If apiFrom/apiTo are not provided, fall back to calculation (for backward compatibility)
  const paginationInfo = isServerPagination
    ? {
        from: apiFrom ?? (total ? Math.max(1, ((currentPage || 1) - 1) * pageSize + 1) : 0),
        to: apiTo ?? (total ? Math.min((currentPage || 1) * pageSize, total) : 0),
        total: total || 0,
      }
    : null

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: isServerPagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: isServerSorting ? undefined : getSortedRowModel(),
    getFilteredRowModel: isServerSearch ? undefined : getFilteredRowModel(),
    state: {
      sorting: isServerSorting ? [] : sorting,
      globalFilter: isServerSearch ? '' : globalFilter,
    },
    onSortingChange: (updater) => {
      if (isServerSorting && onSortChange) {
        const newSort = typeof updater === 'function' ? updater(sorting) : updater
        if (newSort.length > 0) {
          const sortCol = (columns[newSort[0].id]?.accessorKey as string) || newSort[0].id
          onSortChange(sortCol, newSort[0].desc ? 'desc' : 'asc')
        } else {
          onSortChange('', '')
        }
      } else {
        setSorting(updater)
      }
    },
    onGlobalFilterChange: (updater) => {
      if (isServerSearch && handleSearch) {
        const value = typeof updater === 'function' ? updater(globalFilter) : updater
        handleSearch(value)
      } else {
        setGlobalFilter(updater)
      }
    },
    manualPagination: isServerPagination,
    manualSorting: isServerSorting,
    pageCount: isServerPagination ? lastPage || 1 : -1,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Search Bar */}
      {showSearch && (
        <div className="p-4 md:p-5 border-b border-neutral-100 bg-neutral-50/60">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-neutral-400"
              onChange={(e) => {
                if (isServerSearch && handleSearch) {
                  handleSearch(e.target.value)
                } else {
                  table.setGlobalFilter(e.target.value)
                }
              }}
              // disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-neutral-100">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 md:px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:text-primary-600 transition-colors bg-neutral-50/40"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span className="text-primary-500">
                        {isServerSorting && serverSortBy === header.id
                          ? serverSortOrder === 'desc'
                            ? '↓'
                            : '↑'
                          : ({
                              asc: '↑',
                              desc: '↓',
                            }[header.column.getIsSorted() as string] ?? '')}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-3 border-neutral-200 border-t-primary-500 rounded-full animate-spin"></div>
                    <p className="mt-3 text-neutral-500 text-sm">Memuat data...</p>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-primary-50/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 md:px-5 py-3.5 text-sm text-neutral-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="w-10 h-10 text-neutral-300 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className="text-neutral-400 text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && table.getRowModel().rows.length > 0 && (
        <div className="px-4 md:px-5 py-3.5 border-t border-neutral-100 bg-neutral-50/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Info jumlah data - Server-side */}
            {isServerPagination && total !== undefined && paginationInfo && (
              <div className="text-sm text-neutral-500">
                Menampilkan <span className="font-semibold text-neutral-800">{paginationInfo.from}</span> -{' '}
                <span className="font-semibold text-neutral-800">{paginationInfo.to}</span> dari{' '}
                <span className="font-semibold text-neutral-800">{paginationInfo.total}</span> data
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isServerPagination && onPageChange) {
                    // TanStack Table uses 0-based indexing, convert from API's 1-based to 0-based
                    onPageChange((currentPage || 1) - 1 - 1)
                  } else {
                    table.previousPage()
                  }
                }}
                disabled={isServerPagination ? (currentPage || 1) <= 1 : !table.getCanPreviousPage()}
                className="px-3.5 py-1.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 hover:border-primary-300 hover:text-primary-600 transition-all cursor-pointer"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => {
                  if (isServerPagination && onPageChange) {
                    // TanStack Table uses 0-based indexing, convert from API's 1-based to 0-based
                    onPageChange((currentPage || 1) - 1 + 1)
                  } else {
                    table.nextPage()
                  }
                }}
                disabled={
                  isServerPagination
                    ? (currentPage || 1) >= (lastPage || 1)
                    : !table.getCanNextPage() || table.getPageCount() <= 1
                }
                className="px-3.5 py-1.5 text-sm font-medium text-white bg-primary-500 border border-primary-500 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-600 transition-all cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>

            <div className="flex items-center gap-4">
              {isServerPagination ? (
                <span className="text-sm text-neutral-500">
                  Halaman <span className="font-semibold text-primary-600">{currentPage || 1}</span> dari{' '}
                  <span className="font-semibold text-neutral-800">{lastPage || 1}</span>
                </span>
              ) : (
                <span className="text-sm text-neutral-500">
                  Halaman
                  <span className="font-semibold text-primary-600">
                    {table.getState().pagination.pageIndex + 1}
                  </span>
                  dari{' '}
                  <span className="font-semibold text-neutral-800">
                    {table.getPageCount() > 0 ? table.getPageCount() : 1}
                  </span>
                </span>
              )}

              <select
                value={isServerPagination ? pageSize : table.getState().pagination.pageSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value)
                  if (isServerPagination && onPageSizeChange) {
                    onPageSizeChange(newSize)
                  } else {
                    table.setPageSize(newSize)
                  }
                }}
                className="px-2.5 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white text-neutral-600 cursor-pointer"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size} per halaman
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
