import * as Hapi from 'hapi'
import { internal } from 'boom'

import { logger } from 'src/logger'
import { upsertEvent } from './service'

export async function deathEventHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as fhir.Bundle
  try {
    await upsertEvent(payload)
  } catch (error) {
    logger.error(`Deduplication/deathEventHandler: error: ${error}`)
    return internal(error)
  }

  return h.response().code(200)
}
