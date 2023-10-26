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
import { fetchFHIR } from '@gateway/features/fhir/utils'

export const resolvers: GQLResolver = {
  Query: {
    async locationsByParent(_, { parentId }, { headers: authHeader }) {
      const bundle = await fetchFHIR(`/Location?partof=${parentId}`, authHeader)
      return bundle.entry.map((entry: { resource: {} }) => entry.resource)
    },
    async hasChildLocation(_, { parentId }, { headers: authHeader }) {
      const bundle = await fetchFHIR(
        `/Location?_count=1&partof=${parentId}`,
        authHeader
      )
      const [childLocation] = bundle.entry.map(
        (entry: { resource: {} }) => entry.resource
      )
      return childLocation
    },
    async locationById(_, { locationId }, { headers: authHeader }) {
      return fetchFHIR(`/Location/${locationId}`, authHeader)
    }
  }
}
