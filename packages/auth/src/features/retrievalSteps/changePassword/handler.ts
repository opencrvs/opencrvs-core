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

import { changePassword } from '@auth/features/retrievalSteps/changePassword/service'
import {
  getRetrievalStepInformation,
  RetrievalSteps,
  deleteRetrievalStepInformation,
  RETRIEVAL_FLOW_PASSWORD
} from '@auth/features/retrievalSteps/verifyUser/service'

interface IPayload {
  newPassword: string
  nonce: string
}

export default async function changePasswordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IPayload
  const retrievalStepInformation = await getRetrievalStepInformation(
    payload.nonce
  ).catch(() => {
    throw unauthorized()
  })

  // One guard, one rejection shape: a username-reminder record must be
  // rejected exactly as an unverified one. Splitting these into two branches
  // with different shapes caused a prior Critical here — don't reintroduce it.
  if (
    retrievalStepInformation.status !== RetrievalSteps.SECURITY_Q_VERIFIED ||
    retrievalStepInformation.retrieveFlow !== RETRIEVAL_FLOW_PASSWORD
  ) {
    return h.response().code(401)
  }

  await changePassword(retrievalStepInformation.userId, payload.newPassword)
  await deleteRetrievalStepInformation(payload.nonce)
  return h.response().code(200)
}

export const reqChangePasswordSchema = Joi.object({
  newPassword: Joi.string(),
  nonce: Joi.string()
})
