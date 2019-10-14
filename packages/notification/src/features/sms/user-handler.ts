import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { HapiRequest, ISMSPayload } from '@notification/features/sms/handler'
import { buildAndSendSMS } from '@notification/features/sms/utils'
import { logger } from '@notification/logger'

interface ICredentialsPayload extends ISMSPayload {
  username: string
  password: string
}

interface IRetrieveUserNamePayload extends ISMSPayload {
  username: string
}

export async function sendUserCredentials(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as ICredentialsPayload
  // TODO: need to remove this once dev env check code is here
  logger.info(`Username: ${payload.username}`)
  logger.info(`Password: ${payload.password}`)

  await buildAndSendSMS(
    request,
    payload.msisdn,
    'userCredentialsNotification',
    {
      username: payload.username,
      password: payload.password
    }
  )
  return h.response().code(200)
}

export async function retrieveUserName(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IRetrieveUserNamePayload
  logger.info(`Username: ${payload.username}`)
  await buildAndSendSMS(
    request,
    payload.msisdn,
    'retieveUserNameNotification',
    {
      username: payload.username
    }
  )
  return h.response().code(200)
}

export const userCredentialsNotificationSchema = Joi.object({
  msisdn: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required()
})

export const retrieveUserNameNotificationSchema = Joi.object({
  msisdn: Joi.string().required(),
  username: Joi.string().required()
})
