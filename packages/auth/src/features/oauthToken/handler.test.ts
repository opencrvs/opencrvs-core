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
import { right } from 'fp-ts/lib/Either'

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
      const res = await server.server.inject({
        method: 'POST',
        url: '/token?client_id=123&client_secret=456&grant_type=client_credentials'
      })

      expect(res.statusCode).toBe(401)
    })
  })
  describe('events service says credentials are valid', () => {
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

describe('token-exchange grant type', () => {
  let server: AuthServer

  const eventId = '3ee9ada3-cc76-4d33-a4b3-70b52a0f88a1'
  const actionId = 'e97c7f9c-4d1f-4c3e-8f2d-1a2b3c4d5e6f'

  const tokenExchangeParams = (overrides: Record<string, string> = {}) =>
    new URLSearchParams({
      grant_type: 'urn:opencrvs:oauth:grant-type:token-exchange',
      subject_token: 'a-subject-token',
      subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
      requested_token_type:
        'urn:opencrvs:oauth:token-type:single_record_token',
      event_id: eventId,
      action_id: actionId,
      ...overrides
    }).toString()

  beforeEach(async () => {
    server = await createServer()
    jest.spyOn(authService, 'verifyToken').mockReturnValue(
      right({
        sub: 'user-1',
        userType: 'user',
        scope: [],
        iat: 0,
        exp: 0,
        aud: ['opencrvs:auth-user']
      }) as ReturnType<typeof authService.verifyToken>
    )
    jest
      .spyOn(authService, 'createTokenForActionConfirmation')
      .mockResolvedValue('record-token-abc')
  })

  it('is not reachable through the public /token endpoint', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: `/token?${tokenExchangeParams()}`
    })

    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.payload).error).toBe('unsupported_grant_type')
    expect(authService.createTokenForActionConfirmation).not.toHaveBeenCalled()
  })

  it('mints a record token on the internal-only /internal/token-exchange endpoint', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: `/internal/token-exchange?${tokenExchangeParams()}`
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.payload).access_token).toBe('record-token-abc')
    expect(authService.createTokenForActionConfirmation).toHaveBeenCalledWith(
      { eventId, actionId },
      'user-1',
      'user',
      []
    )
  })
})
