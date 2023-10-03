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
import { fetchToken, fetchUserInfo } from './utils'

export const resolvers: GQLResolver = {
  Query: {
    getOIDPUserInfo: async (_, { code, clientId, redirectUri, grantType }) => {
      const tokenResponse = await fetchToken({
        code,
        clientId,
        redirectUri,
        grantType
      })

      if (!tokenResponse.access_token) {
        throw new Error(
          'Something went wrong with the OIDP token request. No access token was returned. Response from OIDP: ' +
            JSON.stringify(tokenResponse)
        )
      }

      return fetchUserInfo(tokenResponse.access_token)
    }
  }
}
