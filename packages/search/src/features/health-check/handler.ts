import { logger } from '@search/logger'
import * as Hapi from '@hapi/hapi'

export async function healthCheckHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    return h.response({ status: 'ok' }).code(200)
  } catch (err) {
    logger.error(err)
    return h.response({ status: 'error' }).code(500)
  }
}
