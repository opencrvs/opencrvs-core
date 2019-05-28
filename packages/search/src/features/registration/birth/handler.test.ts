import { readFileSync } from 'fs'
import * as fetch from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import {
  indexComposition,
  searchComposition,
  updateComposition
} from 'src/elasticsearch/dbhelper'
import { createServer } from 'src/index'
import {
  mockBirthFhirBundle,
  mockBirthFhirBundleWithoutCompositionId,
  mockBirthRejectionTaskBundle,
  mockBirthRejectionTaskBundleWithoutCompositionReference,
  mockCompositionEntry,
  mockCompositionResponse,
  mockSearchResponse
} from 'src/test/utils'

jest.mock('src/elasticsearch/dbhelper.ts')

describe('Verify handlers', () => {
  let server: any

  describe('birthEventHandler', () => {
    beforeEach(async () => {
      server = await createServer()
    })

    it('should return status code 500 if invalid payload received', async () => {
      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:search-user'
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

    it('should return status code 200 if the event data is updated with task', async () => {
      ;(updateComposition as jest.Mock).mockReturnValue({})

      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:search-user'
      })

      const res = await server.server.inject({
        method: 'POST',
        url: '/events/birth/mark-voided',
        payload: mockBirthRejectionTaskBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(res.statusCode).toBe(200)
    })

    it('should return status code 500 if the event data is updated with a task where there is no focus reference for Composition', async () => {
      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:search-user'
      })

      const res = await server.server.inject({
        method: 'POST',
        url: '/events/birth/mark-voided',
        payload: mockBirthRejectionTaskBundleWithoutCompositionReference,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(res.statusCode).toBe(500)
    })

    it('should return status code 500 when composition has no ID', async () => {
      ;(indexComposition as jest.Mock).mockReturnValue({})
      ;(searchComposition as jest.Mock).mockReturnValue(mockSearchResponse)
      ;(updateComposition as jest.Mock).mockReturnValue({})
      fetch.mockResponses(
        [JSON.stringify(mockCompositionResponse)],
        [JSON.stringify(mockCompositionEntry)],
        [JSON.stringify(mockCompositionEntry)],
        [JSON.stringify({})]
      )
      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:search-user'
      })

      const res = await server.server.inject({
        method: 'POST',
        url: '/events/birth/new-declaration',
        payload: mockBirthFhirBundleWithoutCompositionId,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(res.statusCode).toBe(500)
    })

    it('should return status code 200 if the composition indexed correctly', async () => {
      ;(indexComposition as jest.Mock).mockReturnValue({})
      ;(searchComposition as jest.Mock).mockReturnValue(mockSearchResponse)
      ;(updateComposition as jest.Mock).mockReturnValue({})
      fetch.mockResponses(
        [JSON.stringify(mockCompositionResponse)],
        [JSON.stringify(mockCompositionEntry)],
        [JSON.stringify(mockCompositionEntry)],
        [JSON.stringify({})]
      )
      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:search-user'
      })

      const res = await server.server.inject({
        method: 'POST',
        url: '/events/birth/new-declaration',
        payload: mockBirthFhirBundle,
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
