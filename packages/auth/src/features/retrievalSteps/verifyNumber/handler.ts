import * as Hapi from 'hapi'
import * as Joi from 'joi'
import {
  storeRetrievalStepInformation,
  getRetrievalStepInformation,
  RetrievalSteps,
  IRetrievalStepInformation
} from '@auth/features/retrievalSteps/verifyUser/service'
import { checkVerificationCode } from '@auth/features/verifyCode/service'
import { unauthorized } from 'boom'
import { logger } from '@auth/logger'

interface IVerifyNumberPayload {
  nonce: string
  code: string
}

interface IVerifyNumberResponse {
  nonce: string
  securityQuestionKey: string
}

export default async function verifyNumberHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IVerifyNumberResponse> {
  const payload = request.payload as IVerifyNumberPayload
  let retrievalStepInfo: IRetrievalStepInformation
  // Looks for step1 data. Throws exception if not found
  retrievalStepInfo = await getRetrievalStepInformation(payload.nonce).catch(
    () => {
      throw unauthorized()
    }
  )
  // Throws exception if not ready for step2
  if (
    retrievalStepInfo.status !==
    RetrievalSteps.WAITING_FOR_VERIFICATION.toString()
  ) {
    throw unauthorized()
  }
  try {
    // Matchs verification code. Throws exception if doesn't
    await checkVerificationCode(payload.nonce, payload.code)
  } catch (err) {
    logger.error(err)
    throw unauthorized()
  }
  // Update retrievalstep info with new status NUMBER_VERIFIED
  await storeRetrievalStepInformation(
    payload.nonce,
    retrievalStepInfo.userId,
    retrievalStepInfo.username,
    retrievalStepInfo.mobile,
    RetrievalSteps.NUMBER_VERIFIED,
    retrievalStepInfo.securityQuestionKey
  )
  // Returns the securityQuestionKey with nonce
  const respose: IVerifyNumberResponse = {
    securityQuestionKey: retrievalStepInfo.securityQuestionKey,
    nonce: payload.nonce
  }
  return respose
}

export const requestSchema = Joi.object({
  nonce: Joi.string().required(),
  code: Joi.string().required()
})

export const responseSchema = Joi.object({
  nonce: Joi.string(),
  securityQuestionKey: Joi.string()
})
