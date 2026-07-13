import { api } from '@/Services/api'
import getDashboardSummary from './getDashboardSummary'

export const dashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDashboardSummary: getDashboardSummary(build),
  }),
  overrideExisting: false,
})

export const { useGetDashboardSummaryQuery } = dashboardApi