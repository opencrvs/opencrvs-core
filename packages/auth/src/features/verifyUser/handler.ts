import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { verifyUser } from '@auth/features/verifyUser/service'
import { storeUserInformation } from '@auth/features/authenticate/service'
import {
  generateVerificationCode,
  sendVerificationCode,
  generateNonce,
  storeVerificationCode
} from '@auth/features/verifyCode/service'
import { logger } from '@auth/logger'
import { unauthorized } from 'boom'
import { PRODUCTION } from '@auth/constants'

interface IVerifyUserPayload {
  mobile: string
}

interface IVerifyUserResponse {
  nonce: string
  mobile: string
}

export default async function verifyUserHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IVerifyUserResponse> {
  const payload = request.payload as IVerifyUserPayload
  let result

  try {
    result = await verifyUser(payload.mobile)
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

  const respose: IVerifyUserResponse = {
    mobile: result.mobile,
    nonce
  }
  return respose
}

export const requestSchema = Joi.object({
  mobile: Joi.string()
})

export const responseSchema = Joi.object({
  nonce: Joi.string(),
  mobile: Joi.string()
})
