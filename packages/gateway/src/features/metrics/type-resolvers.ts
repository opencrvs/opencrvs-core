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
import { GQLResolver, GQLVSExport } from '@gateway/graphql/schema'
import { fetchFHIR } from '@gateway/features/fhir/utils'
import { FILTER_BY } from '@gateway/features/metrics/root-resolvers'
import { USER_MANAGEMENT_URL } from '@gateway/constants'
import fetch from '@gateway/fetch'
import { getPresignedUrlFromUri } from '@gateway/features/registration/utils'

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
    async location({ location }, _, { headers: authHeader }) {
      return await fetchFHIR(`/${location}`, authHeader)
    }
  },
  VSExport: {
    async url({ url: fileUri }: GQLVSExport, _, { headers: authHeader }) {
      return getPresignedUrlFromUri(fileUri, authHeader)
    }
  },
  EventMetricsByRegistrar: {
    async registrarPractitioner(
      { registrarPractitioner },
      _,
      { headers: authHeader }
    ) {
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
