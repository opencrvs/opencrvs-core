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
import { fetchLocaitonWiseEventEstimationsGroupByTimeLabel } from '@metrics/features/metrics/metricsGenerator'
import {
  TIME_FROM,
  TIME_TO,
  LOCATION_ID,
  EVENT
} from '@metrics/features/metrics/constants'
import { IAuthHeader } from '@metrics/features/registration/'
import { fetchChildLocationsByParentId } from '@metrics/api'

interface ILocationWiseEstimation {
  total: number
  withinTarget: number
  within1Year: number
  within5Years: number
  estimated: number
  locationId: string
  locationName: string
}

export async function locationWiseEventEstimationsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const timeStart = request.query[TIME_FROM]
  const timeEnd = request.query[TIME_TO]
  const locationId = 'Location/' + request.query[LOCATION_ID]
  const event = request.query[EVENT]
  const authHeader: IAuthHeader = {
    Authorization: request.headers.authorization,
    'x-correlation-id': request.headers['x-correlation-id']
  }
  const childLocations = await fetchChildLocationsByParentId(
    locationId,
    authHeader
  )

  const estimations: ILocationWiseEstimation[] = []
  for (const childLocation of childLocations) {
    if (!childLocation || !childLocation.id) {
      continue
    }

    const { results, estimated } =
      await fetchLocaitonWiseEventEstimationsGroupByTimeLabel(
        timeStart,
        timeEnd,
        `Location/${childLocation.id}`,
        event,
        authHeader
      )

    estimations.push({
      total: results.reduce((t, p) => t + p.total, 0),
      withinTarget: results
        .filter((p) => p.timeLabel === 'withinTarget')
        .reduce((t, p) => t + p.total, 0),
      within1Year: results
        .filter(
          (p) =>
            p.timeLabel === 'withinTarget' ||
            p.timeLabel === 'withinLate' ||
            p.timeLabel === 'within1Year'
        )
        .reduce((t, p) => t + p.total, 0),
      within5Years: results
        .filter((p) => p.timeLabel !== 'after5Years')
        .reduce((t, p) => t + p.total, 0),
      estimated: estimated.totalEstimation,
      locationName: childLocation.name || '',
      locationId: childLocation.id
    })
  }
  return estimations
}
