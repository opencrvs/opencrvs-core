/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { logger, maskEmail, maskSms } from '@countryconfig/logger'
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import { COUNTRY_LOGO_URL, SENDER_EMAIL_ADDRESS } from './constant'
import { sendEmail } from './email-service'
import { InformantTemplateType, getSMSTemplate, sendSMS } from './sms-service'
import {
  getTemplate,
  InformantNotificationVariables,
  renderTemplate,
  TriggerVariable
} from './email-templates'

import {
  Recipient,
  TriggerEvent,
  TriggerPayload
} from '@opencrvs/toolkit/notification'
import { LOGIN_URL } from '@countryconfig/constants'
import { applicationConfig } from '../application/application-config'
import { NameFieldValue } from '@opencrvs/toolkit/events'

type EmailPayloads = {
  subject: string
  html: string
  from: string
  to: string
}

export const emailSchema = Joi.object({
  subject: Joi.string().required(),
  html: Joi.string().required(),
  from: Joi.string().required(),
  to: Joi.string().required()
})

export async function emailHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as EmailPayloads

  if (process.env.NODE_ENV !== 'production') {
    logger.info(
      `Ignoring email due to NODE_ENV not being 'production'. Params: ${JSON.stringify(
        { ...payload, from: maskEmail(payload.from), to: maskEmail(payload.to) }
      )}`
    )

    return h.response().code(200)
  }

  await sendEmail(payload)
  return h.response().code(200)
}

export function makeNotificationHandler<T extends TriggerEvent>(event: T) {
  return async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { payload: maybePayload } = request

    const payloadValidation = TriggerPayload[event].safeParse(maybePayload)

    if (!payloadValidation.success) {
      return h
        .response({
          error: 'Invalid payload',
          details: payloadValidation.error
        })
        .code(400)
    }

    await sendUserNotification(
      event,
      payloadValidation.data as TriggerPayload[T]
    )

    return h.response().code(200)
  }
}

export function generateFailureLog({
  contact,
  name,
  event,
  reason
}: {
  contact: { mobile?: string; email?: string }
  name?: NameFieldValue
  event: TriggerEvent | InformantTemplateType
  reason: string
}) {
  contact.mobile &&= maskSms(contact.mobile)
  contact.email &&= maskEmail(contact.email)
  logger.info(
    `Ignoring notification due to ${reason}. Params: ${JSON.stringify({
      event,
      recipient: {
        ...contact,
        name: name ? name.firstname + ' ' + name.surname : ''
      }
    })}`
  )
  return
}

async function sendUserNotification<T extends TriggerEvent>(
  event: T,
  payload: TriggerPayload[T]
) {
  const variable = {
    ...convertPayloadToVariable({ event, payload } as TriggerEventPayloadPair),
    applicationName: applicationConfig.APPLICATION_NAME,
    countryLogo: COUNTRY_LOGO_URL
  }

  await notify({
    event,
    variable,
    recipient: payload.recipient,
    deliveryMethod: applicationConfig.USER_NOTIFICATION_DELIVERY_METHOD
  })
}

export interface NotificationParams {
  event: UserEventVariablePair['event'] | InformantEventVariablePair['event']
  variable:
    | UserEventVariablePair['variable']
    | InformantEventVariablePair['variable']
  recipient: Recipient
  deliveryMethod: string
}

export async function notify({
  event,
  variable,
  recipient,
  deliveryMethod
}: NotificationParams) {
  const { email, mobile, name, bcc } = recipient

  if (deliveryMethod === 'email') {
    if (!email) {
      generateFailureLog({
        contact: { mobile, email },
        name,
        event,
        reason:
          "Not having recipient email when USER_NOTIFICATION_DELIVERY_METHOD is 'email'"
      })

      return
    }

    const template = getTemplate(event)
    const subject = 'subject' in variable ? variable.subject : template.subject
    const emailBody = renderTemplate(template, variable)

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `Sending email to ${email} with subject: ${subject}, body: ${JSON.stringify(emailBody)}`
      )
      return
    }

    await sendEmail({
      subject,
      html: emailBody,
      from: SENDER_EMAIL_ADDRESS,
      to: email,
      bcc
    })

    return
  }

  if (deliveryMethod === 'sms') {
    if (!mobile) {
      generateFailureLog({
        contact: { mobile, email },
        name,
        event,
        reason:
          "Not having recipient mobile when USER_NOTIFICATION_DELIVERY_METHOD is 'sms'"
      })
      return
    }

    if (event === TriggerEvent.ALL_USER_NOTIFICATION) {
      generateFailureLog({
        contact: { mobile, email },
        name,
        event,
        reason:
          "USER_NOTIFICATION_DELIVERY_METHOD being 'sms' when trying to send all-user-notification"
      })
      return
    }

    await sendSMS(getSMSTemplate(event), variable, mobile, 'en')
    return
  }

  generateFailureLog({
    contact: { mobile, email },
    name,
    event,
    reason: `Invalid USER_NOTIFICATION_DELIVERY_METHOD. Options are 'email' or 'sms'. Found ${deliveryMethod}`
  })

  return
}

export type UserEventVariablePair<T extends TriggerEvent = TriggerEvent> = {
  [K in T]: {
    event: K
    variable: TriggerVariable[K]
  }
}[T]

type InformantEventVariablePair<
  T extends InformantTemplateType = InformantTemplateType
> = {
  [K in T]: {
    event: K
    variable: InformantNotificationVariables[K]
  }
}[T]

export type TriggerEventPayloadPair<T extends TriggerEvent = TriggerEvent> = {
  [K in T]: {
    event: K
    payload: TriggerPayload[K]
  }
}[T]

function convertPayloadToVariable({
  event,
  payload
}: TriggerEventPayloadPair): TriggerVariable[typeof event] {
  const firstname = payload.recipient.name?.firstname ?? ''
  switch (event) {
    case TriggerEvent.USER_CREATED:
      return {
        firstname,
        username: payload.username,
        temporaryPassword: payload.temporaryPassword,
        completeSetupUrl: LOGIN_URL,
        loginURL: LOGIN_URL
      }

    case TriggerEvent.USER_UPDATED:
      return {
        firstname,
        oldUsername: payload.oldUsername,
        newUsername: payload.newUsername
      }

    case TriggerEvent.USERNAME_REMINDER:
      return {
        firstname,
        username: payload.username
      }

    case TriggerEvent.RESET_PASSWORD:
      return {
        firstname,
        code: payload.code
      }

    case TriggerEvent.RESET_PASSWORD_BY_ADMIN:
      return {
        firstname,
        temporaryPassword: payload.temporaryPassword
      }

    case TriggerEvent.RESEND_INVITE:
      return {
        firstname,
        username: payload.username,
        temporaryPassword: payload.temporaryPassword,
        completeSetupUrl: LOGIN_URL,
        loginURL: LOGIN_URL
      }

    case TriggerEvent.TWO_FA:
    case TriggerEvent.CHANGE_EMAIL_ADDRESS:
    case TriggerEvent.CHANGE_PHONE_NUMBER:
      return {
        firstname,
        code: payload.code
      }
    case TriggerEvent.ALL_USER_NOTIFICATION:
      return { subject: payload.subject, body: payload.body }
    default:
      throw new Error(`Unknown event: ${event}`)
  }
}
