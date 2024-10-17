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

export async function tokenHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const grantType = request.query.grant_type

  if (grantType === 'client_credentials') {
    return clientCredentialsHandler(request, h)
  }

  if (grantType === 'urn:opencrvs:oauth:grant-type:token-exchange') {
    return tokenExchangeHandler(request, h)
  }

  return oauthResponse.invalidGrantType(h)
}
