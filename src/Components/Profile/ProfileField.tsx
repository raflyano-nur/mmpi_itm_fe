import React from 'react'
import type { ProfileFieldConfig } from './profileFields.config'

interface ProfileFieldProps {
  field: ProfileFieldConfig
  value: unknown
  displayValue: string
  isEditing: boolean
  onChange: (key: string, value: string) => void
}

const ProfileField: React.FC<ProfileFieldProps> = ({ field, value, displayValue, isEditing, onChange }) => {
  const inputId = `profile-field-${field.key}`

  const renderInput = () => {
    switch (field.type) {
      case 'select':
        return (
          <select
            id={inputId}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border-2 border-primary/30 rounded-lg text-sm focus:border-primary focus:ring focus:ring-primary/20 focus:outline-none bg-white"
          >
            <option value="" disabled>
              Pilih {field.label}
            </option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )
      case 'date':
        return (
          <input
            id={inputId}
            type="date"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border-2 border-primary/30 rounded-lg text-sm focus:border-primary focus:ring focus:ring-primary/20 focus:outline-none"
          />
        )
      case 'text':
      default:
        return (
          <input
            id={inputId}
            type="text"
            value={(value as string) ?? ''}
            placeholder={field.placeholder}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border-2 border-primary/30 rounded-lg text-sm focus:border-primary focus:ring focus:ring-primary/20 focus:outline-none"
          />
        )
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className="block text-xs font-medium text-gray-500 mb-1">
        {field.label}
        {field.required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {isEditing && field.type !== 'readonly' ? (
        renderInput()
      ) : (
        <p className="text-sm font-medium text-gray-800 py-2 min-h-[2.25rem] flex items-center">
          {displayValue || <span className="text-gray-400 font-normal">-</span>}
        </p>
      )}
    </div>
  )
}

export default ProfileField
