import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'

export interface DeleteMemberResponse {
  success: boolean
  message: string
  data: {
    idnumber: string | number
  }
  meta: Record<string, any>
  errors: any
}

export default (build: EndpointBuilder<any, any, any>) =>
  build.mutation<DeleteMemberResponse, string | number>({
    query: (idnumber) => ({
      url: `/members/${idnumber}`,
      method: 'DELETE',
    }),
    invalidatesTags: [{ type: 'Member', id: 'LIST' }, 'Dashboard'],
  })
