import React from 'react'
import type { Member } from '@/Services/Modules/members/getMembers'
import ProfileField from './ProfileField'
import { isFieldEditable, type ProfileSectionConfig } from './profileFields.config'
import { calculateAge } from '@/Helpers/calculateAge'

interface ProfileInfoCardProps {
  section: ProfileSectionConfig
  member: Member
  formData: Record<string, unknown>
  isEditing: boolean
  viewerRole: 'admin' | 'user'
  onFieldChange: (key: string, value: string) => void
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  section,
  member,
  formData,
  isEditing,
  viewerRole,
  onFieldChange,
}) => {
  const handleFieldChange = (key: string, value: string) => {
    onFieldChange(key, value)

    // Auto-hitung Age setiap kali BirthDate berubah
    if (key === 'BirthDate') {
      onFieldChange('Age', calculateAge(value))
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-primary mb-4">{section.title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
        {section.fields.map((field) => {
          const rawValue = isEditing ? (formData[field.key] ?? member[field.key]) : member[field.key]
          const displayValue = field.formatValue
            ? field.formatValue(rawValue, member)
            : String(rawValue ?? '')
          const editableHere = isEditing && isFieldEditable(field, viewerRole)

          return (
            <ProfileField
              key={field.key}
              field={field}
              value={rawValue}
              displayValue={displayValue}
              isEditing={editableHere}
              onChange={handleFieldChange}
            />
          )
        })}
      </div>
    </div>
  )
}

export default ProfileInfoCard
