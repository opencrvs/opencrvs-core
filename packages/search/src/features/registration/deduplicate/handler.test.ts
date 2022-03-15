/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  updateComposition,
  searchByCompositionId
} from '@search/elasticsearch/dbhelper'
import { createServer } from '@search/server'
import { mockCompositionResponse, mockSearchResponse } from '@search/test/utils'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'

jest.mock('@search/elasticsearch/dbhelper.ts')

describe('Verify handlers', () => {
  let server: any

  describe('Deduplication handler', () => {
    beforeEach(async () => {
      server = await createServer()
    })

    it.skip('should return status code 500 if invalid payload received', async () => {
      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:search-user'
      })

      const res = await server.server.inject({
        method: 'POST',
        url: '/events/not-duplicate',
        payload: {},
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(res.statusCode).toBe(500)
    })

    it.skip('should return status code 200 if the composition indexed correctly', async () => {
      const mockedSearchByCompositionId =
        searchByCompositionId as jest.Mocked<any>
      const mockedUpdateComposition = updateComposition as jest.Mocked<any>

      mockedSearchByCompositionId.mockReturnValue(mockSearchResponse)
      mockedUpdateComposition.mockReturnValue({})

      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:search-user'
      })

      const res = await server.server.inject({
        method: 'POST',
        url: '/events/not-duplicate',
        payload: mockCompositionResponse,
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
