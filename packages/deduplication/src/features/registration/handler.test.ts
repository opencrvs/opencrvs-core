import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import * as fetch from 'jest-fetch-mock'
import { createServer } from 'src/index'
import {
  mockFhirBundle,
  mockTaskBundle,
  mockSearchResponse,
  mockCompositionEntry
} from 'src/test/utils'
import { indexComposition, searchComposition } from 'src/elasticsearch/dbhelper'

jest.mock('src/elasticsearch/dbhelper.ts')

describe('Verify handlers', () => {
  let server: any

  describe('insertNewDeclarationHandler:', () => {
    beforeEach(async () => {
      server = await createServer()
    })

    it('should return status code 500 if invalid payload received', async () => {
      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:deduplication-user'
      })

      const res = await server.server.inject({
        method: 'POST',
        url: '/events/birth/new-declaration',
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(res.statusCode).toBe(500)
    })

    it('should return status code 200 if the composition indexed correctly', async () => {
      indexComposition.mockReturnValue({})
      searchComposition.mockReturnValue(mockSearchResponse)
      fetch.mockResponses(
        [JSON.stringify(mockCompositionEntry)],
        [JSON.stringify(mockCompositionEntry)],
        [JSON.stringify(mockCompositionEntry)],
        [JSON.stringify({})]
      )
      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:deduplication-user'
      })

      const res = await server.server.inject({
        method: 'POST',
        url: '/events/birth/new-declaration',
        payload: mockFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(res.statusCode).toBe(200)
    })

    afterAll(async () => {
      jest.clearAllMocks()
    })
  })

  describe('updatedDeclarationHandler:', () => {
    beforeEach(async () => {
      server = await createServer()
    })

    it('should return status code 500 if composition identifier not available in payload', async () => {
      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:deduplication-user'
      })

      const res = await server.server.inject({
        method: 'POST',
        url: '/events/birth/update-declaration',
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(res.statusCode).toBe(500)
    })

    it('should skip indexing if composition not updated', async () => {
      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:deduplication-user'
      })

      const res = await server.server.inject({
        method: 'POST',
        url: '/events/birth/update-declaration',
        payload: mockTaskBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(indexComposition.mock.calls.length).toBe(0)
    })

    it('should return status code 200 if the composition indexed correctly', async () => {
      indexComposition.mockReturnValue({})
      searchComposition.mockReturnValue(mockSearchResponse)
      fetch.mockResponses(
        [JSON.stringify(mockCompositionEntry)],
        [JSON.stringify(mockCompositionEntry)],
        [JSON.stringify({})]
      )
      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:deduplication-user'
      })

      const res = await server.server.inject({
        method: 'POST',
        url: '/events/birth/update-declaration',
        payload: mockFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(res.statusCode).toBe(200)
    })

    afterAll(async () => {
      jest.clearAllMocks()
    })
  })
})
