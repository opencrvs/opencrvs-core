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
import { clientCredentialsHandler } from './client-credentials'
import * as oauthResponse from './responses'
import { tokenExchangeHandler } from './token-exchange'
import { preAuthorizedCodeHandler } from './pre-authorized-code'

const CLIENT_CREDENTIALS = 'client_credentials'
const TOKEN_EXCHANGE = 'urn:opencrvs:oauth:grant-type:token-exchange'
const PRE_AUTHORIZED_CODE_GRANT =
  'urn:ietf:params:oauth:grant-type:pre-authorized_code'

export async function tokenHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const grantType = request.query.grant_type

  if (grantType === CLIENT_CREDENTIALS) {
    return clientCredentialsHandler(request, h)
  }

  if (grantType === TOKEN_EXCHANGE) {
    return tokenExchangeHandler(request, h)
  }

  if (grantType === PRE_AUTHORIZED_CODE_GRANT) {
    return preAuthorizedCodeHandler(request, h)
  }

  return oauthResponse.invalidGrantType(h)
}
