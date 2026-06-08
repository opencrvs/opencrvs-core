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
import { createToken } from '@auth/features/authenticate/service'
import { SCOPES, TokenUserType } from '@opencrvs/commons'

interface IAuthResponse {
  token: string
}

export default async function integrationCreatorTokenHandler(
  _request: Hapi.Request,
  _h: Hapi.ResponseToolkit
): Promise<IAuthResponse> {
  const token = await createToken(
    'opencrvs:countryconfig-service',
    [SCOPES.INTEGRATION_CREATE],
    ['opencrvs:auth-user'],
    'opencrvs:auth-service',
    undefined,
    true,
    TokenUserType.enum.system,
    60
  )
  return { token }
}

export const responseSchema = Joi.object({
  token: Joi.string().optional()
})
