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
import * as fetchMock from 'jest-fetch-mock'

const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock
import { AuthenticateResponse } from '@auth/features/authenticate/handler'

describe('authenticate handler receives a request', () => {
  let server: AuthServer

  beforeEach(async () => {
    server = await createProductionEnvironmentServer()
  })

  describe('user management service says credentials are valid', () => {
    it('verifies a code and generates a token', async () => {
      /* eslint-disable @typescript-eslint/no-require-imports */
      /* eslint-disable @typescript-eslint/no-var-requires */
      const codeService = require('./service')

      const authService = require('../authenticate/service')
      const codeSpy = jest.spyOn(codeService, 'sendVerificationCode')

      fetch.mockResponseOnce(JSON.stringify(DEFAULT_ROLES_DEFINITION), {
        status: 200
      })
      jest.spyOn(authService, 'authenticate').mockReturnValue({
        name: [
          {
            use: 'en',
            family: 'Anik',
            given: ['Sadman']
          }
        ],
        userId: '1',
        role: 'NATIONAL_SYSTEM_ADMIN',
        status: 'active',
        mobile: '+345345343',
        email: 'test@test.org'
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
      const authCode = codeSpy.mock.calls[0][0]

      expect(authRes.result).toBeDefined()

      const res: { result?: { token: string } } = await server.server.inject({
        method: 'POST',
        url: '/verifyCode',
        payload: {
          nonce: authRes.result!.nonce,
          code: authCode
        }
      })

      expect(res.result).toBeDefined()
      expect(res.result!.token.split('.')).toHaveLength(3)
      const [, payload] = res.result!.token.split('.')
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
  })
  describe('user auth service says credentials are invalid', () => {
    it('returns a 401 if the code is bad', async () => {
      const authService = require('../authenticate/service')
      jest.spyOn(authService, 'authenticate').mockReturnValue({
        id: '1',
        scope: ['admin'],
        status: 'active',
        mobile: '+345345343'
      })
      const authRes: { result?: AuthenticateResponse } =
        await server.server.inject({
          method: 'POST',
          url: '/authenticate',
          payload: {
            mobile: '+345345343',
            password: '2r23432'
          }
        })
      const badCode = '1'

      expect(authRes.result).toBeDefined()

      const res = await server.server.inject({
        method: 'POST',
        url: '/verifyCode',
        payload: {
          nonce: authRes.result!.nonce,
          code: badCode
        }
      })
      expect(res.statusCode).toBe(401)
    })
  })
})
