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
import { GQLResolver } from '@gateway/graphql/schema'
import {
  getMetrics,
  eventInTargetDayEstimationCalculator
} from '@gateway/features/fhir/utils'

export interface IMetricsParam {
  timeStart: string
  timeEnd: string
  locationId?: string
  event?: string
  practitionerIds?: string[]
  practitionerId?: string
  count?: number
}

export const resolvers: GQLResolver = {
  Query: {
    async getTotalMetrics(
      _,
      { timeStart, timeEnd, locationId, event },
      authHeader
    ) {
      return getMetrics(
        '/totalMetrics',
        {
          timeStart,
          timeEnd,
          locationId,
          event
        },
        authHeader
      )
    },
    async getTotalPayments(
      _,
      { timeStart, timeEnd, locationId, event },
      authHeader
    ) {
      return getMetrics(
        '/totalPayments',
        {
          timeStart,
          timeEnd,
          locationId,
          event
        },
        authHeader
      )
    },
    async getTotalCorrections(
      _,
      { timeStart, timeEnd, locationId, event },
      authHeader
    ) {
      return getMetrics(
        '/totalCorrections',
        {
          timeStart,
          timeEnd,
          locationId,
          event
        },
        authHeader
      )
    },
    async getDeclarationsStartedMetrics(
      _,
      { timeStart, timeEnd, locationId },
      authHeader
    ) {
      return getMetrics(
        '/declarationsStarted',
        {
          timeStart,
          timeEnd,
          locationId
        },
        authHeader
      )
    },
    async fetchMonthWiseEventMetrics(
      _,
      { timeStart, timeEnd, locationId, event },
      authHeader
    ) {
      const metricsData = await getMetrics(
        '/monthWiseEventEstimations',
        {
          timeStart,
          timeEnd,
          locationId,
          event
        },
        authHeader
      )
      return {
        details: metricsData,
        total: eventInTargetDayEstimationCalculator(metricsData)
      }
    },
    async fetchLocationWiseEventMetrics(
      _,
      { timeStart, timeEnd, locationId, event },
      authHeader
    ) {
      const metricsData = await getMetrics(
        '/locationWiseEventEstimations',
        {
          timeStart,
          timeEnd,
          locationId,
          event
        },
        authHeader
      )
      return {
        details: metricsData,
        total: eventInTargetDayEstimationCalculator(metricsData)
      }
    },
    async fetchTimeLoggedMetricsByPractitioner(
      _,
      { timeStart, timeEnd, practitionerId, locationId, count },
      authHeader
    ) {
      return await getMetrics(
        '/timeLoggedMetricsByPractitioner',
        {
          timeStart,
          timeEnd,
          practitionerId,
          locationId,
          count
        },
        authHeader
      )
    }
  }
}
