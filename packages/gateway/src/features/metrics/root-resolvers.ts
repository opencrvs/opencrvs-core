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
import { ActionType } from '@opencrvs/commons'

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

function V2ActionTypeToV1ActionType(
  actionType: ActionType
): V1ActionType | null {
  switch (actionType) {
    case ActionType.DECLARE:
      return 'DECLARED'
    case ActionType.VALIDATE:
      return 'VALIDATED'
    case ActionType.REGISTER:
      return 'REGISTERED'
    case ActionType.REJECT:
      return 'REJECTED'
    case ActionType.PRINT_CERTIFICATE:
      return 'CERTIFIED'
    case ActionType.MARK_AS_DUPLICATE:
      return 'MARKED_AS_DUPLICATE'
    case ActionType.MARK_AS_NOT_DUPLICATE:
      return 'MARKED_AS_NOT_DUPLICATE'
    case ActionType.REQUEST_CORRECTION:
      return 'REQUESTED_CORRECTION'
    case ActionType.APPROVE_CORRECTION:
      return 'APPROVED_CORRECTION'
    case ActionType.REJECT_CORRECTION:
      return 'REJECTED_CORRECTION'
    case ActionType.READ:
      return 'VIEWED'
    case ActionType.DELETE:
      return null
    case ActionType.CREATE:
      return null
    case ActionType.NOTIFY:
      return 'IN_PROGRESS'
    case ActionType.DUPLICATE_DETECTED:
      return null
    case ActionType.ARCHIVE:
      return 'ARCHIVED'
    case ActionType.ASSIGN:
      return 'ASSIGNED'
    case ActionType.UNASSIGN:
      return 'UNASSIGNED'
    default:
      return null
  }
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
        {
          practitionerId: params.practitionerId
        },
        authHeader
      )

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

      const combinedResults = [
        ...(metricsData.results || []),
        ...eventActionsData.results
          .map((action) => ({
            action: V2ActionTypeToV1ActionType(action.actionType as ActionType),
            ipAddress: '', // Not available in event actions
            practitionerId: action.createdBy,
            time: action.createdAt,
            userAgent: '', // Not available in event actions
            data: {
              compositionId: action.eventId,
              trackingId: action.trackingId
            }
          }))
          .filter((a) => a.action !== null)
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

      // Apply pagination to combined results
      const paginatedResults = combinedResults.slice(
        params.skip || 0,
        (params.skip || 0) + (params.count || 10)
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
