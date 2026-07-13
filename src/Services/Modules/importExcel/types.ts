// Services/modules/importExcel/types.ts

export interface UploadError {
  row?: number
  idnumber?: string
  message: string
}

export interface UploadParticipantsResponse {
  success: boolean
  message: string
  data: {
    success_count: number
    error_count: number
    errors: UploadError[]
  }
  meta: Record<string, unknown>
  errors: unknown
}

export interface UploadParticipantsPayload {
  file: File
  // Tambahkan parameter lain jika diperlukan
  // onProgress?: (progress: number) => void
}
