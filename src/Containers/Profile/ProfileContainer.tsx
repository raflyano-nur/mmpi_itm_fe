import React, { useEffect, useState } from 'react'
import { useGetMemberDetailQuery, useUpdateMemberMutation } from '@/Services/Modules/members'
import { useSessionUser } from '@/Hooks/useSessionUser'
import { calculateAgeFromBirthdate, normalizeBirthdateDraft, toInputDate } from '@/Helpers/memberDate'
import ProfileView from './ProfileView'
import AppLayout from "@/Components/Layout/AppLayout";

interface ProfileContainerProps {
  /** Which member to show. Defaults to the logged-in user's own profile. */
  idnumber?: string | number
}

/**
 * Owns all Profile data-fetching/mutation logic. Pure presentation lives in
 * ProfileView + the components under Components/Profile — this file only
 * decides *what* to show and *what happens* on user actions.
 */
const ProfileContainer: React.FC<ProfileContainerProps> = ({ idnumber }) => {
  const session = useSessionUser()
  const targetId = idnumber ?? session.id ?? ''

  const isOwnProfile = String(targetId) === String(session.id)
  const canEdit = isOwnProfile || session.role === 'admin'

  const {
    data,
    isLoading,
    isFetching,
    error: fetchError,
  } = useGetMemberDetailQuery(targetId, { skip: !targetId })

  const [updateMember, { isLoading: isSaving }] = useUpdateMemberMutation()

  const member = data?.data.member ?? null

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [saveError, setSaveError] = useState<string | null>(null)

  // Reset the draft whenever a fresh member record arrives (e.g. after a refetch).
  useEffect(() => {
    if (member) {
      setFormData(normalizeBirthdateDraft({ ...member }, 'BirthDate', 'Age'))
    }
  }, [member])

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'BirthDate') {
        next.Age = calculateAgeFromBirthdate(value)
      }
      return next
    })
  }

  const handleEdit = () => {
    setSaveError(null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (member) setFormData(normalizeBirthdateDraft({ ...member }, 'BirthDate', 'Age'))
    setSaveError(null)
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!member) return
    setSaveError(null)

    const birthdate = toInputDate(formData.BirthDate as string | number | null)
    const age = String(formData.Age ?? '').trim()
    if (!birthdate || !age) {
      setSaveError('Tanggal Lahir dan Usia wajib diisi.')
      return
    }

    try {
      await updateMember({
        idnumber: member.IDNumber,
        nama: formData.Name as string,
        address: formData.Address as string,
        gender: formData.Gender as string,
        birthdate,
        age,
        education: formData.Education as string,
        marital: formData.MaritalStatus as string,
        occupation: formData.Occupation as string,
        referredby: formData.ReferredBy as string,
      }).unwrap()
      setIsEditing(false)
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ?? 'Gagal menyimpan perubahan profil.'
      setSaveError(message)
    }
  }

  return (
    <AppLayout
          title="Profile Peserta"
          subtitle="Kelola Peserta"
        >
    <ProfileView
      member={member}
      viewerRole={session.role}
      canEdit={canEdit}
      isEditing={isEditing}
      isSaving={isSaving}
      isLoading={session.isLoading || isLoading || isFetching}
      error={saveError ?? (fetchError ? 'Gagal memuat data profil.' : null)}
      formData={formData}
      onEdit={handleEdit}
      onCancel={handleCancel}
      onSave={handleSave}
      onFieldChange={handleFieldChange}
    />
        </AppLayout>
    
  )
}

export default ProfileContainer
