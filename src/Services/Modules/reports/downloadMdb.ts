import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import type { DownloadFilePayload } from './downloadUtils'
import { getFilenameFromContentDisposition } from './downloadUtils'

export default (build: EndpointBuilder<any, any, any>) =>
  build.mutation<DownloadFilePayload, void>({
    query: () => ({
      url: '/download/mdb',
      method: 'GET',
      responseHandler: async (response) => ({
        blob: await response.blob(),
        filename: getFilenameFromContentDisposition(response.headers.get('content-disposition'), 'Data.mdb'),
      }),
      cache: 'no-cache',
    }),
  })
