import * as Hapi from 'hapi'
import * as Joi from 'joi'

import { verifySecurityAnswer } from './service'

import { unauthorized } from 'boom'
import {
  getRetrievalStepInformation,
  RetrievalSteps,
  storeRetrievalStepInformation
} from '@auth/features/verifyUser/service'

interface IPayload {
  questionKey: string
  answer: string
  nonce: string
}

export default async function verifySecurityQuestionHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IPayload

  const retrivalStepInformation = await getRetrievalStepInformation(
    payload.nonce
  )

  if (
    !retrivalStepInformation ||
    retrivalStepInformation.status !== RetrievalSteps.NUMBER_VERIFIED
  ) {
    return unauthorized()
  }

  try {
    await verifySecurityAnswer(
      retrivalStepInformation.userId,
      payload.questionKey,
      payload.answer
    )
  } catch (err) {
    return unauthorized()
  }

  // Updates nonce status
  await storeRetrievalStepInformation(
    payload.nonce,
    retrivalStepInformation.userId,
    retrivalStepInformation.scope,
    retrivalStepInformation.mobile,
    RetrievalSteps.SECURITY_Q_VERIFIED,
    retrivalStepInformation.question
  )

  return h.response().code(200)
}

export const verifySecurityQuestionSchema = Joi.object({
  questionKey: Joi.string(),
  answer: Joi.string(),
  nonce: Joi.string()
})
