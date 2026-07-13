import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'

export default (build: EndpointBuilder<any, any, any>) =>
  build.mutation<LoginResponse, LoginRequest>({
    query: (body) => ({
      url: `/auth/login`,
      method: 'POST',
      body,
    }),
    invalidatesTags: ['Auth'],
  })

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: {
      IDNumber: number | string
      Name: string
      username: string
      role: string
      is_active: number
      [key: string]: any
    }
    redirect: string
  }
  meta: Record<string, any>
  errors: any
}