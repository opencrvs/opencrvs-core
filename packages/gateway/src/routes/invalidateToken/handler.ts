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
import fetch from 'node-fetch'

interface IInvalidateTokenPayload {
  token: string
}

export default async function invalidateTokenHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IInvalidateTokenPayload

  const authUrl = new URL('/invalidateToken', AUTH_URL)
  const res = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    logger.error(await res.text())
    throw new Error(
      `Error occured when calling invalidateToken endpoint [${res.statusText} ${
        res.status
      }]: ${await res.text()}`
    )
  }
  return {}
}

export const reqInvalidateTokenSchema = Joi.object({
  token: Joi.string()
})
