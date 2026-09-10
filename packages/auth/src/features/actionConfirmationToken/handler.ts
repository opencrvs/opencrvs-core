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
import * as Joi from 'joi'
import { UUID } from '@opencrvs/commons'
import {
  createTokenForActionConfirmation,
  verifyToken
} from '@auth/features/authenticate/service'

interface IAuthResponse {
  token: string
}

/**
 * Mints the token core hands to the country configuration when requesting
 * action confirmation.
 *
 * The minted token carries no scopes and no caller identity — it only proves to
 * the country configuration that an internal core service is calling (see
 * {@link createTokenForActionConfirmation}). We still require the caller to
 * present a valid token so that an arbitrary internal caller cannot mint one;
 * its contents are otherwise not carried over. Reachable on the internal
 * network only.
 */
export default async function actionConfirmationTokenHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IAuthResponse | Hapi.ResponseObject> {
  const { eventId, actionId } = request.payload as {
    eventId: UUID
    actionId: UUID
  }

  const authorization = request.headers.authorization as string | undefined
  const subjectToken = authorization?.replace(/^Bearer\s+/, '')

  if (!subjectToken) {
    return h.response({ error: 'invalid_request' }).code(400)
  }

  const decodedOrError = verifyToken(subjectToken)

  if (decodedOrError._tag === 'Left') {
    return h.response({ error: 'invalid_subject_token' }).code(401)
  }

  const token = await createTokenForActionConfirmation({ eventId, actionId })

  return { token }
}

export const requestSchema = Joi.object({
  eventId: Joi.string().uuid().required(),
  actionId: Joi.string().uuid().required()
})

export const responseSchema = Joi.object({
  token: Joi.string().optional()
})
