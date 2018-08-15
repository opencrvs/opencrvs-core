import * as fetch from 'jest-fetch-mock'
import { createServerWithEnvironment } from 'src/tests/util'
import { createServer } from '../..'

describe('resend handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  describe('resend sms service says nonce is invalid', () => {
    it('returns a 401 response to client', async () => {
      fetch.mockReject(new Error())
      const res = await server.server.inject({
        method: 'POST',
        url: '/resendSms',
        payload: {
          nonce: '12345'
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
        roles: ['admin'],
        mobile: '+345345343'
      })
      fetch.mockResponse(JSON.stringify({}))
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
  })
})
