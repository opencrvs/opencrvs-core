import { server } from 'src/index'
import * as fetch from 'jest-fetch-mock'

describe('authenticate handler receives a request', () => {
  describe('user management service says credentials are not valid', () => {
    it('returns a 401 response to client', async () => {
      fetch.mockResponse(JSON.stringify({ valid: false }))
      const res = await server.inject({
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
      const res = await server.inject({
        method: 'POST',
        url: '/authenticate',
        payload: {
          mobile: '+345345343',
          password: '2r23432'
        }
      })

      expect(JSON.parse(res.payload).nonce).toBe('12345')
    })
    it('generates a mobile verification code and stores it with nonce', async () => {})
  })
})
