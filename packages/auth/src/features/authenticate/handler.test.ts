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
import * as fetchAny from 'jest-fetch-mock'
import { createServerWithEnvironment } from '@auth/tests/util'
import { createServer } from '@auth/server'

const fetch = fetchAny as fetchAny.FetchMock
describe('authenticate handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  describe('user management service says credentials are not valid', () => {
    it('returns a 401 response to client', async () => {
      fetch.mockReject(new Error())
      const res = await server.server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          username: '+345345343',
          password: '2r23432'
        }
      })

      expect(res.statusCode).toBe(401)
    })
  })
  describe('user management service says credentials are not valid', () => {
    it('returns a 401 response to client', async () => {
      fetch.mockReject(new Error())
      const res = await server.server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          username: '+345345343',
          password: '2r23432'
        }
      })

      expect(res.statusCode).toBe(401)
    })
  })
  describe('auth service returns 403 for deactivated users', () => {
    it('returns 403', async () => {
      fetch.mockResponse(
        JSON.stringify({
          userId: '1',
          status: 'deactivated',
          scope: ['admin']
        })
      )
      const res = await server.server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          username: '+345345343',
          password: '2r23432'
        }
      })

      expect(res.statusCode).toBe(403)
    })
    it('generates a mobile verification code and sends it to sms gateway', async () => {
      server = await createServerWithEnvironment({ NODE_ENV: 'production' })

      const reloadedCodeService = require('../verifyCode/service')

      jest.spyOn(reloadedCodeService, 'generateNonce').mockReturnValue('12345')

      fetch.mockResponse(
        JSON.stringify({
          userId: '1',
          status: 'active',
          scope: ['admin'],
          mobile: `+345345343`
        })
      )
      const spy = jest.spyOn(reloadedCodeService, 'sendVerificationCode')

      await server.server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          username: '+345345343',
          password: '2r23432'
        }
      })

      expect(spy).toHaveBeenCalled()
      expect(spy.mock.calls[0]).toHaveLength(2)
      expect(spy.mock.calls[0][0]).toBe('+345345343')
    })
    it('does not generate a mobile verification code for pending users', async () => {
      server = await createServerWithEnvironment({ NODE_ENV: 'production' })

      const reloadedCodeService = require('../verifyCode/service')

      jest.spyOn(reloadedCodeService, 'generateNonce').mockReturnValue('12345')

      fetch.mockResponse(
        JSON.stringify({
          userId: '1',
          status: 'pending',
          scope: ['admin'],
          mobile: `+345345343`
        })
      )
      const spy = jest.spyOn(reloadedCodeService, 'sendVerificationCode')

      await server.server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          username: '+345345343',
          password: '2r23432'
        }
      })

      expect(spy).not.toHaveBeenCalled()
    })
  })
})
