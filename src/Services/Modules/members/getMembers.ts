import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'

export interface Member {
  IDNumber: string | number
  Name: string
  Address?: string
  Gender?: string
  Birthdate?: string
  Age?: string | number
  Education?: string
  MaritalStatus?: string
  Occupation?: string
  ReferredBy?: string
  username: string
  role: 'user' | 'admin'
  tgl_register?: string
  is_active: 0 | 1
}

export interface GetMembersParams {
  role?: string
  page?: number
  per_page?: number
  q?: string
  start_date?: string
  end_date?: string
}

export interface GetMembersMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export interface GetMembersResponse {
  success: boolean
  message: string
  data: {
    items: Member[]
  }
  meta: GetMembersMeta
  errors: any
}

export default (build: EndpointBuilder<any, any, any>) =>
  build.query<GetMembersResponse, GetMembersParams>({
    query: (params) => ({
      url: `/members`,
      method: 'GET',
      params,
    }),
    providesTags: (result) =>
      result?.data?.items
        ? [
            ...result.data.items.map((member) => ({ type: 'Member' as const, id: member.IDNumber })),
            { type: 'Member' as const, id: 'LIST' },
          ]
        : [{ type: 'Member' as const, id: 'LIST' }],
  })
