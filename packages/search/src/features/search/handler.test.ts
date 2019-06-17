import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { createServer } from '@search/index'
import { searchComposition } from '@search/features/search/service'
import { mockSearchResult } from '@search/test/utils'

jest.mock('./service.ts')

describe('Verify handlers', () => {
  let server: any

  describe('Check Access role', () => {
    beforeEach(async () => {
      server = await createServer()
    })
    it('should return status code 403 if not Registrar or Declare', async () => {
      const token = jwt.sign(
        {
          scope: ['anonymous']
        },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:search-user'
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/search',
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(res.statusCode).toBe(403)
    })
    it('should return status code 200 for Registrar or Declare scope', async () => {
      const token = jwt.sign(
        {
          scope: ['register', 'declare']
        },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:search-user'
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/search',
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(200)
    })
    it('should return status code 500', async () => {
      ;(searchComposition as jest.Mock).mockImplementation(() => {
        throw 'dead'
      })
      const token = jwt.sign(
        {
          scope: ['register']
        },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:search-user'
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/search',
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(500)
    })
  })

  describe('When the request is made', async () => {
    let token: string
    beforeEach(async () => {
      ;(searchComposition as jest.Mock).mockReturnValue(mockSearchResult)
      server = await createServer()
      token = jwt.sign(
        {
          scope: ['register']
        },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:search-user'
        }
      )
    })

    it('Should return a valid response as expected', async () => {
      const res = await server.server.inject({
        method: 'POST',
        url: '/search',
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(JSON.parse(res.payload)).toHaveProperty('_shards')
    })
  })
})
