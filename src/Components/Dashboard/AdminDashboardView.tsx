// AdminDashboardView.tsx - Versi Compact Tanpa Toggle Upload

import React, { useRef, useState, useCallback, useEffect } from 'react'
import {
  HiUserGroup,
  HiCheckCircle,
  HiClock,
  HiClipboardDocumentList,
  HiArrowUpTray,
  HiDocumentText,
  HiXMark,
  HiEye,
  HiChevronDown,
  HiChevronUp,
  HiSparkles,
  HiCalendarDays,
  HiMagnifyingGlass,
} from 'react-icons/hi2'
import { useExcelUpload } from '@/Hooks/useExcelUpload'

interface StatCard {
  label: string
  value: string | number
  icon: React.ReactNode
  bgColor: string
  trend?: string
}

interface RecentMember {
  id: string | number
  name: string
  status: string
  date: string
  idnumber?: string
}

interface UploadResult {
  success_count: number
  error_count: number
  errors: { row?: number; message: string }[]
}

interface AdminDashboardViewProps {
  adminName?: string
  stats: StatCard[]
  recentMembers: RecentMember[]
  isLoading?: boolean
  onViewAllMembers: () => void
  onUploadSuccess?: (result: UploadResult) => void
  apiBaseUrl?: string
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Terverifikasi: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Belum Verifikasi': 'bg-amber-50 text-amber-700 border-amber-200',
    Nonaktif: 'bg-rose-50 text-rose-700 border-rose-200',
  }
  return map[status] || 'bg-slate-50 text-slate-700 border-slate-200'
}

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  adminName,
  stats,
  recentMembers,
  isLoading = false,
  onViewAllMembers,
  onUploadSuccess,
  apiBaseUrl = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadMessage, setUploadMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
    details?: string[]
  } | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { uploadFile, uploading, uploadProgress, error, success, reset } = useExcelUpload(
    (data) => {
      const result = data.data as UploadResult
      const successCount = result?.success_count || 0
      const errorCount = result?.error_count || 0
      const errorDetails = result?.errors?.map((err) => `Baris ${err.row ?? '?'}: ${err.message}`) || []

      setUploadMessage({
        type: errorCount === 0 ? 'success' : 'info',
        text: `${successCount} berhasil, ${errorCount} gagal`,
        details: errorDetails.length ? errorDetails : undefined,
      })

      if (onUploadSuccess) {
        onUploadSuccess(result)
      }
      setSelectedFile(null)
    },
    (err) => {
      const errorMsg = err?.data?.message || err?.message || 'Upload gagal'
      setUploadMessage({
        type: 'error',
        text: errorMsg,
      })
    },
  )

  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  const validateFile = (file: File): boolean => {
    const allowedExtensions = ['.xlsx', '.xls']
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!allowedExtensions.includes(ext)) {
      setUploadMessage({
        type: 'error',
        text: 'Format tidak didukung. Gunakan .xlsx atau .xls',
      })
      return false
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadMessage({
        type: 'error',
        text: 'File terlalu besar. Maksimal 50MB',
      })
      return false
    }

    return true
  }

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (validateFile(file)) {
          setSelectedFile(file)
          await uploadFile(file)
        }
      }
    },
    [uploadFile],
  )

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (validateFile(file)) {
      setSelectedFile(file)
      await uploadFile(file)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFile(null)
    setUploadMessage(null)
    reset()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Filter members based on search
  const filteredMembers = recentMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.idnumber || m.id.toString()).toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Show only first 5 members by default
  const displayMembers = filteredMembers.slice(0, 5)

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-4 sm:p-5 text-white shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  Selamat Datang, {adminName || 'Admin'}
                  <HiSparkles className="h-5 w-5 text-yellow-300" />
                </h1>
                <p className="text-blue-100 text-xs sm:text-sm flex items-center gap-1.5 mt-0.5">
                  <HiCalendarDays className="h-3.5 w-3.5" />
                  Ringkasan aktivitas hari ini
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-blue-50">Online</span>
            </div>
          </div>
        </div>

        {/* Compact Stat Cards - 4 in a row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group bg-white rounded-xl border border-slate-200/60 p-3 sm:p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className={`${stat.bgColor} p-2 rounded-lg transition-transform group-hover:scale-110`}>
                  <div className="h-5 w-5 sm:h-6 sm:w-6">{stat.icon}</div>
                </div>
                <div className="min-w-0">
                  {isLoading ? (
                    <>
                      <div className="h-6 w-16 bg-slate-100 rounded animate-pulse mb-1" />
                      <div className="h-3 w-12 bg-slate-100 rounded animate-pulse" />
                    </>
                  ) : (
                    <>
                      <p className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                        {stat.value}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{stat.label}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout: Table + Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Members - Compact Table */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Peserta Terbaru</h2>
              <div className="flex items-center gap-2">
                <div className="relative hidden sm:block">
                  <HiMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-36"
                  />
                </div>
                <button
                  onClick={onViewAllMembers}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  Semua
                  <HiEye className="h-3 w-3" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-3 py-2 text-left font-medium text-slate-500">ID</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-500">Nama</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(3)].map((_, j) => (
                          <td key={j} className="px-3 py-2.5">
                            <div
                              className="h-3 bg-slate-100 rounded animate-pulse"
                              style={{ width: `${Math.random() * 30 + 40}px` }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : displayMembers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-8 text-center">
                        <HiUserGroup className="h-8 w-8 text-slate-300 mx-auto mb-1" />
                        <p className="text-slate-500 text-xs">Belum ada peserta</p>
                      </td>
                    </tr>
                  ) : (
                    displayMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded">
                            {m.idnumber || m.id}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                              {m.name.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-900 truncate max-w-[120px]">
                              {m.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${statusBadge(m.status)}`}
                          >
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filteredMembers.length > 5 && (
              <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-center">
                <button className="text-xs text-blue-600 hover:text-blue-800">
                  +{filteredMembers.length - 5} peserta lainnya
                </button>
              </div>
            )}
          </div>

          {/* Upload Area - Always Visible */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Upload Data</h2>
            </div>

            <div className="p-4 space-y-3">
              {/* Compact Dropzone */}
              <div
                ref={dropZoneRef}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleClick}
                className={`
                  relative rounded-xl border-2 border-dashed p-6 transition-all duration-200 cursor-pointer
                  ${
                    isDragging
                      ? 'border-blue-400 bg-blue-50/50 scale-[1.02]'
                      : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-white'
                  }
                  ${uploading ? 'pointer-events-none opacity-75' : ''}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center gap-3">
                  {uploading ? (
                    <>
                      <div className="relative">
                        <div className="w-12 h-12 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                        <HiDocumentText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-700">Mengupload...</p>
                        <p className="text-xs text-slate-500 mt-0.5">{Math.round(uploadProgress)}% selesai</p>
                      </div>
                      <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </>
                  ) : selectedFile ? (
                    <div className="flex items-center gap-4 w-full max-w-sm bg-white rounded-lg p-3 border border-slate-200">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <HiDocumentText className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{selectedFile.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <HiXMark className="h-4 w-4 text-slate-400 hover:text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className={`p-3 rounded-xl ${isDragging ? 'bg-blue-100' : 'bg-blue-50'}`}>
                        <HiArrowUpTray
                          className={`h-8 w-8 ${isDragging ? 'text-blue-700' : 'text-blue-600'}`}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-700">
                          {isDragging ? (
                            <span className="font-medium text-blue-600">Lepaskan file di sini</span>
                          ) : (
                            <>
                              <span className="text-blue-600 font-medium">Klik untuk upload</span> atau drag &
                              drop
                            </>
                          )}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">File Excel (.xlsx, .xls) • Maks. 50MB</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Upload Message - Compact */}
              {uploadMessage && (
                <div
                  className={`p-3 rounded-lg border ${
                    uploadMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : uploadMessage.type === 'error'
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {uploadMessage.type === 'success' ? (
                      <HiCheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    ) : uploadMessage.type === 'error' ? (
                      <HiXMark className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    ) : (
                      <HiCheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{uploadMessage.text}</p>
                      {uploadMessage.details && uploadMessage.details.length > 0 && (
                        <div className="mt-1.5">
                          <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-xs underline hover:no-underline opacity-70 hover:opacity-100"
                          >
                            {showDetails ? 'Sembunyikan' : 'Lihat'} {uploadMessage.details.length} detail
                            error
                          </button>
                          {showDetails && (
                            <div className="mt-1.5 max-h-32 overflow-y-auto bg-white/50 rounded p-2">
                              <ul className="space-y-1">
                                {uploadMessage.details.map((detail, idx) => (
                                  <li key={idx} className="text-xs flex items-start gap-1.5">
                                    <span className="text-red-400 mt-0.5">•</span>
                                    <span>{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setUploadMessage(null)
                        setShowDetails(false)
                      }}
                      className="p-0.5 hover:bg-black/5 rounded flex-shrink-0"
                    >
                      <HiXMark className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardView
