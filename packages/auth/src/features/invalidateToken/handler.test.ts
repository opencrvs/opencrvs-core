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

describe('invalidate token handler', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('add an invalid token to redis', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/invalidateToken',
      payload: {
        token: '111'
      }
    })

    expect(res.statusCode).toBe(200)

    const val = await get(`${INVALID_TOKEN_NAMESPACE}:111`)
    expect(val).toBe('INVALID')
  })

  it('catches redis errors', async () => {
    ;(setex as jest.Mock).mockImplementationOnce(() => Promise.reject('boom'))

    const res = await server.server.inject({
      method: 'POST',
      url: '/invalidateToken',
      payload: {
        token: '111'
      }
    })

    expect(res.statusCode).toBe(500)
  })
})
