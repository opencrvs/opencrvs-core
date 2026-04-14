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
import { createToken } from '@auth/features/authenticate/service'
import * as Hapi from '@hapi/hapi'
import { encodeScope, REINDEX_USER_ID, TokenUserType } from '@opencrvs/commons'
import * as Joi from 'joi'

interface IAuthResponse {
  token: string
}

export default async function reindexingTokenHandler(
  _request: Hapi.Request,
  _h: Hapi.ResponseToolkit
): Promise<IAuthResponse> {
  const token = await createToken(
    REINDEX_USER_ID,
    [encodeScope({ type: 'record.reindex' })],
    ['opencrvs:gateway-user', 'opencrvs:events-user'],
    'opencrvs:auth-service',
    undefined,
    TokenUserType.enum.system
  )
  return { token }
}

export const responseSchema = Joi.object({
  token: Joi.string().optional()
})
