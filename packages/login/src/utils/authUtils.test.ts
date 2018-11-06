import { getTokenPayload, getRedirectURL } from './authUtils'
import { config } from '../config'

const performanceJWT =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE1NDExNjU0NjEsImV4cCI6MTU3MjcwMTQ2MSwiYXVkIjoiIiwic3ViIjoiMSIsImNsYWltcyI6IlsncGVyZm9ybWFuY2UnXSJ9.B9n01MM8ZZyvXsE0AmdWNzYjcTsEJK-bM2DiRLJEi58'

const declareJWT =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE1NDExNjU0NjEsImV4cCI6MTU3MjcwMTQ2MSwiYXVkIjoiIiwic3ViIjoiMSIsImNsYWltcyI6IlsnZGVjbGFyZSddIn0.y692mz7WDYc-UrO0oIxX_aji68lUtBJO4UyKUSntoVg'

describe('authUtils', () => {
  describe('getTokenPayload. Returns the correct payload from a token', () => {
    it('should return the right payload', () => {
      const response = {
        iss: '',
        iat: 1541165461,
        exp: 1572701461,
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
