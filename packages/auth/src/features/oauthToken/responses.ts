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
import { RECORD_TOKEN_TYPE } from './token-exchange'

export const invalidRequest = (h: Hapi.ResponseToolkit) =>
  h
    .response({
      error: 'invalid_request',
      error_description:
        'Invalid request. Check that all required parameters have been provided.',
      error_uri:
        'Refer to https://documentation.opencrvs.org/technology/interoperability/authenticate-a-client'
    })
    .header('Cache-Control', 'no-store')
    .code(400)

export const invalidGrantType = (h: Hapi.ResponseToolkit) =>
  h
    .response({
      error: 'unsupported_grant_type',
      error_description: `Invalid grant type. Only "client_credentials" or "${RECORD_TOKEN_TYPE}" are supported.`,
      error_uri:
        'Refer to https://documentation.opencrvs.org/technology/interoperability/authenticate-a-client'
    })

    .header('Cache-Control', 'no-store')
    .code(400)

export const invalidClient = (h: Hapi.ResponseToolkit) =>
  h
    .response({
      error: 'invalid_client',
      error_description: 'Invalid client id or secret',
      error_uri:
        'Refer to https://documentation.opencrvs.org/technology/interoperability/authenticate-a-client'
    })
    .header('Cache-Control', 'no-store')
    .code(401)

export const success = (h: Hapi.ResponseToolkit, token: string) =>
  h
    .response({
      access_token: token,
      token_type: 'Bearer'
    })
    .header('Cache-Control', 'no-store')
    .code(200)
