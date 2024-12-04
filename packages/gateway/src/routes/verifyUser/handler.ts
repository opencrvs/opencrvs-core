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

interface IVerifyUserPayload {
  mobile?: string
  email?: string
  retrieveFlow: string
}

interface IVerifyUserResponse {
  nonce: string
  securityQuestionKey?: string
}

const RETRIEVAL_FLOW_USER_NAME = 'username'
const RETRIEVAL_FLOW_PASSWORD = 'password'

export default async function verifyUserHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<IVerifyUserResponse> {
  const payload = request.payload as IVerifyUserPayload

  const authUrl = new URL('/verifyUser', AUTH_URL)
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
      `Error occured when calling verifyUser endpoint [${res.statusText} ${
        res.status
      }]: ${await res.text()}`
    )
  }
  return await res.json()
}

export const requestSchema = Joi.object({
  mobile: Joi.string(),
  email: Joi.string().email(),
  retrieveFlow: Joi.string()
    .valid(RETRIEVAL_FLOW_USER_NAME, RETRIEVAL_FLOW_PASSWORD)
    .required()
})

export const responseSchema = Joi.object({
  nonce: Joi.string().required(),
  securityQuestionKey: Joi.string().optional()
})
