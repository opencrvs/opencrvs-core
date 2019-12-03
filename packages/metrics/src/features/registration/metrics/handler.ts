/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as Hapi from 'hapi'
import {
  fetchRegWithinTimeFrames,
  getCurrentAndLowerLocationLevels,
  fetchCertificationPayments,
  fetchGenderBasisMetrics
} from '@metrics/features/registration/metrics/metricsGenerator'
import { logger } from '@metrics/logger'
import { internal } from 'boom'
import {
  TIME_FROM,
  TIME_TO,
  LOCATION_ID
} from '@metrics/features/registration/metrics/constants'
// import { IAuthHeader } from '@metrics/features/registration/'
// import {
//   getDistrictLocation,
//   Location
// } from '@metrics/features/registration/metrics/utils'

export async function metricsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const timeStart = request.query[TIME_FROM]
    const timeEnd = request.query[TIME_TO]
    const locationId = request.query[LOCATION_ID]
    // const authHeader: IAuthHeader = {
    //   Authorization: request.headers.authorization
    // }

    // const location: Location = await getDistrictLocation(locationId, authHeader)
    const {
      currentLocationLevel,
      lowerLocationLevel
    } = await getCurrentAndLowerLocationLevels(timeStart, timeEnd, locationId)

    if (currentLocationLevel) {
      const timeFrames = await fetchRegWithinTimeFrames(
        timeStart,
        timeEnd,
        locationId,
        currentLocationLevel,
        lowerLocationLevel
      )
      const payments = await fetchCertificationPayments(
        timeStart,
        timeEnd,
        locationId,
        currentLocationLevel,
        lowerLocationLevel
      )

      const genderBasisMetrics = await fetchGenderBasisMetrics(
        locationId,
        currentLocationLevel,
        lowerLocationLevel
      )
      return { timeFrames, payments, genderBasisMetrics }
    } else {
      return {
        timeFrames: [],
        payments: [],
        genderBasisMetrics: []
      }
    }
  } catch (error) {
    logger.error(`Metrics:metricsHandler: error: ${error}`)
    return internal(error)
  }
}
