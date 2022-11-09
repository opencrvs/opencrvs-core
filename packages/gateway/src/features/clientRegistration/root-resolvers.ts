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
import { hasScope } from '@gateway/features/user/utils'
import { GQLResolver } from '@gateway/graphql/schema'
import fetch from 'node-fetch'
import { USER_MANAGEMENT_URL } from '@gateway/constants'

export const resolvers: GQLResolver = {
  Mutation: {
    async registerSystemClient(_, { clientDetails }, authHeader) {
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error('Only sysadmin is allowed to create client')
        )
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}registerSystemClient`, {
        method: 'POST',
        body: JSON.stringify(clientDetails),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (res.status !== 201) {
        return await Promise.reject(
          new Error(
            `Something went wrong on config service. Couldn't register new client`
          )
        )
      }
      return await res.json()
    }
  }
}
