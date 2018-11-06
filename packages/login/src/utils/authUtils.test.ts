import { getTokenPayload, getRedirectURL } from './authUtils'
import { config } from '../config'

const performanceJWT =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE1NDExNjU0NjEsImV4cCI6MTU0MTUyNDY5NywiYXVkIjoiIiwic3ViIjoiMSIsInNjb3BlIjoiWydwZXJmb3JtYW5jZSddIiwianRpIjoiMGQ3NzVhMTQtNDdjNS00OWQzLWIxNTQtNDhlYzM4YjUxNDg2In0.9k5QtB4D-6b-xZLjrOwaPDC0aNhmpwonaQrkMVdjDW4'

const declareJWT =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE1NDExNjU0NjEsImV4cCI6MTU0MTUyNDc2NCwiYXVkIjoiIiwic3ViIjoiMSIsInNjb3BlIjoiWydkZWNsYXJlJ10iLCJqdGkiOiI0ZjVmZTliYS04NTQ3LTRjOTgtOTY4Ni0zOGQyN2U4MTgwMjUifQ.Uc_2ynPEcJAB9aNEEhydj4l2wYSF_ClAggtLd2lmvF4'

describe('authUtils', () => {
  describe('getTokenPayload. Returns the correct payload from a token', () => {
    it('should return the right payload', () => {
      const response = {
        iss: '',
        iat: 1541165461,
        exp: 1541524697,
        aud: '',
        sub: '1',
        jti: '0d775a14-47c5-49d3-b154-48ec38b51486', // NEED TO REMOVE THIS
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
