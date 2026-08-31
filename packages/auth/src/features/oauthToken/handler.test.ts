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

const CREDENTIALS =
  'client_id=123&client_secret=456&grant_type=client_credentials'

const formEncodedRequest = (payload: string) => ({
  method: 'POST' as const,
  url: '/token',
  payload,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
})

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

  describe('events service says credentials are not valid', () => {
    it('returns a 401 response to client', async () => {
      jest
        .spyOn(authService, 'authenticateSystem')
        .mockRejectedValue(new Error('Invalid credentials'))
      const res = await server.server.inject(formEncodedRequest(CREDENTIALS))

      expect(res.statusCode).toBe(401)
    })
  })
  describe('events service says credentials are valid', () => {
    it('returns a token to the client', async () => {
      const res = await server.server.inject(formEncodedRequest(CREDENTIALS))

      expect(JSON.parse(res.payload).access_token).toBe('789')
    })
    it('returns a token when using a JSON payload', async () => {
      const res = await server.server.inject({
        method: 'POST',
        url: '/token',
        payload: {
          client_id: '123',
          client_secret: '456',
          grant_type: 'client_credentials'
        }
      })

      expect(JSON.parse(res.payload).access_token).toBe('789')
    })
  })

  describe('parameters are passed in the query string', () => {
    it('does not authenticate the client', async () => {
      const res = await server.server.inject({
        method: 'POST',
        url: `/token?${CREDENTIALS}`
      })

      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.payload).error).toBe('unsupported_grant_type')
      expect(JSON.parse(res.payload).access_token).toBeUndefined()
    })

    it('reads the payload, ignoring what the query string carries', async () => {
      const res = await server.server.inject({
        ...formEncodedRequest(CREDENTIALS),
        url: '/token?client_secret=wrong'
      })

      expect(JSON.parse(res.payload).access_token).toBe('789')
      expect(authService.authenticateSystem).toHaveBeenCalledWith('123', '456')
    })
  })
})
