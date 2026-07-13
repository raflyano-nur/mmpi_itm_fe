import { ColumnDef } from '@tanstack/react-table'
import type { Member } from '@/Services/Modules/members/getMembers'
import AdminStatusBadge from './AdminStatusBadge'
import AdminRowActions from './AdminRowActions'

interface BuildAdminColumnsArgs {
  selectedIds: (string | number)[]
  onToggleSelect: (id: string | number) => void
  onToggleSelectAll: () => void
  isAllSelected: boolean
  onToggleActive: (admin: Member) => void
  onDelete: (admin: Member) => void
  togglingId?: string | number | null
  deletingId?: string | number | null
}

const checkboxClass =
  'w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer'

export function buildAdminColumns({
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  isAllSelected,
  onToggleActive,
  onDelete,
  togglingId = null,
  deletingId = null,
}: BuildAdminColumnsArgs): ColumnDef<Member, any>[] {
  return [
    {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={onToggleSelectAll}
          className={checkboxClass}
          aria-label="Pilih semua admin di halaman ini"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.original.IDNumber)}
          onChange={() => onToggleSelect(row.original.IDNumber)}
          onClick={(e) => e.stopPropagation()}
          className={checkboxClass}
          aria-label={`Pilih ${row.original.Name}`}
        />
      ),
      enableSorting: false,
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <AdminRowActions
          admin={row.original}
          onToggleActive={onToggleActive}
          onDelete={onDelete}
          isToggling={togglingId === row.original.IDNumber}
          isDeleting={deletingId === row.original.IDNumber}
        />
      ),
      enableSorting: false,
    },
    {
      id: 'IDNumber',
      header: 'ID Number',
      accessorFn: (row) => row.IDNumber,
    },
    {
      id: 'Name',
      header: 'Nama',
      accessorFn: (row) => row.Name,
      cell: ({ row }) => <span className="font-medium text-neutral-800">{row.original.Name}</span>,
    },
    {
      id: 'username',
      header: 'Username',
      accessorFn: (row) => row.username,
    },
    {
      id: 'Gender',
      header: 'Jenis Kelamin',
      accessorFn: (row) => row.Gender,
    },
    {
      id: 'tgl_register',
      header: 'Tgl Daftar',
      accessorFn: (row) => row.tgl_register,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <AdminStatusBadge isActive={row.original.is_active} />,
    },
  ]
}
