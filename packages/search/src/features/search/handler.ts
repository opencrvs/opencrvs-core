import * as Hapi from 'hapi'
import { logger } from 'src/logger'
import { internal } from 'boom'
import { searchComposition } from './service'
import { ISearchQuery } from './types'

export async function searchDeclaration(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const result = await searchComposition(request.payload as ISearchQuery)
    return h.response(result).code(200)
  } catch (error) {
    logger.error(`Search/searchDeclarationHandler: error: ${error}`)
    return internal(error)
  }
}
