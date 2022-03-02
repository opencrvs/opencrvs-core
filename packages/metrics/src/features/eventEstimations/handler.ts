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
import { fetchLocationWiseEventEstimations } from '@metrics/features/metrics/metricsGenerator'

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
  let estimatedTargetDayBirthMetrics
  try {
    estimatedTargetDayBirthMetrics = await fetchLocationWiseEventEstimations(
      timeStart,
      timeEnd,
      locationId,
      EVENT_TYPE.BIRTH,
      authHeader
    )
  } catch (error) {
    return {
      birthTargetDayMetrics: {
        actualRegistration: 0,
        estimatedRegistration: 0,
        estimatedPercentage: 0,
        malePercentage: 0,
        femalePercentage: 0
      },
      deathTargetDayMetrics: {
        actualRegistration: 0,
        estimatedRegistration: 0,
        estimatedPercentage: 0,
        malePercentage: 0,
        femalePercentage: 0
      }
    }
  }
  let estimatedTargetDayDeathMetrics
  try {
    estimatedTargetDayDeathMetrics = await fetchLocationWiseEventEstimations(
      timeStart,
      timeEnd,
      locationId,
      EVENT_TYPE.DEATH,
      authHeader
    )
  } catch (error) {
    return {
      birthTargetDayMetrics: {
        ...estimatedTargetDayBirthMetrics
      },
      deathTargetDayMetrics: {
        actualRegistration: 0,
        estimatedRegistration: 0,
        estimatedPercentage: 0,
        malePercentage: 0,
        femalePercentage: 0
      }
    }
  }

  return {
    locationId,
    birthTargetDayMetrics: {
      ...estimatedTargetDayBirthMetrics
    },
    deathTargetDayMetrics: {
      ...estimatedTargetDayDeathMetrics
    }
  }
}
