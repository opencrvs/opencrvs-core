import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import {
  indexComposition,
  searchComposition,
  updateComposition,
  searchByCompositionId
} from '@search/elasticsearch/dbhelper'
import { createServer } from '@search/index'
import {
  mockBirthFhirBundle,
  mockBirthFhirBundleWithoutCompositionId,
  mockBirthRejectionTaskBundle,
  mockBirthRejectionTaskBundleWithoutCompositionReference,
  mockCompositionEntry,
  mockCompositionResponse,
  mockSearchResponse,
  mockSearchResponseWithoutCreatedBy
} from '@search/test/utils'

import * as fetchMock from 'jest-fetch-mock'

const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock

jest.mock('@search/elasticsearch/dbhelper.ts')

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

    it('500 if the event data is updated with a task where there is no focus reference for Composition', async () => {
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
        [JSON.stringify(mockCompositionResponse), { status: 200 }],
        [JSON.stringify(mockCompositionEntry), { status: 200 }],
        [JSON.stringify(mockCompositionEntry), { status: 200 }],
        [JSON.stringify({}), { status: 200 }]
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
      const mockedIndexComposition = indexComposition as jest.Mocked<any>
      const mockedSearchComposition = searchComposition as jest.Mocked<any>
      const mockedSearchByCompositionId = searchByCompositionId as jest.Mocked<
        any
      >
      const mockedUpdateComposition = updateComposition as jest.Mocked<any>
      mockedIndexComposition.mockReturnValue({})
      mockedSearchComposition.mockReturnValue(mockSearchResponse)
      mockedSearchByCompositionId.mockReturnValue(mockSearchResponse)
      mockedUpdateComposition.mockReturnValue({})
      fetch.mockResponses(
        [JSON.stringify(mockCompositionResponse), { status: 200 }],
        [JSON.stringify(mockCompositionEntry), { status: 200 }],
        [JSON.stringify(mockCompositionEntry), { status: 200 }],
        [JSON.stringify({}), { status: 200 }]
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

    it('should return status code 200 if the composition indexed correctly', async () => {
      const mockedIndexComposition = indexComposition as jest.Mocked<any>
      const mockedSearchComposition = searchComposition as jest.Mocked<any>
      const mockedSearchByCompositionId = searchByCompositionId as jest.Mocked<
        any
      >
      const mockedUpdateComposition = updateComposition as jest.Mocked<any>
      mockedIndexComposition.mockReturnValue({})
      mockedSearchComposition.mockReturnValue(
        mockSearchResponseWithoutCreatedBy
      )
      mockedSearchByCompositionId.mockReturnValue(
        mockSearchResponseWithoutCreatedBy
      )
      mockedUpdateComposition.mockReturnValue({})
      fetch.mockResponses(
        [JSON.stringify(mockCompositionResponse), { status: 200 }],
        [JSON.stringify(mockCompositionEntry), { status: 200 }],
        [JSON.stringify(mockCompositionEntry), { status: 200 }],
        [JSON.stringify({}), { status: 200 }]
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
