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
import { createProductionEnvironmentServer } from '@auth/tests/util'
import * as codeService from '@auth/features/verifyCode/service'
import * as verifyUserService from '@auth/features/retrievalSteps/verifyUser/service'
import { AuthServer, createServer } from '@auth/server'

describe('verifyUser handler receives a request', () => {
  let server: AuthServer

  beforeEach(async () => {
    server = await createServer()
  })

  describe('events service says user is not valid', () => {
    it('returns a 401 response to client when error occurs', async () => {
      jest.spyOn(verifyUserService, 'verifyUser').mockRejectedValue(new Error())
      const res = await server.server.inject({
        method: 'POST',
        url: '/verifyUser',
        payload: { mobile: '+8801711111111', retrieveFlow: 'password' }
      })

      expect(res.statusCode).toBe(401)
    })
    it('returns a 401 response to client when the fetch call responses with a bad request response', async () => {
      jest
        .spyOn(verifyUserService, 'verifyUser')
        .mockRejectedValue(new Error('Bad request'))
      const res = await server.server.inject({
        method: 'POST',
        url: '/verifyUser',
        payload: { mobile: '+8801711111111', retrieveFlow: 'password' }
      })

      expect(res.statusCode).toBe(401)
    })
  })
  describe('events service says user is valid', () => {
    it('returns a nonce to the client', async () => {
      jest.spyOn(codeService, 'generateNonce').mockReturnValue('12345')
      jest.spyOn(verifyUserService, 'verifyUser').mockResolvedValue({
        userId: '1',
        username: 'fake_user_name',
        userFullName: [],
        scope: ['demo'],
        status: 'active',
        mobile: '+8801711111111',
        email: undefined,
        securityQuestionKey: 'dummyKey'
      })
      const res = await server.server.inject({
        method: 'POST',
        url: '/verifyUser',
        payload: { mobile: '+8801711111111', retrieveFlow: 'username' }
      })

      expect(JSON.parse(res.payload).nonce).toBe('12345')
    })
    it('generates a mobile verification code and sends it to notification gateway', async () => {
      server = await createProductionEnvironmentServer()

      /* eslint-disable @typescript-eslint/no-require-imports */
      /* eslint-disable @typescript-eslint/no-var-requires */
      const reloadedCodeService = require('../../verifyCode/service')
      const reloadedVerifyUserService = require('./service')

      jest.spyOn(reloadedVerifyUserService, 'verifyUser').mockResolvedValue({
        userId: '1',
        username: 'fake_user_name',
        userFullName: [],
        scope: ['admin'],
        status: 'active',
        mobile: '+8801711111111',
        email: undefined,
        securityQuestionKey: 'dummyKey'
      })
      jest.spyOn(reloadedCodeService, 'generateNonce').mockReturnValue('12345')

      const spy = jest
        .spyOn(reloadedCodeService, 'sendVerificationCode')
        .mockResolvedValue(undefined)

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
