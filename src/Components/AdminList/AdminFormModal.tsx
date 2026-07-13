import FormModal, { FormFieldConfig } from '@/Components/General/FormModal'
import { useNotification } from '@/Components/General/Notification'
import {
  useCreateAdminMutation,
  useGetMemberDetailQuery,
  useUpdateMemberMutation,
} from '@/Services/Modules/members'
import type { Member } from '@/Services/Modules/members/getMembers'

type AdminFormMode = 'create' | 'edit'

interface AdminFormData {
  idnumber: string
  nama: string
  username: string
  password: string
  repassword: string
  address: string
  gender: string
  birthdate: string
  age: string
  education: string
  marital: string
  occupation: string
  referredby: string
  is_active: boolean
}

interface AdminFormModalProps {
  isOpen: boolean
  mode: AdminFormMode
  admin?: Member | null
  onClose: () => void
  onSuccess?: () => void
}

const toInputDate = (value?: string | number | null): string => {
  if (!value) return ''
  const text = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return ''
  const [, d, m, y] = match
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

const calculateAgeFromBirthdate = (isoDate: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return ''
  const birth = new Date(isoDate)
  if (Number.isNaN(birth.getTime())) return ''

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  const dayDiff = today.getDate() - birth.getDate()
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1
  return age >= 0 ? String(age) : ''
}

const buildFormValues = (admin?: Member | null): Partial<AdminFormData> => ({
  idnumber: admin?.IDNumber != null ? String(admin.IDNumber) : '',
  nama: admin?.Name ?? '',
  username: admin?.username ?? '',
  password: '',
  repassword: '',
  address: admin?.Address ?? '',
  gender: admin?.Gender ?? '',
  birthdate: toInputDate(admin?.BirthDate),
  age: admin?.Age != null ? String(admin.Age) : '',
  education: admin?.Education ?? '',
  marital: admin?.MaritalStatus ?? '',
  occupation: admin?.Occupation ?? '',
  referredby: admin?.ReferredBy ?? '',
  is_active: admin?.is_active == null ? true : !!admin.is_active,
})

const dateInputClass = (hasError: boolean) =>
  `w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white focus:outline-none
   focus:ring-2 transition-all placeholder:text-neutral-400
   ${
     hasError
       ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
       : 'border-neutral-200 focus:ring-blue-500/20 focus:border-blue-500'
   }`

const baseProfileFields: FormFieldConfig<AdminFormData>[] = [
  {
    key: 'nama',
    label: 'Nama Lengkap',
    type: 'text',
    required: true,
    colSpan: 2,
    placeholder: 'Nama lengkap admin',
  },
  {
    key: 'gender',
    label: 'Jenis Kelamin',
    type: 'radio',
    options: [
      { label: 'Laki-laki', value: 'L' },
      { label: 'Perempuan', value: 'P' },
    ],
  },
  {
    key: 'birthdate',
    label: 'Tanggal Lahir',
    type: 'custom',
    render: ({ value, errors, setValues }) => (
      <input
        type="date"
        value={value ?? ''}
        onChange={(e) => {
          const birthdate = e.target.value
          setValues({
            birthdate,
            age: calculateAgeFromBirthdate(birthdate),
          })
        }}
        className={dateInputClass(!!errors.birthdate)}
      />
    ),
  },
  { key: 'age', label: 'Usia', type: 'number', placeholder: 'Usia (tahun)' },
  { key: 'education', label: 'Pendidikan', type: 'text' },
  {
    key: 'marital',
    label: 'Status Pernikahan',
    type: 'select',
    placeholder: 'Pilih status pernikahan',
    options: [
      { value: 'Belum Menikah', label: 'Belum Menikah' },
      { value: 'Menikah', label: 'Menikah' },
      { value: 'Cerai', label: 'Cerai' },
    ],
  },
  { key: 'occupation', label: 'Pekerjaan', type: 'text' },
  // { key: 'referredby', label: 'Direferensikan Oleh', type: 'text' },
  {
    key: 'address',
    label: 'Alamat',
    type: 'textarea',
    rows: 2,
    colSpan: 2,
  },
]

const buildFields = (mode: AdminFormMode): FormFieldConfig<AdminFormData>[] => {
  const accountFields: FormFieldConfig<AdminFormData>[] =
    mode === 'create'
      ? [
          {
            key: 'idnumber',
            label: 'ID Number',
            type: 'text',
            required: true,
            placeholder: 'Masukkan ID Number admin',
          },
          {
            key: 'username',
            label: 'Username',
            type: 'text',
            required: true,
            placeholder: 'Username untuk login',
          },
          {
            key: 'password',
            label: 'Password',
            type: 'text',
            required: true,
            placeholder: 'Password admin',
          },
          {
            key: 'repassword',
            label: 'Ulangi Password',
            type: 'text',
            required: true,
            placeholder: 'Ketik ulang password',
            validate: (value, formData) => (value !== formData.password ? 'Password tidak sama' : undefined),
          },
          {
            key: 'is_active',
            label: 'Status Admin',
            type: 'switch',
            switchOnLabel: 'Terverifikasi',
            switchOffLabel: 'Belum Verifikasi',
            colSpan: 2,
          },
        ]
      : [
          {
            key: 'idnumber',
            label: 'ID Number',
            type: 'text',
            readOnly: true,
          },
          {
            key: 'username',
            label: 'Username',
            type: 'text',
            readOnly: true,
            helperText: 'Username belum didukung untuk diubah oleh endpoint update.',
          },
        ]

  return [...accountFields, ...baseProfileFields]
}

export default function AdminFormModal({
  isOpen,
  mode,
  admin = null,
  onClose,
  onSuccess,
}: AdminFormModalProps) {
  const { showNotification, contextHolder } = useNotification()
  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation()
  const [updateMember, { isLoading: isUpdating }] = useUpdateMemberMutation()

  const { data: detailData, isFetching: isDetailFetching } = useGetMemberDetailQuery(admin?.IDNumber ?? '', {
    skip: !isOpen || mode !== 'edit' || !admin,
  })

  const detail = detailData?.data?.member ?? admin
  const fields = buildFields(mode)
  const initialData = buildFormValues(admin)
  const externalValues = mode === 'edit' ? buildFormValues(detail) : undefined

  const handleSubmit = async (data: AdminFormData) => {
    try {
      const payload = {
        idnumber: data.idnumber,
        nama: data.nama,
        username: data.username,
        password: data.password,
        repassword: data.repassword,
        address: data.address,
        gender: data.gender,
        birthdate: data.birthdate,
        age: data.age,
        education: data.education,
        marital: data.marital,
        occupation: data.occupation,
        referredby: data.referredby,
        is_active: data.is_active ? 1 : 0,
      } as const

      const res =
        mode === 'create'
          ? await createAdmin(payload).unwrap()
          : await updateMember({
              idnumber: detail?.IDNumber ?? data.idnumber,
              ...payload,
              role: 'admin',
            }).unwrap()

      showNotification({
        title: 'Berhasil',
        description:
          res.message ||
          (mode === 'create' ? 'Admin berhasil ditambahkan.' : 'Data admin berhasil diperbarui.'),
        type: 'success',
      })
      onSuccess?.()
      onClose()
    } catch (error: any) {
      showNotification({
        title: mode === 'create' ? 'Gagal menambahkan admin' : 'Gagal mengedit admin',
        description: error?.data?.message || 'Terjadi kesalahan sistem.',
        type: 'error',
      })
    }
  }

  if (mode === 'edit' && !admin) return null

  return (
    <>
      {contextHolder}
      <FormModal<AdminFormData>
        isOpen={isOpen}
        mode={mode}
        title={mode === 'create' ? 'Tambah Admin' : 'Edit Admin'}
        subtitle={
          mode === 'edit'
            ? isDetailFetching
              ? `ID Number: ${admin?.IDNumber} - Memuat data terbaru...`
              : `ID Number: ${admin?.IDNumber}`
            : 'Lengkapi data akun dan profil admin baru.'
        }
        fields={fields}
        initialData={initialData}
        externalValues={externalValues}
        isSubmitting={isCreating || isUpdating}
        itemId={detail?.IDNumber}
        onClose={onClose}
        onSubmit={handleSubmit}
      />
    </>
  )
}
