import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'

export interface BulkActionMembersPayload {
  selected_ids: (string | number)[]
  action: 'verifikasi' | 'batalkan_verifikasi' | 'hapus'
}

export interface BulkActionMembersResponse {
  success: boolean
  message: string
  data: {
    ids: (string | number)[]
    action: string
  }
  meta: Record<string, any>
  errors: any
}

export default (build: EndpointBuilder<any, any, any>) =>
  build.mutation<BulkActionMembersResponse, BulkActionMembersPayload>({
    query: (payload) => ({
      url: `/members/bulk`,
      method: 'POST',
      body: payload,
    }),
    invalidatesTags: [{ type: 'Member', id: 'LIST' }, 'Dashboard'],
  })
