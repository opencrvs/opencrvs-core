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
import { logger } from '@opencrvs/commons'

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

  describe('parameters are passed in the deprecated query string', () => {
    const nodeEnv = process.env.NODE_ENV

    afterEach(() => {
      process.env.NODE_ENV = nodeEnv
      jest.restoreAllMocks()
    })

    it('rejects the request outside production', async () => {
      process.env.NODE_ENV = 'development'
      const res = await server.server.inject({
        method: 'POST',
        url: `/token?${CREDENTIALS}`
      })

      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.payload).error).toBe('invalid_request')
      expect(JSON.parse(res.payload).error_description).toContain(
        'client_secret'
      )
    })

    it('issues a token in production, logging the parameters', async () => {
      process.env.NODE_ENV = 'production'
      const logError = jest.spyOn(logger, 'error').mockImplementation()

      const res = await server.server.inject({
        method: 'POST',
        url: `/token?${CREDENTIALS}`
      })

      expect(JSON.parse(res.payload).access_token).toBe('789')
      expect(logError).toHaveBeenCalledWith(
        expect.stringContaining('grant_type, client_id, client_secret')
      )
    })

    it('reports parameters the payload also carries', async () => {
      process.env.NODE_ENV = 'production'
      const logError = jest.spyOn(logger, 'error').mockImplementation()

      const res = await server.server.inject({
        ...formEncodedRequest(CREDENTIALS),
        url: '/token?client_secret=456'
      })

      expect(JSON.parse(res.payload).access_token).toBe('789')
      expect(logError).toHaveBeenCalledWith(
        expect.stringContaining('client_secret')
      )
    })

    it('ignores non-OAuth query parameters', async () => {
      process.env.NODE_ENV = 'development'
      const res = await server.server.inject({
        ...formEncodedRequest(CREDENTIALS),
        url: '/token?utm_source=docs'
      })

      expect(JSON.parse(res.payload).access_token).toBe('789')
    })
  })
})
