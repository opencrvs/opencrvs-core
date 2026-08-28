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
import * as Hapi from '@hapi/hapi'
import { logger } from '@opencrvs/commons'
import { clientCredentialsHandler } from './client-credentials'
import * as oauthResponse from './responses'
import { tokenExchangeHandler } from './token-exchange'
import { deprecatedQueryParams, getParam } from './utils'

export async function tokenHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const queryParams = deprecatedQueryParams(request)

  if (queryParams.length > 0) {
    // Reject outside production, so integrations hit this while developing
    // rather than when the fallback goes; production keeps working, but loudly.
    if (process.env.NODE_ENV !== 'production') {
      return oauthResponse.queryParametersDeprecated(h, queryParams)
    }

    logger.error(
      `Deprecated: POST /token got OAuth parameters in the query string ` +
        `(${queryParams.join(', ')}). Send them in the request body instead. ` +
        `Secrets sent this way are in the access logs and should be rotated.`
    )
  }

  const grantType = getParam(request, 'grant_type')

  if (grantType === 'client_credentials') {
    return clientCredentialsHandler(request, h)
  }

  if (grantType === 'urn:opencrvs:oauth:grant-type:token-exchange') {
    return tokenExchangeHandler(request, h)
  }

  return oauthResponse.invalidGrantType(h)
}
