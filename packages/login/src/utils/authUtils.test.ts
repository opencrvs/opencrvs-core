import { getTokenPayload, getRedirectURL } from './authUtils'
import { config } from '../config'

const performanceJWT =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE1NDE1NzY5NjUsImV4cCI6MTU3MzExMjk2NSwiYXVkIjoiIiwic3ViIjoiMSIsInNjb3BlIjoiWydwZXJmb3JtYW5jZSddIn0.huK3iFFi01xkwHvQZQAOnScrz0rJ50EsxpZA3a1Ynao'

const declareJWT =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE1NDE1NzY5NjUsImV4cCI6MTU3MzExMjk2NSwiYXVkIjoiIiwic3ViIjoiMSIsInNjb3BlIjoiWydkZWNsYXJlJ10ifQ.yMSf_4TJaFqgczHg1YgC0ev_bPneLaJwRsrA9eZkmUk'

describe('authUtils', () => {
  describe('getTokenPayload. Returns the correct payload from a token', () => {
    it('should return the right payload', () => {
      const response = {
        iss: '',
        iat: 1541576965,
        exp: 1573112965,
        aud: '',
        sub: '1',
        scope: "['performance']"
      }
      expect(getTokenPayload(performanceJWT)).toEqual(response)
    })
  })
  describe('getRedirectURL. Returns either the performance or register URLs depending on the content of the token', () => {
    it('should return the performance URL', () => {
      const response = `${config.PERFORMANCE_APP_URL}?token=${performanceJWT}`
      expect(getRedirectURL(performanceJWT)).toEqual(response)
    })
    it('should return the register URL', () => {
      const response = `${config.REGISTER_APP_URL}?token=${declareJWT}`
      expect(getRedirectURL(declareJWT)).toEqual(response)
    })
  })
})
