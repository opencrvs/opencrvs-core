import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'
import { getStoredUserInformation } from '@auth/features/authenticate/service'
import {
  generateVerificationCode,
  sendVerificationCode
} from '@auth/features/verifyCode/service'
import { PRODUCTION } from '@auth/constants'
import { logger } from '@auth/logger'

interface IRefreshPayload {
  nonce: string
}

export default async function refreshHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { nonce } = request.payload as IRefreshPayload

  let userInformation
  try {
    userInformation = await getStoredUserInformation(nonce)
  } catch (err) {
    return unauthorized()
  }

  const { mobile, scope } = userInformation

  const isDemoUser = scope.indexOf('demo') > -1

  let verificationCode
  if (isDemoUser) {
    verificationCode = '000000'
  } else {
    verificationCode = await generateVerificationCode(nonce, mobile)
  }

  if (!PRODUCTION || isDemoUser) {
    logger.info('Resending a verification SMS', {
      mobile,
      verificationCode
    })
  } else {
    await sendVerificationCode(mobile, verificationCode)
  }

  return { nonce }
}

export const requestSchema = Joi.object({
  nonce: Joi.string()
})
export const responseSchma = Joi.object({
  nonce: Joi.string()
})
