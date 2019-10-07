import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { HapiRequest, ISMSPayload } from '@notification/features/sms/handler'
import { buildAndSendSMS } from '@notification/features/sms/utils'
import { logger } from '@notification/logger'

export interface IDeclarationPayload extends ISMSPayload {
  trackingid: string
  name: string
}

export interface IRegistrationPayload extends ISMSPayload {
  name: string
}

export interface IRejectionPayload extends ISMSPayload {
  trackingid: string
  name: string
}

export async function sendBirthDeclarationConfirmation(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IDeclarationPayload
  logger.info(
    `Notification service sendBirthDeclarationConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )
  await buildAndSendSMS(
    request,
    payload.msisdn,
    'birthDeclarationNotification',
    {
      name: payload.name,
      trackingid: payload.trackingid
    }
  )
  return h.response().code(200)
}

export async function sendBirthRegistrationConfirmation(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IRegistrationPayload
  logger.info(
    `Notification service sendBirthRegistrationConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )
  await buildAndSendSMS(
    request,
    payload.msisdn,
    'birthRegistrationNotification',
    {
      name: payload.name
    }
  )
  return h.response().code(200)
}

export async function sendBirthRejectionConfirmation(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IRejectionPayload
  logger.info(
    `Notification service sendBirthRejectionConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )
  await buildAndSendSMS(request, payload.msisdn, 'birthRejectionNotification', {
    name: payload.name,
    trackingid: payload.trackingid
  })
  return h.response().code(200)
}

export const declarationNotificationSchema = Joi.object({
  msisdn: Joi.string().required(),
  trackingid: Joi.string()
    .length(7)
    .required(),
  name: Joi.string().required()
})

export const registrationNotificationSchema = Joi.object({
  msisdn: Joi.string().required(),
  name: Joi.string().required()
})

export const rejectionNotificationSchema = Joi.object({
  msisdn: Joi.string().required(),
  trackingid: Joi.string()
    .length(7)
    .required(),
  name: Joi.string().required()
})
