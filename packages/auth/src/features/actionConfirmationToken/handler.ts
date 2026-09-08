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
import { decodeScope, EncodedScope, UUID } from '@opencrvs/commons'
import {
  createTokenForActionConfirmation,
  verifyToken
} from '@auth/features/authenticate/service'

interface IAuthResponse {
  token: string
}

/**
 * Scopes carried over from the requesting user's token into the action
 * confirmation token. A country configuration handler may read the record it
 * was asked to confirm; it has no business holding the caller's write scopes.
 */
const CARRIED_OVER_SCOPE_TYPES = ['record.read']

/**
 * Mints a token bound to a single requested action, for core to hand to the
 * country configuration when requesting action confirmation.
 *
 * The identity comes from the caller's own token rather than the payload, so
 * this can only ever mint a confirmation token for whoever already
 * authenticated. Reachable on the internal network only.
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

  const { sub, userType } = decodedOrError.right

  /*
   * Every token that can clear `verifyToken` carries `userType` — the only
   * signing paths that omit it (the internal service and initialisation tokens)
   * lack the `opencrvs:auth-user` audience it requires. It is optional in the
   * payload codec rather than in practice, so refuse instead of guessing:
   * assuming `user` here would mint a confirmation token asserting user
   * identity for what may be a system client.
   */
  if (!userType) {
    return h.response({ error: 'invalid_subject_token' }).code(401)
  }

  const extraScopes = decodedOrError.right.scope.filter(
    (scope): scope is EncodedScope => {
      const decoded = decodeScope(scope as EncodedScope)

      return CARRIED_OVER_SCOPE_TYPES.some((type) => type === decoded?.type)
    }
  )

  const token = await createTokenForActionConfirmation(
    { eventId, actionId },
    sub as UUID,
    userType,
    extraScopes
  )

  return { token }
}

export const requestSchema = Joi.object({
  eventId: Joi.string().uuid().required(),
  actionId: Joi.string().uuid().required()
})

export const responseSchema = Joi.object({
  token: Joi.string().optional()
})
