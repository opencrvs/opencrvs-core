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
  verifyUser,
  storeRetrievalStepInformation,
  RetrievalSteps,
  RETRIEVAL_FLOW_USER_NAME,
  RETRIEVAL_FLOW_PASSWORD
} from '@auth/features/retrievalSteps/verifyUser/service'
import { generateAndSendVerificationCode } from '@auth/features/authenticate/service'
import {
  NotificationEvent,
  generateNonce
} from '@auth/features/verifyCode/service'
import { unauthorized } from '@hapi/boom'
interface IVerifyUserPayload {
  mobile?: string
  email?: string
  retrieveFlow: string
}

interface IVerifyUserResponse {
  nonce: string
  securityQuestionKey?: string
}

export default async function verifyUserHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IVerifyUserResponse> {
  const payload = request.payload as IVerifyUserPayload
  let result
  try {
    result = await verifyUser(payload.mobile, payload.email)
  } catch (err) {
    throw unauthorized()
  }
  const nonce = generateNonce()
  const isUserNameRetrievalFlow =
    payload.retrieveFlow.toLowerCase() === RETRIEVAL_FLOW_USER_NAME

  await storeRetrievalStepInformation(
    nonce,
    isUserNameRetrievalFlow
      ? RetrievalSteps.NUMBER_VERIFIED
      : RetrievalSteps.WAITING_FOR_VERIFICATION,
    result
  )

  if (!isUserNameRetrievalFlow) {
    const notificationEvent = NotificationEvent.PASSWORD_RESET

    await generateAndSendVerificationCode(
      nonce,
      result.scope,
      notificationEvent,
      result.userFullName,
      result.mobile,
      result.email
    )
  }

  const response: IVerifyUserResponse = {
    nonce
  }
  if (isUserNameRetrievalFlow) {
    response.securityQuestionKey = result.securityQuestionKey
  }
  return response
}

export const requestSchema = Joi.object({
  mobile: Joi.string(),
  email: Joi.string().email(),
  retrieveFlow: Joi.string()
    .valid(RETRIEVAL_FLOW_USER_NAME, RETRIEVAL_FLOW_PASSWORD)
    .required()
})

export const responseSchema = Joi.object({
  nonce: Joi.string().required(),
  securityQuestionKey: Joi.string().optional()
})
