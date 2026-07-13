/**
 * @file MainAppConfig.tsx
 * @description Komponen utama untuk konfigurasi aplikasi (App Config).
 *
 * Layout: Tab-based, no page scroll. Seluruh UI muat dalam viewport.
 * Hanya area konten tab yang scrollable secara internal (overflow-y-auto).
 *
 * API fields: BOYOLALI_BASE_URL, API_TOKEN_BOYOLALI, items_per_page, logo
 * Payload format: flat object { key: value, ... }
 *
 * @module Setting/AppConfig/MainAppConfig
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  HiCog6Tooth,
  HiPhoto,
  HiTrash,
  HiEye,
  HiEyeSlash,
  HiArrowPath,
  HiLink,
  HiComputerDesktop,
  HiCheckCircle,
  HiCloud,
} from 'react-icons/hi2'
import { useNotification } from '@/Components/General/Notification'
import { useGetAppConfigQuery, useUpdateAppConfigMutation } from '@/Services/Modules/appConfig'
import { convertImageToBase64 } from '@/Helpers/fileToBase64'
import {
  type AppConfigFormData,
  type AppConfigFieldConfig,
  APP_CONFIG_FORM_INITIAL,
  APP_CONFIG_FIELDS,
  configArrayToFormData,
} from './types'

// ── Tab definitions ────────────────────────────────────────────────
type TabKey = 'assets' | 'api' | 'display'

const TABS: { key: TabKey; label: string; icon: React.ReactNode; subtitle: string }[] = [
  {
    key: 'assets',
    label: 'Aset Tampilan',
    icon: <HiPhoto className="w-4 h-4" />,
    subtitle: 'Logo aplikasi',
  },
  {
    key: 'api',
    label: 'Integrasi API',
    icon: <HiLink className="w-4 h-4" />,
    subtitle: 'Koneksi layanan eksternal',
  },
  {
    key: 'display',
    label: 'Tampilan Aplikasi',
    icon: <HiComputerDesktop className="w-4 h-4" />,
    subtitle: 'Info & tampilan umum',
  },
]

const TAB_FIELD_MAP: Record<TabKey, (keyof AppConfigFormData)[]> = {
  assets: [],
  api: ['BOYOLALI_BASE_URL', 'API_TOKEN_BOYOLALI'],
  display: ['items_per_page'],
}

// ── Component ──────────────────────────────────────────────────────
const MainAppConfig: React.FC = () => {
  const { showNotification, contextHolder } = useNotification()

  // ── API ──
  const { data: apiResponse, isLoading, isFetching, refetch } = useGetAppConfigQuery()
  const [updateAppConfig, { isLoading: isUpdating }] = useUpdateAppConfigMutation()

  // ── State ──
  const [activeTab, setActiveTab] = useState<TabKey>('assets')
  const [formData, setFormData] = useState<AppConfigFormData>(APP_CONFIG_FORM_INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof AppConfigFormData, string>>>({})
  const [showPasswords, setShowPasswords] = useState<Partial<Record<keyof AppConfigFormData, boolean>>>({})
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Logo
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoConverting, setLogoConverting] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [logoChanged, setLogoChanged] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // ── Populate form ──
  // useEffect(() => {
  //   if (apiResponse?.data) {
  //     const parsed = configArrayToFormData(apiResponse.data)
  //     setFormData(parsed)
  //     if (parsed.logo) setLogoPreview(parsed.logo)
  //   }
  // }, [apiResponse])
  // ── Populate form ──
  useEffect(() => {
    if (apiResponse?.data) {
      const parsed = configArrayToFormData(apiResponse.data)
      setFormData((prev) => ({
        ...parsed,
        // Preserve logo base64 yang sudah ada di formData (hasil upload user)
        // Jangan overwrite kalau sebelumnya sudah base64 dan server kembalikan URL
        logo: prev.logo?.startsWith('data:') ? prev.logo : parsed.logo,
      }))
      // Set preview: prioritaskan yang sudah ada, fallback ke dari server
      setLogoPreview((prev) => {
        if (prev && prev.startsWith('data:')) return prev
        return parsed.logo || null
      })
    }
  }, [apiResponse])

  // ── Handlers ──
  const handleChange = (key: keyof AppConfigFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const togglePasswordVisibility = (key: keyof AppConfigFormData) => {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleImageUpload = async (
    file: File,
    field: 'logo',
    setPreview: (v: string | null) => void,
    setConverting: (v: boolean) => void,
    setError: (v: string | null) => void,
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) => {
    setError(null)
    setConverting(true)
    try {
      const result = await convertImageToBase64(file)
      if ('error' in result) {
        setError(result.error)
        return
      }
      setFormData((prev) => ({ ...prev, [field]: result.base64 }))
      setPreview(result.base64)
      setLogoChanged(true)
    } catch {
      setError('Gagal memproses gambar.')
    } finally {
      setConverting(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleRemoveImage = (
    field: 'logo',
    setPreview: (v: string | null) => void,
    setError: (v: string | null) => void,
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: '' }))
    setPreview(null)
    setError(null)
    setLogoChanged(true)
    if (inputRef.current) inputRef.current.value = ''
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AppConfigFormData, string>> = {}
    if (formData.items_per_page) {
      const val = parseInt(formData.items_per_page)
      if (isNaN(val) || val < 1) newErrors.items_per_page = 'Harus angka positif'
    }
    setErrors(newErrors)

    // Auto-switch ke tab yang punya error
    const errorKeys = Object.keys(newErrors) as (keyof AppConfigFormData)[]
    if (errorKeys.length > 0) {
      for (const [tabKey, fields] of Object.entries(TAB_FIELD_MAP)) {
        if (fields.some((f) => errorKeys.includes(f))) {
          setActiveTab(tabKey as TabKey)
          break
        }
      }
    }

    return errorKeys.length === 0
  }

  //   const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   if (!validate()) return
  //   try {
  //     const result = await updateAppConfig(formData).unwrap()
  //     if (result.status === 'success') {
  //       setSaveSuccess(true)
  //       setTimeout(() => setSaveSuccess(false), 3000)
  //       showNotification({ title: 'Berhasil!', description: result.message || 'Konfigurasi berhasil disimpan.', type: 'success' })
  //     } else {
  //       showNotification({ title: 'Gagal!', description: result.message, type: 'error' })
  //     }
  //   } catch (error: any) {
  //     const msg = error?.data?.message || error?.message || 'Terjadi kesalahan.'
  //     showNotification({ title: 'Error!', description: msg, type: 'error' })
  //   }
  // }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      const payload: AppConfigFormData = {
        BOYOLALI_BASE_URL: formData.BOYOLALI_BASE_URL,
        API_TOKEN_BOYOLALI: formData.API_TOKEN_BOYOLALI,
        items_per_page: formData.items_per_page,
        // Hanya kirim logo jika user mengubahnya
        ...(logoChanged && {
          logo: formData.logo?.startsWith('data:')
            ? formData.logo
            : logoPreview?.startsWith('data:')
              ? logoPreview
              : formData.logo,
        }),
      }

      console.log('PAYLOAD SEND logo starts with:', payload.logo?.substring(0, 30))

      const result = await updateAppConfig(payload).unwrap()

      if (result.status === 'success') {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        showNotification({
          title: 'Berhasil!',
          description: result.message || 'Konfigurasi berhasil disimpan.',
          type: 'success',
        })
      }
    } catch (error: any) {
      const msg = error?.data?.message || error?.message || 'Terjadi kesalahan.'
      showNotification({ title: 'Error!', description: msg, type: 'error' })
    }
  }

  // ── Render input field ──
  const renderField = (fieldConfig: AppConfigFieldConfig) => {
    const { key, type, placeholder } = fieldConfig
    const isPassword = type === 'password'
    const showPass = showPasswords[key]
    const hasError = !!errors[key]

    const cls = [
      'w-full px-3 py-2 text-sm rounded-lg border transition-all duration-150',
      'bg-white placeholder:text-neutral-300 focus:outline-none focus:ring-2',
      hasError
        ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
        : 'border-neutral-200 focus:ring-primary-100 focus:border-primary-400 text-neutral-800',
      isUpdating ? 'opacity-50 cursor-not-allowed bg-neutral-50' : '',
    ].join(' ')

    if (type === 'textarea') {
      return (
        <textarea
          value={formData[key]}
          onChange={(e) => handleChange(key, e.target.value)}
          placeholder={placeholder}
          rows={2}
          disabled={isUpdating}
          className={`${cls} resize-none`}
        />
      )
    }

    return (
      <div className="relative">
        <input
          type={isPassword && !showPass ? 'password' : 'text'}
          value={formData[key]}
          onChange={(e) => handleChange(key, e.target.value)}
          placeholder={placeholder}
          disabled={isUpdating}
          className={`${cls} ${isPassword ? 'pr-9' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => togglePasswordVisibility(key)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
          >
            {showPass ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
          </button>
        )}
      </div>
    )
  }

  // ── Render image uploader ──
  const renderImageUpload = (
    field: 'logo',
    label: string,
    description: string,
    preview: string | null,
    converting: boolean,
    error: string | null,
    setPreview: (v: string | null) => void,
    setConverting: (v: boolean) => void,
    setError: (v: string | null) => void,
    inputRef: React.RefObject<HTMLInputElement | null>,
    previewClass: string,
  ) => (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-neutral-100 bg-neutral-50/50">
      {/* Preview */}
      <div
        className={`${previewClass} rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden flex-shrink-0 transition-all ${preview ? 'border-primary-200 bg-white' : 'border-neutral-200 bg-white'}`}
      >
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-cover" />
        ) : (
          <HiPhoto className="w-6 h-6 text-neutral-300" />
        )}
      </div>

      {/* Info + controls */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-700">{label}</p>
        <p className="text-xs text-neutral-400 mt-0.5 mb-3">{description}</p>
        <div className="flex items-center flex-wrap gap-2">
          <label
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all border ${converting || isUpdating ? 'opacity-50 cursor-not-allowed bg-neutral-100 text-neutral-400 border-neutral-200' : 'bg-primary-50 text-primary-600 hover:bg-primary-100 border-primary-100'}`}
          >
            <HiCloud className="w-3.5 h-3.5" />
            {converting ? 'Memproses...' : 'Unggah'}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file, field, setPreview, setConverting, setError, inputRef)
              }}
              disabled={converting || isUpdating}
              className="hidden"
            />
          </label>
          {preview && (
            <button
              type="button"
              onClick={() => handleRemoveImage(field, setPreview, setError, inputRef)}
              disabled={isUpdating}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-all cursor-pointer"
            >
              <HiTrash className="w-3 h-3" />
              Hapus
            </button>
          )}
        </div>
        <p className="text-[11px] text-neutral-400 mt-2">JPEG, PNG, GIF, WebP, SVG · Maks 2MB</p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    </div>
  )

  // ── Tab content ──
  const renderTabContent = () => {
    // Assets tab
    if (activeTab === 'assets') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {renderImageUpload(
            'logo',
            'Logo Aplikasi',
            'Ditampilkan di navbar dan halaman login',
            logoPreview,
            logoConverting,
            logoError,
            setLogoPreview,
            setLogoConverting,
            setLogoError,
            logoInputRef,
            'w-20 h-20',
          )}
        </div>
      )
    }

    // Field-based tabs
    const fieldKeys = TAB_FIELD_MAP[activeTab]
    const fields = APP_CONFIG_FIELDS.filter((f) => fieldKeys.includes(f.key))

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {fields.map((field) => (
          <div key={field.key} className={field.colSpan === 2 ? 'sm:col-span-2' : ''}>
            <div className="flex items-baseline justify-between mb-1 gap-2">
              <label className="text-sm font-medium text-neutral-700">{field.label}</label>
              {errors[field.key] && (
                <span className="text-[11px] text-red-500 font-medium shrink-0">{errors[field.key]}</span>
              )}
            </div>
            {field.description && <p className="text-[11px] text-neutral-400 mb-1.5">{field.description}</p>}
            {renderField(field)}
          </div>
        ))}
      </div>
    )
  }

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="flex flex-col h-full gap-4 animate-pulse">
        <div className="h-14 bg-white rounded-xl border border-neutral-100 flex-shrink-0" />
        <div className="h-12 bg-white rounded-xl border border-neutral-100 flex-shrink-0" />
        <div className="flex-1 bg-white rounded-xl border border-neutral-100" />
        <div className="h-14 bg-white rounded-xl border border-neutral-100 flex-shrink-0" />
      </div>
    )
  }

  // ── Main render ──
  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full gap-0 overflow-hidden">
      {contextHolder}

      {/* ── Top bar: title + refresh ── */}
      <div className="flex items-center justify-between px-1 pb-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
            <HiCog6Tooth className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 leading-tight">Konfigurasi Aplikasi</h3>
            <p className="text-[11px] text-neutral-400">Kelola pengaturan sistem</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-500 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all cursor-pointer disabled:opacity-50"
        >
          <HiArrowPath className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Tab nav ── */}
      <div className="flex-shrink-0 bg-white border border-neutral-200 rounded-xl overflow-hidden mb-3">
        {/* Desktop: horizontal tabs */}
        <div className="hidden sm:flex border-b border-neutral-100">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            const tabFields = TAB_FIELD_MAP[tab.key]
            const hasError = tabFields.some((f) => errors[f])
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium
                  transition-all cursor-pointer border-b-2 relative
                  ${
                    isActive
                      ? 'border-primary-500 text-primary-600 bg-primary-50/40'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                  }
                `}
              >
                <span className={isActive ? 'text-primary-500' : 'text-neutral-400'}>{tab.icon}</span>
                <span>{tab.label}</span>
                {hasError && <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-2 right-2" />}
              </button>
            )
          })}
        </div>

        {/* Mobile: select dropdown */}
        <div className="sm:hidden p-3">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TabKey)}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 text-neutral-700 cursor-pointer"
          >
            {TABS.map((tab) => (
              <option key={tab.key} value={tab.key}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active tab subtitle */}
        <div className="px-4 py-2 bg-neutral-50/40 border-t border-neutral-100 hidden sm:block">
          <p className="text-[11px] text-neutral-400">{TABS.find((t) => t.key === activeTab)?.subtitle}</p>
        </div>
      </div>

      {/* ── Tab content body (only this scrolls) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-white border border-neutral-200 rounded-xl p-5">
        {renderTabContent()}
      </div>

      {/* ── Bottom action bar ── */}
      <div className="flex-shrink-0 mt-3 bg-white border border-neutral-200 rounded-xl px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="min-h-[18px] flex items-center">
          {saveSuccess ? (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <HiCheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-medium">Konfigurasi berhasil disimpan</span>
            </div>
          ) : (
            <p className="text-xs text-neutral-400">Perubahan akan aktif setelah disimpan</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isUpdating || logoConverting}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 active:bg-primary-700 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto justify-center flex-shrink-0"
        >
          {isUpdating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <HiCheckCircle className="w-4 h-4" />
              Simpan Konfigurasi
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default MainAppConfig
