import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'

export default (build: EndpointBuilder<any, any, any>) =>
  build.mutation<LogoutResponse, void>({
    query: () => ({
      url: `/auth/logout`,
      method: 'POST',
    }),
    invalidatesTags: ['Auth'],
  })

export interface LogoutResponse {
  success: boolean
  message: string
}