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
import { hasScope } from '@gateway/features/user/utils'
import { GQLResolver } from '@gateway/graphql/schema'
import fetch from 'node-fetch'

export const resolvers: GQLResolver = {
  Mutation: {
    async refreshSystemClientSecret(_, { clientId }, authHeader) {
      if (!hasScope(authHeader, 'natlsysadmin')) {
        throw new Error('Only system user can update refresh client secret')
      }
      const res = await fetch(
        `${USER_MANAGEMENT_URL}refreshSystemClientSecret`,
        {
          method: 'POST',
          body: JSON.stringify({ clientId: clientId }),
          headers: {
            'Content-Type': 'application/json',
            ...authHeader
          }
        }
      )
      if (res.status !== 200) {
        throw new Error(`No user details found by given clientId`)
      }

      return await res.json()
    }
  }
}
