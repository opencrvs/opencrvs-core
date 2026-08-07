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
  RetrievalSteps,
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

  // Signed on both the found and not-found paths, and before the try block,
  // so this awaited work — not whether a user exists — is what the response
  // timing reflects. It is only ever used on the found path, but signing it
  // unconditionally keeps the two paths' awaited work identical.
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

  try {
    const result = await verifyUser({
      mobile: payload.mobile,
      email: payload.email
    })
    const token = generateNonce()

    await storeRetrievalStepInformation(
      token,
      RetrievalSteps.WAITING_FOR_VERIFICATION,
      { ...result, retrieveFlow }
    )

    /*
     * Deliberately not awaited. countryconfig's notify() blocks on the
     * actual SMTP/SMS send, which takes anywhere from hundreds of
     * milliseconds to several seconds — awaiting it here would make the
     * response latency itself an oracle: fast for an unknown identifier
     * (one tRPC lookup), slow for a known one (lookup + sign + HTTP + mail
     * send). The response must not depend on the dispatch outcome anyway,
     * so there is nothing gained by waiting for it. Do not add the await
     * back.
     */
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
    /*
     * Every failure — no such user, no security questions configured, events
     * service down — is swallowed on purpose. The response must not vary
     * with whether the account exists, and a 500 here would be exactly the
     * oracle this endpoint exists to avoid. (Notification dispatch failure
     * is handled separately above, since it is fire-and-forget and never
     * reaches this catch.)
     */
    logger.error(err)
  }

  return h.response().code(200)
}

export const requestSchema = Joi.object({
  mobile: Joi.string(),
  email: Joi.string().email(),
  retrieveFlow: Joi.string()
    .valid(RETRIEVAL_FLOW_USER_NAME, RETRIEVAL_FLOW_PASSWORD)
    .required()
})
