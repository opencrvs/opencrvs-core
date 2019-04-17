import * as Hapi from 'hapi'
import { regByAge } from './metricsGenerator'
import { logger } from 'src/logger'
import { internal } from 'boom'

export async function metricsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    return {
      keyFigures: {},
      regByAge: await regByAge(request.query as Hapi.RequestQuery),
      regWithin$5d: {}
    }
  } catch (error) {
    logger.error(`Metrics:metricsHandler: error: ${error}`)
    return internal(error)
  }
}
