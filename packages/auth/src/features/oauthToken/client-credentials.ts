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
import {
  authenticateSystem,
  createToken
} from '@auth/features/authenticate/service'
import {
  WEB_USER_JWT_AUDIENCES,
  JWT_ISSUER,
  NOTIFICATION_API_USER_AUDIENCE
} from '@auth/constants'
import * as oauthResponse from './responses'
import { SCOPES, TokenUserType } from '@opencrvs/commons/authentication'

export async function clientCredentialsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const clientId = request.query.client_id
  const clientSecret = request.query.client_secret

  if (!clientId || !clientSecret) {
    return oauthResponse.invalidRequest(h)
  }

  let result
  try {
    result = await authenticateSystem(clientId, clientSecret)
  } catch (err) {
    return oauthResponse.invalidClient(h)
  }

  if (result.status !== 'active') {
    return oauthResponse.invalidClient(h)
  }

  const isNotificationAPIUser = result.scope.includes(SCOPES.NOTIFICATION_API)

  const token = await createToken(
    result.systemId,
    result.scope,
    isNotificationAPIUser
      ? WEB_USER_JWT_AUDIENCES.concat([NOTIFICATION_API_USER_AUDIENCE])
      : WEB_USER_JWT_AUDIENCES,
    JWT_ISSUER,
    true,
    TokenUserType.SYSTEM
  )

  return oauthResponse.success(h, token)
}
