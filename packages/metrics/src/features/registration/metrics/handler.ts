import * as Hapi from 'hapi'
import {
  regByAge,
  regWithin45d,
  fetchKeyFigures
} from '@metrics/features/registration/metrics/metricsGenerator'
import { logger } from '@metrics/logger'
import { internal } from 'boom'
import {
  TIME_FROM,
  TIME_TO,
  LOCATION_ID
} from '@metrics/features/registration/metrics/constants'
import { IAuthHeader } from '@metrics/features/registration/'
import {
  getDistrictLocation,
  Location
} from '@metrics/features/registration/metrics/utils'

export async function metricsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const timeStart = request.query[TIME_FROM] + '000000'
    const timeEnd = request.query[TIME_TO] + '000000'
    const locationId = request.query[LOCATION_ID]
    const authHeader: IAuthHeader = {
      Authorization: request.headers.authorization
    }

    const location: Location = await getDistrictLocation(locationId, authHeader)

    return {
      keyFigures: await fetchKeyFigures(timeStart, timeEnd, location),
      regByAge: await regByAge(timeStart, timeEnd),
      regWithin45d: await regWithin45d(timeStart, timeEnd)
    }
  } catch (error) {
    logger.error(`Metrics:metricsHandler: error: ${error}`)
    return internal(error)
  }
}
