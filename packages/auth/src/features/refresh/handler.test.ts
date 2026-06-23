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
import { AuthServer } from '@auth/server'
import { createProductionEnvironmentServer } from '@auth/tests/util'
import { createRefreshToken } from '@auth/features/authenticate/service'
import { encodeScope } from '@opencrvs/commons'
import * as fetchAny from 'jest-fetch-mock'
import { DEFAULT_ROLES_DEFINITION } from '@auth/features/authenticate/handler.test'

const fetch = fetchAny as fetchAny.FetchMock

jest.mock('@auth/features/authenticate/service', () => {
  const actual = jest.requireActual('@auth/features/authenticate/service')
  return {
    ...actual,
    internalClient: {
      user: { getById: { query: jest.fn() } }
    }
  }
})

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
let internalClient =
  require('@auth/features/authenticate/service').internalClient

describe('refresh token handler', () => {
  let server: AuthServer

  beforeEach(async () => {
    server = await createProductionEnvironmentServer()
    // Re-acquire internalClient after jest.resetModules() (called inside createProductionEnvironmentServer)
    internalClient =
      require('@auth/features/authenticate/service').internalClient
    jest.clearAllMocks()
  })

  it('mints a fresh access token with the latest scopes', async () => {
    internalClient.user.getById.query.mockResolvedValue({
      id: '1',
      role: 'NATIONAL_SYSTEM_ADMIN',
      status: 'active'
    })
    fetch.mockResponseOnce(JSON.stringify(DEFAULT_ROLES_DEFINITION), {
      status: 200
    })

    const refreshToken = await createRefreshToken('1')

    const res: { result?: { token: string }; statusCode: number } =
      await server.server.inject({
        method: 'POST',
        url: '/refreshToken',
        payload: { token: refreshToken }
      })

    expect(res.statusCode).toBe(200)
    const [, payload] = res.result!.token.split('.')
    const body = JSON.parse(Buffer.from(payload, 'base64').toString())
    expect(body.sub).toBe('1')
    expect(body.scope).toEqual([
      encodeScope({ type: 'user.create' }),
      encodeScope({ type: 'user.read' }),
      encodeScope({ type: 'user.edit' }),
      encodeScope({ type: 'organisation.read-locations' }),
      encodeScope({ type: 'performance.read' }),
      encodeScope({ type: 'performance.read-dashboards' }),
      encodeScope({ type: 'performance.vital-statistics-export' })
    ])
  })

  it('returns 401 when the user is not active', async () => {
    internalClient.user.getById.query.mockResolvedValue({
      id: '1',
      role: 'NATIONAL_SYSTEM_ADMIN',
      status: 'deactivated'
    })
    const refreshToken = await createRefreshToken('1')

    const res: { statusCode: number } = await server.server.inject({
      method: 'POST',
      url: '/refreshToken',
      payload: { token: refreshToken }
    })
    expect(res.statusCode).toBe(401)
  })

  it('returns 401 when an access token (wrong audience) is presented', async () => {
    const authService = require('@auth/features/authenticate/service')
    const accessToken = await authService.createToken(
      '1',
      [],
      ['opencrvs:auth-user'],
      'opencrvs:auth-service',
      'NATIONAL_SYSTEM_ADMIN'
    )

    const res: { statusCode: number } = await server.server.inject({
      method: 'POST',
      url: '/refreshToken',
      payload: { token: accessToken }
    })
    expect(res.statusCode).toBe(401)
  })

  it('returns 401 for a malformed token', async () => {
    const res: { statusCode: number } = await server.server.inject({
      method: 'POST',
      url: '/refreshToken',
      payload: { token: 'not-a-jwt' }
    })
    expect(res.statusCode).toBe(401)
  })
})
