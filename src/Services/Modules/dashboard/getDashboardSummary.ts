import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'

export default (build: EndpointBuilder<any, any, any>) =>
  build.query<GetDashboardSummaryResponse, void>({
    query: () => ({
      url: `/admin/dashboard-summary`,
      method: 'GET',
    }),
    providesTags: ['Dashboard'],
  })

export interface DashboardStats {
  total_peserta: number
  tes_selesai: number
  belum_verifikasi: number
  total_laporan: number
}

export interface RecentMember {
  id: string | number
  name: string
  status: string
  date: string
}

export interface GetDashboardSummaryResponse {
  success: boolean
  message: string
  data: {
    stats: DashboardStats
    recent_members: RecentMember[]
  }
  meta: Record<string, any>
  errors: any
}