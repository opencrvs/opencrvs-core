import * as Hapi from 'hapi'
import { internal } from 'boom'
import {
  insertNewDeclaration,
  insertUpdatedDeclaration
} from 'src/features/registration/service'
import { logger } from 'src/logger'

export async function newBirthDeclarationHandler(
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

export async function updatedBirthDeclarationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as fhir.Bundle

  try {
    await insertUpdatedDeclaration(payload)
  } catch (error) {
    logger.error(`Deduplication/updatedDeclarationHandler: error: ${error}`)
    return internal(error)
  }

  return h.response().code(200)
}
