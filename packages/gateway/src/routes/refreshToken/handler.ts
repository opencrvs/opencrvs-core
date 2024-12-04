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
import * as Joi from 'joi'
import * as Hapi from '@hapi/hapi'
import { logger } from '@opencrvs/commons'
import { AUTH_URL } from '@gateway/constants'
import { unauthorized } from '@hapi/boom'
import fetch from 'node-fetch'

interface IRefreshPayload {
  nonce: string
  token: string
}

interface IRefreshResponse {
  token: string
}

export default async function verifyRefreshTokenHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IRefreshResponse> {
  const payload = request.payload as IRefreshPayload

  const authUrl = new URL('/refreshToken', AUTH_URL)
  const res = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: request.headers.authorization
    },
    body: JSON.stringify(payload)
  })

  if (res.status === 401) throw unauthorized()

  if (!res.ok) {
    logger.error(await res.text())
    throw new Error(
      `Error occured when calling refreshToken endpoint [${res.statusText} ${
        res.status
      }]: ${await res.text()}`
    )
  }
  return await res.json()
}

export const requestSchema = Joi.object({
  nonce: Joi.string(),
  token: Joi.string()
})
export const responseSchma = Joi.object({
  token: Joi.string()
})
