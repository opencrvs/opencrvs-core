/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import {
  sendNotification,
  IEventMessageRecipient
} from '@notification/features/sms/utils'
import { logger } from '@notification/logger'
import { messageKeys } from '@notification/i18n/messages'

export interface IInProgressPayload extends IEventMessageRecipient {
  trackingId: string
  crvsOffice: string
}

export interface IDeclarationPayload extends IEventMessageRecipient {
  trackingId: string
  name: string
}

export interface IRegistrationPayload extends IEventMessageRecipient {
  name: string
  informantName: string
  registrationNumber: string
  trackingId: string
}

export interface IRejectionPayload extends IEventMessageRecipient {
  trackingId: string
  name: string
  informantName: string
}

export async function sendBirthInProgressConfirmation(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IInProgressPayload
  logger.info(
    `Notification service sendBirthInProgressConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )
  const templateName = messageKeys.birthInProgressNotification
  await sendNotification(
    request,
    {
      sms: templateName,
      email: templateName
    },
    {
      sms: payload.recipient.sms,
      email: payload.recipient.email
    },
    'informant',
    {
      trackingId: payload.trackingId,
      crvsOffice: payload.crvsOffice
    }
  )
  return h.response().code(200)
}

export async function sendBirthDeclarationConfirmation(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IDeclarationPayload
  logger.info(
    `Notification service sendBirthDeclarationConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )
  const templateName = messageKeys.birthDeclarationNotification
  await sendNotification(
    request,
    { sms: templateName, email: templateName },
    { sms: payload.recipient.sms, email: payload.recipient.email },
    'informant',
    {
      name: payload.name,
      trackingId: payload.trackingId
    }
  )
  return h.response().code(200)
}

export async function sendBirthRegistrationConfirmation(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IRegistrationPayload
  logger.info(
    `Notification service sendBirthRegistrationConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )
  const templateName = messageKeys.birthRegistrationNotification
  await sendNotification(
    request,
    { sms: templateName, email: templateName },
    { sms: payload.recipient.sms, email: payload.recipient.email },
    'informant',
    {
      name: payload.name,
      informantName: payload.informantName,
      trackingId: payload.trackingId,
      registrationNumber: payload.registrationNumber
    }
  )
  return h.response().code(200)
}

export async function sendBirthRejectionConfirmation(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IRejectionPayload
  logger.info(
    `Notification service sendBirthRejectionConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )

  const templateName = messageKeys.birthRejectionNotification
  await sendNotification(
    request,
    { sms: templateName, email: templateName },
    { sms: payload.recipient.sms, email: payload.recipient.email },
    'informant',
    {
      name: payload.name,
      informantName: payload.informantName,
      trackingId: payload.trackingId
    }
  )
  return h.response().code(200)
}

export const inProgressNotificationSchema = Joi.object({
  recipient: Joi.object({
    email: Joi.string().allow(null),
    sms: Joi.string().allow(null)
  }),
  trackingId: Joi.string().length(7).required(),
  crvsOffice: Joi.string().required()
})

export const declarationNotificationSchema = Joi.object({
  recipient: Joi.object({
    email: Joi.string().allow(null),
    sms: Joi.string().allow(null)
  }),
  trackingId: Joi.string().length(7).required(),
  name: Joi.string().required()
})

export const registrationNotificationSchema = Joi.object({
  recipient: Joi.object({
    email: Joi.string().allow(null),
    sms: Joi.string().allow(null)
  }),
  name: Joi.string().required(),
  informantName: Joi.string(),
  trackingId: Joi.string().length(7).required(),
  registrationNumber: Joi.string().required()
})

export const rejectionNotificationSchema = Joi.object({
  recipient: Joi.object({
    email: Joi.string().allow(null),
    sms: Joi.string().allow(null)
  }),
  trackingId: Joi.string().length(7).required(),
  name: Joi.string().required()
})
