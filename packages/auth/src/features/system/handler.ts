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

// Based on the example responses in 2023-09-14
// https://www.oauth.com/oauth2-servers/access-tokens/access-token-response/

const invalidRequest = (h: Hapi.ResponseToolkit) =>
  h
    .response({
      error: 'invalid_request',
      error_description:
        'Invalid request. Check that all required parameters (client_id, client_secret and grant_type) have been provided.',
      error_uri:
        'Refer to https://documentation.opencrvs.org/technology/interoperability/authenticate-a-client'
    })
    .header('Cache-Control', 'no-store')
    .code(400)

const invalidGrantType = (h: Hapi.ResponseToolkit) =>
  h
    .response({
      error: 'unsupported_grant_type',
      error_description:
        'Invalid grant type. Only client_credentials is supported.',
      error_uri:
        'Refer to https://documentation.opencrvs.org/technology/interoperability/authenticate-a-client'
    })

    .header('Cache-Control', 'no-store')
    .code(400)

const invalidClient = (h: Hapi.ResponseToolkit) =>
  h
    .response({
      error: 'invalid_client',
      error_description: 'Invalid client id or secret',
      error_uri:
        'Refer to https://documentation.opencrvs.org/technology/interoperability/authenticate-a-client'
    })
    .header('Cache-Control', 'no-store')
    .code(401)

const success = (h: Hapi.ResponseToolkit, token: string) =>
  h
    .response({
      access_token: token,
      token_type: 'Bearer'
    })
    .header('Cache-Control', 'no-store')
    .code(200)

export async function tokenHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const clientId = request.query.client_id
  const clientSecret = request.query.client_secret
  const grantType = request.query.grant_type

  if (!clientId || !clientSecret || !grantType) {
    return invalidRequest(h)
  }

  if (grantType !== 'client_credentials') {
    return invalidGrantType(h)
  }

  let result
  try {
    result = await authenticateSystem(clientId, clientSecret)
  } catch (err) {
    return invalidClient(h)
  }

  if (result.status !== 'active') {
    return invalidClient(h)
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

  return success(h, token)
}
