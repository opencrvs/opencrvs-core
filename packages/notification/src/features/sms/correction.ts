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
  IMessageRecipient,
  sendNotification
} from '@notification/features/sms/utils'
import { templateNames } from '@notification/i18n/messages'

interface CorrectionRejectedInput extends IMessageRecipient {
  reason: string
  event: string
  trackingId: string
}

interface CorrectionApprovedInput extends IMessageRecipient {
  event: string
  trackingId: string
}

export const sendCorrectionRejectedNotificationInput = Joi.object({
  msisdn: Joi.string().allow('').optional(),
  email: Joi.string().allow('').optional(),
  event: Joi.string().required(),
  trackingId: Joi.string().length(7).required(),
  reason: Joi.string().required(),
  userFullName: Joi.array().items(
    Joi.object({
      given: Joi.array().items(Joi.string()).required(),
      use: Joi.string().required(),
      family: Joi.string().required()
    }).unknown(true)
  )
})
export const sendCorrectionApprovedNotificationInput = Joi.object({
  msisdn: Joi.string().allow('').optional(),
  email: Joi.string().allow('').optional(),
  event: Joi.string().required(),
  trackingId: Joi.string().length(7).required(),
  userFullName: Joi.array().items(
    Joi.object({
      given: Joi.array().items(Joi.string()).required(),
      use: Joi.string().required(),
      family: Joi.string().required()
    }).unknown(true)
  )
})

export async function sendCorrectionRejectedNotification(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as CorrectionRejectedInput

  const nameObject = payload.userFullName.find((obj) => obj.use === 'en')

  const firstNames = nameObject?.given[0] || ''

  await sendNotification(
    request,
    {
      sms: templateNames.CORRECTION_REJECTED['sms'],
      email: templateNames.CORRECTION_REJECTED['email']
    },
    { email: payload.email, sms: payload.msisdn },
    'user',
    {
      firstNames,
      lastName: nameObject?.family || '',
      event: payload.event.toLowerCase(),
      trackingId: payload.trackingId,
      reason: payload.reason
    }
  )
  return h.response().code(200)
}

export async function sendCorrectionApprovedNotification(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as CorrectionApprovedInput

  const nameObject = payload.userFullName.find((obj) => obj.use === 'en')

  const firstNames = nameObject?.given[0] || ''

  await sendNotification(
    request,
    {
      sms: templateNames.CORRECTION_APPROVED['sms'],
      email: templateNames.CORRECTION_APPROVED['email']
    },
    { email: payload.email, sms: payload.msisdn },
    'user',
    {
      firstNames,
      lastName: nameObject?.family || '',
      event: payload.event.toLowerCase(),
      trackingId: payload.trackingId
    }
  )
  return h.response().code(200)
}
