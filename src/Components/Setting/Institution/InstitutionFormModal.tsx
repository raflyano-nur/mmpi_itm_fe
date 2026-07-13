/**
 * @file InstitutionFormModal.tsx
 * @description Modal form untuk Create dan Edit data institusi.
 *
 * Fitur:
 * - Menambah institusi baru (mode: 'create')
 * - Mengedit institusi yang sudah ada (mode: 'edit')
 * - Upload logo dengan konversi ke base64
 * - Validasi form sebelum submit
 *
 * @module Setting/Institution/InstitutionFormModal
 */

import React, { useState, useEffect, useRef } from 'react'
import { HiXMark, HiBuildingOffice2, HiPhoto, HiTrash } from 'react-icons/hi2'
import type { InstitutionItem, InstitutionFormData, FormFieldConfig } from './types'
import { INSTITUTION_FORM_INITIAL, INSTITUTION_FORM_FIELDS } from './types'
import { convertImageToBase64 } from '@/Helpers/fileToBase64'

interface InstitutionFormModalProps {
  /** Apakah modal sedang terbuka */
  isOpen: boolean
  /** Mode form: 'create' untuk baru, 'edit' untuk update */
  mode: 'create' | 'edit'
  /** Data institusi yang akan diedit (hanya untuk mode 'edit') */
  item?: InstitutionItem | null
  /** Loading state saat submit */
  isSubmitting?: boolean
  /** Callback ketika modal ditutup */
  onClose: () => void
  /** Callback ketika form disubmit */
  onSubmit: (data: InstitutionFormData, id?: number) => void
}

