/**
 * @file RoleFormModal.tsx
 * @description Modal form untuk create/edit role dengan API
 * NOTE: Tidak ada field "type" — API tidak mengenal enum type
 */

import React, { useEffect, useState } from 'react'
import { HiXMark, HiShieldCheck } from 'react-icons/hi2'
import type { Role, RoleFormData } from './types'
import { ROLE_FORM_INITIAL } from './types'

interface Props {
  isOpen: boolean
  mode: 'create' | 'edit'
  item?: Role | null
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (data: RoleFormData, id?: number) => void
}

const RoleFormModal: React.FC<Props> = ({
  isOpen,
  mode,
  item,
  isSubmitting = false,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<RoleFormData>(ROLE_FORM_INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof RoleFormData, string>>>({})

  useEffect(() => {
    if (mode === 'edit' && item) {
      setFormData({
        role_name: item.name,
        description: item.description,
        is_active: item.isActive,
        permissions: item.permissions,
      })
    } else {
      setFormData(ROLE_FORM_INITIAL)
    }
    setErrors({})
  }, [mode, item, isOpen])

  if (!isOpen) return null

  const handleChange = (field: keyof RoleFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RoleFormData, string>> = {}
    if (!formData.role_name.trim()) newErrors.role_name = 'Nama role wajib diisi'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(formData, mode === 'edit' ? item?.id : undefined)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-50">
              <HiShieldCheck className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {mode === 'create' ? 'Tambah Role Baru' : 'Edit Role'}
              </h2>
              <p className="text-sm text-gray-500">
                {mode === 'create'
                  ? 'Buat role baru dalam sistem'
                  : `Edit role ${item?.name || ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <HiXMark className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 overflow-y-auto max-h-[60vh] space-y-5">

            {/* Nama Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.role_name}
                onChange={(e) => handleChange('role_name', e.target.value)}
                placeholder="Contoh: ADMIN, DOKTER, STAFF LAB"
                disabled={isSubmitting}
                className={`
                  w-full px-4 py-2.5 text-sm border rounded-lg
                  focus:outline-none focus:ring-2 transition-all
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                  ${errors.role_name
                    ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                    : 'border-gray-300 focus:ring-primary-100 focus:border-primary-400'
                  }
                `}
              />
              {errors.role_name && (
                <p className="mt-1.5 text-xs text-red-500">{errors.role_name}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                Nama role akan digunakan sebagai identitas (contoh: ADMIN, DOKTER)
              </p>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Deskripsi
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Jelaskan tanggung jawab role ini..."
                rows={3}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-primary-100 
                         focus:border-primary-400 transition-all
                         disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              />
            </div>

            {/* Status Active (only for edit) */}
            {mode === 'edit' && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Status Role
                </label>
                <label className="flex items-center gap-3 cursor-pointer w-fit">
                  <div
                    onClick={() => !isSubmitting && handleChange('is_active', !formData.is_active)}
                    className={`
                      relative inline-flex items-center w-11 h-6 rounded-full 
                      transition-colors duration-200 cursor-pointer
                      ${formData.is_active ? 'bg-blue-500' : 'bg-gray-300'}
                      ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <span
                      className={`
                        inline-block w-5 h-5 bg-white rounded-full shadow 
                        transform transition-transform duration-200
                        ${formData.is_active ? 'translate-x-5' : 'translate-x-0.5'}
                      `}
                    />
                  </div>
                  <span className="text-sm text-gray-700">
                    {formData.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </label>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
              )}
              {mode === 'create' ? 'Simpan Role' : 'Update Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RoleFormModal