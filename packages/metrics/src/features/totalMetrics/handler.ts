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
import {
  fetchRegistrationsGroupByOfficeLocation,
  fetchRegistrationsGroupByTime,
  getTotalMetrics
} from '@metrics/features/metrics/metricsGenerator'
import { IAuthHeader } from '@metrics/features/registration'
import { format } from 'date-fns'
import { uniqBy } from 'lodash'

enum EVENT_LOCATION_TYPE {
  HEALTH_FACILITY = 'HEALTH_FACILITY',
  PRIVATE_HOME = 'PRIVATE_HOME'
}

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

  const registrarIDs = uniqBy(
    totalRegistrations.results,
    'registrarPractitionerId'
  ).map((item) => item.registrarPractitionerId)

  const results: any[] = []

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

export async function totalMetricsByLocation(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const timeStart = request.query[TIME_FROM]
  const timeEnd = request.query[TIME_TO]
  const event = request.query[EVENT]
  const authHeader: IAuthHeader = {
    Authorization: request.headers.authorization,
    'x-correlation-id': request.headers['x-correlation-id']
  }

  const results = await fetchRegistrationsGroupByOfficeLocation(
    timeStart,
    timeEnd,
    event,
    authHeader
  )

  const locationIDs = uniqBy(results, 'officeLocation').map(
    (item) => item.officeLocation
  )

  const response: any[] = []

  locationIDs.forEach((locationID) => {
    const registrations = results.filter(
      (result) => result.officeLocation === locationID
    )

    const lateRegistrations = registrations.filter(
      (result) => result.timeLabel === 'withinLate'
    )
    const delayedRegistrations = registrations.filter(
      (result) => !['withinLate', 'withinTarget'].includes(result.timeLabel)
    )

    const healthFacilityRegistrations = registrations.filter(
      (result) =>
        result.eventLocationType === EVENT_LOCATION_TYPE.HEALTH_FACILITY
    )

    const homeRegistrations = registrations.filter(
      (result) => result.eventLocationType === EVENT_LOCATION_TYPE.PRIVATE_HOME
    )

    response.push({
      location: locationID,
      total: registrations.length,
      late: lateRegistrations.length,
      delayed: delayedRegistrations.length,
      home: homeRegistrations.length,
      healthFacility: healthFacilityRegistrations.length
    })
  })

  return { results: response }
}

export async function totalMetricsByTime(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const event = request.query[EVENT]
  const registrations = await fetchRegistrationsGroupByTime(event)

  registrations.forEach((registration) => {
    registration.time = format(new Date(registration.time), 'MMMM-yyyy')
  })

  const months = uniqBy(registrations, 'time').map((item) => item.time)

  const results: any[] = []

  months.forEach((month) => {
    const filteredRegistrations = registrations.filter(
      (registration) => registration.time === month
    )

    const lateRegistrations = filteredRegistrations.filter(
      (result) => result.timeLabel === 'withinLate'
    )
    const delayedRegistrations = filteredRegistrations.filter(
      (result) => !['withinLate', 'withinTarget'].includes(result.timeLabel)
    )

    const healthFacilityRegistrations = filteredRegistrations.filter(
      (result) =>
        result.eventLocationType === EVENT_LOCATION_TYPE.HEALTH_FACILITY
    )

    const homeRegistrations = filteredRegistrations.filter(
      (result) => result.eventLocationType === EVENT_LOCATION_TYPE.PRIVATE_HOME
    )

    results.push({
      total: filteredRegistrations.length,
      late: lateRegistrations.length,
      delayed: delayedRegistrations.length,
      home: homeRegistrations.length,
      healthFacility: healthFacilityRegistrations.length,
      month
    })
  })

  return { results }
}
