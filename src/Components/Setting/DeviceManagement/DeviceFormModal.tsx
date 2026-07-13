/**
 * @file DeviceFormModal.tsx
 * @description Modal form untuk Create dan Edit data alat/device.
 *
 * Fitur:
 * - Menambah device baru (mode: 'create')
 * - Mengedit device yang sudah ada (mode: 'edit')
 * - Validasi form client-side
 * - Menampilkan server-side validation errors dari API
 *
 * @module Setting/DeviceManagement/DeviceFormModal
 */

import React, { useState, useEffect } from 'react'
import { HiXMark, HiCpuChip } from 'react-icons/hi2'
import type { DeviceItem, DeviceFormData, FormFieldConfig } from './types'
import { DEVICE_FORM_INITIAL, DEVICE_FORM_FIELDS } from './types'

interface DeviceFormModalProps {
  /** Apakah modal sedang terbuka */
  isOpen: boolean
  /** Mode form: 'create' untuk baru, 'edit' untuk update */
  mode: 'create' | 'edit'
  /** Data device yang akan diedit (hanya untuk mode 'edit') */
  item?: DeviceItem | null
  /** Loading state saat submit */
  isSubmitting?: boolean
  /** Server-side validation errors dari API */
  serverErrors?: Record<string, string>
  /** Callback ketika modal ditutup */
  onClose: () => void
  /** Callback ketika form disubmit */
  onSubmit: (data: DeviceFormData, id?: number) => void
}

const DeviceFormModal: React.FC<DeviceFormModalProps> = ({
  isOpen,
  mode,
  item,
  isSubmitting = false,
  serverErrors = {},
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<DeviceFormData>(DEVICE_FORM_INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof DeviceFormData, string>>>({})

  // Populate form saat edit atau reset saat create
  useEffect(() => {
    if (mode === 'edit' && item) {
      setFormData({
        devices_code: item.devices_code,
        devices_name: item.devices_name,
        status: item.status,
        description: item.description || '',
      })
    } else {
      setFormData(DEVICE_FORM_INITIAL)
    }
    setErrors({})
  }, [mode, item, isOpen])

  // Sync server errors ke local errors state
  useEffect(() => {
    if (Object.keys(serverErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...serverErrors }))
    }
  }, [serverErrors])

  if (!isOpen) return null

  // ===== HANDLERS =====

  const handleChange = (field: keyof DeviceFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error saat user mengetik
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DeviceFormData, string>> = {}

    if (!formData.devices_code.trim()) newErrors.devices_code = 'Kode alat wajib diisi'
    if (!formData.devices_name.trim()) newErrors.devices_name = 'Nama alat wajib diisi'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(formData, mode === 'edit' ? item?.id : undefined)
  }

  // ===== RENDER FORM FIELD =====

  const renderField = (field: FormFieldConfig) => {
    const fieldValue = formData[field.key]
    const hasError = !!errors[field.key]
    const baseInputClass = `w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all`
    const errorClass = hasError
      ? 'border-danger focus:ring-danger/20 focus:border-danger'
      : 'border-neutral-200 focus:ring-primary-500/20 focus:border-primary-500'
    const disabledClass = isSubmitting ? 'opacity-60 cursor-not-allowed' : ''

    if (field.type === 'textarea') {
      return (
        <textarea
          value={String(fieldValue ?? '')}
          onChange={(e) => handleChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          disabled={isSubmitting}
          className={`${baseInputClass} resize-none placeholder:text-neutral-400 ${errorClass} ${disabledClass}`}
        />
      )
    }

    if (field.type === 'select') {
      return (
        <select
          value={String(fieldValue)}
          onChange={(e) => {
            const val = e.target.value
            // Konversi ke number jika options value-nya number
            const numVal = Number(val)
            handleChange(field.key, isNaN(numVal) ? val : numVal)
          }}
          disabled={isSubmitting}
          className={`${baseInputClass} cursor-pointer ${errorClass} ${disabledClass}`}
        >
          {field.options?.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      )
    }

    // Default: text input
    return (
      <input
        type="text"
        value={String(fieldValue ?? '')}
        onChange={(e) => handleChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        disabled={isSubmitting}
        className={`${baseInputClass} placeholder:text-neutral-400 ${errorClass} ${disabledClass}`}
      />
    )
  }

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
            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
              <HiCpuChip className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">
                {mode === 'create' ? 'Tambah Alat' : 'Edit Alat'}
              </h2>
              <p className="text-xs text-neutral-400">
                {mode === 'create'
                  ? 'Daftarkan alat baru ke sistem'
                  : `Edit data alat ${item?.devices_code || ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <HiXMark className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEVICE_FORM_FIELDS.map((field) => (
                <div key={field.key} className={field.colSpan === 2 ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    {field.label}
                    {field.required && <span className="text-danger ml-0.5">*</span>}
                  </label>

                  {renderField(field)}

                  {errors[field.key] && <p className="mt-1 text-xs text-danger">{errors[field.key]}</p>}
                </div>
              ))}
            </div>
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
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {mode === 'create' ? 'Simpan' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DeviceFormModal
