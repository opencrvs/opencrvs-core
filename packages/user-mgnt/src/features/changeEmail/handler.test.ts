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
import { SCOPES } from '@opencrvs/commons/authentication'

const fetch = fetchMock as fetchMock.FetchMock

const token = jwt.sign(
  { scope: [SCOPES.USER_UPDATE] },
  readFileSync('./test/cert.key'),
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
  email: 'j.doe@gmail.com',
  mobile: '+880123445568',
  status: 'active',
  primaryOfficeId: '321',
  device: 'D444',
  passwordHash:
    'c6fdf98bdbb45fb987392b9c2e398cb1dc2915ccbfc7a7d48f9fa7d6b3f1844385517231e98662fbfee5806dcc7a2b0edd7b63cbcfb87efe7e51875ec3e41006',
  salt: '17cbf362-6a16-4728-adda-6bc700af13b6'
}

describe('changeEmailhandler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('change email for new users', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    mockingoose(User).toReturn({}, 'update')

    const res = await server.server.inject({
      method: 'POST',
      url: '/changeUserEmail',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        email: 'don.joe@gmail.com'
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
      url: '/changeUserEmail',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        email: 'j.doe@gmail.com'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(401)
  })
  it('returns 400 for unable to update phone number', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    mockingoose(User).toReturn(new Error('boom'), 'update')

    const res = await server.server.inject({
      method: 'POST',
      url: '/changeUserEmail',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        email: 'j.doe@gmail.com'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(400)
  })
})
