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
// eslint-disable-next-line import/no-relative-parent-imports
import {
  startContainer,
  stopContainer,
  flushAll
} from './utils/redis-test-utils'
import { StartedTestContainer } from 'testcontainers'

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

  it('does not throw RateLimitError when a non-rate-limited route is being called 20 times', async () => {
    const resolverCalls = Array.from({ length: 20 }, async () => {
      fetch.mockResponseOnce(JSON.stringify({ resourceType: 'Location' }))
      await locationResolvers.Query.locationById(
        {},
        { locationId: '1' },
        { headers: authHeaderRegAgent },
        { fieldName: 'locationById' }
      )
    })

    return expect(() => Promise.all(resolverCalls)).not.toThrowError()
  })
})
