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
import * as oauthResponse from './responses'
import { createTokenForVerifiableCredentialIssuance } from '../authenticate/service'

/**
 * Issues a token for a pre-authorized code grant.
 * This is used in OID4VC flows where a client has obtained a pre-authorized code to get the verifiable credential.
 */
export async function preAuthorizedCodeHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const preAuthorizedCode = request.query?.['pre-authorized_code'] // for PoC: this is event ID

  if (!preAuthorizedCode) {
    return oauthResponse.invalidRequest(h, 'missing pre-authorized_code')
  }

  // const token = request.headers.authorization.replace('Bearer ', '')
  // const decodedOrError = pipe(token, verifyToken)

  // if (decodedOrError._tag === 'Left') {
  //   return oauthResponse.invalidSubjectToken(h)
  // }

  // const { sub } = decodedOrError.right

  const token = await createTokenForVerifiableCredentialIssuance(
    preAuthorizedCode,
    'anonymous-user' // In PoC, no user binding, see above comment when needed
  )

  return oauthResponse.preAuthorizedCodeSuccess(h, token)
}
