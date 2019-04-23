import * as Hapi from 'hapi'
import { regByAge, regWithin45d } from './metricsGenerator'
import { logger } from 'src/logger'
import { internal } from 'boom'

export async function metricsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const timeStart = request.query['timeStart'] + '000000'
    const timeEnd = request.query['timeEnd'] + '000000'

    return {
      keyFigures: {},
      regByAge: await regByAge(timeStart, timeEnd),
      regWithin45d: await regWithin45d(timeStart, timeEnd)
    }
  } catch (error) {
    logger.error(`Metrics:metricsHandler: error: ${error}`)
    return internal(error)
  }
}
