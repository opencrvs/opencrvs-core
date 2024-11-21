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
  NOTIFICATION_API_USER_AUDIENCE,
  VALIDATOR_API_USER_AUDIENCE,
  AGE_VERIFICATION_USER_AUDIENCE,
  NATIONAL_ID_USER_AUDIENCE
} from '@auth/constants'
import * as oauthResponse from './responses'

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

  const isNotificationAPIUser = result.scope.includes('notification-api')
  const isValidatorAPIUser = result.scope.includes('validator-api')
  const isAgeVerificationAPIUser = result.scope.includes('age-verification-api')
  const isNationalIDAPIUser = result.scope.includes('nationalId')

  const token = await createToken(
    result.systemId,
    result.scope,
    isNotificationAPIUser
      ? WEB_USER_JWT_AUDIENCES.concat([NOTIFICATION_API_USER_AUDIENCE])
      : isValidatorAPIUser
      ? WEB_USER_JWT_AUDIENCES.concat([VALIDATOR_API_USER_AUDIENCE])
      : isAgeVerificationAPIUser
      ? WEB_USER_JWT_AUDIENCES.concat([AGE_VERIFICATION_USER_AUDIENCE])
      : isNationalIDAPIUser
      ? WEB_USER_JWT_AUDIENCES.concat([NATIONAL_ID_USER_AUDIENCE])
      : WEB_USER_JWT_AUDIENCES,
    JWT_ISSUER,
    true
  )

  return oauthResponse.success(h, token)
}
