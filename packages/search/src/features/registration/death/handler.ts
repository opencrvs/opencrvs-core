import * as Hapi from 'hapi'
import { internal } from 'boom'

import { logger } from '@search/logger'
import { upsertEvent } from '@search/features/registration/death/service'

export async function deathEventHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as fhir.Bundle
  try {
    await upsertEvent(payload)
  } catch (error) {
    logger.error(`Search/deathEventHandler: error: ${error}`)
    return internal(error)
  }

  return h.response().code(200)
}
