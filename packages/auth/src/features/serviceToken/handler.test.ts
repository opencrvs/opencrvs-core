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
import { SERVICE_USER_ID } from '@opencrvs/commons'
import { AuthServer, createServer } from '@auth/server'

const decodeTokenPayload = (token: string) =>
  JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())

describe('service token handler', () => {
  let server: AuthServer

  beforeEach(async () => {
    server = await createServer()
  })

  it('issues a scopeless system token for country config and the gateway', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url: '/internal/service-token'
    })

    expect(res.statusCode).toBe(200)

    const { token } = JSON.parse(res.payload)
    const payload = decodeTokenPayload(token)

    expect(payload.sub).toBe(SERVICE_USER_ID)
    expect(payload.userType).toBe('system')
    expect(payload.scope).toEqual([])
    expect(payload.aud).toEqual([
      'opencrvs:countryconfig-user',
      'opencrvs:gateway-user'
    ])
  })
})
