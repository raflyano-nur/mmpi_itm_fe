// Services/modules/importExcel/uploadParticipants.ts

import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { UploadParticipantsResponse } from './types'

export default (build: EndpointBuilder<any, any, any>) =>
  build.mutation<UploadParticipantsResponse, FormData>({
    query: (formData) => ({
      url: '/upload/participants',
      method: 'POST',
      body: formData,
      // Penting: jangan set Content-Type, biar browser yang set dengan boundary
    }),
    invalidatesTags: [{ type: 'Member', id: 'LIST' }],
    // Transform response untuk konsistensi
    transformResponse: (response: UploadParticipantsResponse) => {
      return response
    },
    // Handle error response - menggunakan transformErrorResponse sebenarnya TIDAK ADA
    // Kita perlu handle error di component atau menggunakan extraReducers
  })
