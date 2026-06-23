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
import { logger } from '@opencrvs/commons'
import { verifyRefreshToken } from '@auth/features/authenticate/service'
import { refreshToken } from '@auth/features/refresh/service'

interface IRefreshPayload {
  token: string
}

export default async function refreshHandler(request: Hapi.Request) {
  const { token } = request.payload as IRefreshPayload

  const decodedOrError = verifyRefreshToken(token)
  if (decodedOrError._tag === 'Left') {
    return unauthorized()
  }

  try {
    const newToken = await refreshToken(decodedOrError.right.sub)
    return { token: newToken }
  } catch (err) {
    logger.error(`Failed to refresh token: ${err}`)
    return unauthorized()
  }
}

export const requestSchema = Joi.object({
  token: Joi.string()
})
export const responseSchma = Joi.object({
  token: Joi.string()
})
