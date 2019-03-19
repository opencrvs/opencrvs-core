import * as Hapi from 'hapi'
import { internal } from 'boom'

import { logger } from 'src/logger'
import { insertNewDeclaration } from './service'

export async function newDeathDeclarationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as fhir.Bundle
  try {
    await insertNewDeclaration(payload)
  } catch (error) {
    logger.error(`Deduplication/newDeclarationHandler: error: ${error}`)
    return internal(error)
  }

  return h.response().code(200)
}
