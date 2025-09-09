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
  getRetrievalStepInformation,
  RetrievalSteps,
  deleteRetrievalStepInformation
} from '@auth/features/retrievalSteps/verifyUser/service'
import {
  logger,
  triggerUserEventNotification,
  personNameFromV1ToV2
} from '@opencrvs/commons'
import { postUserActionToMetrics } from '@auth/metrics'
import { env } from '@auth/environment'

interface IPayload {
  nonce: string
}

export default async function sendUserNameHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IPayload
  const retrievalStepInformation = await getRetrievalStepInformation(
    payload.nonce
  ).catch(() => {
    throw unauthorized()
  })

  if (retrievalStepInformation.status !== RetrievalSteps.SECURITY_Q_VERIFIED) {
    return h.response().code(401)
  }

  const remoteAddress =
    request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']

  await triggerUserEventNotification({
    event: 'username-reminder',
    payload: {
      recipient: {
        name: personNameFromV1ToV2(retrievalStepInformation.userFullName),
        mobile: retrievalStepInformation.mobile,
        email: retrievalStepInformation.email
      },
      username: retrievalStepInformation.username
    },
    countryConfigUrl: env.COUNTRY_CONFIG_URL_INTERNAL,
    authHeader: { Authorization: request.headers.authorization }
  })

  try {
    await postUserActionToMetrics(
      'USERNAME_REMINDER',
      request.headers.authorization,
      remoteAddress,
      userAgent,
      retrievalStepInformation.practitionerId
    )
  } catch (err) {
    logger.error(err.message)
  }

  await deleteRetrievalStepInformation(payload.nonce)
  return h.response().code(200)
}

export const requestSchema = Joi.object({
  nonce: Joi.string().required()
})
