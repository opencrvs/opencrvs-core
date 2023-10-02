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
import { createServer } from '@search/server'
import {
  mockTaskBundleWithExtensions,
  mockDeathFhirBundleWithoutCompositionId,
  mockUserModelResponse
} from '@search/test/utils'
import { readFileSync } from 'fs'
import * as fetchMock from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'

const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock

jest.mock('@search/elasticsearch/dbhelper.ts')

let server: any

describe('assignEventHandler', () => {
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
      url: '/events/assigned',
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
      url: '/events/assigned',
      payload: mockDeathFhirBundleWithoutCompositionId,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(500)
  })

  it('should return status code 200 if the composition indexed correctly', async () => {
    fetch.mockResponses([
      JSON.stringify(mockUserModelResponse),
      { status: 200 }
    ])

    const token = jwt.sign(
      { scope: [] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:search-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/events/assigned',
      payload: mockTaskBundleWithExtensions,
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

describe('unassignEventHandler', () => {
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
      url: '/events/unassigned',
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
      url: '/events/unassigned',
      payload: mockDeathFhirBundleWithoutCompositionId,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(500)
  })

  it('should return status code 200 if the composition indexed correctly', async () => {
    fetch.mockResponses([
      JSON.stringify(mockUserModelResponse),
      { status: 200 }
    ])

    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:search-user'
    })

    const res = await server.server.inject({
      method: 'POST',
      url: '/events/unassigned',
      payload: mockTaskBundleWithExtensions,
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
