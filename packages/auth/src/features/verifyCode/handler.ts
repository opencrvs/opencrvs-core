import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'
import {
  checkVerificationCode,
  deleteUsedVerificationCode
} from '@auth/features/verifyCode/service'
import {
  getStoredUserInformation,
  createToken
} from '@auth/features/authenticate/service'
import { logger } from '@auth/logger'
import { WEB_USER_JWT_AUDIENCES, JWT_ISSUER } from '@auth/constants'

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
  const { userId, scope } = await getStoredUserInformation(nonce)
  const token = await createToken(
    userId,
    scope,
    WEB_USER_JWT_AUDIENCES,
    JWT_ISSUER
  )
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
