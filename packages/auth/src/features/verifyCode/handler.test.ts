import { createServerWithEnvironment } from '@auth/tests/util'

describe('authenticate handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServerWithEnvironment({ NODE_ENV: 'production' })
  })

  describe('user management service says credentials are valid', () => {
    it('verifies a code and generates a token', async () => {
      const codeService = require('./service')
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
      expect(body.scope).toEqual(['admin'])
      expect(body.sub).toBe('1')
    })
  })
  describe('user auth service says credentials are invalid', () => {
    it('returns a 401 if the code is bad', async () => {
      const authService = require('../authenticate/service')
      jest.spyOn(authService, 'authenticate').mockReturnValue({
        userId: '1',
        scope: ['admin'],
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
