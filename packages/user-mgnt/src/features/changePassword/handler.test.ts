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
import { createServer } from '@user-mgnt/server'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import * as fetchMock from 'jest-fetch-mock'
import User, { IUser } from '@user-mgnt/model/user'
import * as mockingoose from 'mockingoose'

const fetch = fetchMock as fetchMock.FetchMock

const token = jwt.sign(
  { scope: ['sysadmin'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:user-mgnt-user'
  }
)

const mockUser: Partial<IUser & { _id: string }> = {
  _id: '5d10885374be318fa7689f0b',
  name: [
    {
      use: 'en',
      given: ['John', 'William'],
      family: 'Doe'
    }
  ],
  username: 'j.doe1',
  identifiers: [{ system: 'NID', value: '1234' }],
  email: 'j.doe@gmail.com',
  mobile: '+880123445568',
  systemRole: 'LOCAL_REGISTRAR',
  status: 'pending',
  primaryOfficeId: '321',
  catchmentAreaIds: [],
  scope: ['register'],
  device: 'D444',
  passwordHash: '$2a$10$fyVfYYctO8oqs9euSvtgVeNyezpOy486VHmvQJgSg/qD81xpr1f.i',
  salt: '$2a$10$fyVfYYctO8oqs9euSvtgVe'
}

const mockExistingUser: Partial<IUser & { _id: string }> = {
  _id: '5d10885374be318fa7689f0b',
  name: [
    {
      use: 'en',
      given: ['John', 'William'],
      family: 'Doe'
    }
  ],
  username: 'j.doe1',
  identifiers: [{ system: 'NID', value: '1234' }],
  email: 'j.doe@gmail.com',
  mobile: '+880123445568',
  systemRole: 'LOCAL_REGISTRAR',
  status: 'active',
  primaryOfficeId: '321',
  catchmentAreaIds: [],
  scope: ['register'],
  device: 'D444',
  passwordHash: '$2a$10$fyVfYYctO8oqs9euSvtgVeNyezpOy486VHmvQJgSg/qD81xpr1f.i',
  salt: '$2a$10$fyVfYYctO8oqs9euSvtgVe'
}

describe('changePassword handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('change password for new users', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    mockingoose(User).toReturn({}, 'updateOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/changePassword',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        password: 'test'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })
  it('returns 401 for invalid user', async () => {
    mockingoose(User).toReturn(null, 'findOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/changePassword',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        password: 'new_password'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(401)
  })
  it('returns 400 for unable to update password', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    mockingoose(User).toReturn(new Error('boom'), 'updateOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/changePassword',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        password: 'new_password'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(400)
  })
})

describe('changeUserPassword handler', () => {
  let server: any
  beforeEach(async () => {
    mockUser.status = 'active'
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('Change password for logged-in user', async () => {
    mockingoose(User).toReturn(mockExistingUser, 'findOne')
    mockingoose(User).toReturn({}, 'updateOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/changeUserPassword',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        existingPassword: 'test',
        password: 'new_password'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })
  it('Returns 401 for wrong existing password of logged-in user', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    mockingoose(User).toReturn({}, 'updateOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/changeUserPassword',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        existingPassword: 'wrong_password',
        password: 'new_password'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(401)
  })
  it('Returns 401 for non-active user', async () => {
    mockUser.status = 'pending'
    mockingoose(User).toReturn(mockUser, 'findOne')
    mockingoose(User).toReturn({}, 'update')

    const res = await server.server.inject({
      method: 'POST',
      url: '/changeUserPassword',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        existingPassword: 'test',
        password: 'new_password'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(401)
  })
})
