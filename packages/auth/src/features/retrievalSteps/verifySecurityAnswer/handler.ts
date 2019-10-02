import * as Hapi from 'hapi'
import * as Joi from 'joi'

import { verifySecurityAnswer, IVerifySecurityAnswerResponse } from './service'

import { unauthorized } from 'boom'
import {
  getRetrievalStepInformation,
  RetrievalSteps,
  storeRetrievalStepInformation
} from '@auth/features/retrievalSteps/verifyUser/service'

interface IPayload {
  answer: string
  nonce: string
}

interface IResponse {
  matched: boolean
  securityQuestionKey?: string
}

export default async function verifySecurityQuestionHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IPayload

  const retrivalStepInformation = await getRetrievalStepInformation(
    payload.nonce
  ).catch(() => {
    throw unauthorized()
  })

  if (
    retrivalStepInformation.status !== RetrievalSteps.NUMBER_VERIFIED.toString()
  ) {
    return unauthorized()
  }
  let verificationResult: IVerifySecurityAnswerResponse
  try {
    verificationResult = await verifySecurityAnswer(
      retrivalStepInformation.userId,
      retrivalStepInformation.securityQuestionKey,
      payload.answer
    )
  } catch (err) {
    return unauthorized()
  }

  // Updates nonce status
  await storeRetrievalStepInformation(
    payload.nonce,
    retrivalStepInformation.userId,
    retrivalStepInformation.username,
    retrivalStepInformation.mobile,
    verificationResult.matched
      ? RetrievalSteps.SECURITY_Q_VERIFIED
      : RetrievalSteps.NUMBER_VERIFIED,
    verificationResult.questionKey // in case of miss-match, updating the new key otherwise same key
  )

  const response: IResponse = {
    matched: verificationResult.matched
  }
  if (!verificationResult.matched) {
    response.securityQuestionKey = verificationResult.questionKey
  }
  return response
}

export const verifySecurityQuestionSchema = Joi.object({
  answer: Joi.string().required(),
  nonce: Joi.string().required()
})

export const verifySecurityQuestionResSchema = Joi.object({
  matched: Joi.bool().required(),
  securityQuestionKey: Joi.string().optional()
})
