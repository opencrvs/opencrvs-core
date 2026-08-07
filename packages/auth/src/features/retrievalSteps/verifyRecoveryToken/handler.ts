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
  storeRetrievalStepInformation,
  RetrievalSteps
} from '@auth/features/retrievalSteps/verifyUser/service'
import { unauthorized } from '@hapi/boom'

interface IVerifyRecoveryTokenPayload {
  token: string
}

interface IVerifyRecoveryTokenResponse {
  nonce: string
  securityQuestionKey: string
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

  const nonce = await rotateRetrievalStepNonce(token)
  await storeRetrievalStepInformation(
    nonce,
    RetrievalSteps.NUMBER_VERIFIED,
    retrievalStepInformation
  )

  return {
    nonce,
    securityQuestionKey: retrievalStepInformation.securityQuestionKey
  }
}

export const requestSchema = Joi.object({
  token: Joi.string().required()
})

export const responseSchema = Joi.object({
  nonce: Joi.string(),
  securityQuestionKey: Joi.string()
})
