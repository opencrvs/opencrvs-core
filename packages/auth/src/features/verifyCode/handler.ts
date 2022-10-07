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
import { unauthorized } from '@hapi/boom'
import {
  checkVerificationCode,
  deleteUsedVerificationCode
} from '@auth/features/verifyCode/service'
import {
  getStoredUserInformation,
  createToken
} from '@auth/features/authenticate/service'
import { logger } from '@auth/logger'
import {
  WEB_USER_JWT_AUDIENCES,
  JWT_ISSUER,
  METRICS_URL
} from '@auth/constants'
import { resolve } from 'url'
import fetch from 'node-fetch'

interface IVerifyPayload {
  nonce: string
  code: string
}

interface IVerifyResponse {
  token: string
}

export default async function authenticateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { code, nonce } = request.payload as IVerifyPayload
  try {
    await checkVerificationCode(nonce, code)
  } catch (err) {
    logger.error(err)
    return unauthorized()
  }
  const { userId, scope, practitionerId } = await getStoredUserInformation(
    nonce
  )
  console.log(userId, scope, practitionerId)
  const token = await createToken(
    userId,
    scope,
    WEB_USER_JWT_AUDIENCES,
    JWT_ISSUER
  )
  await deleteUsedVerificationCode(nonce)
  const response: IVerifyResponse = { token }

  // Log user audit event for logged in
  const url = resolve(METRICS_URL, '/audit/events')
  const body = { practitionerId: practitionerId, action: 'LOGGED_IN' }
  const authentication = 'Bearer ' + response.token

  await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: authentication
    }
  })

  return response
}

export const requestSchema = Joi.object({
  nonce: Joi.string(),
  code: Joi.string()
})
export const responseSchma = Joi.object({
  token: Joi.string()
})
