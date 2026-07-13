/**
 * @file UserDetailModal.tsx
 * @description Modal form untuk tambah / edit user.
 *
 * Behavior berdasarkan role yang login:
 * - Super Admin : dapat memilih semua role (super_admin, admin, it)
 *                 dan memilih institusi dari dropdown
 * - IT Institusi : hanya dapat memilih role admin atau it,
 *                  institusi diisi otomatis dari session
 *
 * Mode:
 * - Tambah (isEditMode = false) : semua field kosong, password wajib diisi
 * - Edit   (isEditMode = true)  : field terisi dari data item, password opsional
 *
 * @module UserManagement/UserDetailModal
 */

import React, { useEffect, useState } from 'react'
import type { UserItem, UserRole } from './types'
import { dummyInstitusiData, isUsernameTaken } from './userManagementData'

// ============================================================
// PROPS
// ============================================================

interface UserDetailModalProps {
  isOpen: boolean
  item: UserItem | null
  isEditMode: boolean
  /** Role user yang sedang login — menentukan pilihan role & institusi */
  currentUserRole: 'super_admin' | 'admin' | 'it'
  onClose: () => void
  onSave: (payload: Partial<UserItem> & { password?: string }) => void
}

// ============================================================
// INITIAL FORM STATE
// ============================================================

interface FormState {
  username: string
  namaLengkap: string
  phone: string
  email: string
  role: UserRole
  institutionId: string
  namaInstitusi: string
  password: string
  confirmPassword: string
}

const initialForm: FormState = {
  username: '',
  namaLengkap: '',
  phone: '',
  email: '',
  role: 'it',
  institutionId: '',
  namaInstitusi: '',
  password: '',
  confirmPassword: '',
}

const roleLabel: Record<string, { label: string; className: string }> = {
  super_admin: { label: 'Super Admin', className: 'bg-violet-50 text-violet-700 border-violet-100' },
  admin: { label: 'Admin', className: 'bg-blue-50 text-blue-700 border-blue-100' },
  it: { label: 'IT', className: 'bg-amber-50 text-amber-700 border-amber-100' },
}

