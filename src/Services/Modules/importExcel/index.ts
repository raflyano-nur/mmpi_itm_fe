// Services/modules/importExcel/index.ts

import { api } from '@/Services/api'
import uploadParticipants from './uploadParticipants'

// Export semua yang dibutuhkan dari folder ini
export const importExcelApi = api.injectEndpoints({
  endpoints: (build) => ({
    uploadParticipants: uploadParticipants(build),
  }),
  overrideExisting: false,
})

// Export hooks
export const { useUploadParticipantsMutation } = importExcelApi

// Export types
export type { UploadParticipantsResponse, UploadError, UploadParticipantsPayload } from './types'
