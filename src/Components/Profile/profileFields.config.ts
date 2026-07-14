import type { Member } from '@/Services/Modules/members/getMembers'

export type ProfileFieldType = 'text' | 'date' | 'select' | 'readonly'

export interface ProfileFieldOption {
  label: string
  value: string
}

export interface ProfileFieldConfig {
  /** Key on the Member object (also used as the form field key). */
  key: keyof Member
  label: string
  type: ProfileFieldType
  /** Whether this field can be edited at all (independent of role). */
  editable?: boolean
  required?: boolean
  /** Only these roles may edit the field. Omit = any logged-in owner/admin. */
  editableByRoles?: Array<'admin' | 'user'>
  options?: ProfileFieldOption[]
  placeholder?: string
  /** Optional custom formatter for read-only display. */
  formatValue?: (value: unknown, member: Member) => string
}

export interface ProfileSectionConfig {
  id: string
  title: string
  fields: ProfileFieldConfig[]
}

const GENDER_OPTIONS: ProfileFieldOption[] = [
  { label: 'Laki-laki', value: 'Laki-laki' },
  { label: 'Perempuan', value: 'Perempuan' },
]

const MARITAL_OPTIONS: ProfileFieldOption[] = [
  { label: 'Belum Menikah', value: 'Belum Menikah' },
  { label: 'Menikah', value: 'Menikah' },
  { label: 'Cerai', value: 'Cerai' },
]

/**
 * Single source of truth for what the Profile page shows and what is editable.
 * Add/remove/reorder fields here — the UI (ProfileView/ProfileInfoCard) renders
 * whatever this returns, nothing is hardcoded in the components.
 */
export function getProfileSections(role: 'admin' | 'user'): ProfileSectionConfig[] {
  return [
    {
      id: 'identity',
      title: 'Informasi Akun',
      fields: [
        { key: 'IDNumber', label: 'ID Number', type: 'readonly' },
        { key: 'username', label: 'Username', type: 'readonly' },
        { key: 'role', label: 'Peran', type: 'readonly', formatValue: (v) => (v === 'admin' ? 'Admin' : 'Peserta') },
        {
          key: 'is_active',
          label: 'Status',
          type: 'readonly',
          formatValue: (v) => (Number(v) ? 'Terverifikasi' : 'Belum Verifikasi'),
        },
      ],
    },
    {
      id: 'personal',
      title: 'Data Pribadi',
      fields: [
        { key: 'Name', label: 'Nama Lengkap', type: 'text', editable: true, placeholder: 'Nama lengkap' },
        { key: 'Gender', label: 'Jenis Kelamin', type: 'select', editable: true, options: GENDER_OPTIONS },
        { key: 'BirthDate', label: 'Tanggal Lahir', type: 'date', editable: true, required: true },
        { key: 'Age', label: 'Usia', type: 'text', editable: true, required: true },
        { key: 'Address', label: 'Alamat', type: 'text', editable: true, placeholder: 'Alamat lengkap' },
        { key: 'MaritalStatus', label: 'Status Pernikahan', type: 'select', editable: true, options: MARITAL_OPTIONS },
        { key: 'Education', label: 'Pendidikan Terakhir', type: 'text', editable: true },
        { key: 'Occupation', label: 'Pekerjaan', type: 'text', editable: true },
        { key: 'ReferredBy', label: 'Dirujuk Oleh', type: 'text', editable: true },
      ],
    },
    {
      id: 'registration',
      title: 'Registrasi',
      fields: [{ key: 'tgl_register', label: 'Tanggal Daftar', type: 'readonly' }],
    },
  ]
}

/** Whether `viewerRole` is allowed to edit a given field for this profile. */
export function isFieldEditable(field: ProfileFieldConfig, viewerRole: 'admin' | 'user'): boolean {
  if (!field.editable || field.type === 'readonly') return false
  if (field.editableByRoles && !field.editableByRoles.includes(viewerRole)) return false
  return true
}
