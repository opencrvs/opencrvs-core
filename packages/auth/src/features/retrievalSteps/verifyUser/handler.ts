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
import {
  verifyUser,
  storeRetrievalStepInformation,
  padRecoveryResponse,
  RetrievalSteps,
  RetrieveFlow,
  RETRIEVAL_FLOW_USER_NAME,
  RETRIEVAL_FLOW_PASSWORD
} from '@auth/features/retrievalSteps/verifyUser/service'
import { generateNonce } from '@auth/features/verifyCode/service'
import { createToken } from '@auth/features/authenticate/service'
import { JWT_ISSUER } from '@auth/constants'
import { env } from '@auth/environment'
import {
  logger,
  triggerUserEventNotification,
  TriggerEvent,
  TokenUserType
} from '@opencrvs/commons'

interface IVerifyUserPayload {
  mobile?: string
  email?: string
  retrieveFlow: string
}

export default async function verifyUserHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IVerifyUserPayload
  const isUserNameRetrievalFlow =
    payload.retrieveFlow.toLowerCase() === RETRIEVAL_FLOW_USER_NAME
  const retrieveFlow = isUserNameRetrievalFlow
    ? RETRIEVAL_FLOW_USER_NAME
    : RETRIEVAL_FLOW_PASSWORD

  const startedAt = Date.now()

  try {
    const result = await verifyUser({
      mobile: payload.mobile,
      email: payload.email
    })
    const token = generateNonce()

    const authHeader = {
      Authorization: `Bearer ${await createToken(
        'auth',
        [],
        ['opencrvs:countryconfig-user'],
        JWT_ISSUER,
        undefined,
        TokenUserType.enum.system
      )}`
    }

    await storeRetrievalStepInformation(
      token,
      RetrievalSteps.WAITING_FOR_VERIFICATION,
      { ...result, retrieveFlow }
    )

    // Not awaited on purpose: countryconfig blocks on the SMTP/SMS send, so
    // awaiting would make response latency an oracle. Do not add the await back.
    void triggerUserEventNotification({
      event: isUserNameRetrievalFlow
        ? TriggerEvent.USERNAME_REMINDER_LINK
        : TriggerEvent.PASSWORD_RESET_LINK,
      payload: {
        token,
        recipient: {
          name: result.userFullName,
          mobile: result.mobile,
          email: result.email
        }
      },
      countryConfigUrl: env.COUNTRY_CONFIG_URL_INTERNAL,
      authHeader
    }).catch((err) => logger.error(err))
  } catch (err) {
    // Swallowed on purpose: no such user, no security questions, and events
    // being down must all look alike. A 500 here would be the oracle itself.
    logger.error(err)
  }

  // Every response leaves at the same time whether the work above succeeded,
  // failed late, or failed immediately. The bodies are already identical; this
  // is what stops the duration from saying which happened.
  await padRecoveryResponse(startedAt)

  return h.response().code(200)
}

export const requestSchema = Joi.object({
  mobile: Joi.string(),
  email: Joi.string().email(),
  retrieveFlow: Joi.string()
    .valid(...RetrieveFlow.options)
    .required()
})
