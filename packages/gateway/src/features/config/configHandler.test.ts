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
import * as fetchAny from 'jest-fetch-mock'
import { createServer } from '@gateway/server'
import { api } from '@gateway/v2-events/events/service'

jest.mock('@gateway/v2-events/events/service', () => ({
  api: {
    config: {
      application: { query: jest.fn() },
      publicApplication: { query: jest.fn() },
      certificates: { query: jest.fn() }
    }
  }
}))

const fetch = fetchAny as fetchAny.FetchMock
const config = api.config as unknown as Record<
  'application' | 'publicApplication' | 'certificates',
  { query: jest.Mock }
>

const token = jwt.sign({}, readFileSync('./test/cert.key'), {
  algorithm: 'RS256',
  issuer: 'opencrvs:auth-service',
  audience: 'opencrvs:gateway-user'
})

describe('config routes', () => {
  let server: any
  beforeEach(async () => {
    server = await createServer()
    fetch.resetMocks()
    jest.clearAllMocks()
  })

  it('GET /config gets the configuration and certificates from events as the user', async () => {
    config.application.query.mockResolvedValue({ APPLICATION_NAME: 'Test' })
    config.certificates.query.mockResolvedValue([{ id: 'birth-certificate' }])

    const res = await server.app.inject({
      method: 'GET',
      url: '/config',
      headers: { Authorization: `Bearer ${token}` }
    })

    expect(res.statusCode).toBe(200)
    expect(res.result).toEqual({
      config: { APPLICATION_NAME: 'Test' },
      certificates: [{ id: 'birth-certificate' }]
    })
    const asUser = {
      context: { headers: { authorization: `Bearer ${token}` } }
    }
    expect(config.application.query).toHaveBeenCalledWith(undefined, asUser)
    expect(config.certificates.query).toHaveBeenCalledWith(undefined, asUser)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('GET /publicConfig gets the public configuration from events', async () => {
    config.publicApplication.query.mockResolvedValue({
      APPLICATION_NAME: 'Test'
    })

    const res = await server.app.inject({ method: 'GET', url: '/publicConfig' })

    expect(res.statusCode).toBe(200)
    expect(res.result).toEqual({ config: { APPLICATION_NAME: 'Test' } })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('GET /forms no longer exists', async () => {
    const res = await server.app.inject({
      method: 'GET',
      url: '/forms',
      headers: { Authorization: `Bearer ${token}` }
    })

    expect(res.statusCode).toBe(404)
  })
})
