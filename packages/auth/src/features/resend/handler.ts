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
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import { unauthorized } from '@hapi/boom'
import {
  getStoredUserInformation,
  generateAndSendVerificationCode
} from '@auth/features/authenticate/service'
import { getRetrievalStepInformation } from '@auth/features/retrievalSteps/verifyUser/service'
import { NotificationEvent } from '@auth/features/verifyCode/service'

interface IResendNotificationPayload {
  nonce: string
  notificationEvent: NotificationEvent
  retrievalFlow?: boolean
}

export default async function resendNotificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { nonce, retrievalFlow, notificationEvent } =
    request.payload as IResendNotificationPayload

  let userInformation
  try {
    userInformation = retrievalFlow
      ? await getRetrievalStepInformation(nonce)
      : await getStoredUserInformation(nonce)
  } catch (err) {
    return unauthorized()
  }

  const { scope, userFullName, mobile, email } = userInformation

  await generateAndSendVerificationCode(
    nonce,
    scope,
    notificationEvent,
    userFullName,
    mobile,
    email
  )

  return { nonce }
}

export const requestSchema = Joi.object({
  nonce: Joi.string(),
  notificationEvent: Joi.string().required(),
  retrievalFlow: Joi.boolean().optional()
})
export const responseSchma = Joi.object({
  nonce: Joi.string()
})
