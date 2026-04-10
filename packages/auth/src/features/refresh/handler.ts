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
import { verifyToken } from '@auth/features/authenticate/service'
import { refreshToken } from '@auth/features/refresh/service'

interface IRefreshPayload {
  nonce: string
  token: string
}

export default async function refreshHandler(request: Hapi.Request) {
  const { token } = request.payload as IRefreshPayload

  const decodedOrError = verifyToken(token)
  if (decodedOrError._tag === 'Left') {
    return unauthorized()
  }

  const decoded = decodedOrError.right

  const newToken = await refreshToken(decoded)
  return { token: newToken }
}

export const requestSchema = Joi.object({
  nonce: Joi.string(),
  token: Joi.string()
})
export const responseSchma = Joi.object({
  token: Joi.string()
})
