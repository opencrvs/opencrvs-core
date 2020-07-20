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
import { createServer } from '@user-mgnt/index'
import User, { IUser } from '@user-mgnt/model/user'
import System, { ISystem } from '@user-mgnt/model/system'
import { readFileSync } from 'fs'
import * as fetchMock from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import mockingoose from 'mockingoose'
import { statuses } from '@user-mgnt/utils/userUtils'

const fetch = fetchMock as fetchMock.FetchMock

const token = jwt.sign(
  { scope: ['sysadmin', 'demo'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:user-mgnt-user'
  }
)

const badToken = jwt.sign(
  { scope: ['demo'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:user-mgnt-user'
  }
)

const mockUser = ({
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
  role: 'LOCAL_REGISTRAR',
  type: 'SOME_TYPE',
  primaryOfficeId: '321',
  catchmentAreaIds: [],
  scope: ['register'],
  deviceId: 'D444',
  password: 'test',
  signature: {
    type: 'image/png',
    data:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlwAAAK8CAYAAAA6WGEyAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2h'
  },
  localRegistrar: {
    name: [
      {
        use: 'en',
        given: ['John', 'William'],
        family: 'Doe'
      }
    ],
    signature: {
      type: 'image/png',
      data:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlwAAAK8CAYAAAA6WGEyAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2h'
    }
  }
} as unknown) as IUser & { password: string }

const mockSystem = ({
  name: [
    {
      use: 'en',
      given: ['John', 'William'],
      family: 'Doe'
    }
  ],
  username: 'j.doe1',
  client_id: '123',
  status: statuses.ACTIVE,
  salt: '123',
  sha_secret: '123',
  scope: ['nationalId']
} as unknown) as ISystem & { secretHash: string }

describe('registerSystemClient handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('creates and saves system client using mongoose', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    mockingoose(System).toReturn(mockSystem, 'save')

    const res = await server.server.inject({
      method: 'POST',
      url: '/registerSystemClient',
      payload: {
        scope: 'NATIONAL_ID'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(201)
  })

  it('return unauthoried error if sysadmin not returned', async () => {
    mockingoose(User).toReturn(null, 'findOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/registerSystemClient',
      payload: {
        scope: 'NATIONAL_ID'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(400)
  })

  it('return an error if a token scope check fails', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/registerSystemClient',
      payload: {
        scope: 'NATIONAL_ID'
      },
      headers: {
        Authorization: `Bearer ${badToken}`
      }
    })

    expect(res.statusCode).toBe(403)
  })

  it('return an error if system scope is not supported', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/registerSystemClient',
      payload: {
        scope: '123'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(400)
  })
})
