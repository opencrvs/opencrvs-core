import * as Hapi from 'hapi'
import * as Joi from 'joi'

import {
  changePassword,
  getPasswordChangeCodeDetails
} from '@auth/features/changePassword/service'

interface IPayload {
  newPassword: string
  nonce: string
}

export default async function changePasswordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IPayload
  const code = await getPasswordChangeCodeDetails(payload.nonce)
  if (!code) {
    return h.response().code(401)
  }
  await changePassword(code.userId, payload.newPassword)
  return h.response().code(200)
}

export const reqChangePasswordSchema = Joi.object({
  newPassword: Joi.string(),
  nonce: Joi.string()
})
