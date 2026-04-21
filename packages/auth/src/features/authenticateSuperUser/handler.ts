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
import {
  authenticateSuperuser,
  createInternalServiceToken
} from '@auth/features/authenticate/service'
import { unauthorized } from '@hapi/boom'

interface IAuthPayload {
  username: string
  password: string
}

export default async function authenticateSuperUserHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IAuthPayload

  const { password } = payload

  try {
    const isVerified = await authenticateSuperuser(password)

    if (!isVerified) {
      throw unauthorized()
    }

    const token = await createInternalServiceToken(
      'opencrvs:data-seeder-service'
    )
    return h.response({
      token
    })
  } catch (err) {
    throw unauthorized()
  }
}

export const requestSchema = Joi.object({
  password: Joi.string()
})

export const responseSchema = Joi.object({
  token: Joi.string().optional()
})
