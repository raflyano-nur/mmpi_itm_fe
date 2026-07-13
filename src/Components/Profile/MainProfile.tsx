// MainProfile.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/Store'
import {
  HiUser,
  HiEnvelope,
  HiPhone,
  HiMapPin,
  HiCalendar,
  HiIdentification,
  HiBuildingOffice,
  HiBriefcase,
  HiAcademicCap,
  HiHeart,
  HiGlobeAlt,
  HiUserGroup,
  HiFlag,
  HiKey,
  HiShieldCheck,
  HiCheckCircle,
  HiPencilSquare,
  HiPhoto,
  HiArrowPath,
  HiXMark,
  HiLockClosed,
  HiEye,
  HiEyeSlash,
} from 'react-icons/hi2'
import { useNotification } from '@/Components/General/Notification'
import { convertImageToBase64 } from '@/Helpers/fileToBase64'
import {
  useGetUserByIdQuery,
  usePutUserMutation,
  usePatchUserToggleActiveMutation,
} from '@/Services/Modules/Users'
import { useGetRoleListQuery } from '@/Services/Modules/Roles/rolesApi'
import { useGetListInstitutionQuery } from '@/Services/Modules/institution'
import type { UserData, Role, Institution, ProfileFormData, TabKey, UserResponse } from './types'
import { UserMutationResponse } from '@/Services/Modules/Users/users.types'

const TABS: { key: TabKey; label: string; icon: React.ReactNode; description: string }[] = [
  {
    key: 'personal',
    label: 'Data Pribadi',
    icon: <HiUser className="w-3.5 h-3.5" />,
    description: 'Informasi identitas diri',
  },
  {
    key: 'contact',
    label: 'Kontak & Alamat',
    icon: <HiMapPin className="w-3.5 h-3.5" />,
    description: 'Informasi kontak dan alamat',
  },
  {
    key: 'account',
    label: 'Akun & Akses',
    icon: <HiShieldCheck className="w-3.5 h-3.5" />,
    description: 'Informasi akun dan hak akses',
  },
]

const GENDER_OPTIONS = [
  { value: 'L', label: 'Laki-laki' },
  { value: 'P', label: 'Perempuan' },
]
const RELIGION_OPTIONS = ['Islam', 'Kristen Protestan', 'Kristen Katolik', 'Hindu', 'Buddha', 'Konghucu']
const EDUCATION_OPTIONS = ['SD/Sederajat', 'SMP/Sederajat', 'SMA/Sederajat', 'D1/D2/D3', 'S1/D4', 'S2', 'S3']
const MARITAL_STATUS_OPTIONS = ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati']
const CITIZENSHIP_OPTIONS = ['WNI', 'WNA']

interface MainProfileProps {
  userId?: number
  token: string
}

