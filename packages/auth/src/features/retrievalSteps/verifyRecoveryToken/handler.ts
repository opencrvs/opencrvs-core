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
import {
  getRetrievalStepInformation,
  rotateRetrievalStepNonce,
  RetrievalSteps,
  RETRIEVAL_FLOW_USER_NAME,
  RETRIEVAL_FLOW_PASSWORD,
  type RetrieveFlow
} from '@auth/features/retrievalSteps/verifyUser/service'
import { unauthorized } from '@hapi/boom'

interface IVerifyRecoveryTokenPayload {
  token: string
}

interface IVerifyRecoveryTokenResponse {
  nonce: string
  securityQuestionKey: string
  retrieveFlow: RetrieveFlow
}

/*
 * Possession of the emailed token is the proof of mailbox control that a
 * typed 6-digit code used to provide, so exchanging it advances the
 * retrieval record exactly as the old code-entry step used to. Rotating the
 * nonce on exchange makes the token single-use: the URL the user clicked
 * stops working the moment it is redeemed, so a copy left in browser
 * history or a mail archive is inert.
 */
export default async function verifyRecoveryTokenHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IVerifyRecoveryTokenResponse> {
  const { token } = request.payload as IVerifyRecoveryTokenPayload

  const retrievalStepInformation = await getRetrievalStepInformation(
    token
  ).catch(() => {
    throw unauthorized()
  })

  if (
    retrievalStepInformation.status !==
    RetrievalSteps.WAITING_FOR_VERIFICATION.toString()
  ) {
    throw unauthorized()
  }

  /*
   * A record with no retrieveFlow predates this field: the recovery link
   * was emailed before this change deployed. We cannot safely guess which
   * flow it belongs to, so reject rather than default to either flow. These
   * legacy records were written with `redis.set` and no expiry at all, so
   * they persist indefinitely rather than dying with a TTL — operators
   * should drop stale `retrieval_step_*` keys at deploy rather than rely on
   * them expiring. The user can request a fresh link.
   */
  if (!retrievalStepInformation.retrieveFlow) {
    throw unauthorized()
  }

  // GETDEL inside rotateRetrievalStepNonce makes the claim atomic: if a
  // second concurrent exchange of this same token already won the race and
  // deleted the key, this throws and the loser fails closed with the same
  // 401 shape as any other invalid token — not a 500 that would reveal a
  // race happened.
  const nonce = await rotateRetrievalStepNonce(
    token,
    RetrievalSteps.NUMBER_VERIFIED
  ).catch(() => {
    throw unauthorized()
  })

  return {
    nonce,
    securityQuestionKey: retrievalStepInformation.securityQuestionKey,
    retrieveFlow: retrievalStepInformation.retrieveFlow
  }
}

export const requestSchema = Joi.object({
  // crypto.randomBytes(16).toString('base64') — the token this endpoint
  // actually issues — is 24 characters. 64 is generous headroom while still
  // bounding the size of the Redis key this value gets embedded into.
  token: Joi.string().max(64).required()
})

export const responseSchema = Joi.object({
  nonce: Joi.string(),
  securityQuestionKey: Joi.string(),
  retrieveFlow: Joi.string().valid(
    RETRIEVAL_FLOW_USER_NAME,
    RETRIEVAL_FLOW_PASSWORD
  )
})
