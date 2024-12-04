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

interface IVerifyNumberPayload {
  nonce: string
  code: string
}

interface IVerifyNumberResponse {
  nonce: string
  securityQuestionKey: string
}

export default async function verifyNumberHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IVerifyNumberResponse> {
  const payload = request.payload as IVerifyNumberPayload

  const authUrl = new URL('/verifyNumber', AUTH_URL)
  const res = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (res.status === 401) throw unauthorized()

  if (!res.ok) {
    logger.error(await res.text())
    throw new Error(
      `Error occured when calling verifyNumber endpoint [${res.statusText} ${
        res.status
      }]: ${await res.text()}`
    )
  }
  return await res.json()
}

export const requestSchema = Joi.object({
  nonce: Joi.string().required(),
  code: Joi.string().required()
})

export const responseSchema = Joi.object({
  nonce: Joi.string(),
  securityQuestionKey: Joi.string()
})
