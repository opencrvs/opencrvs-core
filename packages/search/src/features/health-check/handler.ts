import { client } from '@search/elasticsearch/client'
import { logger } from '@search/logger'
import * as Hapi from '@hapi/hapi'
import { ApiResponse } from '@elastic/elasticsearch/lib/Transport'

// TODO: This is not a good idea, as the other request will not cancel if it timeouts
const thrower = new Promise((_, reject) => {
  setTimeout(
    () =>
      reject({
        timeout: true,
        error: 'Cluster did not return health within 5 seconds'
      }),
    5000
  )
})

export async function healthCheckHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const health = (await Promise.race([
      thrower,
      client.cluster.health()
    ])) as ApiResponse<Record<string, any>, unknown>

    return h.response({ status: 'ok', health: health.body.status }).code(200)
  } catch (err) {
    logger.error(err)
    return h.response({ status: 'error' }).code(500)
  }
}
