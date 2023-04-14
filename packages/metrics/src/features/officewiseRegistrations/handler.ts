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
  TIME_FROM,
  TIME_TO,
  LOCATION_ID,
  EVENT
} from '@metrics/features/metrics/constants'
import {
  getOfficewiseRegistrationsCount,
  getTotalMetrics
} from '@metrics/features/metrics/metricsGenerator'
import { IAuthHeader } from '@metrics/features/registration'
import { uniqBy } from 'lodash'

export async function officewiseRegistrationsHandler(
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
  return getOfficewiseRegistrationsCount(
    timeStart,
    timeEnd,
    event,
    locationId,
    authHeader
  )
}

export async function totalMetricsByRegistrar(
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

  const totalRegistrations = await getTotalMetrics(
    timeStart,
    timeEnd,
    locationId,
    event,
    authHeader
  )

  const registrarIDs = uniqBy(
    totalRegistrations.results,
    'registrarPractitionerId'
  ).map((item) => item.registrarPractitionerId)

  const results: any[] = []

  registrarIDs.forEach((registrarId) => {
    const registrarResults = totalRegistrations.results.filter(
      (result) => result.registrarPractitionerId === registrarId
    )

    results.push({
      registrarPractitioner: registrarId,
      total: registrarResults.reduce(
        (total, currentValue) => total + currentValue.total,
        0
      )
    })
  })

  return {
    total: results.length,
    results: results
  }
}

export async function totalMetricsByLocation(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const authHeader: IAuthHeader = {
    Authorization: request.headers.authorization,
    'x-correlation-id': request.headers['x-correlation-id']
  }

  const timeStart = request.query[TIME_FROM]
  const timeEnd = request.query[TIME_TO]
  const event = request.query[EVENT]
  const locationId = 'Location/' + request.query[LOCATION_ID]

  return getOfficewiseRegistrationsCount(
    timeStart,
    timeEnd,
    event,
    locationId,
    authHeader
  )
}
