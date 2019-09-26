import * as Hapi from 'hapi'
import * as Joi from 'joi'

import { changePassword } from '@auth/features/changePassword/service'
import {
  getRetrievalStepInformation,
  RetrievalSteps,
  deleteRetrievalStepInformation
} from '@auth/features/verifyUser/service'
import { unauthorized } from 'boom'

interface IPayload {
  newPassword: string
  nonce: string
}

export default async function changePasswordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IPayload
  const retrivalStepInformation = await getRetrievalStepInformation(
    payload.nonce
  ).catch(() => {
    throw unauthorized()
  })

  if (retrivalStepInformation.status !== RetrievalSteps.SECURITY_Q_VERIFIED) {
    return h.response().code(401)
  }
  await changePassword(retrivalStepInformation.userId, payload.newPassword)
  await deleteRetrievalStepInformation(payload.nonce)
  return h.response().code(200)
}

export const reqChangePasswordSchema = Joi.object({
  newPassword: Joi.string(),
  nonce: Joi.string()
})
