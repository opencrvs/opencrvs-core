import { verifyToken, validateFunc } from './token-verifier'
import * as fetchMock from 'jest-fetch-mock'

const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock

describe('Token verifier module', () => {
  describe('.verifyToken()', () => {
    it('Calls the auth service and return true if valid', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          valid: true
        })
      )

      const valid = await verifyToken('111', 'http://auth.opencrvs.org')
      expect(valid).toBe(true)
    })

    it('Calls the auth service and return false if valid', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          valid: false
        })
      )

      const valid = await verifyToken('222', 'http://auth.opencrvs.org')
      expect(valid).toBe(false)
    })
  })

  describe('.validateFunc()', () => {
    it('Verifies the token and returns true when valid if check token is enabled', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          valid: true
        })
      )

      const result = await validateFunc(
        '111',
        // @ts-ignore
        { headers: { authorization: 'Bearer: 111' } },
        'true',
        'http://auth.opencrvs.org'
      )
      expect(result.isValid).toBe(true)
      expect(result.credentials).toBe('111')
    })

    it('Verifies the token and returns false when valid if check token is enabled', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          valid: false
        })
      )

      const result = await validateFunc(
        '111',
        // @ts-ignore
        { headers: { authorization: 'Bearer: 111' } },
        'true',
        'http://auth.opencrvs.org'
      )
      expect(result.isValid).toBe(false)
      expect(result.credentials).not.toBeDefined()
    })

    it('Returns true when check token is disabled', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          valid: false
        })
      )

      const result = await validateFunc(
        '111',
        // @ts-ignore
        { headers: { authorization: 'Bearer: 111' } },
        'false',
        'http://auth.opencrvs.org'
      )
      expect(result.isValid).toBe(true)
      expect(result.credentials).toBe('111')
    })
  })
})
