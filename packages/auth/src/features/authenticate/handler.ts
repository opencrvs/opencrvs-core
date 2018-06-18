import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { authenticate, isUnauthorizedError } from './service'
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
  let mobile
  let nonce

  try {
    const result = await authenticate(payload.mobile, payload.password)
    mobile = result.mobile
    nonce = result.nonce
  } catch (err) {
    if (isUnauthorizedError(err)) {
      throw unauthorized()
    }
    throw err
  }

  const verificationCode = await generateVerificationCode(nonce, mobile)
  await sendVerificationCode(mobile, verificationCode)

  return { nonce, mobile }
}

export const requestSchema = Joi.object({
  mobile: Joi.string(),
  password: Joi.string()
})

export const responseSchema = Joi.object({
  nonce: Joi.string(),
  mobile: Joi.string()
})
