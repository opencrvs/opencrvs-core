/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as Hapi from '@hapi/hapi'
import {
  fetchCertificationPayments,
  fetchEstimatedTargetDayMetrics,
  fetchGenderBasisMetrics,
  fetchRegWithinTimeFrames,
  getCurrentAndLowerLocationLevels
} from '@metrics/features/metrics/metricsGenerator'

import {
  EVENT,
  LOCATION_ID,
  TIME_FROM,
  TIME_TO
} from '@metrics/features/metrics/constants'
import {
  EVENT_TYPE,
  fetchChildLocationIdsByParentId,
  getRegistrationTargetDays
} from '@metrics/features/metrics/utils'
import { IAuthHeader } from '@metrics/features/registration/'
import { deleteMeasurements } from '@metrics/influxdb/client'
import { INFLUX_DB } from '@metrics/influxdb/constants'
import { MongoClient } from 'mongodb'
import { DASHBOARD_MONGO_URL } from '@metrics/constants'

export async function metricsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const timeStart = request.query[TIME_FROM]
  const timeEnd = request.query[TIME_TO]
  const locationId = 'Location/' + request.query[LOCATION_ID]
  const event = request.query[EVENT].toUpperCase() as EVENT_TYPE
  let currentLocationLevel
  let lowerLocationLevel

  try {
    const levels = await getCurrentAndLowerLocationLevels(
      timeStart,
      timeEnd,
      locationId,
      event
    )
    currentLocationLevel = levels.currentLocationLevel
    lowerLocationLevel = levels.lowerLocationLevel
  } catch (err) {
    return {
      timeFrames: [],
      payments: [],
      genderBasisMetrics: [],
      estimatedTargetDayMetrics: []
    }
  }

  const authHeader: IAuthHeader = {
    Authorization: request.headers.authorization,
    'x-correlation-id': request.headers['x-correlation-id']
  }

  const childLocationIds = await fetchChildLocationIdsByParentId(
    request.query[LOCATION_ID],
    currentLocationLevel,
    lowerLocationLevel,
    authHeader
  )

  const registrationTargetInDays = await getRegistrationTargetDays(
    event,
    authHeader.Authorization
  )

  const timeFrames = await fetchRegWithinTimeFrames(
    timeStart,
    timeEnd,
    locationId,
    currentLocationLevel,
    lowerLocationLevel,
    event,
    childLocationIds,
    registrationTargetInDays
  )

  const payments = await fetchCertificationPayments(
    timeStart,
    timeEnd,
    locationId,
    currentLocationLevel,
    lowerLocationLevel,
    event,
    childLocationIds
  )

  const genderBasisMetrics = await fetchGenderBasisMetrics(
    timeStart,
    timeEnd,
    locationId,
    currentLocationLevel,
    lowerLocationLevel,
    event,
    childLocationIds
  )

  const estimatedTargetDayMetrics = await fetchEstimatedTargetDayMetrics(
    timeStart,
    timeEnd,
    locationId,
    currentLocationLevel,
    lowerLocationLevel,
    event,
    childLocationIds,
    authHeader,
    registrationTargetInDays
  )

  return { timeFrames, payments, genderBasisMetrics, estimatedTargetDayMetrics }
}

export async function metricsDeleteMeasurementHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const res = await deleteMeasurements()
    return h.response(res).code(200)
  } catch (err) {
    throw new Error(`Could not delete influx database ${INFLUX_DB}`)
  }
}

export async function deletePerformanceHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const client = new MongoClient(DASHBOARD_MONGO_URL)
  try {
    const connectedClient = await client.connect()
    const db = connectedClient.db()
    await Promise.all([
      db.collection('registrations').drop(),
      db.collection('corrections').drop(),
      db.collection('populationEstimatesPerDay').drop()
    ])
    const res = {
      status: `Successfully deleted all the collections from performance database`
    }
    return h.response(res).code(200)
  } catch (err) {
    throw new Error(`Could not delete performance database`)
  }
}
