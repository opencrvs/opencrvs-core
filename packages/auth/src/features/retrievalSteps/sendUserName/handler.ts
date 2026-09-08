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
  deleteRetrievalStepInformation,
  RETRIEVAL_FLOW_USER_NAME
} from '@auth/features/retrievalSteps/verifyUser/service'
import { triggerUserEventNotification, TokenUserType } from '@opencrvs/commons'
import { env } from '@auth/environment'
import { JWT_ISSUER } from '@auth/constants'
import {
  createToken,
  recordAnonymousUserAuditEvent
} from '@auth/features/authenticate/service'

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

  /*
   * Two conditions, one rejection, deliberately. A record that never got past
   * the security question and a record belonging to the password-reset flow
   * both have to be refused here, and they have to be refused the same way:
   * whoever is calling must not be able to tell which of the two they hit.
   */
  if (
    retrievalStepInformation.status !== RetrievalSteps.SECURITY_Q_VERIFIED ||
    retrievalStepInformation.retrieveFlow !== RETRIEVAL_FLOW_USER_NAME
  ) {
    return h.response().code(401)
  }

  await triggerUserEventNotification({
    event: 'username-reminder',
    payload: {
      recipient: {
        name: retrievalStepInformation.userFullName,
        mobile: retrievalStepInformation.mobile,
        email: retrievalStepInformation.email
      },
      username: retrievalStepInformation.username
    },
    countryConfigUrl: env.COUNTRY_CONFIG_URL_INTERNAL,
    /*
     * Username retrieval is a pre-authentication flow: the caller proves
     * itself with the nonce, not a token, so there is no incoming
     * Authorization header to forward. Mint a short-lived system token
     * instead — the same way the 2FA and password-reset code notifications do
     * — so country config can require auth on `/trigger/user/*`.
     */
    authHeader: {
      Authorization: `Bearer ${await createToken(
        'auth',
        [],
        ['opencrvs:countryconfig-user'],
        JWT_ISSUER,
        undefined,
        TokenUserType.enum.system
      )}`
    }
  })

  await recordAnonymousUserAuditEvent({
    operation: 'user.username_reminder',
    requestData: {
      subjectId: retrievalStepInformation.userId
    }
  })

  await deleteRetrievalStepInformation(payload.nonce)
  return h.response().code(200)
}

export const requestSchema = Joi.object({
  nonce: Joi.string().required()
})
