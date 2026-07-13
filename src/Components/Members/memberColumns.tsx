import { ColumnDef } from "@tanstack/react-table";
import type { Member } from "@/Services/Modules/members/getMembers";
import MemberStatusBadge from "./MemberStatusBadge";
import MemberRowActions from "./MemberRowActions";

interface BuildMemberColumnsArgs {
  selectedIds: (string | number)[];
  onToggleSelect: (id: string | number) => void;
  onToggleSelectAll: () => void;
  isAllSelected: boolean;
  onToggleVerify: (member: Member) => void;
  onDelete: (member: Member) => void;
  togglingId?: string | number | null;
  deletingId?: string | number | null;
}

const checkboxClass =
  "w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer";

export function buildMemberColumns({
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  isAllSelected,
  onToggleVerify,
  onDelete,
  togglingId = null,
  deletingId = null,
}: BuildMemberColumnsArgs): ColumnDef<Member, any>[] {
  return [
    {
      id: "select",
      header: () => (
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={onToggleSelectAll}
          className={checkboxClass}
          aria-label="Pilih semua peserta di halaman ini"
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
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <MemberRowActions
          member={row.original}
          onToggleVerify={onToggleVerify}
          onDelete={onDelete}
          isToggling={togglingId === row.original.IDNumber}
          isDeleting={deletingId === row.original.IDNumber}
        />
      ),
      enableSorting: false,
    },
    {
      id: "IDNumber",
      header: "ID Number",
      accessorFn: (row) => row.IDNumber,
    },
    {
      id: "Name",
      header: "Nama",
      accessorFn: (row) => row.Name,
      cell: ({ row }) => (
        <span className="font-medium text-neutral-800">
          {row.original.Name}
        </span>
      ),
    },
    {
      id: "BirthDate",
      header: "Tanggal Lahir",
      accessorFn: (row) => row.BirthDate,
    },
    {
      id: "Gender",
      header: "Jenis Kelamin",
      accessorFn: (row) => row.Gender,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <MemberStatusBadge isActive={row.original.is_active} />
      ),
    },
  ];
}
