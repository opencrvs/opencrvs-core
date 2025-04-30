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
import * as codeService from '@auth/features/verifyCode/service'
import { AuthServer, createServer } from '@auth/server'

const fetch = fetchAny as fetchAny.FetchMock

describe('verifyUser handler receives a request', () => {
  let server: AuthServer

  beforeEach(async () => {
    server = await createServer()
  })

  describe('user management service says user is not valid', () => {
    it('returns a 401 response to client when error occurs', async () => {
      fetch.mockReject(new Error())
      const res = await server.server.inject({
        method: 'POST',
        url: '/verifyUser',
        payload: { mobile: '+8801711111111', retrieveFlow: 'password' }
      })

      expect(res.statusCode).toBe(401)
    })
    it('returns a 401 response to client when the fetch call responses with a bad request response', async () => {
      fetch.mockResponse('{}', { status: 400 })
      const res = await server.server.inject({
        method: 'POST',
        url: '/verifyUser',
        payload: { mobile: '+8801711111111', retrieveFlow: 'password' }
      })

      expect(res.statusCode).toBe(401)
    })
  })
  describe('user management service says user is valid', () => {
    it('returns a nonce to the client', async () => {
      jest.spyOn(codeService, 'generateNonce').mockReturnValue('12345')
      fetch.mockResponse(
        JSON.stringify({
          id: '1',
          username: 'fake_user_name',
          status: 'active',
          scope: ['demo'],
          mobile: '+8801711111111',
          securityQuestionKey: 'dummyKey'
        })
      )
      const res = await server.server.inject({
        method: 'POST',
        url: '/verifyUser',
        payload: { mobile: '+8801711111111', retrieveFlow: 'username' }
      })

      expect(JSON.parse(res.payload).nonce).toBe('12345')
    })
    it('generates a mobile verification code and sends it to notification gateway', async () => {
      server = await createProductionEnvironmentServer()

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const reloadedCodeService = require('../../verifyCode/service')

      jest.spyOn(reloadedCodeService, 'generateNonce').mockReturnValue('12345')

      fetch.mockResponse(
        JSON.stringify({
          id: '1',
          username: 'fake_user_name',
          status: 'active',
          scope: ['admin'],
          mobile: '+8801711111111',
          securityQuestionKey: 'dummyKey'
        })
      )
      const spy = jest.spyOn(reloadedCodeService, 'sendVerificationCode')

      await server.server.inject({
        method: 'POST',
        url: '/verifyUser',
        payload: { mobile: '+8801711111111', retrieveFlow: 'password' }
      })

      expect(spy).toHaveBeenCalled()
      expect(spy.mock.calls[0]).toHaveLength(5)
      expect(spy.mock.calls[0][3]).toBe('+8801711111111')
    })
  })
})
