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
import { getParam } from './utils'

/**
 * Public `/token` endpoint, reachable through the gateway (`/auth/token`).
 * Only `client_credentials` is served here. The
 * `urn:opencrvs:oauth:grant-type:token-exchange` grant is intentionally not
 * handled by this public handler - see `tokenExchangeHandler` and
 * `/internal/token-exchange`, which assumes its caller (the events service)
 * has already verified the subject has access to the requested record.
 * Exposing that grant here would let anyone with a valid login token mint a
 * `record.confirm-registration` / `record.reject-registration` token for any
 * event_id/action_id they name.
 */
export async function tokenHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const grantType = getParam(request, 'grant_type')

  if (grantType === 'client_credentials') {
    return clientCredentialsHandler(request, h)
  }

  return oauthResponse.invalidGrantType(h)
}
