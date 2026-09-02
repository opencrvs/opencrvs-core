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
import { RouteHandlerMethod } from 'fastify'

export const packetManagerAuthHandler: RouteHandlerMethod = async (
  _request,
  reply
) => {
  const token = 'some-token'
  reply.header(
    'set-cookie',
    `Authorization=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`
  )

  return reply.status(200).send({
    id: 'string',
    version: 'string',
    responsetime: new Date().toISOString(),
    metadata: null,
    response: {
      status: 'Success',
      message: 'Clientid and Token combination had been validated successfully'
    },
    errors: null
  })
}
