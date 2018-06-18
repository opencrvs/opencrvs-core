import { createServer } from 'src/index'
import * as fetch from 'jest-fetch-mock'
import * as codeService from '../verifyCode/service'

describe('authenticate handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
    await server.start()
  })
  afterEach(() => server.stop())

  describe('user management service says credentials are not valid', () => {
    it('returns a 401 response to client', async () => {
      fetch.mockResponse(JSON.stringify({ valid: false }))
      const res = await server.server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          mobile: '+345345343',
          password: '2r23432'
        }
      })

      expect(res.statusCode).toBe(401)
    })
  })
  describe('user management service says credentials are valid', () => {
    it('returns a nonce to the client', async () => {
      fetch.mockResponse(JSON.stringify({ valid: true, nonce: '12345' }))
      const res = await server.server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          mobile: '+345345343',
          password: '2r23432'
        }
      })

      expect(JSON.parse(res.payload).nonce).toBe('12345')
    })
    it('generates a mobile verification code and sends it to sms gateway', async () => {
      fetch.mockResponse(JSON.stringify({ valid: true, nonce: '12345' }))
      const spy = jest.spyOn(codeService, 'sendVerificationCode')

      await server.server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          mobile: '+345345343',
          password: '2r23432'
        }
      })

      expect(spy).toHaveBeenCalled()
      expect(spy.mock.calls[0]).toHaveLength(2)
      expect(spy.mock.calls[0][0]).toBe('+345345343')
    })
  })
})
