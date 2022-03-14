/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { createServer } from '@auth/server'
import { get, setex } from '@auth/database'
import { INVALID_TOKEN_NAMESPACE } from '@auth/constants'

describe('verify token handler', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it("returns valid when the token isn't in redis", async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/verifyToken',
      payload: {
        token: '111'
      }
    })

    expect(res.statusCode).toBe(200)
    expect(res.result).toEqual({ valid: true })
  })

  it('returns invalid when the token is in redis', async () => {
    setex(`${INVALID_TOKEN_NAMESPACE}:111`, 10, 'INVALID')

    const res = await server.server.inject({
      method: 'POST',
      url: '/verifyToken',
      payload: {
        token: '111'
      }
    })

    expect(res.statusCode).toBe(200)
    expect(res.result).toEqual({ valid: false })
  })

  it('catches redis errors', async () => {
    ;(get as jest.Mock).mockImplementationOnce(() => Promise.reject('boom'))

    const res = await server.server.inject({
      method: 'POST',
      url: '/verifyToken',
      payload: {
        token: '111'
      }
    })

    expect(res.statusCode).toBe(500)
  })
})
