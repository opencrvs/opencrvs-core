import { createServerWithEnvironment } from '@auth/tests/util'

describe('authenticate handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServerWithEnvironment({ NODE_ENV: 'production' })
  })

  describe('refresh expiring token', () => {
    it('verifies a token and generates a new token', async () => {
      const codeService = require('../verifyCode/service')
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
      const codeService = require('../verifyCode/service')
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
