import { useState } from 'react'
import Button from '@/Components/General/Button'
import Icon from '@/Components/General/Icon'
import DetailModal, { DetailSection } from '@/Components/General/DetailModal'
import AdminFormModal from './AdminFormModal'
import type { Member } from '@/Services/Modules/members/getMembers'

interface AdminRowActionsProps {
  admin: Member
  onToggleActive: (admin: Member) => void
  onDelete: (admin: Member) => void
  isToggling?: boolean
  isDeleting?: boolean
}

const genderLabel = (gender: Member['Gender']) => {
  if (gender === 'L') return 'Laki-laki'
  if (gender === 'P') return 'Perempuan'
  return gender || '-'
}

export default function AdminRowActions({
  admin,
  onToggleActive,
  onDelete,
  isToggling = false,
  isDeleting = false,
}: AdminRowActionsProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const detailSections: DetailSection[] = [
    {
      title: 'Informasi Akun',
      fields: [
        { label: 'ID Number', value: admin.IDNumber },
        { label: 'Username', value: admin.username },
        { label: 'Tanggal Daftar', value: admin.tgl_register },
        {
          label: 'Status',
          value: admin.is_active ? 'Terverifikasi' : 'Belum Verifikasi',
          badge: {
            text: admin.is_active ? 'Terverifikasi' : 'Belum Verifikasi',
            variant: admin.is_active ? 'success' : 'warning',
          },
        },
      ],
    },
    {
      title: 'Data Pribadi',
      fields: [
        { label: 'Nama', value: admin.Name, colSpan: 2 },
        { label: 'Jenis Kelamin', value: genderLabel(admin.Gender) },
        { label: 'Usia', value: admin.Age != null ? `${admin.Age} tahun` : null },
        { label: 'Tanggal Lahir', value: admin.BirthDate },
        { label: 'Status Pernikahan', value: admin.MaritalStatus },
        { label: 'Pendidikan', value: admin.Education },
        { label: 'Pekerjaan', value: admin.Occupation },
      ],
    },
    {
      title: 'Informasi Lainnya',
      fields: [
        { label: 'Alamat', value: admin.Address, colSpan: 2 },
        // { label: 'Direferensikan Oleh', value: admin.ReferredBy, colSpan: 2 },
      ],
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDetailOpen(true)}
        icon={<Icon iconName="eye" className="w-3.5 h-3.5" />}
        className="!text-neutral-600 !border-neutral-300 hover:!bg-neutral-100 hover:!border-neutral-400"
      >
        Detail
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditOpen(true)}
        icon={<Icon iconName="pencil-square" className="w-3.5 h-3.5" />}
        className="!text-blue-600 !border-blue-200 hover:!bg-blue-50 hover:!border-blue-400"
      >
        Edit
      </Button>

      <Button
        variant={admin.is_active ? 'outline' : 'green'}
        size="sm"
        loading={isToggling}
        onClick={() => onToggleActive(admin)}
        icon={<Icon iconName={admin.is_active ? 'arrow-uturn-left' : 'check'} className="w-3.5 h-3.5" />}
        className={
          admin.is_active
            ? '!text-amber-600 !border-amber-200 hover:!bg-amber-50 hover:!border-amber-400'
            : ''
        }
      >
        {admin.is_active ? 'Batalkan' : 'Verifikasi'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        loading={isDeleting}
        onClick={() => onDelete(admin)}
        icon={<Icon iconName="trash" className="w-3.5 h-3.5" />}
        className="!text-red-600 !border-red-200 hover:!border-red-400 hover:!bg-red-50"
      >
        Hapus
      </Button>

      <DetailModal
        isOpen={isDetailOpen}
        title={admin.Name}
        subtitle={`ID Number: ${admin.IDNumber}`}
        sections={detailSections}
        onClose={() => setIsDetailOpen(false)}
      />

      <AdminFormModal isOpen={isEditOpen} mode="edit" admin={admin} onClose={() => setIsEditOpen(false)} />
    </div>
  )
}
