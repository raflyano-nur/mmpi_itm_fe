import React from 'react'
import { HiPencilSquare, HiCheck, HiXMark } from 'react-icons/hi2'
import type { Member } from '@/Services/Modules/members/getMembers'
import ProfileAvatar from './ProfileAvatar'

interface ProfileHeaderProps {
  member: Member
  canEdit: boolean
  isEditing: boolean
  isSaving: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
}

const RoleBadge: React.FC<{ role: string }> = ({ role }) => (
  <span
    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
      role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
    }`}
  >
    {role === 'admin' ? 'Admin' : 'Peserta'}
  </span>
)

const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <span
    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
    }`}
  >
    {isActive ? 'Terverifikasi' : 'Belum Verifikasi'}
  </span>
)

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  member,
  canEdit,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <ProfileAvatar name={member.Name} size="lg" />

      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-gray-800 truncate">{member.Name || 'Tanpa Nama'}</h1>
        <p className="text-sm text-gray-500 mb-2">ID: {member.IDNumber}</p>
        <div className="flex flex-wrap gap-2">
          <RoleBadge role={member.role} />
          <StatusBadge isActive={Boolean(member.is_active)} />
        </div>
      </div>

      {canEdit && (
        <div className="flex gap-2 flex-shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={onCancel}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <HiXMark size={16} />
                Batal
              </button>
              <button
                onClick={onSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50"
              >
                <HiCheck size={16} />
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </>
          ) : (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-primary text-primary text-sm font-medium hover:bg-primary hover:text-white transition-colors"
            >
              <HiPencilSquare size={16} />
              Edit Profil
            </button>
          )}

          <a
                href="/dashboard"
                className="px-5 py-2.5 rounded-full border-2 border-emerald-500 text-emerald-600 text-sm font-medium hover:bg-emerald-500 hover:text-white transition-colors"
              >
                Back
              </a>
        </div>
      )}
    </div>
  )
}

export default ProfileHeader