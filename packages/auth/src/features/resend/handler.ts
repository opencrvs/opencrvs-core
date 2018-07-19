import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'
import { getStoredUserInformation } from 'src/features/authenticate/service'
import {
  generateVerificationCode,
  sendVerificationCode
} from 'src/features/verifyCode/service'
import { PRODUCTION } from 'src/constants'
import { logger } from 'src/logger'

interface IRefreshPayload {
  nonce: string
}

export default async function refreshHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { nonce } = request.payload as IRefreshPayload
  try {
    const { mobile } = await getStoredUserInformation(nonce)
    const verificationCode = await generateVerificationCode(nonce, mobile)

    if (!PRODUCTION) {
      logger.info('Resending a verification SMS', {
        mobile,
        verificationCode
      })
    } else {
      await sendVerificationCode(mobile, verificationCode)
    }
  } catch (err) {
    return unauthorized()
  }
  return { nonce }
}

export const requestSchema = Joi.object({
  nonce: Joi.string()
})
export const responseSchma = Joi.object({
  nonce: Joi.string()
})
