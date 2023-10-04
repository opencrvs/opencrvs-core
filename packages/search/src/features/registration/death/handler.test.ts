/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import {
  indexComposition,
  searchByCompositionId,
  updateComposition
} from '@search/elasticsearch/dbhelper'
import { createServer } from '@search/server'
import {
  mockDeathFhirBundle,
  mockDeathFhirBundleWithoutCompositionId,
  mockDeathRejectionTaskBundle,
  mockLocationResponse,
  mockMinimalDeathFhirBundle,
  mockSearchResponse,
  mockSearchResponseWithoutCreatedBy,
  mockUserModelResponse,
  mockEncounterResponse
} from '@search/test/utils'
import { readFileSync } from 'fs'
import * as fetchMock from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import { searchForDeathDuplicates } from '@search/features/registration/deduplicate/service'

const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock

jest.mock('@search/elasticsearch/dbhelper.ts')
jest.mock('@search/features/registration/deduplicate/service')

describe('Verify handlers', () => {
  let server: any

  describe('deathEventHandler', () => {
    beforeEach(async () => {
      server = await createServer()
      const mockedsearchForDuplicates =
        searchForDeathDuplicates as jest.Mocked<any>
      mockedsearchForDuplicates.mockReturnValue([])
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
      const mockedIndexComposition = indexComposition as jest.Mocked<any>
      const mockedSearchByCompositionId =
        searchByCompositionId as jest.Mocked<any>
      mockedIndexComposition.mockResolvedValue({})
      mockedSearchByCompositionId.mockReturnValue(mockSearchResponse)

      fetch.mockResponses(
        [JSON.stringify(mockEncounterResponse), { status: 200 }],
        [
          JSON.stringify({ partOf: { reference: 'Location/123' } }),
          { status: 200 }
        ],
        [
          JSON.stringify({ partOf: { reference: 'Location/0' } }),
          { status: 200 }
        ],
        [JSON.stringify(mockUserModelResponse), { status: 200 }],
        [JSON.stringify(mockLocationResponse), { status: 200 }],
        [JSON.stringify(mockLocationResponse), { status: 200 }]
      )

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

    it('should return status code 200 if the some sections is missing too', async () => {
      fetch.resetMocks()
      const mockedIndexComposition = indexComposition as jest.Mocked<any>
      const mockedSearchByCompositionId =
        searchByCompositionId as jest.Mocked<any>
      mockedIndexComposition.mockResolvedValue({})
      mockedSearchByCompositionId.mockReturnValue(mockSearchResponse)

      fetch.mockResponses(
        [JSON.stringify(mockEncounterResponse), { status: 200 }],
        [
          JSON.stringify({ partOf: { reference: 'Location/123' } }),
          { status: 200 }
        ],
        [
          JSON.stringify({ partOf: { reference: 'Location/0' } }),
          { status: 200 }
        ],
        [JSON.stringify(mockUserModelResponse), { status: 200 }],
        [JSON.stringify(mockLocationResponse), { status: 200 }],
        [JSON.stringify(mockLocationResponse), { status: 200 }]
      )

      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:search-user'
      })

      const res = await server.server.inject({
        method: 'POST',
        url: '/events/death/new-declaration',
        payload: mockMinimalDeathFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(res.statusCode).toBe(200)
    })

    it('should return status code 200 if the composition indexed correctly', async () => {
      fetch.resetMocks()
      const mockedIndexComposition = indexComposition as jest.Mocked<any>
      const mockedSearchByCompositionId =
        searchByCompositionId as jest.Mocked<any>
      mockedIndexComposition.mockReturnValue({})
      mockedSearchByCompositionId.mockReturnValue(
        mockSearchResponseWithoutCreatedBy
      )

      fetch.mockResponses(
        [JSON.stringify(mockEncounterResponse), { status: 200 }],
        [
          JSON.stringify({ partOf: { reference: 'Location/123' } }),
          { status: 200 }
        ],
        [
          JSON.stringify({ partOf: { reference: 'Location/0' } }),
          { status: 200 }
        ],
        [JSON.stringify(mockUserModelResponse), { status: 200 }],
        [JSON.stringify(mockLocationResponse), { status: 200 }],
        [JSON.stringify(mockLocationResponse), { status: 200 }]
      )

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
      ;(updateComposition as jest.Mock).mockReturnValue({})

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

    afterAll(async () => {
      jest.clearAllMocks()
    })
  })
})
