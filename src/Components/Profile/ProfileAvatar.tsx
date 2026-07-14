import React from 'react'

interface ProfileAvatarProps {
  name?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES: Record<NonNullable<ProfileAvatarProps['size']>, string> = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-16 h-16 text-xl',
  lg: 'w-24 h-24 text-3xl',
}

// Small fixed palette so the color is stable for a given name, not random on every render.
const PALETTE = [
  'bg-primary/90',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-rose-500',
]

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

function getColorClass(name?: string): string {
  if (!name) return PALETTE[0]
  const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return PALETTE[hash % PALETTE.length]
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ name, size = 'md' }) => {
  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold text-white flex-shrink-0 ${SIZE_CLASSES[size]} ${getColorClass(name)}`}
      aria-label={name ? `Avatar ${name}` : 'Avatar'}
    >
      {getInitials(name)}
    </div>
  )
}

export default ProfileAvatar