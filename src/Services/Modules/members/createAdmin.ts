import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import type { Member } from './getMembers'

export interface CreateAdminPayload {
  idnumber: string | number
  nama: string
  username: string
  password: string
  repassword: string
  address?: string
  gender?: string
  birthdate?: string
  age?: string | number
  education?: string
  marital?: string
  occupation?: string
  referredby?: string
  is_active?: 0 | 1 | boolean
  role?: 'admin'
}

export interface CreateAdminResponse {
  success: boolean
  message: string
  data: {
    member: Member
  }
  meta: Record<string, any>
  errors: any
}

export default (build: EndpointBuilder<any, any, any>) =>
  build.mutation<CreateAdminResponse, CreateAdminPayload>({
    query: (body) => ({
      url: '/admin/register',
      method: 'POST',
      body: {
        ...body,
        role: 'admin',
      },
    }),
    invalidatesTags: [{ type: 'Member', id: 'LIST' }, 'Dashboard'],
  })
