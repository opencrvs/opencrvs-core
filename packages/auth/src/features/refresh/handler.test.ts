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
import { AuthServer } from '@auth/server'
import { createProductionEnvironmentServer } from '@auth/tests/util'
import {
  DEFAULT_ROLES_DEFINITION,
  SCOPES
} from '@opencrvs/commons/authentication'
import * as fetchAny from 'jest-fetch-mock'
const fetch = fetchAny as fetchAny.FetchMock
import { AuthenticateResponse } from '@auth/features/authenticate/handler'

describe('authenticate handler receives a request', () => {
  let server: AuthServer

  beforeEach(async () => {
    server = await createProductionEnvironmentServer()
  })

  describe('refresh expiring token', () => {
    it('verifies a token and generates a new token', async () => {
      fetch.mockResponseOnce(JSON.stringify(DEFAULT_ROLES_DEFINITION), {
        status: 200
      })
      /* eslint-disable @typescript-eslint/no-require-imports */
      /* eslint-disable @typescript-eslint/no-var-requires */
      const codeService = require('../verifyCode/service')

      const authService = require('../authenticate/service')
      const codeSpy = jest.spyOn(codeService, 'sendVerificationCode')
      fetch.mockResponseOnce(JSON.stringify(DEFAULT_ROLES_DEFINITION), {
        status: 200
      })
      jest.spyOn(authService, 'authenticate').mockReturnValue({
        userId: '1',
        role: 'NATIONAL_SYSTEM_ADMIN',
        mobile: '+345345343'
      })

      const authRes: { result?: AuthenticateResponse } =
        await server.server.inject({
          method: 'POST',
          url: '/authenticate',
          payload: {
            username: '+345345343',
            password: '2r23432'
          }
        })

      expect(authRes.result).toBeDefined()

      const authCode = codeSpy.mock.calls[0][0]
      const res: { result?: { token: string } } = await server.server.inject({
        method: 'POST',
        url: '/verifyCode',
        payload: {
          nonce: authRes.result!.nonce,
          code: authCode
        }
      })

      expect(res.result).toBeDefined()

      const refreshResponse: { result?: { token: string } } =
        await server.server.inject({
          method: 'POST',
          url: '/refreshToken',
          payload: {
            nonce: authRes.result!.nonce,
            token: res.result!.token
          }
        })
      expect(refreshResponse.result).toBeDefined()

      const { token } = refreshResponse.result!

      expect(token).toBeDefined()
      expect(token.split('.')).toHaveLength(3)

      const [, payload] = token.split('.')
      const body = JSON.parse(Buffer.from(payload, 'base64').toString())
      expect(body.scope).toEqual([
        SCOPES.SYSADMIN,
        SCOPES.NATLSYSADMIN,
        SCOPES.USER_CREATE,
        SCOPES.USER_READ,
        SCOPES.USER_UPDATE,
        SCOPES.ORGANISATION_READ_LOCATIONS,
        SCOPES.PERFORMANCE_READ,
        SCOPES.PERFORMANCE_READ_DASHBOARDS,
        SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS
      ])
      expect(body.sub).toBe('1')
    })
    it('refreshError returns a 401 to the client if the token is bad', async () => {
      fetch.mockResponseOnce(JSON.stringify(DEFAULT_ROLES_DEFINITION), {
        status: 200
      })

      const codeService = require('../verifyCode/service')
      const authService = require('../authenticate/service')
      const codeSpy = jest.spyOn(codeService, 'sendVerificationCode')
      jest.spyOn(authService, 'authenticate').mockReturnValue({
        id: '1',
        role: 'NATIONAL_SYSTEM_ADMIN',
        scope: ['natlsysadmin'],
        username: '+345345343'
      })

      const authRes: { result?: AuthenticateResponse } =
        await server.server.inject({
          method: 'POST',
          url: '/authenticate',
          payload: {
            username: '+345345343',
            password: '2r23432'
          }
        })
      const smsCode = codeSpy.mock.calls[0][1]

      expect(authRes.result).toBeDefined()

      await server.server.inject({
        method: 'POST',
        url: '/verifyCode',
        payload: {
          nonce: authRes.result!.nonce,
          code: smsCode
        }
      })

      const badToken = 'ilgiglig'

      const refreshResponse: {
        result?: { token: string }
        statusCode: number
      } = await server.server.inject({
        method: 'POST',
        url: '/refreshToken',
        payload: {
          nonce: authRes.result!.nonce,
          token: badToken
        }
      })
      expect(refreshResponse.statusCode).toBe(401)
    })
  })
})