// ============================================================
// COMPONENT
// ============================================================

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  item,
  isEditMode,
  currentUserRole,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  // Pilihan role berdasarkan siapa yang login
  const availableRoles: { value: UserRole; label: string }[] =
    currentUserRole === 'super_admin'
      ? [
          { value: 'super_admin', label: 'Super Admin' },
          { value: 'admin', label: 'Admin' },
          { value: 'it', label: 'IT' },
        ]
      : [
          { value: 'admin', label: 'Admin' },
          { value: 'it', label: 'IT' },
        ]

  // ===== EFFECT: isi form saat edit =====
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && item) {
        setForm({
          username: item.username,
          namaLengkap: item.namaLengkap,
          phone: item.phone,
          email: item.email,
          role: item.role,
          institutionId: item.institutionId ?? '',
          namaInstitusi: item.namaInstitusi ?? '',
          password: '',
          confirmPassword: '',
        })
      } else {
        setForm(initialForm)
      }
      setErrors({})
    }
  }, [isOpen, isEditMode, item])

  // ===== CHANGE HANDLER =====
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'institutionId') {
      const inst = dummyInstitusiData.find((i) => i.id === value)
      setForm((prev) => ({ ...prev, institutionId: value, namaInstitusi: inst?.namaInstitusi ?? '' }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  // ===== VALIDATION =====
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {}
    if (!form.namaLengkap.trim()) newErrors.namaLengkap = 'Nama lengkap wajib diisi'
    if (!form.username.trim()) {
      newErrors.username = 'Username wajib diisi'
    } else if (!isEditMode && isUsernameTaken(form.username)) {
      newErrors.username = 'Username sudah digunakan'
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email wajib diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Format email tidak valid'
    }
    if (!form.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi'
    if (currentUserRole === 'super_admin' && !form.institutionId && form.role !== 'super_admin') {
      newErrors.institutionId = 'Institusi wajib dipilih'
    }
    if (!isEditMode) {
      if (!form.password) newErrors.password = 'Password wajib diisi'
      else if (form.password.length < 8) newErrors.password = 'Minimal 8 karakter'
    }
    if (form.password && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ===== SUBMIT =====
  const handleSubmit = () => {
    if (!validate()) return
    onSave({
      username: form.username,
      namaLengkap: form.namaLengkap,
      phone: form.phone,
      email: form.email,
      role: form.role,
      institutionId: form.institutionId || null,
      namaInstitusi: form.namaInstitusi || null,
      ...(form.password ? { password: form.password } : {}),
    })
  }

  if (!isOpen) return null

  // ===== RENDER =====
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity bg-neutral-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="flex items-center justify-center min-h-full p-4">
        <div className="relative w-full max-w-lg transition-all transform bg-white border shadow-xl rounded-xl border-neutral-100">

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-lg w-9 h-9 bg-primary-50">
                {isEditMode ? (
                  <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-800">
                  {isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {isEditMode ? 'Perbarui data pengguna di bawah ini' : 'Isi form berikut untuk membuat akun baru'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── User Summary (hanya mode Edit) ── */}
          {isEditMode && item && (
            <div className="px-6 py-4 border-b border-neutral-50 bg-neutral-50/50">
              <div className="grid grid-cols-3 gap-4">
                {/* Avatar + Nama */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center flex-shrink-0 rounded-full w-9 h-9 bg-primary-50">
                    <span className="text-sm font-semibold text-primary-600">
                      {item.namaLengkap.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Pengguna</p>
                    <p className="text-sm font-medium leading-tight text-neutral-800">{item.namaLengkap}</p>
                    <p className="text-xs text-neutral-400">@{item.username}</p>
                  </div>
                </div>
                {/* Role */}
                <div>
                  <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Role</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border mt-1 ${roleLabel[item.role].className}`}>
                    {roleLabel[item.role].label}
                  </span>
                </div>
                {/* Status */}
                <div>
                  <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border mt-1 ${
                    item.status === 'aktif'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'aktif' ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
                    {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Form Body ── */}
          <div className="px-6 py-5 space-y-4 max-h-[55vh] overflow-y-auto">

            <Field label="Nama Lengkap" required error={errors.namaLengkap}>
              <input
                name="namaLengkap"
                value={form.namaLengkap}
                onChange={handleChange}
                placeholder="Contoh: Agus Prasetyo"
                className={inputClass(!!errors.namaLengkap)}
              />
            </Field>

            <Field label="Username" required error={errors.username}>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Contoh: it.pkm1"
                disabled={isEditMode}
                className={inputClass(!!errors.username, isEditMode)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Email" required error={errors.email}>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="user@institusi.go.id"
                  className={inputClass(!!errors.email)}
                />
              </Field>
              <Field label="No. Telepon" required error={errors.phone}>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  className={inputClass(!!errors.phone)}
                />
              </Field>
            </div>

            <Field label="Role" required>
              <select name="role" value={form.role} onChange={handleChange} className={inputClass(false)}>
                {availableRoles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </Field>

            {currentUserRole === 'super_admin' && form.role !== 'super_admin' && (
              <Field label="Institusi" required error={errors.institutionId}>
                <select
                  name="institutionId"
                  value={form.institutionId}
                  onChange={handleChange}
                  className={inputClass(!!errors.institutionId)}
                >
                  <option value="">— Pilih Institusi —</option>
                  {dummyInstitusiData.map((inst) => (
                    <option key={inst.id} value={inst.id}>{inst.namaInstitusi}</option>
                  ))}
                </select>
              </Field>
            )}

            {/* Password Section */}
            <div className="pt-1">
              <p className="mb-3 text-xs font-medium tracking-wider uppercase text-neutral-400">
                {isEditMode ? 'Ganti Password (opsional)' : 'Password'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Password" required={!isEditMode} error={errors.password}>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={isEditMode ? 'Kosongkan jika tidak diganti' : 'Min. 8 karakter'}
                    className={inputClass(!!errors.password)}
                  />
                </Field>
                <Field label="Konfirmasi Password" error={errors.confirmPassword}>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulangi password"
                    className={inputClass(!!errors.confirmPassword)}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 px-6 py-3.5 border-t border-neutral-100 bg-neutral-50/40">
            <button
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Batal
            </button>

            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors cursor-pointer"
            >
              {isEditMode ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Perubahan
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Buat Pengguna
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

// ============================================================
// HELPER COMPONENTS
// ============================================================

const Field: React.FC<{
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}> = ({ label, required, error, children }) => (
  <div className="space-y-1">
    <label className="block text-xs font-medium text-neutral-600">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

const inputClass = (hasError: boolean, disabled = false) =>
  [
    'w-full px-3 py-2 text-sm rounded-lg border outline-none transition-colors',
    hasError
      ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
      : 'border-neutral-200 bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100',
    disabled ? 'opacity-50 cursor-not-allowed bg-neutral-50' : '',
  ]
    .filter(Boolean)
    .join(' ')

export default UserDetailModal