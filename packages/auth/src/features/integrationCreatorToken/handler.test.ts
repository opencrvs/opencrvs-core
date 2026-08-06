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
import { encodeScope } from '@opencrvs/commons'
import { AuthServer, createServer } from '@auth/server'

const decodeTokenPayload = (token: string) =>
  JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())

describe('integration creator token handler', () => {
  let server: AuthServer

  beforeEach(async () => {
    server = await createServer()
  })

  it('returns a 60 second bootstrap token scoped to integration.create', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/internal/integration-creator-token'
    })

    expect(res.statusCode).toBe(200)

    const { token } = JSON.parse(res.payload)
    const payload = decodeTokenPayload(token)

    expect(payload.scope).toEqual([
      encodeScope({ type: 'integration.create' })
    ])
    expect(payload.sub).toBe('opencrvs:countryconfig-service')
    expect(payload.userType).toBe('system')
    // The token is consumed by countryconfig (system/ready trigger) and
    // user-mgnt (createIntegration)
    expect(payload.aud).toEqual([
      'opencrvs:countryconfig-user',
      'opencrvs:user-mgnt-user'
    ])
    expect(payload.exp - payload.iat).toBe(60)
  })
})
