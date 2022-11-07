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
import { resolvers } from '@gateway/features/search/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

const fetch = fetchAny as any

beforeEach(() => {
  fetch.resetMocks()
})

describe('Search root resolvers', () => {
  describe('searchEvents()', () => {
    let authHeaderValidUserRegister: { Authorization: string }
    let authHeaderValidUserDeclare: { Authorization: string }

    beforeEach(() => {
      fetch.resetMocks()
      const validUserTokenRegister = jwt.sign(
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderValidUserRegister = {
        Authorization: `Bearer ${validUserTokenRegister}`
      }
      const validUserTokenDeclare = jwt.sign(
        { scope: ['declare'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderValidUserDeclare = {
        Authorization: `Bearer ${validUserTokenDeclare}`
      }
    })
    it('returns an array of composition results for event', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: {
              total: { value: 1 },
              hits: [{ _type: 'composition', _source: {} }]
            }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          advanceSearchParameters: {
            event: 'Birth'
          }
        },
        authHeaderValidUserDeclare
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results for status', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: {
              total: { value: 1 },
              hits: [{ _type: 'composition', _source: {} }]
            }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          advanceSearchParameters: {
            registrationStatuses: ['DECLARED']
          }
        },
        authHeaderValidUserDeclare
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results for compositionType', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: {
              total: { value: 1 },
              hits: [{ _type: 'composition', _source: {} }]
            }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          advanceSearchParameters: {
            compositionType: ['birth-declaration', 'death-declaration']
          }
        },
        authHeaderValidUserDeclare
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results for locationIds', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: {
              total: { value: 1 },
              hits: [{ _type: 'composition', _source: {} }]
            }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          advanceSearchParameters: {
            locationIds: ['0411ff3d-78a4-4348-8eb7-b023a0ee6dce']
          }
        },
        authHeaderValidUserDeclare
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('should returns error if no has param', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: {
              total: { value: 1 },
              hits: [{ _type: 'composition', _source: {} }]
            }
          }
        })
      )

      await expect(
        resolvers.Query.searchEvents(
          {},
          {
            advanceSearchParameters: {}
          },
          authHeaderValidUserRegister
        )
      ).rejects.toThrowError('There is no param to search')
    })
    it('returns an array of composition results for trackingId', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: {
              total: { value: 1 },
              hits: [{ _type: 'composition', _source: {} }]
            }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          advanceSearchParameters: {
            trackingId: 'B123456'
          }
        },
        authHeaderValidUserRegister
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results for sortColumn', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: {
              total: { value: 1 },
              hits: [{ _type: 'composition', _source: {} }]
            }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          advanceSearchParameters: {
            trackingId: 'B123456'
          },
          sortColumn: 'modifiedAt.keyword'
        },
        authHeaderValidUserRegister
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results with given count', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: {
              total: { value: 1 },
              hits: [{ _type: 'composition', _source: {} }]
            }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          advanceSearchParameters: {
            trackingId: 'B123456'
          },
          count: 10,
          skip: 2
        },
        authHeaderValidUserRegister
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns total item as 0 and an empty array in-case of invalid result found from elastic', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: { hits: null }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          advanceSearchParameters: {
            event: 'Birth',
            locationIds: '0411ff3d-78a4-4348-8eb7-b023a0ee6dce'
          }
        },
        authHeaderValidUserRegister
      )

      expect(result).toBeDefined()
      expect(result.results).toEqual([])
      expect(result.totalItems).toBe(0)
    })
    it('returns an array of composition results for name', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: {
              total: { value: 1 },
              hits: [{ _type: 'composition', _source: {} }]
            }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          advanceSearchParameters: {
            name: 'Hasib'
          }
        },
        authHeaderValidUserRegister
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
  })

  describe('getEventsWithProgress()', () => {
    let unauthorizedUser: { Authorization: string }
    let authorizedUser: { Authorization: string }

    beforeEach(() => {
      fetch.resetMocks()
      const declareToken = jwt.sign(
        { scope: ['declare'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      unauthorizedUser = {
        Authorization: `Bearer ${declareToken}`
      }
      const sysadminUserToken = jwt.sign(
        { scope: ['sysadmin'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authorizedUser = {
        Authorization: `Bearer ${sysadminUserToken}`
      }
    })
    it('returns an array of results for an authorized user', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: {
              total: { value: 1 },
              hits: [{ _type: 'composition', _source: {} }]
            }
          }
        })
      )
      const result = await resolvers.Query.getEventsWithProgress(
        {},
        {
          locationId: 'dummy_loc_id_parent',
          count: 25,
          skip: 25,
          type: ['birth-declaration'],
          status: ['REGISTERED']
        },
        authorizedUser
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('throws an error for unauthorized user', async () => {
      await expect(
        resolvers.Query.getEventsWithProgress({}, {}, unauthorizedUser)
      ).rejects.toThrowError(
        'User does not have a sysadmin or register or validate scope'
      )
    })
    it('returns empty result for invalid location id', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          entry: []
        })
      )
      const result = await resolvers.Query.getEventsWithProgress(
        {},
        { locationId: null },
        authorizedUser
      )
      expect(result.totalItems).toBe(0)
      expect(result.results).toEqual([])
    })
  })
})
