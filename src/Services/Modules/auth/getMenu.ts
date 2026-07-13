import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'

export default (build: EndpointBuilder<any, any, any>) =>
  build.query<GetMenuResponse, void>({
    query: () => ({
      url: `/auth/menu`,
      method: 'GET',
    }),
    providesTags: ['Auth'],
  })

export interface MenuItem {
  icon: string
  label: string
  route: string
}

export interface GetMenuResponse {
  success: boolean
  message: string
  data: {
    menu: MenuItem[]
    role: string
  }
  meta: Record<string, any>
  errors: any
}