import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface DataTableProps<T extends object> {
  data?: T[];
  columns?: ColumnDef<T, any>[];
  pageSize?: number;
  pageSizeOptions?: number[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  isLoading?: boolean;
  isRefetching?: boolean;
  emptyMessage?: string;
  totalData?: number;
  totalItems?: number;
  currentPage?: number;
  lastPage?: number;
  apiFrom?: number;
  apiTo?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortChange?: (sortBy: string, sortOrder: string) => void;
  serverSortBy?: string;
  serverSortOrder?: string;
  onSearchChange?: (search: string) => void;
  onSearch?: (search: string) => void;
}

type DataTableColumnMeta = {
  headerClassName?: string;
  cellClassName?: string;
  headerStyle?: React.CSSProperties;
  cellStyle?: React.CSSProperties;
};

function getPageNumbers(
  currentPage: number,
  lastPage: number,
): (number | "...")[] {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (currentPage > 3) pages.push("...");

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(lastPage - 1, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (currentPage < lastPage - 2) pages.push("...");

  pages.push(lastPage);
  return pages;
}

export default function DataTable<T extends object>({
  data = [],
  columns = [],
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100],
  showSearch = true,
  searchPlaceholder = "Cari...",
  isLoading = false,
  isRefetching = false,
  emptyMessage = "Tidak ada data",
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
  const normalizedPageSizeOptions = [
    ...new Set([pageSize, ...pageSizeOptions]),
  ].sort((a, b) => a - b);
  const total = totalData ?? totalItems;
  const handleSearch = onSearchChange ?? onSearch;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pendingPage, setPendingPage] = useState<number | null>(null);
  const isServerSide = !!onPageChange;

  const paginationInfo = isServerSide
    ? {
        from:
          apiFrom ??
          (total ? Math.max(1, ((currentPage || 1) - 1) * pageSize + 1) : 0),
        to:
          apiTo ?? (total ? Math.min((currentPage || 1) * pageSize, total) : 0),
        total: total || 0,
      }
    : null;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
    getSortedRowModel: onSortChange ? undefined : getSortedRowModel(),
    getFilteredRowModel: isServerSide ? undefined : getFilteredRowModel(),
    state: {
      sorting: onSortChange ? [] : sorting,
      globalFilter: isServerSide ? "" : globalFilter,
      pagination: {
        pageIndex: (currentPage || 1) - 1,
        pageSize,
      },
    },
    onSortingChange: (updater) => {
      if (onSortChange) {
        const newSort =
          typeof updater === "function" ? updater(sorting) : updater;
        if (newSort.length > 0) {
          const sortCol =
            (columns[newSort[0].id]?.accessorKey as string) || newSort[0].id;
          onSortChange(sortCol, newSort[0].desc ? "desc" : "asc");
        } else {
          onSortChange("", "");
        }
      } else {
        setSorting(updater);
      }
    },
    onGlobalFilterChange: (updater) => {
      if (isServerSide && handleSearch) {
        const value =
          typeof updater === "function" ? updater(globalFilter) : updater;
        handleSearch(value);
      } else {
        setGlobalFilter(updater);
      }
    },
    manualPagination: isServerSide,
    manualSorting: !!onSortChange,
    pageCount: isServerSide ? lastPage || 1 : -1,
  });

  const getColumnMeta = (columnDef: ColumnDef<T, any>): DataTableColumnMeta =>
    (columnDef.meta as DataTableColumnMeta) ?? {};

  const resolvedCurrentPage = currentPage || 1;
  const activePage = isServerSide
    ? (pendingPage ?? resolvedCurrentPage)
    : table.getState().pagination.pageIndex + 1;
  const totalPages = isServerSide
    ? lastPage || 1
    : table.getPageCount() > 0
      ? table.getPageCount()
      : 1;
  const isPageTransitioning =
    isServerSide &&
    pendingPage !== null &&
    (pendingPage !== resolvedCurrentPage || isLoading || isRefetching);
  const isPaginationBusy = isPageTransitioning || isLoading || isRefetching;
  const canPrev = isServerSide ? activePage > 1 : table.getCanPreviousPage();
  const canNext = isServerSide
    ? activePage < (lastPage || 1)
    : table.getCanNextPage() && table.getPageCount() > 1;

  useEffect(() => {
    if (!isServerSide) return;

    if (
      !isLoading &&
      !isRefetching &&
      pendingPage !== null &&
      pendingPage === resolvedCurrentPage
    ) {
      setPendingPage(null);
    }
  }, [isLoading, isRefetching, isServerSide, pendingPage, resolvedCurrentPage]);

  function goToPage(page: number) {
    if (
      page < 1 ||
      page > totalPages ||
      page === activePage ||
      isPaginationBusy
    )
      return;

    if (isServerSide && onPageChange) {
      setPendingPage(page);
      onPageChange(page - 1);
    } else {
      table.setPageIndex(page - 1);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-theme-sm">
      {showSearch && (
        <div className="border-b border-neutral-100 bg-neutral-50/60 p-4 md:p-5">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 transform text-neutral-400"
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
              className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-all placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              onChange={(e) => {
                if (isServerSide && handleSearch) {
                  handleSearch(e.target.value);
                } else {
                  table.setGlobalFilter(e.target.value);
                }
              }}
            />
          </div>
        </div>
      )}

      <div className="relative overflow-x-auto">
        {((isRefetching && !isLoading) || isPageTransitioning) &&
        table.getRowModel().rows.length > 0 ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-white/70 pt-6 backdrop-blur-[1px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600 shadow-sm">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-primary-500" />
              {isPageTransitioning
                ? "Memuat halaman..."
                : "Memperbarui tabel..."}
            </div>
          </div>
        ) : null}
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-neutral-100">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`cursor-pointer bg-neutral-50/40 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 transition-colors hover:text-primary-600 md:px-5 ${getColumnMeta(header.column.columnDef).headerClassName ?? ""}`}
                    style={getColumnMeta(header.column.columnDef).headerStyle}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      <span className="text-primary-500">
                        {isServerSide && serverSortBy === header.id
                          ? serverSortOrder === "desc"
                            ? "↓"
                            : "↑"
                          : ({
                              asc: "↑",
                              desc: "↓",
                            }[header.column.getIsSorted() as string] ?? "")}
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
                    <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-neutral-200 border-t-primary-500" />
                    <p className="mt-3 text-sm text-neutral-500">
                      Memuat data...
                    </p>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-primary-50/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-3.5 text-sm text-neutral-700 md:px-5 ${getColumnMeta(cell.column.columnDef).cellClassName ?? ""}`}
                      style={getColumnMeta(cell.column.columnDef).cellStyle}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="mb-3 h-10 w-10 text-neutral-300"
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
                    <p className="text-sm text-neutral-400">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && table.getRowModel().rows.length > 0 && (
        <div className="border-t border-neutral-100 bg-neutral-50/40 px-4 py-3.5 md:px-5">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            {isServerSide && total !== undefined && paginationInfo && (
              <div className="text-sm text-neutral-500">
                Menampilkan{" "}
                <span className="font-semibold text-neutral-800">
                  {paginationInfo.from}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-neutral-800">
                  {paginationInfo.to}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-neutral-800">
                  {paginationInfo.total}
                </span>{" "}
                data
              </div>
            )}

            <div className="flex items-center gap-1">
              {totalPages > 1 ? (
                <>
                  <button
                    onClick={() => goToPage(activePage - 1)}
                    disabled={!canPrev || isPaginationBusy}
                    className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 transition-all hover:border-primary-300 hover:bg-neutral-50 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="flex items-center gap-1">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Sebelumnya
                    </span>
                  </button>

                  <div className="mx-1 flex items-center gap-1">
                    {getPageNumbers(activePage, totalPages).map((page, idx) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="flex h-8 w-8 select-none items-center justify-center text-sm text-neutral-400"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => goToPage(page as number)}
                          disabled={isPaginationBusy}
                          className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border text-sm font-medium transition-all ${
                            page === activePage
                              ? "border-primary-500 bg-primary-500 text-white"
                              : "border-neutral-200 bg-white text-neutral-600 hover:border-primary-300 hover:bg-neutral-50 hover:text-primary-600"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    onClick={() => goToPage(activePage + 1)}
                    disabled={!canNext || isPaginationBusy}
                    className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 transition-all hover:border-primary-300 hover:bg-neutral-50 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="flex items-center gap-1">
                      Selanjutnya
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </button>
                </>
              ) : (
                <div className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-500">
                  1 halaman
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <select
                value={
                  isServerSide ? pageSize : table.getState().pagination.pageSize
                }
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  if (isServerSide && onPageSizeChange) {
                    onPageSizeChange(newSize);
                  } else {
                    table.setPageSize(newSize);
                  }
                }}
                className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-600 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {normalizedPageSizeOptions.map((size) => (
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
  );
}
