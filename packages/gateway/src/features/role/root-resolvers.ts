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
import { COUNTRY_CONFIG_URL } from '@gateway/constants'
import { GQLResolver } from '@gateway/graphql/schema'
import { fetchJSON, joinURL, Roles } from '@opencrvs/commons'

export const resolvers: GQLResolver = {
  Query: {
    async getUserRoles(_, __, { headers: authHeader }) {
      const roles = await fetchJSON<Roles[]>(
        joinURL(COUNTRY_CONFIG_URL, `/roles`),
        {
          headers: {
            'Content-Type': 'application/json',
            ...authHeader
          }
        }
      )

      return roles
    }
  }
}