const InstitutionFormModal: React.FC<InstitutionFormModalProps> = ({
  isOpen,
  mode,
  item,
  isSubmitting = false,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<InstitutionFormData>(INSTITUTION_FORM_INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof InstitutionFormData, string>>>({})
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [isConvertingLogo, setIsConvertingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Populate form saat edit
  useEffect(() => {
    if (mode === 'edit' && item) {
      setFormData({
        institutions_code: item.institutions_code,
        institutions_name: item.institutions_name,
        addr1: item.addr1,
        addr2: item.addr2,
        rt: item.rt,
        rw: item.rw,
        villages: item.villages,
        districts: item.districts,
        regencies: item.regencies,
        provincies: item.provincies,
        poscode: item.poscode?.trim() || '',
        phone: item.phone?.trim() || '',
        fax: item.fax?.trim() || '',
        mail: item.mail?.trim() || '',
        logo: '',
        status: item.status,
      })
      // Set logo preview dari URL yang ada
      setLogoPreview(item.logo_url || null)
    } else {
      setFormData(INSTITUTION_FORM_INITIAL)
      setLogoPreview(null)
    }
    setErrors({})
    setLogoError(null)
  }, [mode, item, isOpen])

  if (!isOpen) return null

  // ===== HANDLERS =====

  const handleChange = (field: keyof InstitutionFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error saat user mengetik
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLogoError(null)
    setIsConvertingLogo(true)

    try {
      const result = await convertImageToBase64(file)

      if ('error' in result) {
        setLogoError(result.error)
        setIsConvertingLogo(false)
        return
      }

      setFormData((prev) => ({ ...prev, logo: result.base64 }))
      setLogoPreview(result.base64)
    } catch {
      setLogoError('Gagal memproses gambar. Silakan coba lagi.')
    } finally {
      setIsConvertingLogo(false)
      // Reset input agar bisa upload file yang sama
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logo: '' }))
    setLogoPreview(null)
    setLogoError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof InstitutionFormData, string>> = {}

    if (!formData.institutions_code.trim()) newErrors.institutions_code = 'Kode institusi wajib diisi'
    if (!formData.institutions_name.trim()) newErrors.institutions_name = 'Nama institusi wajib diisi'
    if (!formData.addr1.trim()) newErrors.addr1 = 'Alamat 1 wajib diisi'
    if (!formData.villages.trim()) newErrors.villages = 'Kelurahan/Desa wajib diisi'
    if (!formData.districts.trim()) newErrors.districts = 'Kecamatan wajib diisi'
    if (!formData.regencies.trim()) newErrors.regencies = 'Kabupaten/Kota wajib diisi'
    if (!formData.provincies.trim()) newErrors.provincies = 'Provinsi wajib diisi'
    if (!formData.phone.trim()) newErrors.phone = 'Telepon wajib diisi'

    if (formData.mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mail)) {
      newErrors.mail = 'Format email tidak valid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    // Buat payload, hapus logo jika kosong (edit tanpa ganti logo)
    const payload = { ...formData }
    if (!payload.logo && mode === 'edit') {
      // Jika edit dan tidak ada logo baru, hapus field logo dari payload
      delete (payload as any).logo
    }

    onSubmit(payload, mode === 'edit' ? item?.id : undefined)
  }

  // ===== RENDER FORM FIELD =====

  const renderField = (field: FormFieldConfig) => {
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
          value={formData[field.key] as string}
          onChange={(e) => handleChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          disabled={isSubmitting}
          className={`
            w-full px-3.5 py-2.5 text-sm border rounded-lg resize-none
            bg-white focus:outline-none focus:ring-2 transition-all
            placeholder:text-neutral-400
            ${
              errors[field.key]
                ? 'border-danger focus:ring-danger/20 focus:border-danger'
                : 'border-neutral-200 focus:ring-primary-500/20 focus:border-primary-500'
            }
            ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        />
      )
    }

    if (field.type === 'select') {
      return (
        <select
          value={String(formData[field.key])}
          onChange={(e) => handleChange(field.key, e.target.value)}
          disabled={isSubmitting}
          className={`
            w-full px-3.5 py-2.5 text-sm border rounded-lg
            bg-white focus:outline-none focus:ring-2 transition-all cursor-pointer
            ${
              errors[field.key]
                ? 'border-danger focus:ring-danger/20 focus:border-danger'
                : 'border-neutral-200 focus:ring-primary-500/20 focus:border-primary-500'
            }
            ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        >
          {field.options?.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      )
    }

    // Default: text / email input
    return (
      <input
        type={field.type}
        value={formData[field.key] as string}
        onChange={(e) => handleChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        disabled={isSubmitting}
        className={`
          w-full px-3.5 py-2.5 text-sm border rounded-lg
          bg-white focus:outline-none focus:ring-2 transition-all
          placeholder:text-neutral-400
          ${
            errors[field.key]
              ? 'border-danger focus:ring-danger/20 focus:border-danger'
              : 'border-neutral-200 focus:ring-primary-500/20 focus:border-primary-500'
          }
          ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}
        `}
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
              <HiBuildingOffice2 className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">
                {mode === 'create' ? 'Tambah Institusi' : 'Edit Institusi'}
              </h2>
              <p className="text-xs text-neutral-400">
                {mode === 'create'
                  ? 'Isi data untuk menambah institusi baru'
                  : `Edit data institusi ${item?.institutions_code || ''}`}
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
            {/* Logo Upload */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Logo</label>
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-neutral-200 flex items-center justify-center overflow-hidden bg-neutral-50 flex-shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <HiPhoto className="w-8 h-8 text-neutral-300" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <label
                      className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all
                        ${isSubmitting || isConvertingLogo ? 'opacity-60 cursor-not-allowed bg-neutral-100 text-neutral-400' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'}
                      `}
                    >
                      <HiPhoto className="w-3.5 h-3.5" />
                      {isConvertingLogo ? 'Memproses...' : 'Pilih Gambar'}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                        onChange={handleLogoChange}
                        disabled={isSubmitting || isConvertingLogo}
                        className="hidden"
                      />
                    </label>

                    {logoPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-danger bg-danger/5 rounded-lg hover:bg-danger/10 transition-all cursor-pointer"
                      >
                        <HiTrash className="w-3.5 h-3.5" />
                        Hapus
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400">Format: JPEG, PNG, GIF, WebP, SVG. Maks 2MB.</p>
                  {logoError && <p className="text-xs text-danger">{logoError}</p>}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INSTITUTION_FORM_FIELDS.map((field) => (
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
              disabled={isSubmitting || isConvertingLogo}
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

export default InstitutionFormModal
