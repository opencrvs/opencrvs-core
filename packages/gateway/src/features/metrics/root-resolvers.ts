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

import { getUser, inScope } from '@gateway/features/user/utils'
import { getMetrics } from './service'
import { getEventActions } from './events-service'
import { SCOPES } from '@opencrvs/commons/authentication'
import { ActionType, ActionTypes } from '@opencrvs/commons'

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

type V1ActionType =
  | 'IN_PROGRESS'
  | 'DECLARED'
  | 'VALIDATED'
  | 'DECLARATION_UPDATED'
  | 'REGISTERED'
  | 'REJECTED'
  | 'CERTIFIED'
  | 'ISSUED'
  | 'ASSIGNED'
  | 'UNASSIGNED'
  | 'CORRECTED'
  | 'REQUESTED_CORRECTION'
  | 'APPROVED_CORRECTION'
  | 'REJECTED_CORRECTION'
  | 'ARCHIVED'
  | 'LOGGED_IN'
  | 'LOGGED_OUT'
  | 'PHONE_NUMBER_CHANGED'
  | 'EMAIL_ADDRESS_CHANGED'
  | 'PASSWORD_CHANGED'
  | 'DEACTIVATE'
  | 'REACTIVATE'
  | 'EDIT_USER'
  | 'CREATE_USER'
  | 'PASSWORD_RESET'
  | 'USERNAME_REMINDER'
  | 'USERNAME_REMINDER_BY_ADMIN'
  | 'PASSWORD_RESET_BY_ADMIN'
  | 'RETRIEVED'
  | 'VIEWED'
  | 'REINSTATED_IN_PROGRESS'
  | 'REINSTATED_DECLARED'
  | 'REINSTATED_REJECTED'
  | 'SENT_FOR_APPROVAL'
  | 'MARKED_AS_DUPLICATE'
  | 'MARKED_AS_NOT_DUPLICATE'

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
      if (inScope(authHeader, [SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS])) {
        results = await getMetrics('/fetchVSExport', variables, authHeader)
        return {
          results
        }
      } else {
        throw new Error(
          'User does not have the scope required for this resource'
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
      // 1. Skip, timeStart and timeEnd must remain as the defaults in order for us to know the number of pages and full size of the results
      const metricsData = await getMetrics(
        '/audit/events',
        {
          practitionerId: params.practitionerId,
          skip: 0,
          count: params.count + (params.skip || 0),
          timeStart: params.timeStart,
          timeEnd: params.timeEnd
        },
        authHeader
      )

      const user = await getUser(
        { practitionerId: params.practitionerId },
        authHeader
      )

      // 1. Skip, timeStart and timeEnd must remain as the defaults in order for us to know the number of pages and full size of the results
      const eventActionsData = await getEventActions(
        {
          userId: user._id,
          skip: 0,
          count: params.count + (params.skip || 0),
          timeStart: params.timeStart,
          timeEnd: params.timeEnd
        },
        { ...authHeader }
      )

      const cleanedEventActions = eventActionsData.results.map((action) => ({
        // TODO CIHAN: remove isV2?
        isV2: true,
        action: action.actionType,
        ipAddress: '', // Not available in event actions
        practitionerId: action.createdBy,
        time: action.createdAt,
        userAgent: '', // Not available in event actions
        data: { compositionId: action.eventId, trackingId: action.trackingId }
      }))

      // 3. Combine and sort the results by time.
      const combinedResults = [
        ...(metricsData.results || []),
        ...cleanedEventActions
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

      // 4. Paginate the combined results. Ensure slicing stays within the bounds of the array.
      const start = params.skip || 0
      const end = start + (params.count || 10)

      const paginatedResults = combinedResults.slice(
        start,
        Math.min(end, combinedResults.length)
      )

      return {
        results: paginatedResults,
        total: (metricsData.total || 0) + (eventActionsData.total || 0)
      }
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
