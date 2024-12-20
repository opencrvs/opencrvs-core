import { http, HttpResponse, PathParams } from 'msw'
import { env } from '@events/environment'
import { setupServer } from 'msw/node'

export const handlers = [
  http.post<PathParams<never>, { filenames: string[] }>(
    `${env.DOCUMENTS_URL}/presigned-urls`,
    async (info) => {
      const request = await info.request.json()
      return HttpResponse.json(request.filenames)
    }
  )
]

export const mswServer = setupServer(...handlers)
