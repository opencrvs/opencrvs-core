import * as Hapi from 'hapi'
import { internal } from 'boom'
import { insertNewDeclaration } from './service'

export async function newDeclarationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as fhir.Bundle
  try {
    await insertNewDeclaration(payload)
  } catch (err) {
    console.log(err)
    return internal(err)
  }

  return h.response().code(200)
}
