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
import { HapiRequest } from '@notification/features/sms/handler'
import {
  IInProgressPayload,
  IDeclarationPayload,
  IRegistrationPayload,
  IRejectionPayload
} from '@notification/features/sms/birth-handler'
import { buildAndSendSMS } from '@notification/features/sms/utils'
import { logger } from '@notification/logger'

export async function sendDeathInProgressConfirmation(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IInProgressPayload
  logger.info(
    `Notification service sendDeathInProgressConfirmation calling sendSMS: ${JSON.stringify(
      payload
    )}`
  )
  await buildAndSendSMS(
    request,
    payload.msisdn,
    'deathInProgressNotification',
    {
      trackingId: payload.trackingId,
      crvsOffice: payload.crvsOffice
    }
  )
  return h.response().code(200)
}

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
      trackingId: payload.trackingId
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
      name: payload.name,
      trackingId: payload.trackingId
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
    trackingId: payload.trackingId
  })
  return h.response().code(200)
}
