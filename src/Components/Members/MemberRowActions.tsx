import { Link } from 'react-router-dom'
import Button from '@/Components/General/Button'
import Icon from '@/Components/General/Icon'
import type { Member } from '@/Services/Modules/members/getMembers'

interface MemberRowActionsProps {
  member: Member
  onToggleVerify: (member: Member) => void
  onDelete: (member: Member) => void
  isToggling?: boolean
  isDeleting?: boolean
}

export default function MemberRowActions({
  member,
  onToggleVerify,
  onDelete,
  isToggling = false,
  isDeleting = false,
}: MemberRowActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Link to={`/admin/members/${member.IDNumber}`}>
        <Button
          variant="outline"
          size="sm"
          icon={<Icon iconName="eye" className="w-3.5 h-3.5" />}
          className="!text-neutral-600 !border-neutral-300 hover:!bg-neutral-100 hover:!border-neutral-400"
        >
          Detail
        </Button>
      </Link>

      <Button
        variant={member.is_active ? 'outline' : 'primary'}
        size="sm"
        loading={isToggling}
        onClick={() => onToggleVerify(member)}
        icon={
          <Icon
            iconName={member.is_active ? 'arrow-uturn-left' : 'check'}
            className="w-3.5 h-3.5"
          />
        }
        className={
          member.is_active
            ? '!text-amber-600 !border-amber-200 hover:!bg-amber-50 hover:!border-amber-400'
            : ''
        }
      >
        {member.is_active ? 'Batalkan' : 'Verifikasi'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        loading={isDeleting}
        onClick={() => onDelete(member)}
        icon={<Icon iconName="trash" className="w-3.5 h-3.5" />}
        className="!text-red-600 !border-red-200 hover:!border-red-400 hover:!bg-red-50"
      >
        Hapus
      </Button>
    </div>
  )
}