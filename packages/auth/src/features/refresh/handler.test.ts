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
import { createServerWithEnvironment } from '@auth/tests/util'

describe('authenticate handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServerWithEnvironment({ NODE_ENV: 'production' })
  })

  describe('refresh expiring token', () => {
    it('verifies a token and generates a new token', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const codeService = require('../verifyCode/service')

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const authService = require('../authenticate/service')
      const codeSpy = jest.spyOn(codeService, 'sendVerificationCode')
      jest.spyOn(authService, 'authenticate').mockReturnValue({
        userId: '1',
        scope: ['admin'],
        mobile: '+345345343'
      })

      const authRes = await server.server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          username: '+345345343',
          password: '2r23432'
        }
      })
      const authCode = codeSpy.mock.calls[0][0]
      const res = await server.server.inject({
        method: 'POST',
        url: '/verifyCode',
        payload: {
          nonce: authRes.result.nonce,
          code: authCode
        }
      })

      const refreshResponse = await server.server.inject({
        method: 'POST',
        url: '/refreshToken',
        payload: {
          nonce: authRes.result.nonce,
          token: res.result.token
        }
      })

      expect(refreshResponse.result.token).toBeDefined()
      expect(refreshResponse.result.token.split('.')).toHaveLength(3)

      const [, payload] = refreshResponse.result.token.split('.')
      const body = JSON.parse(Buffer.from(payload, 'base64').toString())
      expect(body.scope).toEqual(['admin'])
      expect(body.sub).toBe('1')
    })
    it('refreshError returns a 401 to the client if the token is bad', async () => {
      // eslint-disable-next-line
      const codeService = require('../verifyCode/service')
      // eslint-disable-next-line
      const authService = require('../authenticate/service')
      const codeSpy = jest.spyOn(codeService, 'sendVerificationCode')
      jest.spyOn(authService, 'authenticate').mockReturnValue({
        userId: '1',
        scope: ['admin'],
        username: '+345345343'
      })

      const authRes = await server.server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          username: '+345345343',
          password: '2r23432'
        }
      })
      const smsCode = codeSpy.mock.calls[0][1]
      await server.server.inject({
        method: 'POST',
        url: '/verifyCode',
        payload: {
          nonce: authRes.result.nonce,
          code: smsCode
        }
      })

      const badToken = 'ilgiglig'

      const refreshResponse = await server.server.inject({
        method: 'POST',
        url: '/refreshToken',
        payload: {
          nonce: authRes.result.nonce,
          token: badToken
        }
      })
      expect(refreshResponse.statusCode).toBe(401)
    })
  })
})
