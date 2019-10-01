import * as Hapi from 'hapi'
import { HapiRequest } from '@notification/features/sms/handler'
import {
  IDeclarationPayload,
  IRegistrationPayload,
  IRejectionPayload
} from '@notification/features/sms/birth-handler'
import { buildAndSendSMS } from '@notification/features/sms/utils'
import { logger } from '@notification/logger'

export async function sendDeathDeclarationConfirmation(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IDeclarationPayload
  logger.info(
    `Notification service sendDeathDeclarationConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )
  await buildAndSendSMS(
    request,
    payload.msisdn,
    'deathDeclarationNotification',
    {
      name: payload.name,
      trackingid: payload.trackingid
    }
  )
  return h.response().code(200)
}

export async function sendDeathRegistrationConfirmation(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IRegistrationPayload
  logger.info(
    `Notification service sendDeathRegistrationConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )
  await buildAndSendSMS(
    request,
    payload.msisdn,
    'deathRegistrationNotification',
    {
      name: payload.name
    }
  )
  return h.response().code(200)
}

export async function sendDeathRejectionConfirmation(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IRejectionPayload
  logger.info(
    `Notification service sendDeathRejectionConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )
  await buildAndSendSMS(request, payload.msisdn, 'deathRejectionNotification', {
    name: payload.name,
    trackingid: payload.trackingid
  })
  return h.response().code(200)
}
