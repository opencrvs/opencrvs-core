import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { authenticate, storeUserInformation } from './service'
import {
  generateVerificationCode,
  sendVerificationCode
} from 'src/features/verifyCode/service'
import { logger } from 'src/logger'
import { unauthorized } from 'boom'
import { PRODUCTION } from 'src/constants'

interface IAuthPayload {
  mobile: string
  password: string
}

interface IAuthResponse {
  nonce: string
  mobile: string
}

export default async function authenticateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IAuthResponse> {
  const payload = request.payload as IAuthPayload
  let result

  try {
    result = await authenticate(payload.mobile, payload.password)
  } catch (err) {
    throw unauthorized()
  }

  await storeUserInformation(result.nonce, result.userId, result.role)

  const verificationCode = await generateVerificationCode(
    result.nonce,
    result.mobile
  )

  if (!PRODUCTION) {
    logger.info('Sending a verification SMS', {
      mobile: result.mobile,
      verificationCode
    })
  } else {
    await sendVerificationCode(result.mobile, verificationCode)
  }

  return { mobile: result.mobile, nonce: result.nonce }
}

export const requestSchema = Joi.object({
  mobile: Joi.string(),
  password: Joi.string()
})

export const responseSchema = Joi.object({
  nonce: Joi.string(),
  mobile: Joi.string()
})
