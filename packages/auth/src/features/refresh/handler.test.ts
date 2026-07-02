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
import { signRefreshToken } from '@auth/features/authenticate/service'
import { TokenUserType } from '@opencrvs/commons'
import * as fetchAny from 'jest-fetch-mock'
import { DEFAULT_ROLES_DEFINITION } from '@auth/features/authenticate/handler.test'

const fetch = fetchAny as fetchAny.FetchMock

jest.mock('@auth/features/refresh/family', () => ({
  consume: jest.fn(),
  revokeFamily: jest.fn().mockResolvedValue(undefined),
  createFamily: jest.fn().mockResolvedValue({ familyId: 'fam-1', jti: 'jti-1' })
}))

jest.mock('@auth/features/authenticate/service', () => {
  const actual = jest.requireActual('@auth/features/authenticate/service')
  return {
    ...actual,
    internalClient: { user: { getById: { query: jest.fn() } } }
  }
})

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
let internalClient: { user: { getById: { query: jest.Mock } } }
let family: { consume: jest.Mock; revokeFamily: jest.Mock }

function makeRefreshToken(familyId = 'fam-1', jti = 'jti-1') {
  return signRefreshToken('1', TokenUserType.enum.user, familyId, jti)
}

describe('refresh token rotation', () => {
  let server: AuthServer

  beforeEach(async () => {
    server = await createProductionEnvironmentServer()
    jest.clearAllMocks()
    internalClient =
      require('@auth/features/authenticate/service').internalClient
    family = require('@auth/features/refresh/family')
  })

  it('rotates: returns a new access token and a new refresh token', async () => {
    family.consume.mockResolvedValue({
      status: 'rotate',
      userId: '1',
      newJti: 'jti-2'
    })
    internalClient.user.getById.query.mockResolvedValue({
      id: '1',
      role: 'NATIONAL_SYSTEM_ADMIN',
      status: 'active'
    })
    fetch.mockResponseOnce(JSON.stringify(DEFAULT_ROLES_DEFINITION), {
      status: 200
    })

    const token = await makeRefreshToken()
    const res: {
      result?: { token: string; refreshToken: string }
      statusCode: number
    } = await server.server.inject({
      method: 'POST',
      url: '/refreshToken',
      payload: { token }
    })

    expect(res.statusCode).toBe(200)
    expect(res.result!.token).toBeDefined()
    expect(res.result!.refreshToken).toBeDefined()
    // the new refresh token carries the rotated jti
    const [, payload] = res.result!.refreshToken.split('.')
    const body = JSON.parse(Buffer.from(payload, 'base64').toString())
    expect(body.familyId).toBe('fam-1')
    expect(body.jti).toBe('jti-2')
  })

  it('grace replay also returns a new pair', async () => {
    family.consume.mockResolvedValue({
      status: 'grace',
      userId: '1',
      newJti: 'jti-3'
    })
    internalClient.user.getById.query.mockResolvedValue({
      id: '1',
      role: 'NATIONAL_SYSTEM_ADMIN',
      status: 'active'
    })
    fetch.mockResponseOnce(JSON.stringify(DEFAULT_ROLES_DEFINITION), {
      status: 200
    })

    const res: { statusCode: number } = await server.server.inject({
      method: 'POST',
      url: '/refreshToken',
      payload: { token: await makeRefreshToken() }
    })
    expect(res.statusCode).toBe(200)
  })

  it('reuse → 401 (family already revoked by consume)', async () => {
    family.consume.mockResolvedValue({ status: 'reuse', userId: '1' })
    const res: { statusCode: number } = await server.server.inject({
      method: 'POST',
      url: '/refreshToken',
      payload: { token: await makeRefreshToken() }
    })
    expect(res.statusCode).toBe(401)
  })

  it('missing family → 401', async () => {
    family.consume.mockResolvedValue({ status: 'missing' })
    const res: { statusCode: number } = await server.server.inject({
      method: 'POST',
      url: '/refreshToken',
      payload: { token: await makeRefreshToken() }
    })
    expect(res.statusCode).toBe(401)
  })

  it('deactivated user → revokes family + 401', async () => {
    family.consume.mockResolvedValue({
      status: 'rotate',
      userId: '1',
      newJti: 'jti-2'
    })
    internalClient.user.getById.query.mockResolvedValue({
      id: '1',
      role: 'NATIONAL_SYSTEM_ADMIN',
      status: 'deactivated'
    })
    const res: { statusCode: number } = await server.server.inject({
      method: 'POST',
      url: '/refreshToken',
      payload: { token: await makeRefreshToken('fam-9', 'jti-9') }
    })
    expect(res.statusCode).toBe(401)
    expect(family.revokeFamily).toHaveBeenCalledWith('fam-9')
  })

  it('pending user (mid-onboarding) → rotates, not revoked', async () => {
    family.consume.mockResolvedValue({
      status: 'rotate',
      userId: '1',
      newJti: 'jti-2'
    })
    internalClient.user.getById.query.mockResolvedValue({
      id: '1',
      role: 'NATIONAL_SYSTEM_ADMIN',
      status: 'pending'
    })
    fetch.mockResponseOnce(JSON.stringify(DEFAULT_ROLES_DEFINITION), {
      status: 200
    })

    const res: {
      result?: { token: string; refreshToken: string }
      statusCode: number
    } = await server.server.inject({
      method: 'POST',
      url: '/refreshToken',
      payload: { token: await makeRefreshToken('fam-5', 'jti-5') }
    })

    expect(res.statusCode).toBe(200)
    expect(res.result!.token).toBeDefined()
    expect(res.result!.refreshToken).toBeDefined()
    expect(family.revokeFamily).not.toHaveBeenCalled()
  })

  it('malformed token → 401', async () => {
    const res: { statusCode: number } = await server.server.inject({
      method: 'POST',
      url: '/refreshToken',
      payload: { token: 'not-a-jwt' }
    })
    expect(res.statusCode).toBe(401)
  })
})
