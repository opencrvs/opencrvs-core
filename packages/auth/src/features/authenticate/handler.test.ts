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
import * as fetchAny from 'jest-fetch-mock'
import { createProductionEnvironmentServer } from '@auth/tests/util'
import { createServer, AuthServer } from '@auth/server'
import { DEFAULT_ROLES_DEFINITION } from '@opencrvs/commons/authentication'

const fetch = fetchAny as fetchAny.FetchMock
describe('authenticate handler receives a request', () => {
  let server: AuthServer

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
          id: '1',
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
    it('generates a mobile verification code and sends it to notification gateway', async () => {
      server = await createProductionEnvironmentServer()

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const reloadedCodeService = require('../verifyCode/service')

      jest.spyOn(reloadedCodeService, 'generateNonce').mockReturnValue('12345')

      fetch.mockResponseOnce(
        JSON.stringify({
          id: '1',
          status: 'active',
          role: 'NATIONAL_SYSTEM_ADMIN',
          mobile: `+345345343`
        })
      )

      fetch.mockResponse(JSON.stringify(DEFAULT_ROLES_DEFINITION), {
        status: 200
      })
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
      expect(spy.mock.calls[0]).toHaveLength(5)
      expect(spy.mock.calls[0][3]).toBe('+345345343')
    })
    it('does not generate a mobile verification code for pending users', async () => {
      server = await createProductionEnvironmentServer()

      // eslint-disable-next-line
      const reloadedCodeService = require('../verifyCode/service')

      jest.spyOn(reloadedCodeService, 'generateNonce').mockReturnValue('12345')

      fetch.mockResponseOnce(
        JSON.stringify({
          id: '1',
          status: 'pending',
          role: 'NATIONAL_SYSTEM_ADMIN',
          mobile: `+345345343`
        })
      )

      fetch.mockResponse(JSON.stringify(DEFAULT_ROLES_DEFINITION), {
        status: 200
      })

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
