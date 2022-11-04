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
import { UserInputError } from 'apollo-server-hapi'
import { GQLResolver } from '@gateway/graphql/schema'
import fetch from 'node-fetch'
import { USER_MANAGEMENT_URL } from '@gateway/constants'

export const resolvers: GQLResolver = {
  Mutation: {
    async refreshSystemClientSecret(_, { clientId }, authHeader) {
      try {
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
        return await res.json()
      } catch (error) {
        throw new UserInputError(error.message)
      }
    }
  }
}
