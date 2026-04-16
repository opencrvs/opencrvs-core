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
import { AuthServer, createServer } from '@auth/server'
import * as authService from '@auth/features/authenticate/service'

describe('authenticate handler receives a request', () => {
  let server: AuthServer

  beforeEach(async () => {
    server = await createServer()
    jest
      .spyOn(authService, 'createToken')
      .mockReturnValue(Promise.resolve('789'))
    jest.spyOn(authService, 'authenticateSystem').mockReturnValue(
      Promise.resolve({
        systemId: '1',
        status: 'active',
        scope: []
      })
    )
  })

  describe('user management service says credentials are not valid', () => {
    it('returns a 401 response to client', async () => {
      jest.spyOn(authService, 'authenticateSystem').mockRejectedValue(
        new Error('Invalid credentials')
      )
      const res = await server.server.inject({
        method: 'POST',
        url: '/token?client_id=123&client_secret=456&grant_type=client_credentials'
      })

      expect(res.statusCode).toBe(401)
    })
  })
  describe('user management service says credentials are valid', () => {
    it('returns a token to the client', async () => {
      const res = await server.server.inject({
        method: 'POST',
        url: '/token?client_id=123&client_secret=456&grant_type=client_credentials'
      })

      expect(JSON.parse(res.payload).access_token).toBe('789')
    })
  })
  describe('form-encoded payload support', () => {
    it('returns a token when using form-encoded payload', async () => {
      const res = await server.server.inject({
        method: 'POST',
        url: '/token',
        payload:
          'client_id=123&client_secret=456&grant_type=client_credentials',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      expect(JSON.parse(res.payload).access_token).toBe('789')
    })
  })
})
