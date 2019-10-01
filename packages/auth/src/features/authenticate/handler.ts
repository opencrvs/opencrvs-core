import * as Hapi from 'hapi'
import * as Joi from 'joi'
import {
  authenticate,
  storeUserInformation,
  createToken,
  generateAndSendVerificationCode
} from '@auth/features/authenticate/service'
import { generateNonce } from '@auth/features/verifyCode/service'
import { unauthorized } from 'boom'
import { WEB_USER_JWT_AUDIENCES, JWT_ISSUER } from '@auth/constants'

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

  await generateAndSendVerificationCode(nonce, result.mobile, result.scope)

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
