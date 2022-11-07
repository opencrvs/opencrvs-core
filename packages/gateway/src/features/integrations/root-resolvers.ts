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
import { getSystem, hasScope } from '@gateway/features/user/utils'

export const resolvers: GQLResolver = {
  Query: {
    async fetchIntegration(_, { ids }, authHeader) {
      if (authHeader && !hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error('Fetch integration is only allowed for sysadmin')
        )
      }

      let payload = {}
      if (ids?.clientId) {
        payload = { clientId: ids?.clientId }
      }
      if (ids?.systemId) {
        payload = { systemId: ids?.systemId }
      }
      const systemRes = await getSystem(payload, authHeader)

      return {
        name: systemRes.name,
        clientId: systemRes.client_id,
        shaSecret: systemRes.sha_secret
      }
    }
  }
}
