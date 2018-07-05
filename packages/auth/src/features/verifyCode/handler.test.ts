import * as fetch from 'jest-fetch-mock'
import { createServerWithEnvironment } from 'src/tests/util'

describe('authenticate handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServerWithEnvironment({ NODE_ENV: 'production' })
  })

  describe('user management service says credentials are valid', () => {
    it('verifies a code and generates a token', async () => {
      const codeService = require('./service')
      const authService = require('../authenticate/service')

      fetch.mockResponse(
        JSON.stringify({
          valid: true,
          nonce: '12345',
          userId: '1',
          role: 'admin'
        })
      )
      const codeSpy = jest.spyOn(codeService, 'sendVerificationCode')
      jest.spyOn(authService, 'authenticate').mockReturnValue({
        userId: '1',
        role: 'admin',
        mobile: '+345345343'
      })

      const authRes = await server.server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          mobile: '+345345343',
          password: '2r23432'
        }
      })
      const smsCode = codeSpy.mock.calls[0][1]
      const res = await server.server.inject({
        method: 'POST',
        url: '/verifyCode',
        payload: {
          nonce: authRes.result.nonce,
          code: smsCode
        }
      })

      expect(res.result.token.split('.')).toHaveLength(3)
      const [, payload] = res.result.token.split('.')
      const body = JSON.parse(Buffer.from(payload, 'base64').toString())
      expect(body.role).toBe('admin')
      expect(body.sub).toBe('1')
    })
  })
  describe('user auth service says credentials are invalid', () => {
    it('returns a 401 if the code is bad', async () => {
      const authService = require('../authenticate/service')

      fetch.mockResponse(
        JSON.stringify({
          valid: true,
          nonce: '12345',
          userId: '1',
          role: 'admin'
        })
      )
      jest.spyOn(authService, 'authenticate').mockReturnValue({
        userId: '1',
        role: 'admin',
        mobile: '+345345343'
      })
      const authRes = await server.server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          mobile: '+345345343',
          password: '2r23432'
        }
      })
      const badCode = '1'
      const res = await server.server.inject({
        method: 'POST',
        url: '/verifyCode',
        payload: {
          nonce: authRes.result.nonce,
          code: badCode
        }
      })
      expect(res.statusCode).toBe(401)
    })
  })
})
