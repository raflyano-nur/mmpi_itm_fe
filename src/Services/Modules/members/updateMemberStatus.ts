import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'

export interface UpdateMemberStatusPayload {
  idnumber: string | number
  action: 'verifikasi' | 'batalkan_verifikasi'
}

export interface UpdateMemberStatusResponse {
  success: boolean
  message: string
  data: {
    idnumber: string | number
    is_active: number
  }
  meta: Record<string, any>
  errors: any
}

export default (build: EndpointBuilder<any, any, any>) =>
  build.mutation<UpdateMemberStatusResponse, UpdateMemberStatusPayload>({
    query: ({ idnumber, action }) => ({
      url: `/members/${idnumber}/status`,
      method: 'PATCH',
      body: { action },
    }),
    invalidatesTags: (_result, _error, arg) => [
      { type: 'Member', id: arg.idnumber },
      { type: 'Member', id: 'LIST' },
      'Dashboard',
    ],
  })
