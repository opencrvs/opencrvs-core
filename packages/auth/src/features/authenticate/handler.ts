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
import { JWT_ISSUER, WEB_USER_JWT_AUDIENCES } from '@auth/constants'
import {
  IAuthentication,
  authenticate,
  createToken,
  generateAndSendVerificationCode,
  storeUserInformation
} from '@auth/features/authenticate/service'
import {
  NotificationEvent,
  generateNonce
} from '@auth/features/verifyCode/service'
import { forbidden, unauthorized } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import { getUserRoleScopeMapping } from '@auth/features/scopes/service'

interface IAuthPayload {
  username: string
  password: string
}

interface IAuthResponse {
  nonce: string
  mobile?: string
  email?: string
  status: string
  token?: string
}

export default async function authenticateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IAuthResponse> {
  const payload = request.payload as IAuthPayload
  let result: IAuthentication

  const { username, password } = payload
  try {
    result = await authenticate(username.trim(), password)
  } catch (err) {
    throw unauthorized()
  }
  if (result.status === 'deactivated') {
    throw forbidden()
  }

  const nonce = generateNonce()
  const response: IAuthResponse = {
    mobile: result.mobile,
    email: result.email,
    status: result.status,
    nonce
  }

  const isPendingUser = response.status && response.status === 'pending'

  const roleScopeMappings = await getUserRoleScopeMapping()

  const role = result.role as keyof typeof roleScopeMappings
  const scopes = roleScopeMappings[role]

  if (isPendingUser) {
    response.token = await createToken(
      result.userId,
      scopes,
      WEB_USER_JWT_AUDIENCES,
      JWT_ISSUER
    )
  } else {
    await storeUserInformation(
      nonce,
      result.name,
      result.userId,
      scopes,
      result.mobile,
      result.email
    )

    const notificationEvent = NotificationEvent.TWO_FACTOR_AUTHENTICATION

    await generateAndSendVerificationCode(
      nonce,
      scopes,
      notificationEvent,
      result.name,
      result.mobile,
      result.email
    )
  }

  return response
}

export const requestSchema = Joi.object({
  username: Joi.string(),
  password: Joi.string()
})

export const responseSchema = Joi.object({
  nonce: Joi.string(),
  mobile: Joi.string().optional(),
  email: Joi.string().optional(),
  status: Joi.string(),
  role: Joi.string(),
  token: Joi.string().optional()
})

export type AuthenticateResponse = {
  nonce: string
  mobile?: string
  email?: string
  status: string
  token?: string
}
