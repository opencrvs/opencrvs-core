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
  EVENT,
  LOCATION_ID,
  SIZE,
  SKIP,
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
  PRIVATE_HOME = 'PRIVATE_HOME',
  DECEASED_USUAL_RESIDENCE = 'DECEASED_USUAL_RESIDENCE'
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
  const skip = request.query[SKIP]
  const size = request.query[SIZE]

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
      total: registrarResults.reduce(
        (total, currentValue) => total + currentValue.total,
        0
      ),
      late: lateRegistrations.reduce(
        (total, currentValue) => total + currentValue.total,
        0
      ),
      delayed: delayedRegistrations.reduce(
        (total, currentValue) => total + currentValue.total,
        0
      )
    })
  })

  return {
    total: results.length,
    results: results.splice(skip, size)
  }
}

export async function totalMetricsByLocation(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const timeStart = request.query[TIME_FROM]
  const timeEnd = request.query[TIME_TO]
  const event = request.query[EVENT]
  const locationId = request.query[LOCATION_ID]
    ? 'Location/' + request.query[LOCATION_ID]
    : undefined
  const skip = request.query[SKIP]
  const size = request.query[SIZE]

  const results = await fetchRegistrationsGroupByOfficeLocation(
    timeStart,
    timeEnd,
    event,
    locationId
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

    const homeRegistrations = registrations.filter((result) =>
      event === 'BIRTH'
        ? result.eventLocationType === EVENT_LOCATION_TYPE.PRIVATE_HOME
        : result.eventLocationType ===
          EVENT_LOCATION_TYPE.DECEASED_USUAL_RESIDENCE
    )

    response.push({
      location: locationID,
      total: registrations.reduce(
        (total, currentValue) => total + currentValue.total,
        0
      ),
      late: lateRegistrations.reduce(
        (total, currentValue) => total + currentValue.total,
        0
      ),
      delayed: delayedRegistrations.reduce(
        (total, currentValue) => total + currentValue.total,
        0
      ),
      home: homeRegistrations.reduce(
        (total, currentValue) => total + currentValue.total,
        0
      ),
      healthFacility: healthFacilityRegistrations.reduce(
        (total, currentValue) => total + currentValue.total,
        0
      )
    })
  })

  return {
    total: response.length,
    results: response.splice(skip, size)
  }
}

export async function totalMetricsByTime(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const timeStart = request.query[TIME_FROM]
  const timeEnd = request.query[TIME_TO]
  const locationId = request.query[LOCATION_ID]
    ? 'Location/' + request.query[LOCATION_ID]
    : undefined
  const event = request.query[EVENT]
  const skip = request.query[SKIP]
  const size = request.query[SIZE]
  const registrationsByGroup = await fetchRegistrationsGroupByTime(
    timeStart,
    timeEnd,
    event,
    locationId
  )
  const registrations = registrationsByGroup

  registrations.forEach((registration) => {
    registration.month = format(new Date(registration.time), 'MMMM yyyy')
  })

  const months = uniqBy(registrations, 'month').map((item) => item.month)

  const results: any[] = []

  months.forEach((month) => {
    const filteredRegistrations = registrations.filter(
      (registration) => registration.month === month
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

    const homeRegistrations = filteredRegistrations.filter((result) =>
      event === 'BIRTH'
        ? result.eventLocationType === EVENT_LOCATION_TYPE.PRIVATE_HOME
        : result.eventLocationType ===
          EVENT_LOCATION_TYPE.DECEASED_USUAL_RESIDENCE
    )

    results.push({
      total: filteredRegistrations.reduce(
        (total, currentValue) => total + currentValue.total,
        0
      ),
      late: lateRegistrations.reduce(
        (total, currentValue) => total + currentValue.total,
        0
      ),
      delayed: delayedRegistrations.reduce(
        (total, currentValue) => total + currentValue.total,
        0
      ),
      home: homeRegistrations.reduce(
        (total, currentValue) => total + currentValue.total,
        0
      ),
      healthFacility: healthFacilityRegistrations.reduce(
        (total, currentValue) => total + currentValue.total,
        0
      ),
      month,
      time: new Date(month).getTime()
    })
  })

  return {
    total: results.length,
    results: results.splice(skip, size)
  }
}
