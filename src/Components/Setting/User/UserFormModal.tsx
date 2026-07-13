/**
 * @file UserFormModal.tsx
 * @description Modal form create/edit user
 * NOTE: roleOptions diterima dari parent (MainUser) yang fetch dari API roles
 * NOTE: Edit mode menggunakan data dari GET /users/:id yang memiliki nested person object
 *       Address dari API adalah string gabungan — di-parse dengan regex
 */

import React, { useEffect, useMemo } from 'react'
import { HiUserPlus, HiXMark, HiPhoto, HiTrash, HiIdentification } from 'react-icons/hi2'
import type { UserItem, UserFormData } from './types'

interface Institution {
  id: number
  name: string
  code?: string
}

interface RoleOption {
  label: string
  value: number
}

interface Props {
  isOpen: boolean
  mode: 'create' | 'edit'
  item?: UserItem | null
  institutions: Institution[]
  roleOptions: RoleOption[]
  isInstitutionsLoading?: boolean
  isSubmitting?: boolean
  role: string
  onClose: () => void
  onSubmit: (data: UserFormData, id?: number) => void
}

const EMPTY_FORM: UserFormData = {
  username: '',
  password: '',
  role_id: 0,
  isactive: true,
  institution_id: null,
  natid: '',
  fullname: '',
  mail: null,
  phone: null,
  title: null,
  sex: null,
  birthplace: null,
  birthdate: null,
  religion: null,
  ethnic: null,
  citizenship: null,
  maritalstatus: null,
  education: null,
  work: null,
  addr1: null,
  addr2: null,
  rt: null,
  rw: null,
  villages: null,
  districts: null,
  regencies: null,
  provincies: null,
  poscode: null,
  file_ktp: null,
  file_photo: null,
}

function parseAddressString(address?: string | null): {
  addr1: string | null
  addr2: string | null
  rt: string | null
  rw: string | null
  villages: string | null
  districts: string | null
  regencies: string | null
  provincies: string | null
  poscode: string | null
} {
  const empty = {
    addr1: null,
    addr2: null,
    rt: null,
    rw: null,
    villages: null,
    districts: null,
    regencies: null,
    provincies: null,
    poscode: null,
  }

  if (!address?.trim()) return empty

  const rtMatch = address.match(/RT\s+(\w+)/i)
  const rwMatch = address.match(/RW\s+(\w+)/i)
  const posMatch = address.match(/Kode\s+Pos\s+(\w+)/i)

  const addr1 = address.split(/,\s*RT\s/i)[0]?.trim() || null
  const parts = address.split(/,\s*/)

  const rtIdx = parts.findIndex((p) => /^RT\s/i.test(p))
  const villagesIdx = rtIdx >= 0 ? rtIdx + 1 : 2
  const districtsIdx = villagesIdx + 1
  const regenciesIdx = districtsIdx + 1
  const provinciesIdx = regenciesIdx + 1

  const getClean = (str?: string) => {
    if (!str) return null
    const cleaned = str.replace(/Kode\s+Pos\s+\w+/i, '').trim()
    return cleaned || null
  }

  return {
    addr1,
    addr2: null,
    rt: rtMatch ? rtMatch[1].trim() : null,
    rw: rwMatch ? rwMatch[1].trim() : null,
    villages: getClean(parts[villagesIdx]),
    districts: getClean(parts[districtsIdx]),
    regencies: getClean(parts[regenciesIdx]),
    provincies: getClean(parts[provinciesIdx]),
    poscode: posMatch ? posMatch[1].trim() : null,
  }
}

function formatDateForInput(dateStr?: string | null): string | null {
  if (!dateStr) return null
  return dateStr.split('T')[0] ?? null
}

