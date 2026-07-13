import Badge from '@/Components/General/Badge'
import type { Member } from '@/Services/Modules/members/getMembers'

interface AdminStatusBadgeProps {
  isActive: Member['is_active']
}

export default function AdminStatusBadge({ isActive }: AdminStatusBadgeProps) {
  return isActive ? (
    <Badge variant="success" size="sm">
      Terverifikasi
    </Badge>
  ) : (
    <Badge variant="warning" size="sm">
      Belum Verifikasi
    </Badge>
  )
}
