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
  timeFrameTotalCalculator,
  genderBasisTotalCalculator,
  paymentTotalCalculator,
  estimatedTargetDayMetricsTotalCalculator,
  eventInTargetDayEstimationCalculator
} from '@gateway/features/fhir/utils'

export interface IMetricsParam {
  timeStart: string
  timeEnd: string
  locationId: string
  event?: string
  practitionerIds?: string[]
  practitionerId?: string
  count?: number
}

export const resolvers: GQLResolver = {
  Query: {
    async fetchRegistrationMetrics(
      _,
      { timeStart, timeEnd, locationId, event },
      authHeader
    ) {
      const params: IMetricsParam = {
        timeStart,
        timeEnd,
        locationId,
        event
      }
      const metricsData = await getMetrics('/metrics', params, authHeader)

      return {
        timeFrames: {
          details: metricsData.timeFrames,
          total: timeFrameTotalCalculator(metricsData.timeFrames)
        },
        genderBasisMetrics: {
          details: metricsData.genderBasisMetrics,
          total: genderBasisTotalCalculator(metricsData.genderBasisMetrics)
        },
        estimatedTargetDayMetrics: {
          details: metricsData.estimatedTargetDayMetrics,
          total: estimatedTargetDayMetricsTotalCalculator(
            metricsData.estimatedTargetDayMetrics
          )
        },
        payments: {
          details: metricsData.payments,
          total: paymentTotalCalculator(metricsData.payments)
        }
      }
    },
    async getEventEstimationMetrics(
      _,
      { timeStart, timeEnd, locationId },
      authHeader
    ) {
      return getMetrics(
        '/eventEstimations',
        {
          timeStart,
          timeEnd,
          locationId
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
