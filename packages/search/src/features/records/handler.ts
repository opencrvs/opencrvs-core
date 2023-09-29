import * as Hapi from '@hapi/hapi'
import { RecordNotFoundError, getRecordById } from './service'

export async function getRecordByIdHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const recordId = request.params.recordId
  const allowedStates = request.query.states?.split(',') || []
  const includeHistoryResources =
    request.query.includeHistoryResources !== undefined
  try {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.time('getRecordById')
    }
    const bundle = await getRecordById(
      recordId,
      allowedStates,
      includeHistoryResources
    )
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.timeEnd('getRecordById')
    }
    return bundle
  } catch (error) {
    if (error instanceof RecordNotFoundError) {
      return h.response({ error: error.message }).code(404)
    }
  }
}
