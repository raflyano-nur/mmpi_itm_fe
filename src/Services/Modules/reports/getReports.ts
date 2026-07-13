import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'

export interface ReportItem {
  id?: string | number
  IDNumber?: string | number
  Name?: string
  name?: string
  date?: string
  tgl_register?: string
  meta?: unknown
  [key: string]: unknown
}

export interface GetReportsResponse {
  success: boolean
  message: string
  data: {
    items: ReportItem[]
  }
  meta: {
    total?: number
    [key: string]: unknown
  }
  errors: unknown
}

export default (build: EndpointBuilder<any, any, any>) =>
  build.query<GetReportsResponse, void>({
    query: () => ({
      url: '/reports',
      method: 'GET',
    }),
    providesTags: [{ type: 'Report', id: 'LIST' }],
  })
