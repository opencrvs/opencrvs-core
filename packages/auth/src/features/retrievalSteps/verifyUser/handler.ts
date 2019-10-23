import * as Hapi from 'hapi'
import * as Joi from 'joi'
import {
  verifyUser,
  storeRetrievalStepInformation,
  RetrievalSteps,
  RETRIEVAL_FLOW_USER_NAME,
  RETRIEVAL_FLOW_PASSWORD
} from '@auth/features/retrievalSteps/verifyUser/service'
import { generateAndSendVerificationCode } from '@auth/features/authenticate/service'
import { generateNonce } from '@auth/features/verifyCode/service'
import { unauthorized } from 'boom'

interface IVerifyUserPayload {
  mobile: string
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
    result = await verifyUser(payload.mobile)
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
    await generateAndSendVerificationCode(nonce, result.mobile, result.scope)
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
  mobile: Joi.string().required(),
  retrieveFlow: Joi.string()
    .valid(RETRIEVAL_FLOW_USER_NAME, RETRIEVAL_FLOW_PASSWORD)
    .required()
})

export const responseSchema = Joi.object({
  nonce: Joi.string().required(),
  securityQuestionKey: Joi.string().optional()
})
