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

import { resolvers as rootResolvers } from '@gateway/features/user/root-resolvers'
import { resolvers as locationRootResolvers } from '@gateway/features/location/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import {
  startContainer,
  stopContainer,
  flushAll
} from './utils/redis-test-utils'
import { StartedTestContainer } from 'testcontainers'
import { savedAdministrativeLocation } from '@opencrvs/commons/fixtures'
import { createServer } from '@gateway/server'
import { UUID } from '@opencrvs/commons'

const fetch = fetchAny as any
const resolvers = rootResolvers as any
const locationResolvers = locationRootResolvers as any

let container: StartedTestContainer
jest.mock('./constants', () => {
  const originalModule = jest.requireActual('./constants')
  return {
    __esModule: true,
    ...originalModule,
    DISABLE_RATE_LIMIT: false
  }
})
describe('Rate limit', () => {
  let authHeaderRegAgent: { Authorization: string }
  let authHeaderRegAgent2: { Authorization: string }

  beforeAll(async () => {
    container = await startContainer()
  })
  afterAll(async () => {
    await stopContainer(container)
  })

  beforeEach(async () => {
    await flushAll()
    fetch.resetMocks()

    const validateToken = jwt.sign(
      { scope: ['validate'] },
      readFileSync('./test/cert.key'),
      {
        subject: 'ba7022f0ff4822',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:gateway-user'
      }
    )
    authHeaderRegAgent = {
      Authorization: `Bearer ${validateToken}`
    }

    const validateToken2 = jwt.sign(
      { scope: ['validate'] },
      readFileSync('./test/cert.key'),
      {
        subject: '5bdc55ece42c82de9a529c36',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:gateway-user'
      }
    )
    authHeaderRegAgent2 = {
      Authorization: `Bearer ${validateToken2}`
    }
  })

  it('allows 10 calls and then throws RateLimitError', async () => {
    for (let i = 1; i <= 10; i++) {
      fetch.mockResponseOnce(
        JSON.stringify({
          username: 'sakibal.hasan',
          id: '123',
          scope: ['declare'],
          status: 'active'
        })
      )

      await resolvers.Query.verifyPasswordById(
        {},
        { id: '123', password: 'test' },
        { headers: authHeaderRegAgent },
        { fieldName: 'verifyPasswordById' }
      )
    }

    fetch.mockResponseOnce(
      JSON.stringify({
        username: 'sakibal.hasan',
        id: '123',
        scope: ['declare'],
        status: 'active'
      })
    )

    return expect(
      resolvers.Query.verifyPasswordById(
        {},
        { id: '123', password: 'test' },
        { headers: authHeaderRegAgent },
        { fieldName: 'verifyPasswordById' }
      )
    ).rejects.toThrow(
      'Too many requests within a minute. Please throttle your requests.'
    )
  })

  it('does not throw RateLimitError when called exactly 10 times', async () => {
    for (let i = 1; i <= 9; i++) {
      fetch.mockResponseOnce(
        JSON.stringify({
          username: 'sakibal.hasan',
          id: '123',
          scope: ['declare'],
          status: 'active'
        })
      )

      await resolvers.Query.verifyPasswordById(
        {},
        { id: '123', password: 'test' },
        { headers: authHeaderRegAgent },
        { fieldName: 'verifyPasswordById' }
      )
    }

    fetch.mockResponseOnce(
      JSON.stringify({
        username: 'sakibal.hasan',
        id: '123',
        scope: ['declare'],
        status: 'active'
      })
    )

    return expect(
      resolvers.Query.verifyPasswordById(
        {},
        { id: '123', password: 'test' },
        { headers: authHeaderRegAgent },
        { fieldName: 'verifyPasswordById' }
      )
    ).resolves.not.toThrowError()
  })

  it('does not throw RateLimitError when different users try to access the same route', async () => {
    const users = [
      { username: 'sakibal.hasan', id: '0' },
      { username: 'p.rouvila', id: '1' }
    ]

    // Call the route 7 times for all users, it should not throw RateLimitError for this user yet
    for (let i = 1; i <= 7; i++) {
      fetch.mockResponseOnce(
        JSON.stringify({
          username: users[0].username,
          id: users[0].id,
          scope: ['declare'],
          status: 'active'
        })
      )

      await resolvers.Query.verifyPasswordById(
        {},
        { id: users[0].id, password: 'test' },
        { headers: authHeaderRegAgent },
        { fieldName: 'verifyPasswordById' }
      )
    }

    // ...now call the same route 7 times for the second user, it should not throw RateLimitError for this user either
    for (let i = 1; i <= 7; i++) {
      fetch.mockResponseOnce(
        JSON.stringify({
          username: users[1].username,
          id: users[1].id,
          scope: ['declare'],
          status: 'active'
        })
      )

      await resolvers.Query.verifyPasswordById(
        {},
        { id: users[1].id, password: 'test' },
        { headers: authHeaderRegAgent2 },
        { fieldName: 'verifyPasswordById' }
      )
    }

    // ...now call the same route for the first user again, it should not still throw RateLimitError
    fetch.mockResponseOnce(
      JSON.stringify({
        username: users[0].username,
        id: users[0].id,
        scope: ['declare'],
        status: 'active'
      })
    )

    return expect(
      resolvers.Query.verifyPasswordById(
        {},
        { id: users[0].id, password: 'test' },
        { headers: authHeaderRegAgent },
        { fieldName: 'verifyPasswordById' }
      )
    ).resolves.not.toThrowError()
  })

  it('does not throw RateLimitError when a non-rate-limited route is being called 20 times', async () => {
    const resolverCalls = Array.from({ length: 20 }, async () => {
      fetch.mockResponseOnce(
        JSON.stringify([
          savedAdministrativeLocation({
            partOf: { reference: 'Location/1' as `Location/${UUID}` }
          })
        ])
      )
      await locationResolvers.Query!.isLeafLevelLocation(
        {},
        { locationId: '1' },
        { headers: authHeaderRegAgent },
        { fieldName: 'isLeafLevelLocation' }
      )
    })

    return expect(() => Promise.all(resolverCalls)).not.toThrowError()
  })

  it('handles multiple users authenticating with different usernames', async () => {
    const server = await createServer()

    // okay to go through 10 times
    for (let i = 1; i <= 10; i++) {
      const res = await server.app.inject({
        method: 'POST',
        url: '/auth/authenticate',
        payload: {
          username: 'test.user',
          password: 'test'
        }
      })

      expect((res.result as any).statusCode).not.toBe(402)
    }

    // should return 402 Forbidden
    const res = await server.app.inject({
      method: 'POST',
      url: '/auth/authenticate',
      payload: {
        username: 'test.user',
        password: 'test'
      }
    })
    expect((res.result as any).statusCode).toBe(402)

    // okay to go through 10 times with a different username
    for (let i = 1; i <= 10; i++) {
      const res = await server.app.inject({
        method: 'POST',
        url: '/auth/authenticate',
        payload: {
          username: 'test.user2',
          password: 'test'
        }
      })
      expect((res.result as any).statusCode).not.toBe(402)
    }

    // should return 402 Forbidden
    const res2 = await server.app.inject({
      method: 'POST',
      url: '/auth/authenticate',
      payload: {
        username: 'test.user2',
        password: 'test'
      }
    })
    expect((res2.result as any).statusCode).toBe(402)
  })
})
