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
import { WEB_USER_JWT_AUDIENCES } from '@auth/constants'
import { AuthServer, createServer } from '@auth/server'

const decodeTokenPayload = (token: string) =>
  JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())

describe('service token handler', () => {
  let server: AuthServer

  beforeEach(async () => {
    server = await createServer()
  })

  it('issues a scopeless system token accepted by every service', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url: '/internal/service-token'
    })

    expect(res.statusCode).toBe(200)

    const { token } = JSON.parse(res.payload)
    const payload = decodeTokenPayload(token)

    expect(payload.sub).toBe(SERVICE_USER_ID)
    expect(payload.userType).toBe('system')
    // Carries no scopes: a broad audience grants no authority, it only lets each
    // service accept the token.
    expect(payload.scope).toEqual([])
    // Country config relays this token onward (e.g. informant notifications call
    // back through the gateway to the events service), so it must be accepted by
    // the gateway and downstream services, not just country config.
    expect(payload.aud).toEqual(WEB_USER_JWT_AUDIENCES)
    expect(payload.aud).toContain('opencrvs:gateway-user')
    expect(payload.aud).toContain('opencrvs:events-user')
  })
})
