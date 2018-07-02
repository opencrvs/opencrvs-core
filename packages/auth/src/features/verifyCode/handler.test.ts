import * as fetch from 'jest-fetch-mock'
import { createServerWithEnvironment } from 'src/tests/util'

describe('authenticate handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServerWithEnvironment({ NODE_ENV: 'production' })
  })

  describe('user management service says credentials are valid', () => {
    it('generates a mobile verification code and sends it to sms gateway', async () => {
      const codeService = require('./service')
      fetch.mockResponse(
        JSON.stringify({
          valid: true,
          nonce: '12345',
          userId: '1',
          role: 'admin'
        })
      )
      const spy = jest.spyOn(codeService, 'sendVerificationCode')
      const authRes = await server.server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          mobile: '+345345343',
          password: '2r23432'
        }
      })

      const code = spy.mock.calls[0][1]
      const res = await server.server.inject({
        method: 'POST',
        url: '/verifyCode',
        payload: {
          nonce: authRes.result.nonce,
          code
        }
      })
      expect(res.result.token.split('.')).toHaveLength(3)
      const [, payload] = res.result.token.split('.')
      const body = JSON.parse(Buffer.from(payload, 'base64').toString())
      expect(body.role).toBe('admin')
      expect(body.sub).toBe('1')
    })
    it('returns a forbidden response if verifyCode endpoint is being used with invalid nonce / code', async () => {
      const res = await server.server.inject({
        method: 'POST',
        url: '/verifyCode',
        payload: {
          nonce: '2312',
          code: '23122'
        }
      })
      expect(res.result.statusCode).toBe(401)
    })
  })
})
