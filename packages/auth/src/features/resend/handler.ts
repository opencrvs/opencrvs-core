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

  let userInformation
  try {
    userInformation = await getStoredUserInformation(nonce)
  } catch (err) {
    return unauthorized()
  }

  const { mobile, claims } = userInformation

  const isDemoUser = claims.indexOf('demo') > -1

  let verificationCode
  if (isDemoUser) {
    verificationCode = '000000'
  } else {
    console.log('Calling generateVerificationCode')
    verificationCode = await generateVerificationCode(nonce, mobile)
  }

  if (!PRODUCTION || isDemoUser) {
    logger.info('Resending a verification SMS', {
      mobile,
      verificationCode
    })
  } else {
    console.log('Calling sendVerificationCode')
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
