import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'
import {
  getStoredUserInformation,
  generateAndSendVerificationCode
} from '@auth/features/authenticate/service'
import { getRetrievalStepInformation } from '@auth/features/retrievalSteps/verifyUser/service'

interface IRefreshPayload {
  nonce: string
  retrievalFlow?: boolean
}

export default async function refreshHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { nonce, retrievalFlow } = request.payload as IRefreshPayload

  let userInformation
  try {
    userInformation = retrievalFlow
      ? await getRetrievalStepInformation(nonce)
      : await getStoredUserInformation(nonce)
  } catch (err) {
    return unauthorized()
  }

  const { mobile, scope } = userInformation

  await generateAndSendVerificationCode(nonce, mobile, scope)

  return { nonce }
}

export const requestSchema = Joi.object({
  nonce: Joi.string(),
  retrievalFlow: Joi.boolean().optional()
})
export const responseSchma = Joi.object({
  nonce: Joi.string()
})
