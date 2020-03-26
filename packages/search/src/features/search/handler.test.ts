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
    it('should return status code 403 if the token does not hold any of the Register, Validate or Declare scope', async () => {
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
    it('should return status code 200 when the token hold any or some of Register, Validate or Declare', async () => {
      const token = jwt.sign(
        {
          scope: ['register', 'validate', 'declare']
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

    afterAll(async () => {
      jest.clearAllMocks()
    })
  })

  describe('When the request is made', () => {
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
      expect(JSON.parse(res.payload).body).toHaveProperty('_shards')
    })

    afterAll(async () => {
      jest.clearAllMocks()
    })
  })
})
