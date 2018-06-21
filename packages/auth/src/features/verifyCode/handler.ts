import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'
import { checkVerificationCode } from './service'
import {
  getStoredUserInformation,
  createToken
} from 'src/features/authenticate/service'

interface IVerifyPayload {
  nonce: string
  code: string
}

interface IVerifyResponse {
  token: string
}

export default async function authenticateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { code, nonce } = request.payload as IVerifyPayload

  if (await checkVerificationCode(nonce, code)) {
    const { userId, role } = await getStoredUserInformation(nonce)

    const token = await createToken(userId, role)
    const response: IVerifyResponse = { token }
    return response
  }

  return unauthorized()
}

export const requestSchema = Joi.object({
  nonce: Joi.string(),
  code: Joi.string()
})
export const responseSchma = Joi.object({
  token: Joi.string()
})