const MainProfile: React.FC<MainProfileProps> = ({ userId, token }) => {
  const { showNotification, contextHolder } = useNotification()
  const [activeTab, setActiveTab] = useState<TabKey>('personal')
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(userId ? Number(userId) : undefined)
  const auth = useSelector((state: RootState) => state.AuthSlicer)
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.role_name === 'Super Admin'

  const emptyForm: ProfileFormData = {
    username: '',
    fullname: '',
    email: '',
    phone: '',
    address: '',
    birthplace: '',
    birthdate: '',
    sex: '',
    religion: '',
    citizenship: '',
    maritalstatus: '',
    education: '',
    work: '',
    institution_id: '',
    role_id: '',
    photo: '',
  }
  const [formData, setFormData] = useState<ProfileFormData>(emptyForm)
  const [originalData, setOriginalData] = useState<ProfileFormData>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoConverting, setPhotoConverting] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' })
  const [passwordErrors, setPasswordErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({})
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (!currentUserId && auth?.user?.id) setCurrentUserId(Number(auth.user.id))
  }, [auth, currentUserId])

  const {
    data: userResponse,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser,
    refetch: refetchUser,
  } = useGetUserByIdQuery(currentUserId as number, { skip: !token || currentUserId === null })
  const {
    data: rolesResponse,
    isLoading: isLoadingRoles,
    refetch: refetchRoles,
  } = useGetRoleListQuery({ per_page: 999, page: 1, with_deleted: false }, { skip: !token })
  const {
    data: institutionsResponse,
    isLoading: isLoadingInstitutions,
    refetch: refetchInstitutions,
  } = useGetListInstitutionQuery({ per_page: 100 }, { skip: !token })
  const [updateUser, { isLoading: isUpdating }] = usePutUserMutation()
  const [toggleActive, { isLoading: isToggling }] = usePatchUserToggleActiveMutation()

  // const userData = userResponse?.data as UserData | undefined
  const userData = userResponse?.data
  const roles = (rolesResponse?.data as any)?.data || []
  const institutions = (institutionsResponse?.data as any)?.data || []

  useEffect(() => {
    if (userData) {
      const d: ProfileFormData = {
        username: userData.username || '',
        fullname: userData.person?.fullname || '',
        email: userData.person?.mail || '',
        phone: userData.person?.phone || '',
        // address: userData.person?.address || '',
        address: userData.person?.address?.addr1 || '',
        birthplace: userData.person?.birthplace || '',
        birthdate: userData.person?.birthdate ? userData.person.birthdate.split('T')[0] : '',
        sex: userData.person?.sex || '',
        religion: userData.person?.religion || '',
        citizenship: userData.person?.citizenship || '',
        maritalstatus: userData.person?.maritalstatus || '',
        education: userData.person?.education || '',
        work: userData.person?.work || '',
        institution_id: userData.institution_id?.toString() || '',
        role_id: userData.role_id?.toString() || '',
        photo: userData.person?.photo_link || '',
      }
      setFormData(d)
      setOriginalData(d)
      setPhotoPreview(userData.person?.photo_link || null)
    }
  }, [userData])

  const handleChange = (key: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }
  const handlePasswordChange = (key: 'newPassword' | 'confirmPassword', value: string) => {
    setPasswordData((prev) => ({ ...prev, [key]: value }))
    if (passwordErrors[key]) setPasswordErrors((prev) => ({ ...prev, [key]: undefined }))
  }
  const handlePhotoUpload = async (file: File) => {
    setPhotoError(null)
    setPhotoConverting(true)
    try {
      const result = await convertImageToBase64(file)
      if ('error' in result) {
        setPhotoError(result.error)
        return
      }
      setFormData((prev) => ({ ...prev, photo: result.base64 }))
      setPhotoPreview(result.base64)
    } catch {
      setPhotoError('Gagal memproses gambar.')
    } finally {
      setPhotoConverting(false)
      if (photoInputRef.current) photoInputRef.current.value = ''
    }
  }
  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: '' }))
    setPhotoPreview(null)
    setPhotoError(null)
    if (photoInputRef.current) photoInputRef.current.value = ''
  }
  const validate = (): boolean => {
    const e: Partial<Record<keyof ProfileFormData, string>> = {}
    if (!formData.fullname.trim()) e.fullname = 'Nama lengkap wajib diisi'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = 'Format email tidak valid'
    if (formData.birthdate && !/^\d{4}-\d{2}-\d{2}$/.test(formData.birthdate))
      e.birthdate = 'Format YYYY-MM-DD'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const validatePassword = (): boolean => {
    const e: { newPassword?: string; confirmPassword?: string } = {}
    if (passwordData.newPassword && passwordData.newPassword.length < 8) e.newPassword = 'Minimal 8 karakter'
    if (passwordData.newPassword && !passwordData.confirmPassword) e.confirmPassword = 'Wajib diisi'
    if (
      passwordData.newPassword &&
      passwordData.confirmPassword &&
      passwordData.newPassword !== passwordData.confirmPassword
    )
      e.confirmPassword = 'Password tidak cocok'
    setPasswordErrors(e)
    return Object.keys(e).length === 0
  }
  const handleSave = async () => {
    if (!validate() || !validatePassword()) return
    if (!currentUserId || !token) {
      showNotification({ title: 'Error!', description: 'Token tidak ditemukan.', type: 'error' })
      return
    }
    setIsSaving(true)
    try {
      const data: any = {
        username: formData.username,
        institution_id: formData.institution_id ? Number(formData.institution_id) : null,
        fullname: formData.fullname,
        mail: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        birthplace: formData.birthplace || null,
        birthdate: formData.birthdate || null,
        sex: formData.sex || null,
        religion: formData.religion || null,
        citizenship: formData.citizenship || null,
        maritalstatus: formData.maritalstatus || null,
        education: formData.education || null,
        work: formData.work || null,
      }

      // FIX: was formData.base64 (typo) → sekarang formData.photo
      // In handleSave, replace the file_photo block:

      // if (formData.photo && !formData.photo.startsWith('/storage/')) {
      //   // Ensure the base64 string has the required data URI prefix
      //   const hasPrefix = formData.photo.startsWith('data:')
      //   data.file_photo = hasPrefix ? formData.photo : `data:image/jpeg;base64,${formData.photo}`
      // } else if (formData.photo === '') {
      //   data.file_photo = null
      // }
      // kirim hanya jika foto benar-benar diubah
      if (formData.photo !== originalData.photo) {
        if (formData.photo === '') {
          data.file_photo = null // user menghapus foto
        } else if (!formData.photo.startsWith('/storage/')) {
          const hasPrefix = formData.photo.startsWith('data:')
          data.file_photo = hasPrefix ? formData.photo : `data:image/jpeg;base64,${formData.photo}`
        }
      }
      // Kalau /storage/ → skip (tidak dikirim)

      if (passwordData.newPassword) {
        data.password = passwordData.newPassword
      }

      // const result = (await updateUser({
      //   id: currentUserId,
      //   data,
      // }).unwrap())
      const result: UserMutationResponse = await updateUser({
        id: currentUserId,
        data,
      }).unwrap()
      if (result.status === 'success') {
        setOriginalData(formData)
        setIsEditing(false)
        setPasswordData({ newPassword: '', confirmPassword: '' })
        showNotification({
          title: 'Berhasil!',
          description: result.message || 'Profil diperbarui.',
          type: 'success',
        })
        refetchUser()
      } else {
        showNotification({
          title: 'Gagal!',
          description: result.message || 'Terjadi kesalahan.',
          type: 'error',
        })
      }
    } catch (err: any) {
      showNotification({
        title: 'Gagal!',
        description: err?.data?.message || 'Terjadi kesalahan.',
        type: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }
  const handleCancel = () => {
    setFormData(originalData)
    setPhotoPreview(originalData.photo || null)
    setErrors({})
    setIsEditing(false)
    setPhotoError(null)
    setPasswordData({ newPassword: '', confirmPassword: '' })
    setPasswordErrors({})
  }
  const handleRefresh = () => {
    refetchUser()
    refetchRoles()
    refetchInstitutions()
  }

  const hasChanges =
    JSON.stringify(formData) !== JSON.stringify(originalData) ||
    passwordData.newPassword !== '' ||
    passwordData.confirmPassword !== ''
  const isLoading = isLoadingUser || isLoadingRoles || isLoadingInstitutions
  const isFetching = isFetchingUser || isUpdating || isToggling

  if (!token)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <HiShieldCheck className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
          <p className="text-sm text-neutral-500">Token tidak ditemukan</p>
        </div>
      </div>
    )
  if (isLoading)
    return (
      <div className="flex flex-col gap-3 p-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg" />
        <div className="h-16 bg-gray-200 rounded-lg" />
        <div className="h-40 bg-gray-200 rounded-lg" />
      </div>
    )

  // ── Shared styles ──
  const inputCls = (err?: boolean) =>
    `w-full px-2.5 py-1.5 text-xs rounded-md border transition-all bg-white focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed ${err
      ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
      : 'border-neutral-200 focus:ring-primary-100 focus:border-primary-400'
    }`

  const renderField = (
    key: keyof ProfileFormData,
    label: string,
    icon: React.ReactNode,
    type: 'text' | 'select' | 'date' = 'text',
    options?: { value: string; label: string }[] | string[],
  ) => {
    const value = formData[key]
    const error = errors[key]
    return (
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-1 text-[11px] font-medium text-neutral-500">
          <span className="text-neutral-400">{icon}</span>
          {label}
        </label>
        {isEditing ? (
          <>
            {type === 'select' ? (
              <select
                value={value || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                disabled={isSaving}
                className={inputCls(!!error)}
              >
                <option value="">Pilih…</option>
                {options?.map((o) =>
                  typeof o === 'string' ? (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ) : (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ),
                )}
              </select>
            ) : (
              <input
                type={type === 'date' ? 'date' : 'text'}
                value={value || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                disabled={isSaving}
                placeholder={`${label}…`}
                className={inputCls(!!error)}
              />
            )}
            {error && <p className="text-[10px] text-red-500">{error}</p>}
          </>
        ) : (
          <p className={`text-xs ${value ? 'text-neutral-800' : 'text-neutral-400 italic'}`}>
            {value || '—'}
          </p>
        )}
      </div>
    )
  }

  const renderReadOnly = (label: string, icon: React.ReactNode, value?: string) => (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-1 text-[11px] font-medium text-neutral-500">
        <span className="text-neutral-400">{icon}</span>
        {label}
      </label>
      <p className={`text-xs ${value ? 'text-neutral-800' : 'text-neutral-400 italic'}`}>{value || '—'}</p>
    </div>
  )

  const renderPasswordField = (
    key: 'newPassword' | 'confirmPassword',
    label: string,
    show: boolean,
    onToggle: () => void,
  ) => {
    const error = passwordErrors[key]
    return (
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-1 text-[11px] font-medium text-neutral-500">
          <HiLockClosed className="w-3 h-3 text-neutral-400" />
          {label}
        </label>
        {isEditing ? (
          <>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={passwordData[key]}
                onChange={(e) => handlePasswordChange(key, e.target.value)}
                disabled={isSaving}
                placeholder={key === 'newPassword' ? 'Kosongkan jika tidak diubah' : 'Ulangi password baru'}
                className={`${inputCls(!!error)} pr-8`}
              />
              <button
                type="button"
                onClick={onToggle}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400 hover:text-neutral-600"
              >
                {show ? <HiEyeSlash className="w-3.5 h-3.5" /> : <HiEye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {error && <p className="text-[10px] text-red-500">{error}</p>}
          </>
        ) : (
          <p className="text-xs italic text-neutral-400">••••••••</p>
        )}
      </div>
    )
  }

  const renderTabContent = () => {
    if (activeTab === 'personal')
      return (
        <div className="grid grid-cols-2 gap-x-5 gap-y-3">
          {renderField('fullname', 'Nama Lengkap', <HiUser className="w-3 h-3" />)}
          {renderField('birthplace', 'Tempat Lahir', <HiFlag className="w-3 h-3" />)}
          {renderField('birthdate', 'Tanggal Lahir', <HiCalendar className="w-3 h-3" />, 'date')}
          {renderField('sex', 'Jenis Kelamin', <HiUserGroup className="w-3 h-3" />, 'select', GENDER_OPTIONS)}
          {renderField('religion', 'Agama', <HiHeart className="w-3 h-3" />, 'select', RELIGION_OPTIONS)}
          {renderField(
            'citizenship',
            'Kewarganegaraan',
            <HiGlobeAlt className="w-3 h-3" />,
            'select',
            CITIZENSHIP_OPTIONS,
          )}
          {renderField(
            'maritalstatus',
            'Status Pernikahan',
            <HiHeart className="w-3 h-3" />,
            'select',
            MARITAL_STATUS_OPTIONS,
          )}
          {renderField(
            'education',
            'Pendidikan',
            <HiAcademicCap className="w-3 h-3" />,
            'select',
            EDUCATION_OPTIONS,
          )}
          {renderField('work', 'Pekerjaan', <HiBriefcase className="w-3 h-3" />)}
        </div>
      )
    if (activeTab === 'contact')
      return (
        <div className="grid grid-cols-2 gap-x-5 gap-y-3">
          {renderField('email', 'Email', <HiEnvelope className="w-3 h-3" />)}
          {renderField('phone', 'Nomor Telepon', <HiPhone className="w-3 h-3" />)}
          <div className="col-span-2">
            {renderReadOnly('Alamat', <HiMapPin className="w-3 h-3" />, formData.address)}
          </div>
        </div>
      )
    if (activeTab === 'account') {
      const institutionName = institutions.find(
        (i: Institution) => i.id.toString() === formData.institution_id,
      )?.institutions_name
      const roleName = roles.find((r: Role) => r.id.toString() === formData.role_id)?.role_name
      return (
        <div className="grid grid-cols-2 gap-x-5 gap-y-3">
          {renderField('username', 'Username', <HiIdentification className="w-3 h-3" />)}
          {renderPasswordField('newPassword', 'Password Baru', showNewPassword, () =>
            setShowNewPassword((v) => !v),
          )}
          {isEditing ? (
            renderPasswordField('confirmPassword', 'Konfirmasi Password', showConfirmPassword, () =>
              setShowConfirmPassword((v) => !v),
            )
          ) : (
            <div />
          )}
          {!isSuperAdmin &&
            renderReadOnly('Institusi', <HiBuildingOffice className="w-3 h-3" />, institutionName)}
          {renderReadOnly('Role', <HiKey className="w-3 h-3" />, roleName)}
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-1 text-[11px] font-medium text-neutral-500">
              <HiShieldCheck className="w-3 h-3 text-neutral-400" />
              Status Akun
            </label>
            <div className="flex flex-wrap gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${userData?.isactive ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-600'
                  }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${userData?.isactive ? 'bg-emerald-500' : 'bg-neutral-400'}`}
                />
                {userData?.isactive ? 'Aktif' : 'Tidak Aktif'}
              </span>
              {userData?.api_key_active && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">
                  <HiKey className="w-2.5 h-2.5" />
                  API Key Aktif
                </span>
              )}
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col h-full gap-2 p-3 overflow-hidden">
      {contextHolder}

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-shrink-0">
        {/* <div className="flex items-center gap-2">
          <div className="flex items-center justify-center border rounded-lg w-7 h-7 bg-primary-50 border-primary-100">
            <HiUser className="w-3.5 h-3.5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-neutral-800">Profil Pengguna</h3>
            <p className="text-[10px] text-neutral-400">Kelola informasi profil Anda</p>
          </div>
        </div> */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-neutral-500 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <HiArrowPath className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-primary-600 bg-primary-50 border border-primary-100 rounded-md hover:bg-primary-100 transition-all cursor-pointer"
            >
              <HiPencilSquare className="w-3 h-3" />
              <span className="hidden sm:inline">Edit Profil</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-neutral-600 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 transition-all disabled:opacity-50 cursor-pointer"
              >
                <HiXMark className="w-3 h-3" />
                <span className="hidden sm:inline">Batal</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-white bg-primary-500 border border-primary-600 rounded-md hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <div className="w-3 h-3 border rounded-full border-white/30 border-t-white animate-spin" />
                    <span>Menyimpan…</span>
                  </>
                ) : (
                  <>
                    <HiCheckCircle className="w-3 h-3" />
                    <span>Simpan</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Profile strip ── */}
      <div className="flex items-center flex-shrink-0 gap-3 px-3 py-2 bg-white border border-neutral-200 rounded-xl">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="flex items-center justify-center w-12 h-12 overflow-hidden border-2 border-dashed rounded-xl border-neutral-200 bg-neutral-50">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile"
                className="object-cover w-full h-full"
                onError={() => setPhotoPreview(null)}
              />
            ) : (
              <HiPhoto className="w-5 h-5 text-neutral-300" />
            )}
          </div>
          {isEditing && (
            <div className="absolute flex gap-0.5 -bottom-1.5 -right-1.5">
              <label className="flex items-center justify-center w-5 h-5 bg-white border rounded-full shadow-sm cursor-pointer border-neutral-200 hover:bg-neutral-50">
                <HiPhoto className="w-3 h-3 text-neutral-600" />
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handlePhotoUpload(f)
                  }}
                  disabled={photoConverting || isSaving}
                  className="hidden"
                />
              </label>
              {photoPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isSaving}
                  className="flex items-center justify-center w-5 h-5 bg-white border rounded-full shadow-sm border-neutral-200 hover:bg-neutral-50 disabled:opacity-50"
                >
                  <HiXMark className="w-3 h-3 text-red-500" />
                </button>
              )}
            </div>
          )}
        </div>
        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate text-neutral-800">
            {formData.fullname || 'Nama Lengkap'}
          </p>
          <p className="text-[11px] text-neutral-400">@{formData.username || 'username'}</p>
          {photoError && <p className="text-[10px] text-red-500">{photoError}</p>}
          {photoConverting && <p className="text-[10px] text-neutral-400">Memproses foto…</p>}
        </div>
        {/* Meta */}
        <div className="flex-shrink-0 text-right">
          <p className="text-[10px] text-neutral-400">ID: {userData?.id || '—'}</p>
          {userData?.person?.natid && (
            <p className="text-[10px] text-neutral-400">NIK: {userData.person.natid}</p>
          )}
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex-shrink-0 overflow-hidden bg-white border border-neutral-200 rounded-xl">
        <div className="hidden sm:flex">
          {TABS.map((tab) => {
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium transition-all cursor-pointer border-b-2 ${active
                  ? 'border-primary-500 text-primary-600 bg-primary-50/40'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                  }`}
              >
                <span className={active ? 'text-primary-500' : 'text-neutral-400'}>{tab.icon}</span>
                {tab.label}
              </button>
            )
          })}
        </div>
        <div className="p-2 sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TabKey)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border rounded-md border-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-100"
          >
            {TABS.map((tab) => (
              <option key={tab.key} value={tab.key}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>
        <div className="items-center hidden px-4 py-1 border-t sm:flex bg-neutral-50/40 border-neutral-100">
          <p className="text-[10px] text-neutral-400">{TABS.find((t) => t.key === activeTab)?.description}</p>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 min-h-0 px-4 py-3 overflow-y-auto bg-white border border-neutral-200 rounded-xl">
        {renderTabContent()}
      </div>
    </div>
  )
}

export default MainProfile
