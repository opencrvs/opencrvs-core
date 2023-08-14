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
import { logger } from '@notification/logger'
import { templateNames } from '@notification/i18n/messages'

interface ICredentialsPayload extends IMessageRecipient {
  username: string
  password: string
}
interface IResetPasswordPayload extends IMessageRecipient {
  password: string
}

interface IRetrieveUserNamePayload extends IMessageRecipient {
  username: string
}

interface IUserAuthCodePayload extends IMessageRecipient {
  code: string
  notificationEvent: string
}

export async function sendUserCredentials(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as ICredentialsPayload
  logger.info(`Username: ${payload.username}`)
  logger.info(`Password: ${payload.password}`)

  const nameObject = payload.userFullName.find((obj) => obj.use === 'en')
  // Extract the firstNames
  const firstNames = nameObject?.given[0] as string

  await sendNotification(
    request,
    {
      sms: templateNames.ONBOARDING_INVITE['sms'],
      email: templateNames.ONBOARDING_INVITE['email']
    },
    { email: payload.email, sms: payload.msisdn },
    'user',
    {
      firstNames,
      username: payload.username,
      password: payload.password
    }
  )
  return h.response().code(200)
}

export async function sendResetPasswordInvite(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IResetPasswordPayload
  logger.info(`Password: ${payload.password}`)
  const nameObject = payload.userFullName.find((obj) => obj.use === 'en')
  // Extract the firstNames
  const firstNames = nameObject?.given[0] as string

  await sendNotification(
    request,
    {
      sms: templateNames.PASSWORD_RESET_BY_SYSTEM_ADMIN['sms'],
      email: templateNames.PASSWORD_RESET_BY_SYSTEM_ADMIN['email']
    },
    { email: payload.email, sms: payload.msisdn },
    'user',
    {
      firstNames,
      password: payload.password
    }
  )
  return h.response().code(200)
}

export async function retrieveUserName(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IRetrieveUserNamePayload
  logger.info(`Username: ${payload.username}`)

  const nameObject = payload.userFullName.find((obj) => obj.use === 'en')
  // Extract the firstNames
  const firstNames = nameObject?.given[0] as string

  await sendNotification(
    request,
    {
      sms: templateNames.USERNAME_REMINDER['sms'],
      email: templateNames.USERNAME_REMINDER['email']
    },
    { email: payload.email, sms: payload.msisdn },
    'user',
    {
      firstNames,
      username: payload.username
    }
  )
  return h.response().code(200)
}

export async function sendUserAuthenticationCode(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IUserAuthCodePayload
  logger.info(`Authentication Code: ${payload.code}`)

  const nameObject = payload.userFullName.find((obj) => obj.use === 'en')

  // Extract the firstNames
  const firstNames = nameObject?.given[0] as string
  await sendNotification(
    request,
    {
      sms: templateNames[payload.notificationEvent]['sms'],
      email: templateNames[payload.notificationEvent]['email']
    },
    { email: payload.email, sms: payload.msisdn },
    'user',
    {
      firstNames,
      authCode: payload.code
    }
  )
  return h.response().code(200)
}

export async function updateUserName(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IRetrieveUserNamePayload
  logger.info(`Username: ${payload.username}`)

  const nameObject = payload.userFullName.find((obj) => obj.use === 'en')
  // Extract the firstNames
  const firstNames = nameObject?.given[0] as string

  await sendNotification(
    request,
    {
      sms: templateNames.USERNAME_UPDATED['sms'],
      email: templateNames.USERNAME_UPDATED['email']
    },
    { email: payload.email, sms: payload.msisdn },
    'user',
    {
      firstNames,
      username: payload.username
    }
  )
  return h.response().code(200)
}

export const userCredentialsNotificationSchema = Joi.object({
  msisdn: Joi.string().allow('').optional(),
  email: Joi.string().allow('').optional(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  userFullName: Joi.array().items(
    Joi.object({
      given: Joi.array().items(Joi.string()).required(),
      use: Joi.string().required(),
      family: Joi.string().required()
    }).unknown(true)
  )
})

export const userPasswordResetNotificationSchema = Joi.object({
  msisdn: Joi.string().allow('').optional(),
  email: Joi.string().allow('').optional(),
  password: Joi.string().required(),
  userFullName: Joi.array().items(
    Joi.object({
      given: Joi.array().items(Joi.string()).required(),
      use: Joi.string().required(),
      family: Joi.string().required()
    }).unknown(true)
  )
})

export const retrieveUserNameNotificationSchema = Joi.object({
  msisdn: Joi.string().allow('').optional(),
  email: Joi.string().allow('').optional(),
  username: Joi.string().required(),
  userFullName: Joi.array().items(
    Joi.object({
      given: Joi.array().items(Joi.string()).required(),
      use: Joi.string().required(),
      family: Joi.string().required()
    }).unknown(true)
  )
})

export const authCodeNotificationSchema = Joi.object({
  msisdn: Joi.string().allow('').optional(),
  email: Joi.string().allow('').optional(),
  code: Joi.string().required(),
  notificationEvent: Joi.string().required(),
  userFullName: Joi.array().items(
    Joi.object({
      given: Joi.array().items(Joi.string()).required(),
      use: Joi.string().required(),
      family: Joi.string().required()
    }).unknown(true)
  )
})
