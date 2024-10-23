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
// import {
//   CORRECTION_TOTALS,
//   PERFORMANCE_METRICS,
//   PERFORMANCE_STATS
// } from '@client/views/SysAdmin/Performance/metricsQuery'
import { Action, Middleware } from 'redux'
import { SCOPES } from '@client/utils/gateway'
// import startOfMonth from 'date-fns/startOfMonth'
// import subMonths from 'date-fns/subMonths'
// import { QueryOptions } from '@apollo/client/core'

/*function getQueriesToPrefetch(
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
}*/

export const persistenceMiddleware: Middleware<{}, IStoreState> =
  ({ dispatch, getState }) =>
  (next) =>
  (action: Action) => {
    next(action)
    if (import.meta.env.MODE === 'test') return
    if (action.type === USER_DETAILS_AVAILABLE) {
      // const userDetails = getState().profile.userDetails
      const scopes = getState().profile.tokenPayload!.scope!

      if (
        scopes.includes(SCOPES.ORGANISATION_READ_LOCATIONS) ||
        scopes.includes(SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE)
      ) {
        /*
        export function getDefaultPerformanceLocationId(userDetails: UserDetails) {
  const role = userDetails?.systemRole
  const primaryOfficeId = userDetails.primaryOffice?.id
  if (role) {
    if (REGISTRAR_ROLES.includes(role) || SYS_ADMIN_ROLES.includes(role)) {
      return primaryOfficeId
    } else if (
      NATL_ADMIN_ROLES.includes(role) ||
      NATIONAL_REGISTRAR_ROLES.includes(role) ||
      PERFORMANCE_MANAGEMENT_ROLES.includes(role)
    ) {
      return // country wide
    }
  }
}

        const defaultPerformanceLocationId = getDefaultPerformanceLocationId(
          userDetails!
        )
        const officeSelected = scopes.includes(
          'organisation.read-locations:my-office'
        )
        const queriesToPrefetch = getQueriesToPrefetch(
          defaultPerformanceLocationId as string,
          officeSelected
        )
        for (const query of queriesToPrefetch) {
          client.query(query)
        }
        */
      }
    }
  }
