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
import { fetchEventsGroupByMonthDates } from '@metrics/features/metrics/metricsGenerator'
import {
  getMonthRangeFilterListFromTimeRage,
  IMonthRangeFilter,
  fetchEstimateForTargetDaysByLocationId,
  getPercentage
} from '@metrics/features/metrics/utils'
import {
  TIME_FROM,
  TIME_TO,
  LOCATION_ID,
  EVENT
} from '@metrics/features/metrics/constants'
import { IAuthHeader } from '@metrics/features/registration/'

interface IMonthWiseEstimation {
  actualTotalRegistration: number
  actualTargetDayRegistration: number
  estimatedRegistration: number
  estimatedTargetDayPercentage: number
  month: string
  year: string
  startOfMonth: string
  endOfMonth: string
}

export async function monthWiseEventEstimationsHandler(
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
  const monthFilters: IMonthRangeFilter[] = getMonthRangeFilterListFromTimeRage(
    timeStart,
    timeEnd
  )
  const registrationsGroupByEventDates = await fetchEventsGroupByMonthDates(
    timeStart,
    timeEnd,
    locationId,
    event
  )
  const estimations: IMonthWiseEstimation[] = []
  for (const monthFilter of monthFilters) {
    const estimatedTargetDayMetrics =
      await fetchEstimateForTargetDaysByLocationId(
        locationId,
        event,
        authHeader,
        monthFilter.startOfMonthTime,
        monthFilter.endOfMonthTime
      )

    const totalRegistrationWithinMonth = registrationsGroupByEventDates
      .filter(
        (p) => p.dateLabel === `${monthFilter.year}-${monthFilter.monthIndex}`
      )
      .reduce((t, p) => t + p.total, 0)

    const totalWithinTargetInMonth = registrationsGroupByEventDates
      .filter(
        (p) =>
          p.dateLabel === `${monthFilter.year}-${monthFilter.monthIndex}` &&
          p.timeLabel === 'withinTarget'
      )
      .reduce((t, p) => t + p.total, 0)

    estimations.push({
      startOfMonth: monthFilter.startOfMonthTime,
      endOfMonth: monthFilter.endOfMonthTime,
      actualTotalRegistration: totalRegistrationWithinMonth,
      actualTargetDayRegistration: totalWithinTargetInMonth,
      estimatedRegistration: estimatedTargetDayMetrics.totalEstimation,
      estimatedTargetDayPercentage: getPercentage(
        totalWithinTargetInMonth,
        estimatedTargetDayMetrics.totalEstimation
      ),
      month: monthFilter.month,
      year: monthFilter.year
    })
  }
  return estimations
}
