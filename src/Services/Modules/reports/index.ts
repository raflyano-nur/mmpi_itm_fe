import { api } from '@/Services/api'
import getReports from './getReports'
import downloadMdb from './downloadMdb'

export const reportsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getReports: getReports(build),
    downloadMdb: downloadMdb(build),
  }),
  overrideExisting: false,
})

export const { useGetReportsQuery, useDownloadMdbMutation } = reportsApi

export type { ReportItem, GetReportsResponse } from './getReports'
export type { DownloadFilePayload } from './downloadUtils'
export { saveBlobFile } from './downloadUtils'
