import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { indexComposition, updateComposition } from 'src/elasticsearch/dbhelper'
import { createServer } from 'src/index'
import { searchByCompositionId } from 'src/elasticsearch/dbhelper'
import {
  mockDeathFhirBundle,
  mockDeathFhirBundleWithoutCompositionId,
  mockDeathRejectionTaskBundle,
  mockDeathRejectionTaskBundleWithoutCompositionReference,
  mockSearchResponse
} from 'src/test/utils'

jest.mock('src/elasticsearch/dbhelper.ts')

describe('Verify handlers', () => {
  let server: any

  describe('deathEventHandler', () => {
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
        url: '/events/death/new-declaration',
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(res.statusCode).toBe(500)
    })

    it('should return status code 500 if invalid payload received where composition has no ID', async () => {
      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:search-user'
      })

      const res = await server.server.inject({
        method: 'POST',
        url: '/events/death/new-declaration',
        payload: mockDeathFhirBundleWithoutCompositionId,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(res.statusCode).toBe(500)
    })

    it('should return status code 200 if the composition indexed correctly', async () => {
      indexComposition.mockReturnValue({})
      searchByCompositionId.mockReturnValue(mockSearchResponse)
      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:search-user'
      })

      const res = await server.server.inject({
        method: 'POST',
        url: '/events/death/new-declaration',
        payload: mockDeathFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(res.statusCode).toBe(200)
    })

    it('should return status code 200 if the event data is updated with task', async () => {
      updateComposition.mockReturnValue({})

      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:search-user'
      })

      const res = await server.server.inject({
        method: 'POST',
        url: '/events/death/mark-voided',
        payload: mockDeathRejectionTaskBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(res.statusCode).toBe(200)
    })

    it('should return status code 500 if the event data is updated with task where there is no focus reference for Composition', async () => {
      updateComposition.mockReturnValue({})

      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:search-user'
      })

      const res = await server.server.inject({
        method: 'POST',
        url: '/events/death/mark-voided',
        payload: mockDeathRejectionTaskBundleWithoutCompositionReference,
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
