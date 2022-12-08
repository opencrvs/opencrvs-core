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
import { fetchFHIR } from '@gateway/features/fhir/utils'
import { FILTER_BY } from '@gateway/features/metrics/root-resolvers'
import { USER_MANAGEMENT_URL } from '@gateway/constants'
import fetch from 'node-fetch'

export const typeResolvers: GQLResolver = {
  UserAuditLogResultItem: {
    __resolveType(obj) {
      if (obj.data?.compositionId) {
        return 'UserAuditLogItemWithComposition'
      } else {
        return 'UserAuditLogItem'
      }
    }
  },
  MixedTotalMetricsResult: {
    __resolveType(obj, context, info) {
      if (info.variableValues.filterBy === FILTER_BY.REGISTERER)
        return 'TotalMetricsByRegistrar'
      else if (info.variableValues.filterBy === FILTER_BY.LOCATION)
        return 'TotalMetricsByLocation'
      else if (info.variableValues.filterBy === FILTER_BY.TIME)
        return 'TotalMetricsByTime'
      else throw new Error('Invalid type')
    }
  },
  EventMetricsByLocation: {
    async location({ location }, _, authHeader) {
      return await fetchFHIR(`/${location}`, authHeader)
    }
  },
  EventMetricsByRegistrar: {
    async registrarPractitioner({ registrarPractitioner }, _, authHeader) {
      const res = await fetch(`${USER_MANAGEMENT_URL}getUser`, {
        method: 'POST',
        body: JSON.stringify({
          practitionerId: registrarPractitioner
        }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      return await res.json()
    }
  }
}
