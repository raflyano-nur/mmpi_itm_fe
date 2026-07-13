import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'

export default (build: EndpointBuilder<any, any, any>) =>
  build.query<MeResponse, void>({
    query: () => ({
      url: `/auth/me`,
      method: 'GET',
    }),
    providesTags: ['Auth'],
  })

export interface MeResponse {
  success: boolean
  message: string
  data: {
    user: {
      IDNumber: number | string
      Name: string
      username: string
      role: string
      [key: string]: any
    }
  }
  meta: Record<string, any>
  errors: any
}