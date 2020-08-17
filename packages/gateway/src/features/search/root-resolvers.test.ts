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
    it('returns an array of composition results for eventType', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          eventType: 'Birth'
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results for status', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          status: 'DECLARED'
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results for type', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          type: ['birth-application', 'death-application']
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results for locationIds', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          locationIds: ['0411ff3d-78a4-4348-8eb7-b023a0ee6dce']
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('should returns error for not register scope user without location IDs', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
          }
        })
      )

      await expect(
        resolvers.Query.searchEvents(
          {},
          {
            type: ['birth-application', 'death-application']
          },
          authHeaderValidUserDeclare
        )
      ).rejects.toThrowError('User does not have permission')
    })
    it('should returns error for invalid locationIds', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
          }
        })
      )

      await expect(
        resolvers.Query.searchEvents(
          {},
          {
            locationIds: ['']
          },
          authHeaderValidUserRegister
        )
      ).rejects.toThrowError('Invalid location id')
    })
    it('returns an array of composition results for searchContent', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          searchContent: '01622688231'
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results for trackingId', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          trackingId: 'B123456'
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results for registrationNumber', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          registrationNumber: 'D2019123258D1234562'
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results for contactNumber', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          contactNumber: '01622688231'
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results for userId', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          userId: '1'
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results with given count', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          count: 10,
          skip: 2
        }
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
          eventType: 'Birth',
          status: 'DECLARED',
          locationIds: ['0411ff3d-78a4-4348-8eb7-b023a0ee6dce'],
          searchContent: '01622688231'
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toEqual([])
      expect(result.totalItems).toBe(0)
    })
    it('returns an array of composition results for name', async () => {
      fetch.mockResponse(
        JSON.stringify({
          body: {
            hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
          }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          name: 'Hasib'
        }
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
      fetch.mockResponses(
        [
          JSON.stringify({
            entry: [
              { resource: { id: 'dummy_loc_id1' } },
              { resource: { id: 'dummy_loc_id2' } }
            ]
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            body: {
              hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
            }
          })
        ]
      )
      const result = await resolvers.Query.getEventsWithProgress(
        {},
        {
          parentLocationId: 'dummy_loc_id_parent',
          count: 25,
          skip: 25,
          type: ['birth-application'],
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
        { parentLocationId: null },
        authorizedUser
      )
      expect(result.totalItems).toBe(0)
      expect(result.results).toEqual([])
    })
  })
})
