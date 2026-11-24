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

jest.mock('@auth/features/refresh/family', () => ({
  revokeFamily: jest.fn().mockResolvedValue(undefined),
  createFamily: jest
    .fn()
    .mockResolvedValue({ familyId: 'fam-1', jti: 'jti-1' }),
  consume: jest.fn()
}))

jest.mock('@auth/features/invalidateToken/service', () => ({
  invalidateToken: jest.fn().mockResolvedValue(undefined)
}))

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
describe('invalidateToken handler', () => {
  let server: AuthServer

  beforeEach(async () => {
    server = await createProductionEnvironmentServer()
    jest.clearAllMocks()
  })

  it('revokes the family when a refresh token is invalidated', async () => {
    const family = require('@auth/features/refresh/family')
    const token = await signRefreshToken(
      '1',
      TokenUserType.enum.user,
      'fam-77',
      'jti-1'
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/invalidateToken',
      payload: { token }
    })

    expect(res.statusCode).toBe(200)
    expect(family.revokeFamily).toHaveBeenCalledWith('fam-77')
  })

  it('does not revoke a family for a non-refresh token', async () => {
    const family = require('@auth/features/refresh/family')
    const res = await server.server.inject({
      method: 'POST',
      url: '/invalidateToken',
      payload: { token: 'not-a-refresh-token' }
    })

    expect(res.statusCode).toBe(200)
    expect(family.revokeFamily).not.toHaveBeenCalled()
  })
})
