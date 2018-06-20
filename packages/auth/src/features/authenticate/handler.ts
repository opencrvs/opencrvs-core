import * as Hapi from 'hapi'
import * as Joi from 'joi'
import {
  authenticate,
  isUnauthorizedError,
  storeUserInformation
} from './service'
import {
  generateVerificationCode,
  sendVerificationCode
} from 'src/features/verifyCode/service'
import { unauthorized } from 'boom'

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
    if (isUnauthorizedError(err)) {
      throw unauthorized()
    }
    throw err
  }

  await storeUserInformation(result.nonce, result.userId, result.role)

  const verificationCode = await generateVerificationCode(
    result.nonce,
    result.mobile
  )

  await sendVerificationCode(result.mobile, verificationCode)

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
