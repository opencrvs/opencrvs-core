import * as Hapi from 'hapi'
import * as Joi from 'joi'
import {
  authenticate,
  storeUserInformation,
  createToken
} from '@auth/features/authenticate/service'
import {
  generateVerificationCode,
  sendVerificationCode,
  generateNonce,
  storeVerificationCode
} from '@auth/features/verifyCode/service'
import { logger } from '@auth/logger'
import { unauthorized } from 'boom'
import { PRODUCTION, WEB_USER_JWT_AUDIENCES, JWT_ISSUER } from '@auth/constants'

interface IAuthPayload {
  username: string
  password: string
}

interface IAuthResponse {
  nonce: string
  mobile: string
  status: string
  token?: string
}

export default async function authenticateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IAuthResponse> {
  const payload = request.payload as IAuthPayload
  let result

  try {
    result = await authenticate(payload.username, payload.password)
  } catch (err) {
    throw unauthorized()
  }

  const nonce = generateNonce()
  await storeUserInformation(nonce, result.userId, result.scope, result.mobile)

  const isDemoUser = result.scope.indexOf('demo') > -1

  let verificationCode
  if (isDemoUser) {
    verificationCode = '000000'
    await storeVerificationCode(nonce, verificationCode)
  } else {
    verificationCode = await generateVerificationCode(nonce, result.mobile)
  }

  if (!PRODUCTION || isDemoUser) {
    logger.info('Sending a verification SMS', {
      mobile: result.mobile,
      verificationCode
    })
  } else {
    await sendVerificationCode(result.mobile, verificationCode)
  }

  const respose: IAuthResponse = {
    mobile: result.mobile,
    status: result.status,
    nonce
  }

  if (respose.status && respose.status === 'pending') {
    respose.token = await createToken(
      result.userId,
      result.scope,
      WEB_USER_JWT_AUDIENCES,
      JWT_ISSUER
    )
  }
  return respose
}

export const requestSchema = Joi.object({
  username: Joi.string(),
  password: Joi.string()
})

export const responseSchema = Joi.object({
  nonce: Joi.string(),
  mobile: Joi.string(),
  status: Joi.string(),
  token: Joi.string().optional()
})
