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
import * as oauthResponse from './responses'
import * as Hapi from '@hapi/hapi'
import {
  createTokenForRecordValidation,
  verifyToken
} from '@auth/features/authenticate/service'
import { pipe } from 'fp-ts/lib/function'
import { UUID } from '@opencrvs/commons'

export const SUBJECT_TOKEN_TYPE =
  'urn:ietf:params:oauth:token-type:access_token'
export const RECORD_TOKEN_TYPE =
  'urn:opencrvs:oauth:token-type:single_record_token'

/**
 * Allows creating record-specific tokens for when a 3rd party system needs to confirm a registration
 *
 * https://datatracker.ietf.org/doc/html/rfc8693#section-2.1
 */
export async function tokenExchangeHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const subjectToken = request.query.subject_token
  const subjectTokenType = request.query.subject_token_type
  const requestedTokenType = request.query.requested_token_type
  const recordId = request.query.record_id

  if (
    !recordId ||
    !subjectToken ||
    subjectTokenType !== SUBJECT_TOKEN_TYPE ||
    requestedTokenType !== RECORD_TOKEN_TYPE
  ) {
    return oauthResponse.invalidRequest(h)
  }

  const decodedOrError = pipe(subjectToken, verifyToken)
  if (decodedOrError._tag === 'Left') {
    return oauthResponse.invalidSubjectToken(h)
  }
  const { sub } = decodedOrError.right

  // @TODO: If in the future we have a fine grained access control for records, check here that the subject actually has access to the record requested
  const recordToken = await createTokenForRecordValidation(
    sub as UUID,
    recordId
  )

  return oauthResponse.success(h, recordToken)
}
