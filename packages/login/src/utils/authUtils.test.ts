import { getTokenPayload } from '@login/utils/authUtils'

const performanceJWT =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE1NDE1NzY5NjUsImV4cCI6MTU3MzExMjk2NSwiYXVkIjoiIiwic3ViIjoiMSIsInNjb3BlIjoiWydwZXJmb3JtYW5jZSddIn0.huK3iFFi01xkwHvQZQAOnScrz0rJ50EsxpZA3a1Ynao'

describe('authUtils', () => {
  describe('getTokenPayload. Returns the correct payload from a token', () => {
    it('should return null if token not passed', () => {
      expect(getTokenPayload('')).toEqual(null)
    })

    it('should return null if error occurs', () => {
      expect(getTokenPayload('Invalid Token')).toEqual(null)
    })

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
})
