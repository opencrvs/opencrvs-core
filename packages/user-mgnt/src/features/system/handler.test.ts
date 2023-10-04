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
import User, { IUser } from '@user-mgnt/model/user'
import System, { ISystem } from '@user-mgnt/model/system'
import { readFileSync } from 'fs'
import * as fetchMock from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import * as mockingoose from 'mockingoose'
import { statuses } from '@user-mgnt/utils/userUtils'

const fetch = fetchMock as fetchMock.FetchMock

const token = jwt.sign(
  { scope: ['natlsysadmin', 'demo'] },
  readFileSync('../auth/test/cert.key'),
  {
    subject: '123',
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

const mockUser = {
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
  status: 'active',
  password: 'test',
  signature: {
    type: 'image/png',
    data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlwAAAK8CAYAAAA6WGEyAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2h'
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
      data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlwAAAK8CAYAAAA6WGEyAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2h'
    }
  }
} as unknown as IUser & { password: string }

const mockSystem = {
  name: 'MOSIP',
  createdBy: '123',
  username: 'j.doe1',
  client_id: '123',
  secretHash: 'secretsecret',
  salt: '123',
  practitionerId: '123',
  sha_secret: '123',
  scope: ['nationalId'],
  status: statuses.ACTIVE,
  type: 'NATIONAL_ID'
} as unknown as ISystem & { secretHash: string }

describe('registerSystem handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('creates and saves system client using mongoose', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    fetch.mockResponses(
      ['', { status: 201, headers: { Location: 'Practitioner/123' } }],
      ['', { status: 201, headers: { Location: 'PractitionerRole/123' } }]
    )
    mockingoose(System).toReturn(mockSystem, 'save')

    const res = await server.server.inject({
      method: 'POST',
      url: '/registerSystem',
      payload: {
        type: 'RECORD_SEARCH',
        name: 'Fortune Green',
        settings: {
          dailyQuota: 50
        }
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(201)
  })

  it('return unauthorized error if sysadmin not returned', async () => {
    mockingoose(User).toReturn(null, 'findOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/registerSystem',
      payload: {
        type: 'NATIONAL_ID'
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
      url: '/registerSystem',
      payload: {
        type: 'NATIONAL_ID'
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
      url: '/registerSystem',
      payload: {
        type: '123'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(400)
  })
})

describe('deactivateSystem handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('deactivates system client using mongoose', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    mockingoose(System).toReturn(mockSystem, 'findOne')
    mockingoose(System).toReturn({}, 'findOneAndUpdate')

    const res = await server.server.inject({
      method: 'POST',
      url: '/deactivateSystem',
      payload: {
        clientId: '123'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('return unauthorized error if sysadmin not returned', async () => {
    mockingoose(User).toReturn(null, 'findOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/deactivateSystem',
      payload: {
        clientId: '123'
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
      url: '/deactivateSystem',
      payload: {
        clientId: '123'
      },
      headers: {
        Authorization: `Bearer ${badToken}`
      }
    })

    expect(res.statusCode).toBe(403)
  })
})

describe('reactivateSystem handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('reactivates system client using mongoose', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    mockingoose(System).toReturn(mockSystem, 'findOne')
    mockingoose(System).toReturn({}, 'findOneAndUpdate')

    const res = await server.server.inject({
      method: 'POST',
      url: '/reactivateSystem',
      payload: {
        clientId: '123'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('return unauthorized error if sysadmin not returned', async () => {
    mockingoose(User).toReturn(null, 'findOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/reactivateSystem',
      payload: {
        clientId: '123'
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
      url: '/reactivateSystem',
      payload: {
        clientId: '123'
      },
      headers: {
        Authorization: `Bearer ${badToken}`
      }
    })

    expect(res.statusCode).toBe(403)
  })
})

describe('refresh secret system user', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('generate refresh secret key', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    mockingoose(System).toReturn(mockSystem, 'findOne')
    mockingoose(System).toReturn({}, 'findOneAndUpdate')

    const res = await server.server.inject({
      method: 'POST',
      url: '/refreshSystemSecret',
      payload: {
        clientId: '123'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('return unauthorized error if no system user is found', async () => {
    mockingoose(System).toReturn({}, 'findOneAndUpdate')

    const res = await server.server.inject({
      method: 'POST',
      url: '/refreshSystemSecret',
      payload: {
        clientId: '12367'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(400)
  })
})

describe('delete system ', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('delete system using mongoose', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    mockingoose(System).toReturn(mockSystem, 'findOne')
    mockingoose(System).toReturn(mockSystem, 'findOneAndDelete')
    mockingoose(System).toReturn({}, 'deleteOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/deleteSystem',
      payload: {
        clientId: '123'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('return error if system is not found', async () => {
    mockingoose(User).toReturn(null, 'findOneAndDelete')

    const res = await server.server.inject({
      method: 'POST',
      url: '/deleteSystem',
      payload: {
        clientId: '123'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(404)
  })

  it('return an error if a token scope check fails', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/deleteSystem',
      payload: {
        clientId: '123'
      },
      headers: {
        Authorization: `Bearer ${badToken}`
      }
    })

    expect(res.statusCode).toBe(403)
  })
})
