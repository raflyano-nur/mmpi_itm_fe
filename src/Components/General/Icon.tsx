import { getHeroIcon } from '@/Helpers/iconHandler'
import { HiListBullet } from 'react-icons/hi2'

export default function Icon({ iconName, className }) {
  const Icon = getHeroIcon(iconName)

  return (
    <div>
      {Icon ? (
        <Icon className={`${className || 'w-4 h-4 text-white'}`} />
      ) : (
        <HiListBullet className={`${className || 'w-4 h-4 text-white'}`} />
      )}
    </div>
  )
}
