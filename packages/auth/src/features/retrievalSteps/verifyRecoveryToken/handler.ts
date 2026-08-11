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
 * Holding the emailed token is the proof of mailbox control the old 6-digit
 * code provided, so exchanging it advances the record the same way. Rotating
 * the nonce makes it single-use — the clicked URL dies on redemption.
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
   * No retrieveFlow means the link was emailed before this field existed.
   * Guessing the flow could send the wrong thing, so reject and let the user
   * request a fresh link. These legacy records were written without a TTL, so
   * operators should drop stale `retrieval_step_*` keys at deploy.
   */
  if (!retrievalStepInformation.retrieveFlow) {
    throw unauthorized()
  }

  // Rotation claims the key atomically; a concurrent exchange that loses the
  // race throws here and fails closed with the same 401 as any invalid token.
  const nonce = await rotateRetrievalStepNonce(token).catch(() => {
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
