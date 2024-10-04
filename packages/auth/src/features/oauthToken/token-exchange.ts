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

/**
 * Allows creating one-time use tokens for when a 3rd party system needs to confirm a registration
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
    subjectTokenType !== 'urn:opencrvs:oauth:token-type:access_token' ||
    requestedTokenType !==
      'urn:opencrvs:oauth:token-type:single_record_validate_token'
  ) {
    return oauthResponse.invalidRequest(h)
  }

  // @TODO: Get rid of overly functional code
  const decodedOrError = pipe(subjectToken, verifyToken)
  if (decodedOrError._tag === 'Left') {
    throw new Error('Invalid token')
  }
  const { sub } = decodedOrError.right

  // @TODO: Check if the user has access to the record

  const recordToken = await createTokenForRecordValidation(
    sub as UUID,
    recordId
  )

  return oauthResponse.success(h, recordToken)
}
