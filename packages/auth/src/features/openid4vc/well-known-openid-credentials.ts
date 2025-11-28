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

import { env } from '@auth/environment'
import * as Hapi from '@hapi/hapi'

// @TODO: What is actually the best way to figure this out?
// - [ ] should we pass a new environment variable?
// - [ ] should this live not in auth?
const GATEWAY = env.isProduction
  ? `https://gateway.${env.DOMAIN}`
  : 'http://localhost:7070'

export function openidCredentialIssuerHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  return h.response({
    credential_issuer: GATEWAY,
    credential_endpoint: `${GATEWAY}/events/openid4vc.issuance.credential`,
    token_endpoint: `${GATEWAY}/auth/token`,

    credential_configurations_supported: {
      BirthCertificateCredential: {
        format: 'jwt_vc_json'
        // claim schema etc...
      }
    }
  })
}
