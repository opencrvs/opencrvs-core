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
import { internal } from '@hapi/boom'
import { invalidateToken } from '@auth/features/invalidateToken/service'
import {
  recordUserAuditEvent,
  verifyRefreshToken
} from '@auth/features/authenticate/service'
import { getUserIdFromToken, logger } from '@opencrvs/commons'
import { revokeFamily } from '@auth/features/refresh/family'

interface IInvalidateTokenPayload {
  token: string
}

export default async function invalidateTokenHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { token } = request.payload as IInvalidateTokenPayload
  const userId = getUserIdFromToken(token)
  if (userId) {
    recordUserAuditEvent(`Bearer ${token}`, {
      operation: 'user.logged_out',
      requestData: { subjectId: userId }
    })
  }

  const refreshDecoded = verifyRefreshToken(token)
  if (refreshDecoded._tag === 'Right') {
    try {
      await revokeFamily(refreshDecoded.right.familyId)
    } catch (err) {
      logger.error(`Failed to revoke refresh token family on logout: ${err}`)
    }
  }

  try {
    await invalidateToken(token)
  } catch (err) {
    throw internal('Failed to invalidate token', err)
  }

  return {}
}

export const reqInvalidateTokenSchema = Joi.object({
  token: Joi.string()
})
