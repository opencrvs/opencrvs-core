import { createServerWithEnvironment } from '@auth/tests/util'
import { createServer } from '@auth/index'

describe('resend handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  describe('resend sms service says nonce is invalid', () => {
    it('returns a 401 response to client', async () => {
      const authService = require('../authenticate/service')
      jest
        .spyOn(authService, 'getStoredUserInformation')
        .mockImplementation(() => {
          throw new Error()
        })

      const res = await server.server.inject({
        method: 'POST',
        url: '/resendSms',
        payload: {
          nonce: '12345',
          retrievalFlow: true
        }
      })

      expect(res.statusCode).toBe(401)
    })
  })

  describe('resend sms service says nonce is valid, generates a mobile verification code and sends it to sms gateway', () => {
    it('returns a nonce to the client', async () => {
      server = await createServerWithEnvironment({ NODE_ENV: 'production' })
      const codeService = require('../verifyCode/service')
      const authService = require('../authenticate/service')
      jest.spyOn(authService, 'getStoredUserInformation').mockReturnValue({
        userId: '1',
        scope: ['admin'],
        mobile: '+345345343'
      })
      const spy = jest.spyOn(codeService, 'sendVerificationCode')

      const res = await server.server.inject({
        method: 'POST',
        url: '/resendSms',
        payload: {
          nonce: '12345'
        }
      })
      expect(spy).toHaveBeenCalled()
      expect(JSON.parse(res.payload).nonce).toBe('12345')
    })

    it('does not generate new verification code for a demo user', async () => {
      server = await createServerWithEnvironment({ NODE_ENV: 'production' })
      const codeService = require('../verifyCode/service')
      const authService = require('../authenticate/service')
      jest.spyOn(authService, 'getStoredUserInformation').mockReturnValue({
        userId: '2',
        scope: ['demo'],
        mobile: '+8801712323234'
      })
      const spy = jest.spyOn(codeService, 'sendVerificationCode')

      const res = await server.server.inject({
        method: 'POST',
        url: '/resendSms',
        payload: {
          nonce: '67890'
        }
      })
      expect(spy).not.toHaveBeenCalled()
      expect(JSON.parse(res.payload).nonce).toBe('67890')
    })
  })
})
