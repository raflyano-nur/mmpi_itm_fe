import React, { useEffect, useMemo, useState } from 'react'
import { HiBolt, HiDocumentDuplicate, HiEye, HiEyeSlash, HiShieldCheck, HiXMark } from 'react-icons/hi2'
import type { DispatchTargetFieldConfig, DispatchTargetFormData, DispatchTargetItem } from './types'
import {
  DISPATCH_TARGET_AUTH_META,
  DISPATCH_TARGET_FORM_INITIAL,
  DISPATCH_TARGET_PRESETS,
  buildDispatchTargetPayload,
  getDispatchTargetFormFields,
  toDispatchTargetFormData,
} from './types'

type DispatchTargetFormErrors = Partial<Record<keyof DispatchTargetFormData, string>>

interface DispatchTargetFormModalProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  item?: DispatchTargetItem | null
  isSubmitting?: boolean
  serverErrors?: Record<string, string>
  onClose: () => void
  onSubmit: (data: DispatchTargetFormData, id?: number) => void
}

const DispatchTargetFormModal: React.FC<DispatchTargetFormModalProps> = ({
  isOpen,
  mode,
  item,
  isSubmitting = false,
  serverErrors = {},
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<DispatchTargetFormData>(DISPATCH_TARGET_FORM_INITIAL)
  const [errors, setErrors] = useState<DispatchTargetFormErrors>({})
  const [showPasswords, setShowPasswords] = useState<Partial<Record<keyof DispatchTargetFormData, boolean>>>({})

  useEffect(() => {
    if (mode === 'edit' && item) {
      setFormData({
        name: item.name,
        description: item.description ?? '',
        url: item.url,
        auth_type: item.auth_type,
        auth_header_name: item.auth_header_name ?? '',
        auth_value: '',
        is_active: item.is_active,
      })
    } else {
      setFormData(DISPATCH_TARGET_FORM_INITIAL)
    }

    setErrors({})
    setShowPasswords({})
  }, [mode, item, isOpen])

  useEffect(() => {
    if (Object.keys(serverErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...(serverErrors as DispatchTargetFormErrors) }))
    }
  }, [serverErrors])

  const visibleFields = useMemo(
    () => getDispatchTargetFormFields(formData, mode, item),
    [formData, mode, item],
  )
  const authMeta = DISPATCH_TARGET_AUTH_META[formData.auth_type]
  const payloadPreview = useMemo(
    () =>
      JSON.stringify(
        mode === 'create'
          ? buildDispatchTargetPayload(formData, 'create')
          : buildDispatchTargetPayload(formData, 'edit', item),
        null,
        2,
      ),
    [formData, mode, item],
  )

  if (!isOpen) return null

  const handleChange = (field: keyof DispatchTargetFormData, value: string | boolean) => {
    setFormData((prev) => {
      if (field === 'auth_type') {
        const nextAuthType = value as DispatchTargetFormData['auth_type']

        return {
          ...prev,
          auth_type: nextAuthType,
          auth_header_name: nextAuthType === 'api_key_header' ? prev.auth_header_name || 'x-api-key' : '',
          auth_value: nextAuthType === 'none' ? '' : prev.auth_value,
        }
      }

      return { ...prev, [field]: value }
    })

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    if (field === 'auth_type') {
      setErrors((prev) => ({
        ...prev,
        auth_type: undefined,
        auth_header_name: undefined,
        auth_value: undefined,
      }))
    }
  }

  const handleApplyPreset = (presetId: DispatchTargetFormData['auth_type']) => {
    const preset = DISPATCH_TARGET_PRESETS.find((item) => item.id === presetId)
    if (!preset) return

    setFormData(toDispatchTargetFormData(preset))
    setErrors({})
  }

  const togglePasswordVisibility = (field: keyof DispatchTargetFormData) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const validate = (): boolean => {
    const nextErrors: DispatchTargetFormErrors = {}
    const authTypeChanged = mode === 'edit' && !!item && item.auth_type !== formData.auth_type

    if (!formData.name.trim()) nextErrors.name = 'Nama target wajib diisi'
    if (!formData.url.trim()) {
      nextErrors.url = 'URL endpoint wajib diisi'
    } else {
      try {
        new URL(formData.url.trim())
      } catch {
        nextErrors.url = 'Format URL tidak valid'
      }
    }

    if (formData.auth_type === 'api_key_header' && !formData.auth_header_name.trim()) {
      nextErrors.auth_header_name = 'Nama header wajib diisi untuk API Key Header'
    }

    if (formData.auth_type !== 'none') {
      const shouldRequireSecret = mode === 'create' || authTypeChanged
      if (shouldRequireSecret && !formData.auth_value.trim()) {
        nextErrors.auth_value = 'Credential wajib diisi untuk tipe auth ini'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    onSubmit(formData, mode === 'edit' ? item?.id : undefined)
  }

  const renderField = (field: DispatchTargetFieldConfig) => {
    const hasError = !!errors[field.key]
    const commonClassName = `
      w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white transition-all
      focus:outline-none focus:ring-2 placeholder:text-neutral-400
      ${hasError ? 'border-danger focus:ring-danger/20 focus:border-danger' : 'border-neutral-200 focus:ring-primary-500/20 focus:border-primary-500'}
      ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}
    `

    if (field.type === 'toggle') {
      return (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleChange(field.key, !formData[field.key])}
            disabled={isSubmitting}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer
              ${formData[field.key] ? 'bg-primary-500' : 'bg-neutral-300'}
              ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                ${formData[field.key] ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
          <span className="text-sm text-neutral-600">{formData[field.key] ? 'Aktif' : 'Nonaktif'}</span>
        </div>
      )
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={String(formData[field.key] ?? '')}
          onChange={(e) => handleChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          disabled={isSubmitting}
          className={`${commonClassName} resize-none`}
        />
      )
    }

    if (field.type === 'select') {
      return (
        <select
          value={String(formData[field.key])}
          onChange={(e) => handleChange(field.key, e.target.value)}
          disabled={isSubmitting}
          className={`${commonClassName} cursor-pointer`}
        >
          {field.options?.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      )
    }

    if (field.type === 'password') {
      const showPassword = !!showPasswords[field.key]

      return (
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={String(formData[field.key] ?? '')}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            disabled={isSubmitting}
            className={`${commonClassName} pr-10`}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility(field.key)}
            disabled={isSubmitting}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer disabled:opacity-50"
          >
            {showPassword ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
          </button>
        </div>
      )
    }

    return (
      <input
        type={field.type}
        value={String(formData[field.key] ?? '')}
        onChange={(e) => handleChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        disabled={isSubmitting}
        className={commonClassName}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[92vh] overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <HiBolt className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">
                {mode === 'create' ? 'Tambah Dispatch Target' : 'Edit Dispatch Target'}
              </h2>
              <p className="text-xs text-neutral-400">
                {mode === 'create'
                  ? 'Gunakan preset atau isi form untuk membuat target pengiriman baru'
                  : `Perbarui konfigurasi target ${item?.name || ''}`}
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

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 overflow-y-auto max-h-[72vh]">
            {mode === 'create' && (
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-3">
                  <HiDocumentDuplicate className="w-4 h-4 text-primary-500" />
                  Preset body request
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {DISPATCH_TARGET_PRESETS.map((preset) => {
                    const isActive = formData.auth_type === preset.id && formData.name === preset.body.name

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset.id)}
                        className={`
                          rounded-xl border p-3 text-left transition-all cursor-pointer
                          ${isActive ? 'border-primary-300 bg-primary-50 shadow-sm' : 'border-neutral-200 hover:border-primary-200 hover:bg-neutral-50'}
                        `}
                      >
                        <p className="mt-1 text-sm font-semibold text-neutral-800">{preset.title}</p>
                        <p className="mt-1 text-xs text-neutral-500">{preset.subtitle}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="gap-6">
              <div className="space-y-5">
                <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 via-white to-primary-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/70 border border-white/60 flex items-center justify-center">
                      <HiShieldCheck className="w-5 h-5 text-neutral-700" />
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${authMeta.badgeClassName}`}
                      >
                        <HiShieldCheck className="w-3.5 h-3.5" />
                        {authMeta.label}
                      </span>
                      <h3 className="mt-2 text-sm font-semibold text-neutral-800">Konfigurasi Autentikasi</h3>
                      <p className="mt-1 text-sm text-neutral-600">{authMeta.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visibleFields.map((field) => (
                    <div key={field.key} className={field.colSpan === 2 ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        {field.label}
                        {field.required && <span className="text-danger ml-0.5">*</span>}
                      </label>

                      {renderField(field)}

                      {errors[field.key] && <p className="mt-1 text-xs text-danger">{errors[field.key]}</p>}
                      {!errors[field.key] && field.description && (
                        <p className="mt-1 text-xs text-neutral-400">{field.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

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
              {mode === 'create' ? 'Simpan Target' : 'Update Target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DispatchTargetFormModal
