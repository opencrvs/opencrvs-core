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
import { createServer } from '@auth/server'

describe('resend handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  describe('resend sms service says nonce is invalid', () => {
    it('returns a 401 response to client', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const authService = require('../authenticate/service')
      jest
        .spyOn(authService, 'getStoredUserInformation')
        .mockImplementation(() => {
          throw new Error()
        })

      const res = await server.server.inject({
        method: 'POST',
        url: '/resendAuthenticationCode',
        payload: {
          nonce: '12345',
          notificationEvent: 'authenticationCodeNotification',
          retrievalFlow: true
        }
      })

      expect(res.statusCode).toBe(401)
    })
  })

  describe('resend notification service says nonce is valid, generates a mobile verification code and sends it to notification gateway', () => {
    it('returns a nonce to the client', async () => {
      server = await createServerWithEnvironment({ NODE_ENV: 'production' })
      // eslint-disable-next-line
      const codeService = require('../verifyCode/service')
      // eslint-disable-next-line
      const authService = require('../authenticate/service')
      jest.spyOn(authService, 'getStoredUserInformation').mockReturnValue({
        userId: '1',
        scope: ['admin'],
        mobile: '+345345343'
      })
      const spy = jest.spyOn(codeService, 'sendVerificationCode')

      const res = await server.server.inject({
        method: 'POST',
        url: '/resendAuthenticationCode',
        payload: {
          nonce: '12345',
          notificationEvent: 'authenticationCodeNotification'
        }
      })
      expect(spy).toHaveBeenCalled()
      expect(JSON.parse(res.payload).nonce).toBe('12345')
    })

    it('does not generate new verification code for a demo user', async () => {
      server = await createServerWithEnvironment({ NODE_ENV: 'development' })
      // eslint-disable-next-line
      const codeService = require('../verifyCode/service')
      // eslint-disable-next-line
      const authService = require('../authenticate/service')
      jest.spyOn(authService, 'getStoredUserInformation').mockReturnValue({
        userId: '2',
        scope: ['demo'],
        mobile: '+8801712323234'
      })
      const spy = jest.spyOn(codeService, 'sendVerificationCode')

      const res = await server.server.inject({
        method: 'POST',
        url: '/resendAuthenticationCode',
        payload: {
          nonce: '67890',
          notificationEvent: 'authenticationCodeNotification'
        }
      })
      expect(spy).not.toHaveBeenCalled()
      expect(JSON.parse(res.payload).nonce).toBe('67890')
    })
  })
})
