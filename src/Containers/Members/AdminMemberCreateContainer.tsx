import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '@/Components/Layout/AppLayout'
import Button from '@/Components/General/Button'
import Icon from '@/Components/General/Icon'
import { useNotification } from '@/Components/General/Notification'
import { useCreateMemberMutation } from '@/Services/Modules/members'
import type { CreateMemberCredentials } from '@/Services/Modules/members'
import { calculateAgeFromBirthdate, toPasswordFromBirthdate } from '@/Helpers/memberDate'
import { joinClassNames } from '@/Utils/laboratorium'

interface MemberCreateFormData {
  nama: string
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

type FieldType = 'text' | 'number' | 'date' | 'textarea' | 'select' | 'radio' | 'switch'

interface FieldConfig {
  key: keyof MemberCreateFormData
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  helperText?: string
  colSpan?: 1 | 2
  options?: { label: string; value: string }[]
  rows?: number
  readOnly?: boolean
}

const defaultFormData: MemberCreateFormData = {
  nama: '',
  address: '',
  gender: '',
  birthdate: '',
  age: '',
  education: '',
  marital: '',
  occupation: '',
  referredby: '',
  is_active: false,
}

const fields: FieldConfig[] = [
  {
    key: 'nama',
    label: 'Nama Lengkap',
    type: 'text',
    required: true,
    colSpan: 2,
    placeholder: 'Nama lengkap peserta',
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
    label: 'BirthDate / Tanggal Lahir',
    type: 'date',
    required: true,
    helperText: 'Wajib diisi — Usia, Username, dan Password peserta dibuat otomatis dari data ini.',
  },
  {
    key: 'age',
    label: 'Usia',
    type: 'number',
    required: true,
    readOnly: true,
    placeholder: 'Otomatis dari BirthDate',
    helperText: 'Dihitung otomatis dari BirthDate.',
  },
  {
    key: 'marital',
    label: 'Status Pernikahan',
    type: 'select',
    placeholder: 'Pilih status pernikahan',
    options: [
      { label: 'Belum Menikah', value: 'Belum Menikah' },
      { label: 'Menikah', value: 'Menikah' },
      { label: 'Cerai', value: 'Cerai' },
    ],
  },
  { key: 'education', label: 'Pendidikan', type: 'text', placeholder: 'Pendidikan terakhir' },
  { key: 'occupation', label: 'Pekerjaan', type: 'text', placeholder: 'Pekerjaan' },
  { key: 'referredby', label: 'Direferensikan Oleh', type: 'text', placeholder: 'Nama referral' },
  {
    key: 'address',
    label: 'Alamat',
    type: 'textarea',
    rows: 3,
    colSpan: 2,
    placeholder: 'Alamat lengkap peserta',
  },
  {
    key: 'is_active',
    label: 'Status Verifikasi',
    type: 'switch',
    colSpan: 2,
    helperText: 'Aktifkan jika peserta langsung boleh login dan mengikuti test.',
  },
]

const inputClass = (hasError: boolean, readOnly?: boolean) =>
  joinClassNames(
    'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-neutral-800 outline-none transition-all placeholder:text-neutral-400',
    readOnly && 'cursor-not-allowed bg-neutral-50 text-neutral-500',
    hasError
      ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-200'
      : 'border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
  )

export default function AdminMemberCreateContainer() {
  const navigate = useNavigate()
  const { showNotification, contextHolder } = useNotification()
  const [createMember, { isLoading }] = useCreateMemberMutation()
  const [formData, setFormData] = useState<MemberCreateFormData>(defaultFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof MemberCreateFormData, string>>>({})
  const [credentials, setCredentials] = useState<CreateMemberCredentials | null>(null)
  const [copied, setCopied] = useState<'username' | 'password' | null>(null)

  const setFieldValue = (key: keyof MemberCreateFormData, value: string | boolean) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'birthdate') {
        next.age = calculateAgeFromBirthdate(String(value))
      }
      return next
    })

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  const validate = () => {
    const nextErrors: Partial<Record<keyof MemberCreateFormData, string>> = {}

    fields.forEach((field) => {
      const value = formData[field.key]
      if (field.type !== 'switch' && field.required && !String(value ?? '').trim()) {
        nextErrors[field.key] = `${field.label} wajib diisi`
      }
    })

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate()) return

    try {
      const res = await createMember({
        nama: formData.nama,
        address: formData.address,
        gender: formData.gender,
        birthdate: formData.birthdate,
        age: formData.age,
        education: formData.education,
        marital: formData.marital,
        occupation: formData.occupation,
        referredby: formData.referredby,
        is_active: formData.is_active ? 1 : 0,
      }).unwrap()

      showNotification({
        title: 'Berhasil',
        description: res.message || 'Peserta baru berhasil didaftarkan.',
        type: 'success',
      })

      if (res.data?.credentials) {
        // Tampilkan kredensial hasil auto-generate (ID Number, Username & Password
        // tidak lagi diinput manual — lihat api.py: create_member()).
        setCredentials(res.data.credentials)
      } else {
        navigate('/admin/members')
      }
    } catch (error: any) {
      showNotification({
        title: 'Gagal mendaftarkan peserta',
        description: error?.data?.message || 'Terjadi kesalahan sistem.',
        type: 'error',
      })
    }
  }

  const handleCopy = async (label: 'username' | 'password', value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      // Clipboard API tidak tersedia — abaikan secara diam-diam.
    }
  }

  const handleDone = () => {
    setCredentials(null)
    setFormData(defaultFormData)
    navigate('/admin/members')
  }

  const renderField = (field: FieldConfig) => {
    const value = formData[field.key]
    const error = errors[field.key]

    if (field.type === 'switch') {
      return (
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <div>
            <span className="text-sm font-semibold text-neutral-700">{field.label}</span>
            {field.helperText && <p className="mt-1 text-xs text-neutral-400">{field.helperText}</p>}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(value)}
            onClick={() => setFieldValue(field.key, !value)}
            className={joinClassNames(
              'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
              value ? 'bg-blue-500' : 'bg-neutral-200',
            )}
          >
            <span
              className={joinClassNames(
                'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                value ? 'translate-x-6' : 'translate-x-1',
              )}
            />
          </button>
        </label>
      )
    }

    return (
      <>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          {field.label}
          {field.required && <span className="ml-0.5 text-red-500">*</span>}
        </label>

        {field.type === 'radio' ? (
          <div className="flex flex-wrap gap-3">
            {field.options?.map((option) => {
              const checked = String(value) === option.value
              return (
                <label
                  key={option.value}
                  className={joinClassNames(
                    'flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm transition-all',
                    checked
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-neutral-200 bg-white text-neutral-700',
                  )}
                >
                  <input
                    type="radio"
                    name={field.key}
                    value={option.value}
                    checked={checked}
                    onChange={(event) => setFieldValue(field.key, event.target.value)}
                    className="h-4 w-4 border-neutral-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{option.label}</span>
                </label>
              )
            })}
          </div>
        ) : field.type === 'select' ? (
          <select
            value={String(value ?? '')}
            onChange={(event) => setFieldValue(field.key, event.target.value)}
            className={inputClass(!!error)}
          >
            <option value="">{field.placeholder ?? 'Pilih...'}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : field.type === 'textarea' ? (
          <textarea
            value={String(value ?? '')}
            rows={field.rows ?? 3}
            placeholder={field.placeholder}
            onChange={(event) => setFieldValue(field.key, event.target.value)}
            className={joinClassNames(inputClass(!!error), 'resize-none')}
          />
        ) : (
          <input
            type={field.type}
            value={String(value ?? '')}
            placeholder={field.placeholder}
            readOnly={field.readOnly}
            onChange={(event) => setFieldValue(field.key, event.target.value)}
            className={inputClass(!!error, field.readOnly)}
          />
        )}

        {error ? (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        ) : (
          field.helperText && <p className="mt-1 text-xs text-neutral-400">{field.helperText}</p>
        )}
      </>
    )
  }

  return (
    <AppLayout title="Pendaftaran Peserta Baru" subtitle="Tambah peserta MMPI dan siapkan akun login awal.">
      <div className="p-4 md:p-6">
        {contextHolder}

        <div className="mx-auto max-w-5xl">
          <div className="mb-5 overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
            <div className="relative isolate px-6 py-6 md:px-8">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-emerald-50" />
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/70 px-3 py-1 text-xs font-medium text-blue-700">
                    <Icon iconName="user-plus" className="h-4 w-4" />
                    Create Member
                  </div>
                  <h1 className="text-2xl font-semibold text-neutral-900">Form Pendaftaran Peserta</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                    ID Number, Username, dan Password dibuat otomatis oleh sistem setelah data disimpan.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate('/admin/members')}
                  icon={<Icon iconName="arrow-left" className="h-4 w-4" />}
                  className="!border-neutral-200 !bg-white !text-neutral-700 hover:!bg-neutral-50"
                >
                  Kembali
                </Button>
              </div>
            </div>
          </div>

          {credentials ? (
            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-5 flex items-start gap-3">
                <Icon iconName="check-circle" className="mt-0.5 h-6 w-6 text-emerald-600" />
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Peserta berhasil didaftarkan</h2>
                  <p className="mt-1 text-sm text-neutral-600">
                    Catat atau salin kredensial berikut — password ini dibuat otomatis dari tanggal lahir dan
                    tidak ditampilkan lagi setelah halaman ini ditutup.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Username</p>
                    <p className="font-mono text-sm text-neutral-800">{credentials.username}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('username', credentials.username)}
                    className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
                  >
                    {copied === 'username' ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Password</p>
                    <p className="font-mono text-sm text-neutral-800">{credentials.password}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('password', credentials.password)}
                    className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
                  >
                    {copied === 'password' ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setCredentials(null)}
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50"
                >
                  Daftarkan Peserta Lain
                </button>
                <button
                  type="button"
                  onClick={handleDone}
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-600"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm md:p-6"
            >
              <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <div className="flex items-start gap-3">
                  <Icon iconName="sparkles" className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Otomatis oleh sistem</p>
                    <p className="mt-1 text-sm leading-6 text-emerald-700">
                      ID Number dibuat mengikuti pola tanggal registrasi, sedangkan Username dan Password
                      mengikuti ID Number & Tanggal Lahir peserta. Password preview:{' '}
                      <span className="font-mono font-semibold">
                        {toPasswordFromBirthdate(formData.birthdate) || 'isi tanggal lahir dulu'}
                      </span>
                      . Kredensial akan ditampilkan setelah data
                      berhasil disimpan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.key} className={field.colSpan === 2 ? 'md:col-span-2' : undefined}>
                    {renderField(field)}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/admin/members')}
                  disabled={isLoading}
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  {isLoading ? 'Menyimpan...' : 'Simpan Peserta'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
