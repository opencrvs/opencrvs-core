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
import { getUser } from '@gateway/features/user/utils'
import { FILTER_BY } from '@gateway/features/metrics/root-resolvers'
import { fetchFHIR } from '@gateway/features/fhir/utils'

export const typeResolvers: GQLResolver = {
  MixedTotalMetricsResult: {
    __resolveType(obj, context, info) {
      if (info.variableValues.filterBy === FILTER_BY.REGISTERER)
        return 'TotalMetricsByRegistrarResult'
      else if (info.variableValues.filterBy === FILTER_BY.LOCATION)
        return 'TotalMetricsByLocation'
      else return 'TotalMetricsResult'
    }
  },
  LocationDetails: {
    async details(locationId, _, authHeader) {
      const location = await fetchFHIR(`/${locationId}`, authHeader)
      return location
    }
  },
  RegistrarPractitioner: {
    async user(userId, _, authHeader) {
      return await getUser({ userId }, authHeader)
    }
  }
}
