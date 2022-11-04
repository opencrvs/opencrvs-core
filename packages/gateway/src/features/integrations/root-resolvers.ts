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
import { USER_MANAGEMENT_URL } from '@gateway/constants'
import { GQLResolver } from '@gateway/graphql/schema'
import fetch from 'node-fetch'
import { hasScope } from '../user/utils'

export const resolvers: GQLResolver = {
  Query: {
    async fetchIntegration(_, { ids }, authHeader) {
      // check that the user is sysadmin
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(new Error('only allowed for sysadmin'))
      }
      //send a fetch to user-mgnt `getSystemHandler`

      const res = await fetch(`${USER_MANAGEMENT_URL}getSystem`, {
        method: 'POST',
        body: JSON.stringify({
          clientId: ids?.clientId,
          systemId: ids?.systemId
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
