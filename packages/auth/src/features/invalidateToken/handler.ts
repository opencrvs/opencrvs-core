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
import { recordUserAuditEvent } from '@auth/features/authenticate/service'
import { getUserIdFromToken } from '@opencrvs/commons'

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
    recordUserAuditEvent(token, {
      operation: 'user.LOGGED_OUT',
      requestData: { subjectId: userId },
      responseSummary: {}
    })
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
