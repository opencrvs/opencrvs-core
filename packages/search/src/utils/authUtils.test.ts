import { getTokenPayload } from '@search/utils/authUtils'

const token =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE1NDE1NzY5NjUsImV4cCI6MTU3MzExMjk2NSwiYXVkIjoiIiwic3ViIjoiMSIsInNjb3BlIjoiWydwZXJmb3JtYW5jZSddIn0.huK3iFFi01xkwHvQZQAOnScrz0rJ50EsxpZA3a1Ynao'

describe('authUtils', () => {
  it('getTokenPayload should return the right payload', () => {
    const response = {
      iss: '',
      iat: 1541576965,
      exp: 1573112965,
      aud: '',
      sub: '1',
      scope: "['performance']"
    }
    expect(getTokenPayload(token)).toEqual(response)
  })
  it('getTokenPayload should throw error for invalid token', () => {
    expect(() => getTokenPayload('invalid token')).toThrowError()
  })
})
