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

interface IUserAuthCodePayload extends ISMSPayload {
  code: string
}

export async function sendUserCredentials(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as ICredentialsPayload
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

export async function sendUserAuthenticationCode(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IUserAuthCodePayload
  logger.info(`Authentication Code: ${payload.code}`)
  await buildAndSendSMS(
    request,
    payload.msisdn,
    'authenticationCodeNotification',
    {
      authCode: payload.code
    }
  )
  return h.response().code(200)
}

export async function updateUserName(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IRetrieveUserNamePayload
  logger.info(`Username: ${payload.username}`)
  await buildAndSendSMS(request, payload.msisdn, 'updateUserNameNotification', {
    username: payload.username
  })
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

export const authCodeNotificationSchema = Joi.object({
  msisdn: Joi.string().required(),
  code: Joi.string().required()
})
