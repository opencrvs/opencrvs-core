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
  estimated45DayMetricsTotalCalculator
} from '@gateway/features/fhir/utils'

export interface IMetricsParam {
  timeStart: string
  timeEnd: string
  locationId: string
  event?: string
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
        estimated45DayMetrics: {
          details: metricsData.estimated45DayMetrics,
          total: estimated45DayMetricsTotalCalculator(
            metricsData.estimated45DayMetrics
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
    async getApplicationsStartedMetrics(
      _,
      { timeStart, timeEnd, locationId },
      authHeader
    ) {
      return getMetrics(
        '/applicationsStarted',
        {
          timeStart,
          timeEnd,
          locationId
        },
        authHeader
      )
    }
  }
}
