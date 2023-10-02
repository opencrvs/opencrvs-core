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
import { USER_DETAILS_AVAILABLE } from '@client/profile/profileActions'
import { IStoreState } from '@client/store'
import {
  CORRECTION_TOTALS,
  PERFORMANCE_METRICS,
  PERFORMANCE_STATS
} from '@client/views/SysAdmin/Performance/metricsQuery'
import { Action, Middleware } from 'redux'
import { getDefaultPerformanceLocationId } from '@client/navigation'
import { UserDetails } from '@client/utils/userUtils'
import {
  FIELD_AGENT_ROLES,
  NATIONAL_REGISTRAR_ROLES,
  NATL_ADMIN_ROLES
} from '@client/utils/constants'
import { client } from '@client/utils/apolloClient'
import { READY } from '@client/offline/actions'
import startOfMonth from 'date-fns/startOfMonth'
import subMonths from 'date-fns/subMonths'
import { QueryOptions } from '@apollo/client'

const isUserOfNationalScope = (userDetails: UserDetails) =>
  [...NATIONAL_REGISTRAR_ROLES, ...NATL_ADMIN_ROLES].includes(
    userDetails.systemRole
  )
const isFieldAgent = (userDetails: UserDetails) =>
  FIELD_AGENT_ROLES.includes(userDetails.systemRole)

function getQueriesToPrefetch(
  locationId: string,
  officeSelected: boolean
): QueryOptions[] {
  const defaultTimeStart = new Date(
    startOfMonth(subMonths(new Date(Date.now()), 11)).setHours(0, 0, 0, 0)
  )
  const defaultTimeEnd = new Date(
    new Date(Date.now()).setHours(23, 59, 59, 999)
  )

  return [
    {
      query: PERFORMANCE_STATS,
      variables: {
        event: 'birth',
        locationId,
        status: [
          'IN_PROGRESS',
          'DECLARED',
          'REJECTED',
          'VALIDATED',
          'WAITING_VALIDATION',
          'REGISTERED'
        ],
        populationYear: new Date().getFullYear(),
        officeSelected
      },
      fetchPolicy: 'network-only'
    },
    {
      query: PERFORMANCE_METRICS,
      variables: {
        event: 'BIRTH',
        locationId,
        timeStart: defaultTimeStart,
        timeEnd: defaultTimeEnd
      },
      fetchPolicy: 'network-only'
    },
    {
      query: CORRECTION_TOTALS,
      variables: {
        event: 'BIRTH',
        locationId,
        timeStart: defaultTimeStart,
        timeEnd: defaultTimeEnd
      },
      fetchPolicy: 'network-only'
    }
  ]
}
export const persistenceMiddleware: Middleware<{}, IStoreState> =
  ({ dispatch, getState }) =>
  (next) =>
  (action: Action) => {
    next(action)
    if (import.meta.env.MODE === 'test') return
    if (action.type === USER_DETAILS_AVAILABLE) {
      const userDetails = getState().profile.userDetails
      if (!isFieldAgent(userDetails!)) {
        const defaultPerformanceLocationId = getDefaultPerformanceLocationId(
          userDetails!
        )
        const officeSelected = !isUserOfNationalScope(userDetails!)
        const queriesToPrefetch = getQueriesToPrefetch(
          defaultPerformanceLocationId as string,
          officeSelected
        )
        for (const query of queriesToPrefetch) {
          client.query(query)
        }
      }
    } else if (action.type === READY) {
      const { locations } = getState().offline.offlineData
      const userDetails = getState().profile.userDetails
      if (!isFieldAgent(userDetails!)) {
        const stateIds = Object.values(locations!)
          .filter((location) => location.partOf === 'Location/0')
          .map((location) => location.id)

        for (const stateId of stateIds) {
          const queriesToPrefetch = getQueriesToPrefetch(stateId, false)
          for (const query of queriesToPrefetch) {
            client.query(query)
          }
        }
      }
    }
  }
