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
import * as Hapi from '@hapi/hapi'
import { fetchLocationWiseEventEstimationsForAllTimeframes } from '@metrics/features/metrics/metricsGenerator'

import {
  TIME_FROM,
  TIME_TO,
  LOCATION_ID
} from '@metrics/features/metrics/constants'
import { EVENT_TYPE } from '@metrics/features/metrics/utils'
import { IAuthHeader } from '@metrics/features/registration/'

export async function eventEstimationsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const timeStart = request.query[TIME_FROM]
  const timeEnd = request.query[TIME_TO]
  const locationId = 'Location/' + request.query[LOCATION_ID]
  const authHeader: IAuthHeader = {
    Authorization: request.headers.authorization,
    'x-correlation-id': request.headers['x-correlation-id']
  }
  let estimatedBirthMetrics
  const fallbackResponse = {
    actualRegistration: 0,
    estimatedRegistration: 0,
    estimatedPercentage: 0,
    malePercentage: 0,
    femalePercentage: 0
  }
  try {
    estimatedBirthMetrics =
      await fetchLocationWiseEventEstimationsForAllTimeframes(
        timeStart,
        timeEnd,
        locationId,
        EVENT_TYPE.BIRTH,
        authHeader
      )
  } catch (error) {
    return {
      birthTargetDayMetrics: fallbackResponse,
      birth1YearMetrics: fallbackResponse,
      birth5YearMetrics: fallbackResponse,
      deathTargetDayMetrics: fallbackResponse,
      death1YearMetrics: fallbackResponse,
      death5YearMetrics: fallbackResponse
    }
  }
  let estimatedDeathMetrics
  try {
    estimatedDeathMetrics =
      await fetchLocationWiseEventEstimationsForAllTimeframes(
        timeStart,
        timeEnd,
        locationId,
        EVENT_TYPE.DEATH,
        authHeader
      )
  } catch (error) {
    return {
      birthTargetDayMetrics: {
        ...estimatedBirthMetrics.withinTargetDays
      },
      birth1YearMetrics: {
        ...estimatedBirthMetrics.within1Year
      },
      birth5YearMetrics: {
        ...estimatedBirthMetrics.within5Years
      },
      deathTargetDayMetrics: fallbackResponse,
      death1YearMetrics: fallbackResponse,
      death5YearMetrics: fallbackResponse
    }
  }

  return {
    locationId,
    birthTargetDayMetrics: {
      ...estimatedBirthMetrics.withinTargetDays
    },
    birth1YearMetrics: {
      ...estimatedBirthMetrics.within1Year
    },
    birth5YearMetrics: {
      ...estimatedBirthMetrics.within5Years
    },
    deathTargetDayMetrics: {
      ...estimatedDeathMetrics.withinTargetDays
    },
    death1YearMetrics: {
      ...estimatedDeathMetrics.within1Year
    },
    death5YearMetrics: {
      ...estimatedDeathMetrics.within5Years
    }
  }
}