function clean(str?: string | null): string | null {
  const trimmed = str?.trim()
  return trimmed || null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormField = any

const UserFormModal: React.FC<Props> = ({
  isOpen,
  mode,
  item,
  institutions,
  roleOptions,
  isInstitutionsLoading = false,
  isSubmitting = false,
  onClose,
  onSubmit,
  role = '',
}) => {
  const [formData, setFormData] = React.useState<UserFormData>(EMPTY_FORM)
  const [errors, setErrors] = React.useState<Partial<Record<keyof UserFormData, string>>>({})
  const [ktpPreview, setKtpPreview] = React.useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null)
  const [ktpError, setKtpError] = React.useState<string | null>(null)
  const [photoError, setPhotoError] = React.useState<string | null>(null)
  const ktpInputRef = React.useRef<HTMLInputElement>(null)
  const photoInputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return

    if (mode === 'edit' && item) {
      const p = item.person
      const parsedAddress = parseAddressString(p?.address)

      const currentRoleLabel = roleOptions.find((r) => r.value === (item.role_id || 0))?.label ?? ''
      const isCurrentRoleSuperAdmin = currentRoleLabel.toLowerCase().includes('super admin')

      setFormData({
        username: item.username || '',
        password: '',
        role_id: item.role_id || 0,
        isactive: item.isactive === true,
        // institution_id: item.institution_id,
        institution_id: isCurrentRoleSuperAdmin ? null : item.institution_id,
        natid: p?.natid ?? item.natid ?? '',
        fullname: p?.fullname ?? item.fullname ?? item.name ?? '',
        title: clean(p?.title ?? item.title),
        sex: (p?.sex ?? item.sex) as 'L' | 'P' | null,
        birthplace: clean(p?.birthplace ?? item.birthplace),
        birthdate: formatDateForInput(p?.birthdate ?? item.birthdate),
        religion: clean(p?.religion ?? item.religion),
        ethnic: p?.ethnic ?? item.ethnic ?? null,
        citizenship: clean(p?.citizenship ?? item.citizenship),
        maritalstatus: clean(p?.maritalstatus ?? item.maritalstatus),
        education: clean(p?.education ?? item.education),
        work: clean(p?.work ?? item.work),
        mail: clean(p?.mail ?? item.mail ?? item.email),
        phone: clean(p?.phone ?? item.phone),
        addr1: parsedAddress.addr1 ?? clean(item.addr1),
        addr2: parsedAddress.addr2 ?? clean(item.addr2),
        rt: parsedAddress.rt ?? clean(item.rt),
        rw: parsedAddress.rw ?? clean(item.rw),
        villages: parsedAddress.villages ?? clean(item.villages),
        districts: parsedAddress.districts ?? clean(item.districts),
        regencies: parsedAddress.regencies ?? clean(item.regencies),
        provincies: parsedAddress.provincies ?? clean(item.provincies),
        poscode: parsedAddress.poscode ?? clean(item.poscode),
        file_ktp: null,
        file_photo: null,
      })
    } else {
      setFormData({
        ...EMPTY_FORM,
        role_id: roleOptions[0]?.value ?? 0,
        institution_id: institutions.length === 1 ? institutions[0].id : undefined,
      })
    }
    setErrors({})
    setKtpPreview(null)
    setPhotoPreview(null)
    setKtpError(null)
    setPhotoError(null)
  }, [mode, item, isOpen, institutions, roleOptions])

  const institutionOptions = useMemo(() => {
    return institutions.map((i) => ({
      label: i.code ? `${i.code} - ${i.name}` : i.name,
      value: i.id,
    }))
  }, [institutions])

  // ===== isSuperAdminRole — dideklarasikan di level komponen agar tersedia di semua handler =====
  // const selectedRoleLabel = roleOptions.find((r) => r.value === Number(formData.role_id))?.label ?? ''
  // const isSuperAdminRole = selectedRoleLabel.toLowerCase().includes('super admin')

  // FIX: Ketika role diubah ke Super Admin, clear institution_id dari formData
  // agar tidak ikut terkirim ke backend
  // const handleChange = (field: keyof UserFormData, value: any) => {
  //   setFormData((prev) => {
  //     const updated = { ...prev, [field]: value }

  //     if (field === 'role_id') {
  //       const selectedLabel = roleOptions.find((r) => r.value === Number(value))?.label ?? ''
  //       if (selectedLabel.toLowerCase().includes('super admin')) {
  //         updated.institution_id = null
  //       }
  //     }

  //     return updated
  //   })
  //   if (errors[field]) {
  //     setErrors((prev) => ({ ...prev, [field]: undefined }))
  //   }
  // }
  // Di handleChange, sudah benar — pastikan ini ada:
  const handleChange = (field: keyof UserFormData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }

      if (field === 'role_id') {
        const selectedLabel = roleOptions.find((r) => r.value === Number(value))?.label ?? ''
        if (selectedLabel.toLowerCase().includes('super admin')) {
          updated.institution_id = null // ✅ force null
        }
      }

      return updated
    })
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'file_ktp' | 'file_photo') => {
    const file = e.target.files?.[0]
    if (!file) return

    const MAX_SIZE = 2 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      if (field === 'file_ktp') setKtpError('Ukuran file maks 2MB')
      else setPhotoError('Ukuran file maks 2MB')
      return
    }

    if (field === 'file_ktp') setKtpError(null)
    else setPhotoError(null)

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      handleChange(field, result)
      if (field === 'file_ktp') setKtpPreview(result)
      else setPhotoPreview(result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveFile = (field: 'file_ktp' | 'file_photo') => {
    handleChange(field, null)
    if (field === 'file_ktp') {
      setKtpPreview(null)
      setKtpError(null)
      if (ktpInputRef.current) ktpInputRef.current.value = ''
    } else {
      setPhotoPreview(null)
      setPhotoError(null)
      if (photoInputRef.current) photoInputRef.current.value = ''
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {}

    if (!formData.username?.trim()) newErrors.username = 'Username wajib diisi'
    if (mode === 'create') {
      if (!formData.password) newErrors.password = 'Password wajib diisi'
      else if (formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter'
    }
    if (!formData.role_id) newErrors.role_id = 'Role wajib dipilih'

    const selectedRole = roleOptions.find((r) => r.value === Number(formData.role_id))
    const isSuperAdmin = selectedRole?.label?.toLowerCase().includes('super admin') ?? false
    if (!isSuperAdmin && !formData.institution_id) newErrors.institution_id = 'Institusi wajib dipilih'

    if (!formData.natid?.trim()) newErrors.natid = 'NIK/NID wajib diisi'
    if (!formData.fullname?.trim()) newErrors.fullname = 'Nama lengkap wajib diisi'
    if (formData.mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mail)) {
      newErrors.mail = 'Format email tidak valid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    // isSuperAdminRole sudah tersedia dari scope komponen di atas
    const submitData: any = {
      username: formData.username,
      ...(formData.password ? { password: formData.password } : {}),
      role_id: formData.role_id,
      isactive: formData.isactive,
      // institution_id sudah di-clear di handleChange saat role berubah ke Super Admin,
      // double-guard di sini tetap dipertahankan sebagai safety net
      // ...(isSuperAdminRole ? {} : { institution_id: formData.institution_id }),
      institution_id: isSuperAdminRole ? null : formData.institution_id,
      natid: formData.natid,
      fullname: formData.fullname,
      mail: formData.mail || null,
      phone: formData.phone || null,
      title: formData.title || null,
      sex: formData.sex || null,
      birthplace: formData.birthplace || null,
      birthdate: formData.birthdate || null,
      religion: formData.religion || null,
      ethnic: formData.ethnic || null,
      citizenship: formData.citizenship || null,
      maritalstatus: formData.maritalstatus || null,
      education: formData.education || null,
      work: formData.work || null,
      addr1: formData.addr1 || null,
      addr2: formData.addr2 || null,
      rt: formData.rt || null,
      rw: formData.rw || null,
      villages: formData.villages || null,
      districts: formData.districts || null,
      regencies: formData.regencies || null,
      provincies: formData.provincies || null,
      poscode: formData.poscode || null,
      file_ktp: formData.file_ktp || null,
      file_photo: formData.file_photo || null,
    }

    onSubmit(submitData, mode === 'edit' ? item?.id : undefined)
  }
  const selectedRoleLabel = roleOptions.find((r) => r.value === Number(formData.role_id))?.label ?? ''
  const isSuperAdminRole = selectedRoleLabel.toLowerCase().includes('super admin')

  if (!isOpen) return null

  // ===== SHARED FIELD RENDERER =====

  const inputBase = (hasError: boolean, disabled: boolean) => `
    w-full px-3.5 py-2.5 text-sm border rounded-lg
    bg-white focus:outline-none focus:ring-2 transition-all
    placeholder:text-neutral-400
    ${
      hasError
        ? 'border-danger focus:ring-danger/20 focus:border-danger'
        : 'border-neutral-200 focus:ring-primary-500/20 focus:border-primary-500'
    }
    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
  `

  const renderField = (field: {
    key: keyof UserFormData
    label: string
    type: string
    placeholder?: string
    required?: boolean
    hidden?: boolean
    colSpan?: number
    readonly?: boolean
    options?: { label: string; value: any }[]
    accept?: string
  }) => {
    const isDisabled = isSubmitting || (field.key === 'institution_id' && isInstitutionsLoading)
    const hasError = !!errors[field.key]

    // ── Toggle ─────────────────────────────────────────────────────────────
    if (field.key === 'isactive') {
      return (
        <div key={field.key} className={field.colSpan === 2 ? 'md:col-span-2' : ''}>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            {field.label}
            {field.required && <span className="text-danger ml-0.5">*</span>}
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => !isSubmitting && handleChange('isactive', !formData.isactive)}
              disabled={isSubmitting}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer
                ${formData.isactive ? 'bg-primary-500' : 'bg-neutral-300'}
                ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                  ${formData.isactive ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
            <span className="text-sm text-neutral-600">{formData.isactive ? 'Aktif' : 'Nonaktif'}</span>
          </div>
          {errors[field.key] && <p className="mt-1 text-xs text-danger">{errors[field.key]}</p>}
        </div>
      )
    }

    return (
      <div key={field.key} className={field.colSpan === 2 ? 'md:col-span-2' : ''}>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          {field.label}
          {field.required && <span className="text-danger ml-0.5">*</span>}
        </label>

        {field.type === 'select' ? (
          <select
            value={formData[field.key]?.toString() ?? ''}
            onChange={(e) => {
              let value: any = e.target.value
              if (field.key === 'role_id' || field.key === 'institution_id') {
                value = value === '' ? undefined : Number(value)
              }
              handleChange(field.key, value)
            }}
            disabled={isDisabled}
            className={inputBase(hasError, isDisabled)}
          >
            <option value="">
              {field.key === 'institution_id' && isInstitutionsLoading
                ? 'Memuat institusi...'
                : field.placeholder}
            </option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : field.type === 'file' ? (
          <input
            type="file"
            accept={field.accept}
            onChange={(e) => handleFileChange(e, field.key as 'file_ktp' | 'file_photo')}
            disabled={isSubmitting}
            className={`
              w-full px-3.5 py-2 text-sm border rounded-lg transition-all
              border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
              file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0
              file:text-xs file:font-medium file:bg-primary-50 file:text-primary-600
              hover:file:bg-primary-100
              ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          />
        ) : (
          <input
            type={field.type}
            value={formData[field.key]?.toString() ?? ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            disabled={isSubmitting}
            readOnly={field.readonly}
            className={inputBase(hasError, isSubmitting)}
          />
        )}

        {errors[field.key] && <p className="mt-1 text-xs text-danger">{errors[field.key]}</p>}
      </div>
    )
  }

  // ===== FORM SECTIONS =====

  const formSections: { section: string; fields: FormField[] }[] = [
    {
      section: 'Informasi Akun',
      fields: [
        {
          key: 'username' as keyof UserFormData,
          label: 'Username',
          type: 'text',
          placeholder: 'Contoh: johndoe',
          required: true,
          colSpan: 1,
          readonly: role === 'SUPER ADMIN' ? false : mode === 'edit' ? true : false,
        },
        {
          key: 'password' as keyof UserFormData,
          label: 'Password',
          type: 'password',
          placeholder: mode === 'create' ? 'Minimal 6 karakter' : 'Kosongkan jika tidak diubah',
          required: mode === 'create',
          colSpan: 1,
        },
        {
          key: 'role_id' as keyof UserFormData,
          label: 'Role',
          type: 'select',
          placeholder: 'Pilih Role',
          required: true,
          options: roleOptions,
          colSpan: 1,
        },
        {
          key: 'institution_id' as keyof UserFormData,
          label: 'Institusi',
          type: 'select',
          placeholder: 'Pilih Institusi',
          required: !isSuperAdminRole,
          hidden: isSuperAdminRole,
          options: institutionOptions,
          colSpan: 1,
        },
        {
          key: 'isactive' as keyof UserFormData,
          label: 'Status',
          type: 'toggle',
          required: false,
          colSpan: 1,
        },
      ],
    },
    {
      section: 'Data Pribadi',
      fields: [
        {
          key: 'natid' as keyof UserFormData,
          label: 'NIK/NID',
          type: 'text',
          placeholder: 'Nomor Induk Kependudukan',
          required: true,
          colSpan: 1,
        },
        {
          key: 'fullname' as keyof UserFormData,
          label: 'Nama Lengkap',
          type: 'text',
          placeholder: 'Contoh: John Doe',
          required: true,
          colSpan: 1,
        },
        {
          key: 'title' as keyof UserFormData,
          label: 'Gelar',
          type: 'text',
          placeholder: 'Contoh: dr., Sp.PD',
          required: false,
          colSpan: 1,
        },
        {
          key: 'sex' as keyof UserFormData,
          label: 'Jenis Kelamin',
          type: 'select',
          placeholder: 'Pilih Jenis Kelamin',
          required: false,
          options: [
            { label: 'Laki-laki', value: 'L' },
            { label: 'Perempuan', value: 'P' },
          ],
          colSpan: 1,
        },
        {
          key: 'birthplace' as keyof UserFormData,
          label: 'Tempat Lahir',
          type: 'text',
          placeholder: 'Contoh: Jakarta',
          required: false,
          colSpan: 1,
        },
        {
          key: 'birthdate' as keyof UserFormData,
          label: 'Tanggal Lahir',
          type: 'date',
          placeholder: '',
          required: false,
          colSpan: 1,
        },
        {
          key: 'religion' as keyof UserFormData,
          label: 'Agama',
          type: 'text',
          placeholder: 'Contoh: Islam',
          required: false,
          colSpan: 1,
        },
        {
          key: 'maritalstatus' as keyof UserFormData,
          label: 'Status Pernikahan',
          type: 'text',
          placeholder: 'Contoh: Kawin / Belum Kawin',
          required: false,
          colSpan: 1,
        },
        {
          key: 'education' as keyof UserFormData,
          label: 'Pendidikan',
          type: 'text',
          placeholder: 'Contoh: S1 Kedokteran',
          required: false,
          colSpan: 1,
        },
        {
          key: 'work' as keyof UserFormData,
          label: 'Pekerjaan',
          type: 'text',
          placeholder: 'Contoh: Dokter',
          required: false,
          colSpan: 1,
        },
        {
          key: 'mail' as keyof UserFormData,
          label: 'Email',
          type: 'email',
          placeholder: 'Contoh: john@example.com',
          required: false,
          colSpan: 1,
        },
        {
          key: 'phone' as keyof UserFormData,
          label: 'No. HP',
          type: 'text',
          placeholder: 'Contoh: 08123456789',
          required: false,
          colSpan: 1,
        },
      ],
    },
    {
      section: 'Alamat',
      fields: [
        {
          key: 'addr1' as keyof UserFormData,
          label: 'Alamat Baris 1',
          type: 'text',
          placeholder: 'Nama jalan, gang, dll',
          required: false,
          colSpan: 2,
        },
        {
          key: 'addr2' as keyof UserFormData,
          label: 'Alamat Baris 2',
          type: 'text',
          placeholder: 'Detail tambahan (opsional)',
          required: false,
          colSpan: 2,
        },
        {
          key: 'rt' as keyof UserFormData,
          label: 'RT',
          type: 'text',
          placeholder: '001',
          required: false,
          colSpan: 1,
        },
        {
          key: 'rw' as keyof UserFormData,
          label: 'RW',
          type: 'text',
          placeholder: '002',
          required: false,
          colSpan: 1,
        },
        {
          key: 'villages' as keyof UserFormData,
          label: 'Kelurahan/Desa',
          type: 'text',
          placeholder: 'Contoh: Menteng',
          required: false,
          colSpan: 1,
        },
        {
          key: 'districts' as keyof UserFormData,
          label: 'Kecamatan',
          type: 'text',
          placeholder: 'Contoh: Menteng',
          required: false,
          colSpan: 1,
        },
        {
          key: 'regencies' as keyof UserFormData,
          label: 'Kabupaten/Kota',
          type: 'text',
          placeholder: 'Contoh: Jakarta Pusat',
          required: false,
          colSpan: 1,
        },
        {
          key: 'provincies' as keyof UserFormData,
          label: 'Provinsi',
          type: 'text',
          placeholder: 'Contoh: DKI Jakarta',
          required: false,
          colSpan: 1,
        },
        {
          key: 'poscode' as keyof UserFormData,
          label: 'Kode Pos',
          type: 'text',
          placeholder: '10310',
          required: false,
          colSpan: 1,
        },
      ],
    },
  ]

  // ===== DOCUMENT UPLOAD RENDERER =====

  const renderDocumentUpload = (
    field: 'file_ktp' | 'file_photo',
    label: string,
    accept: string,
    hint: string,
    icon: React.ReactNode,
    preview: string | null,
    error: string | null,
    inputRef: React.RefObject<HTMLInputElement>,
  ) => (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      <div className="flex items-start gap-4">
        {/* Preview box */}
        <div className="flex items-center justify-center flex-shrink-0 w-20 h-20 overflow-hidden border-2 border-dashed rounded-lg border-neutral-200 bg-neutral-50">
          {preview ? (
            preview.startsWith('data:image') ? (
              <img src={preview} alt={label} className="object-cover w-full h-full" />
            ) : (
              <div className="flex flex-col items-center gap-1 p-2">
                {icon}
                <span className="text-[10px] text-neutral-500 text-center leading-tight">File terpilih</span>
              </div>
            )
          ) : (
            icon
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <label
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all
                ${isSubmitting ? 'opacity-60 cursor-not-allowed bg-neutral-100 text-neutral-400' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'}
              `}
            >
              <HiPhoto className="w-3.5 h-3.5" />
              Pilih File
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={(e) => handleFileChange(e, field)}
                disabled={isSubmitting}
                className="hidden"
              />
            </label>

            {preview && (
              <button
                type="button"
                onClick={() => handleRemoveFile(field)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-danger bg-danger/5 rounded-lg hover:bg-danger/10 transition-all cursor-pointer"
              >
                <HiTrash className="w-3.5 h-3.5" />
                Hapus
              </button>
            )}
          </div>
          <p className="text-xs text-neutral-400">{hint}</p>
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
      </div>
    </div>
  )

  // ===== RENDER =====

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 backdrop-blur-xs" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg w-9 h-9 bg-primary-50">
              <HiUserPlus className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">
                {mode === 'create' ? 'Tambah User Baru' : 'Edit User'}
              </h2>
              <p className="text-xs text-neutral-400">
                {mode === 'create'
                  ? 'Isi data untuk menambah user baru'
                  : `Edit data user ${item?.username || ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 transition-colors rounded-lg cursor-pointer hover:bg-neutral-100"
          >
            <HiXMark className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">
            {formSections.map((section, idx) => (
              <div key={idx} className="mb-6 last:mb-0">
                {/* Section heading */}
                <h3 className="pb-2 mb-3 text-xs font-semibold tracking-wider uppercase border-b text-neutral-400 border-neutral-100">
                  {section.section}
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {section.fields.filter((f) => !f.hidden).map((f) => renderField(f))}
                </div>
              </div>
            ))}

            {/* Dokumen section — custom upload UI */}
            <div className="mb-6">
              <h3 className="pb-2 mb-3 text-xs font-semibold tracking-wider uppercase border-b text-neutral-400 border-neutral-100">
                Dokumen
              </h3>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {renderDocumentUpload(
                  'file_ktp',
                  'File KTP',
                  '.jpg,.jpeg,.png,.pdf',
                  'Format: JPG, PNG, PDF. Maks 2MB.',
                  <HiIdentification className="w-8 h-8 text-neutral-300" />,
                  ktpPreview,
                  ktpError,
                  ktpInputRef,
                )}
                {renderDocumentUpload(
                  'file_photo',
                  'Foto Profil',
                  '.jpg,.jpeg,.png',
                  'Format: JPG, PNG. Maks 2MB.',
                  <HiPhoto className="w-8 h-8 text-neutral-300" />,
                  photoPreview,
                  photoError,
                  photoInputRef,
                )}
              </div>
            </div>

            {mode === 'edit' && (
              <div className="mt-4 px-3.5 py-3 rounded-lg bg-primary-50 border border-primary-100">
                <p className="text-xs text-primary-700">
                  <span className="font-medium">Info:</span> Biarkan password kosong jika tidak ingin
                  mengubahnya.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/40">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
              )}
              {isSubmitting ? 'Menyimpan...' : mode === 'create' ? 'Simpan' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserFormModal
