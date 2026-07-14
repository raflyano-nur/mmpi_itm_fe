import React from 'react'
import type { Member } from '@/Services/Modules/members/getMembers'
import { ProfileHeader, ProfileInfoCard } from '@/Components/Profile'
import { getProfileSections } from '@/Components/Profile/profileFields.config'

interface ProfileViewProps {
  member: Member | null
  viewerRole: 'admin' | 'user'
  canEdit: boolean
  isEditing: boolean
  isSaving: boolean
  isLoading: boolean
  error?: string | null
  formData: Record<string, unknown>
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  onFieldChange: (key: string, value: string) => void
}

const ProfileSkeleton: React.FC = () => (
  <div className="p-6 max-w-3xl mx-auto space-y-6 animate-pulse">
    <div className="h-28 bg-gray-200 rounded-2xl" />
    <div className="h-40 bg-gray-200 rounded-2xl" />
    <div className="h-40 bg-gray-200 rounded-2xl" />
  </div>
)

const ProfileView: React.FC<ProfileViewProps> = ({
  member,
  viewerRole,
  canEdit,
  isEditing,
  isSaving,
  isLoading,
  error,
  formData,
  onEdit,
  onCancel,
  onSave,
  onFieldChange,
}) => {
  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (error || !member) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-sm">{error || 'Data profil tidak ditemukan.'}</p>
        </div>
      </div>
    )
  }

  const sections = getProfileSections(viewerRole)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <ProfileHeader
        member={member}
        canEdit={canEdit}
        isEditing={isEditing}
        isSaving={isSaving}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={onSave}
      />

      {sections.map((section) => (
        <ProfileInfoCard
          key={section.id}
          section={section}
          member={member}
          formData={formData}
          isEditing={isEditing}
          viewerRole={viewerRole}
          onFieldChange={onFieldChange}
        />
      ))}
    </div>
  )
}

export default ProfileView