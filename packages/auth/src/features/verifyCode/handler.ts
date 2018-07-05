import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'
import { checkVerificationCode, deleteUsedVerificationCode } from './service'
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
  try {
    await checkVerificationCode(nonce, code)
    try {
      const { userId, role } = await getStoredUserInformation(nonce)
      try {
        const token = await createToken(userId, role)
        try {
          await deleteUsedVerificationCode(nonce)
          const response: IVerifyResponse = { token }
          return response
        } catch (err) {
          throw Error(err.message)
        }
      } catch (err) {
        throw Error(err.message)
      }
    } catch (err) {
      return unauthorized()
    }
  } catch (err) {
    return unauthorized()
  }
}

export const requestSchema = Joi.object({
  nonce: Joi.string(),
  code: Joi.string()
})
export const responseSchma = Joi.object({
  token: Joi.string()
})
