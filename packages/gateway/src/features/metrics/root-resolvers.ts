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
import { GQLResolver } from '@gateway/graphql/schema'
import { getMetrics } from '@gateway/features/fhir/utils'
import { inScope } from '@gateway/features/user/utils'

export interface IMetricsParam {
  timeStart?: string
  timeEnd?: string
  locationId?: string
  event?: string
  practitionerIds?: string[]
  practitionerId?: string
  count?: number
  populationYear?: number
  skip?: number
}

export enum FILTER_BY {
  REGISTERER = 'by_registrar',
  LOCATION = 'by_location',
  TIME = 'by_time'
}

export const resolvers: GQLResolver = {
  Query: {
    async getTotalMetrics(_, variables, { headers: authHeader }) {
      return getMetrics('/totalMetrics', variables, authHeader)
    },
    async getRegistrationsListByFilter(
      _,
      { filterBy, ...variables },
      { headers: authHeader }
    ) {
      let result
      if (filterBy === FILTER_BY.REGISTERER) {
        result = await getMetrics(
          '/totalMetricsByRegistrar',
          variables,
          authHeader
        )
      } else if (filterBy === FILTER_BY.LOCATION) {
        result = await getMetrics(
          '/totalMetricsByLocation',
          variables,
          authHeader
        )
      } else if (filterBy === FILTER_BY.TIME) {
        result = await getMetrics('/totalMetricsByTime', variables, authHeader)
      }
      return result
    },
    async getVSExports(_, variables, { headers: authHeader }) {
      let results
      if (inScope(authHeader, ['natlsysadmin', 'performance'])) {
        results = await getMetrics('/fetchVSExport', variables, authHeader)
        return {
          results
        }
      } else {
        return await Promise.reject(
          new Error('User does not have the scope required for this resource')
        )
      }
    },
    async getTotalPayments(
      _,
      { timeStart, timeEnd, locationId, event },
      { headers: authHeader }
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
    async getTotalCertifications(
      _,
      { timeStart, timeEnd, locationId },
      { headers: authHeader }
    ) {
      return getMetrics(
        '/totalCertifications',
        {
          timeStart,
          timeEnd,
          locationId
        },
        authHeader
      )
    },
    async getTotalCorrections(
      _,
      { timeStart, timeEnd, locationId, event },
      { headers: authHeader }
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
      { headers: authHeader }
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
      { headers: authHeader }
    ) {
      const metricsData = await getMetrics(
        '/monthWiseEventEstimations',
        locationId
          ? {
              timeStart,
              timeEnd,
              locationId,
              event
            }
          : {
              timeStart,
              timeEnd,
              event
            },
        authHeader
      )
      return metricsData
    },
    async fetchLocationWiseEventMetrics(
      _,
      { timeStart, timeEnd, locationId, event },
      { headers: authHeader }
    ) {
      const metricsData = await getMetrics(
        '/locationWiseEventEstimations',
        locationId
          ? {
              timeStart,
              timeEnd,
              locationId,
              event
            }
          : {
              timeStart,
              timeEnd,
              event
            },
        authHeader
      )
      return metricsData
    },
    async getUserAuditLog(_, params, { headers: authHeader }) {
      return await getMetrics(
        '/audit/events',
        {
          practitionerId: params.practitionerId,
          skip: params.skip,
          count: params.count,
          timeStart: params.timeStart,
          timeEnd: params.timeEnd
        },
        authHeader
      )
    },
    async getLocationStatistics(
      _,
      { locationId, populationYear },
      { headers: authHeader }
    ) {
      return getMetrics(
        '/locationStatistics',
        locationId ? { locationId, populationYear } : { populationYear },
        authHeader
      )
    }
  }
}
