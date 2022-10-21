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
import {
  EVENT,
  LOCATION_ID,
  TIME_FROM,
  TIME_TO
} from '@metrics/features/metrics/constants'
import { getTotalMetrics } from '@metrics/features/metrics/metricsGenerator'
import { IAuthHeader } from '@metrics/features/registration'
import { unionBy } from 'lodash'

export async function totalMetricsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const timeStart = request.query[TIME_FROM]
  const timeEnd = request.query[TIME_TO]
  const locationId = request.query[LOCATION_ID]
    ? 'Location/' + request.query[LOCATION_ID]
    : undefined
  const event = request.query[EVENT]
  const authHeader: IAuthHeader = {
    Authorization: request.headers.authorization,
    'x-correlation-id': request.headers['x-correlation-id']
  }

  return await getTotalMetrics(
    timeStart,
    timeEnd,
    locationId,
    event,
    authHeader
  )
}

export async function totalMetricsByRegistrar(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const timeStart = request.query[TIME_FROM]
  const timeEnd = request.query[TIME_TO]
  const locationId = request.query[LOCATION_ID]
    ? 'Location/' + request.query[LOCATION_ID]
    : undefined
  const event = request.query[EVENT]
  const authHeader: IAuthHeader = {
    Authorization: request.headers.authorization,
    'x-correlation-id': request.headers['x-correlation-id']
  }

  const totalRegistrations = await getTotalMetrics(
    timeStart,
    timeEnd,
    locationId,
    event,
    authHeader
  )

  const registrarIDs = unionBy(
    totalRegistrations.results,
    'registrarPractitionerId'
  ).map((item) => item.registrarPractitionerId)

  let results: any[] = []

  registrarIDs.forEach((registrarId) => {
    const registrarResults = totalRegistrations.results.filter(
      (result) => result.registrarPractitionerId === registrarId
    )
    const lateRegistrations = registrarResults.filter(
      (result) => result.timeLabel === 'withinLate'
    )
    const delayedRegistrations = registrarResults.filter(
      (result) => !['withinLate', 'withinTarget'].includes(result.timeLabel)
    )

    results.push({
      registrarPractitioner: registrarId,
      total: registrarResults.length,
      late: lateRegistrations.length,
      delayed: delayedRegistrations.length
    })
  })

  return { results }
}
