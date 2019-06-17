import * as Hapi from 'hapi'
import { internal } from 'boom'
import { upsertEvent } from '@search/features/registration/birth/service'
import { logger } from '@search/logger'

export async function birthEventHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as fhir.Bundle
  try {
    await upsertEvent(payload)
  } catch (error) {
    logger.error(`Search/birthEventHandler: error: ${error}`)
    return internal(error)
  }

  return h.response().code(200)
}
