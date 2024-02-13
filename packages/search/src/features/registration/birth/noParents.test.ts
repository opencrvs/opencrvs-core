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
import { createServer } from '@search/server'
import {
  mockEncounterResponse,
  mockUserModelResponse,
  mockLocationResponse,
  mockBirthFhirBundle
} from '@search/test/utils'

import * as fetchMock from 'jest-fetch-mock'

const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock
import { searchForBirthDuplicates } from '@search/features/registration/deduplicate/service'
import { isComposition } from '@search/../../commons/build/dist/types'

jest.mock('@search/elasticsearch/dbhelper.ts')
jest.mock('@search/features/registration/deduplicate/service')

describe('Verify handlers', () => {
  let server: any

  describe('birthEventHandler', () => {
    beforeEach(async () => {
      server = await createServer()
    })

    it('should return status code 200 while father and mother sections is not present', async () => {
      ;(searchForBirthDuplicates as jest.Mock).mockResolvedValueOnce([])
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
        [JSON.stringify(mockEncounterResponse), { status: 200 }],
        [
          JSON.stringify({ partOf: { reference: 'Location/123' } }),
          { status: 200 }
        ],
        [
          JSON.stringify({ partOf: { reference: 'Location/0' } }),
          { status: 200 }
        ]
      )

      const token = jwt.sign({}, readFileSync('./test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:search-user'
      })

      const res = await server.server.inject({
        method: 'POST',
        url: '/record',
        payload: {
          ...mockBirthFhirBundle,
          entry: mockBirthFhirBundle.entry.map((e) => {
            if (isComposition(e.resource)) {
              return {
                ...e,
                resource: {
                  ...e.resource,
                  section: e.resource.section.filter(
                    (s) =>
                      s.code.coding[0].code !== 'mother-details' &&
                      s.code.coding[0].code !== 'father-details'
                  )
                }
              }
            }
            return e
          })
        },
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
