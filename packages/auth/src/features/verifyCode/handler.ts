import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'
import { checkVerificationCode, deleteUsedVerificationCode } from './service'
import {
  getStoredUserInformation,
  createToken,
  getTokenAudience
} from 'src/features/authenticate/service'
import { logger } from 'src/logger'

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
  } catch (err) {
    logger.error(err)
    return unauthorized()
  }
  const { userId, roles } = await getStoredUserInformation(nonce)
  const token = await createToken(userId, roles, getTokenAudience(roles))
  await deleteUsedVerificationCode(nonce)
  const response: IVerifyResponse = { token }
  return response
}

export const requestSchema = Joi.object({
  nonce: Joi.string(),
  code: Joi.string()
})
export const responseSchma = Joi.object({
  token: Joi.string()
})
