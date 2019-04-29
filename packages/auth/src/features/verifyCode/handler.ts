import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'
import { checkVerificationCode, deleteUsedVerificationCode } from './service'
import {
  getStoredUserInformation,
  createToken
} from 'src/features/authenticate/service'
import { logger } from 'src/logger'
import { WEB_USER_JWT_AUDIENCES, JWT_ISSUER } from 'src/constants'

interface IVerifyPayload {
  nonce: string
  code: string
  mobile: string
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
  code: Joi.string(),
  mobile: Joi.string()
})
export const responseSchma = Joi.object({
  token: Joi.string()
})
