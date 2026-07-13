import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import type { Member } from './getMembers'

export interface CreateMemberPayload {
  // ID Number, Username, Password & Ulangi Password TIDAK dikirim dari FE lagi.
  // Backend (api.py) sekarang selalu auto-generate untuk peserta (role "user"):
  //   - IDNumber  -> pola YYMMDD + urutan 3 digit (konsep /register di 1app.py)
  //   - Username  -> = IDNumber
  //   - Password  -> = Ulangi Password -> tanggal lahir tanpa "/" (konsep import Excel)
  // Karena itu birthdate WAJIB diisi.
  nama: string
  address?: string
  gender?: string
  birthdate: string
  age?: string
  education?: string
  marital?: string
  occupation?: string
  referredby?: string
  is_active?: 0 | 1 | boolean
  role?: 'user'
}

export interface CreateMemberCredentials {
  username: string
  password: string
}

export interface CreateMemberResponse {
  success: boolean
  message: string
  data: {
    member: Member
    credentials?: CreateMemberCredentials
  }
  meta: Record<string, any>
  errors: any
}

export default (build: EndpointBuilder<any, any, any>) =>
  build.mutation<CreateMemberResponse, CreateMemberPayload>({
    query: (body) => ({
      url: '/admin/register',
      method: 'POST',
      body: {
        ...body,
        role: 'user',
      },
    }),
    invalidatesTags: [{ type: 'Member', id: 'LIST' }, 'Dashboard'],
  })
