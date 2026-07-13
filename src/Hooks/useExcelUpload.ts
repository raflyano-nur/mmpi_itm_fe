// src/Hooks/useExcelUpload.ts

import { useState, useCallback } from 'react'
import { useUploadParticipantsMutation } from '@/Services/Modules/importExcel'
import { isExcelFile, formatFileSize } from '@/Utils/downloadUtils'

interface UseExcelUploadReturn {
  uploadFile: (file: File) => Promise<void>
  uploading: boolean
  uploadProgress: number
  reset: () => void
  error: string | null
  success: boolean
}

export const useExcelUpload = (
  onSuccess?: (data: any) => void,
  onError?: (error: any) => void,
): UseExcelUploadReturn => {
  const [upload, { isLoading }] = useUploadParticipantsMutation()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null)
      setSuccess(false)

      // Validasi
      if (!isExcelFile(file.name)) {
        const err = 'Format file tidak didukung. Harap upload file .xlsx atau .xls.'
        setError(err)
        if (onError) onError(err)
        return
      }

      if (file.size > 50 * 1024 * 1024) {
        const err = 'Ukuran file terlalu besar. Maksimal 50MB.'
        setError(err)
        if (onError) onError(err)
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      // Simulasi progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const next = prev + Math.random() * 10
          return next >= 90 ? 90 : next
        })
      }, 200)

      try {
        const result = await upload(formData).unwrap()
        clearInterval(progressInterval)
        setUploadProgress(100)
        setSuccess(true)

        if (onSuccess) {
          onSuccess(result)
        }

        // Reset progress setelah sukses
        setTimeout(() => {
          setUploadProgress(0)
          setSuccess(false)
        }, 2000)
      } catch (err: any) {
        clearInterval(progressInterval)
        setUploadProgress(0)
        setSuccess(false)

        // Handle error dengan lebih baik
        let errorMsg = 'Terjadi kesalahan saat upload'
        if (err.data?.message) {
          errorMsg = err.data.message
        } else if (err.message) {
          errorMsg = err.message
        } else if (err.error) {
          errorMsg = err.error
        }

        setError(errorMsg)
        if (onError) onError(err)
        throw err
      }
    },
    [upload, onSuccess, onError],
  )

  const reset = useCallback(() => {
    setUploadProgress(0)
    setError(null)
    setSuccess(false)
  }, [])

  return {
    uploadFile,
    uploading: isLoading,
    uploadProgress,
    reset,
    error,
    success,
  }
}
