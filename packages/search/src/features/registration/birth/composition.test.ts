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
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import {
  indexComposition,
  updateComposition,
  searchByCompositionId
} from '@search/elasticsearch/dbhelper'
import { createServer } from '@search/server'
import {
  mockBirthFhirBundle,
  mockCompositionEntry,
  mockCompositionResponse,
  mockSearchResponse,
  mockSearchResponseWithoutCreatedBy,
  mockEncounterResponse,
  mockLocationResponse,
  mockUserModelResponse,
  mockTaskBundleWithExtensions
} from '@search/test/utils'

import * as fetchMock from 'jest-fetch-mock'
import { searchForBirthDuplicates } from '@search/features/registration/deduplicate/service'

const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock

jest.mock('@search/elasticsearch/dbhelper.ts')
jest.mock('@search/features/registration/deduplicate/service')

describe('Verify handlers', () => {
  let server: any

  describe('birthEventHandler', () => {
    beforeEach(async () => {
      server = await createServer()
      fetch.resetMocks()
    })

    it('should return status code 200 if the composition indexed correctly', async () => {
      const mockedIndexComposition = indexComposition as jest.Mocked<any>
      const mockedsearchForDuplicates =
        searchForBirthDuplicates as jest.Mocked<any>
      const mockedSearchByCompositionId =
        searchByCompositionId as jest.Mocked<any>

      const mockedUpdateComposition = updateComposition as jest.Mocked<any>

      mockedIndexComposition.mockReturnValue({})

      mockedsearchForDuplicates.mockReturnValue(
        mockSearchResponse.body.hits.hits
      )
      mockedSearchByCompositionId.mockReturnValue(mockSearchResponse)
      mockedUpdateComposition.mockReturnValue({})
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
        [JSON.stringify(mockTaskBundleWithExtensions), { status: 200 }],
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
      const mockedSearchComposition =
        searchForBirthDuplicates as jest.Mocked<any>
      const mockedSearchByCompositionId =
        searchByCompositionId as jest.Mocked<any>
      const mockedUpdateComposition = updateComposition as jest.Mocked<any>
      mockedIndexComposition.mockReturnValue({})
      mockedSearchComposition.mockReturnValue(
        mockSearchResponseWithoutCreatedBy.body.hits.hits
      )
      mockedSearchByCompositionId.mockReturnValue(
        mockSearchResponseWithoutCreatedBy
      )
      mockedUpdateComposition.mockReturnValue({})
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
        [JSON.stringify(mockTaskBundleWithExtensions), { status: 200 }],
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
