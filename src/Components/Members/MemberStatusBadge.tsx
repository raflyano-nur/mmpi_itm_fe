import Badge from '@/Components/General/Badge'
import type { Member } from '@/Services/Modules/members/getMembers'

interface MemberStatusBadgeProps {
  isActive: Member['is_active']
}

export default function MemberStatusBadge({ isActive }: MemberStatusBadgeProps) {
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
