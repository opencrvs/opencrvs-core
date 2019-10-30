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
import { FHIR_URL } from '@gateway/constants'
import { GQLResolver } from '@gateway/graphql/schema'
import { fetchFHIR } from '@gateway/features/fhir/utils'

export const resolvers: GQLResolver = {
  Query: {
    async locationsByParent(_, { parentId }, authHeader) {
      const bundle = await fetchFHIR(
        `${FHIR_URL}/Location?partof=${parentId}`,
        authHeader
      )

      return bundle.entry.map((entry: { resource: {} }) => entry.resource)
    },
    async locationById(_, { locationId }, authHeader) {
      return fetchFHIR(`${FHIR_URL}/Location/${locationId}`, authHeader)
    }
  }
}
