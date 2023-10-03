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
  authenticate,
  createToken,
  IAuthentication
} from '@auth/features/authenticate/service'
import { unauthorized } from '@hapi/boom'
import { WEB_USER_JWT_AUDIENCES, JWT_ISSUER } from '@auth/constants'

interface IAuthPayload {
  username: string
  password: string
}

export default async function authenticateSuperUserHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IAuthPayload
  let result: IAuthentication
  const { username, password } = payload
  try {
    result = await authenticate(username.trim(), password)
  } catch (err) {
    throw unauthorized()
  }

  const token = await createToken(
    result.userId,
    result.scope,
    WEB_USER_JWT_AUDIENCES,
    JWT_ISSUER
  )

  return h.response({
    token
  })
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
  token: Joi.string().optional()
})
