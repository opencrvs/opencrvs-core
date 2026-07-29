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
import { SCOPES } from '@opencrvs/commons/authentication'
import { TENNIS_CLUB_MEMBERSHIP } from '@opencrvs/commons'

const fetch = fetchMock as fetchMock.FetchMock

const token = jwt.sign(
  { scope: [SCOPES.CONFIG_UPDATE_ALL] },
  readFileSync('./test/cert.key'),
  {
    subject: '123',
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:user-mgnt-user'
  }
)

const badToken = jwt.sign(
  { scope: ['demo'] },
  readFileSync('./test/cert.key'),
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
      [
        JSON.stringify([{ id: 'birth' }, { id: TENNIS_CLUB_MEMBERSHIP }]),
        { status: 200 }
      ],
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

const integrationCreatorToken = jwt.sign(
  { scope: [SCOPES.INTEGRATION_CREATE] },
  readFileSync('./test/cert.key'),
  {
    subject: 'opencrvs:countryconfig-service',
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:user-mgnt-user'
  }
)

const mockIntegration = {
  name: 'MOSIP',
  client_id: 'dbe70a54-c5d8-4268-a358-4b9773fedeba',
  secretHash: 'secretsecret',
  salt: '123',
  sha_secret: 'existing-sha-secret',
  scope: ['record.register[event=birth]'],
  status: statuses.ACTIVE
} as unknown as ISystem & { secretHash: string }

describe('createIntegration handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    jest.restoreAllMocks()
    server = await createServer()
    fetch.resetMocks()
  })

  it('creates a new integration and returns generated credentials without the secret', async () => {
    mockingoose(System).toReturn(null, 'findOne')
    mockingoose(System).toReturn(mockIntegration, 'save')

    const res = await server.server.inject({
      method: 'POST',
      url: '/createIntegration',
      payload: {
        name: 'MOSIP',
        scopes: [
          { type: 'record.register', options: { event: ['birth', 'death'] } }
        ]
      },
      headers: {
        Authorization: `Bearer ${integrationCreatorToken}`
      }
    })

    expect(res.statusCode).toBe(201)
    const body = JSON.parse(res.payload)
    expect(body.clientId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    )
    expect(body.sha_secret).toBeDefined()
    // The secret is never returned — a National System Admin obtains it via
    // the Integrations page (Refresh secret)
    expect(body.clientSecret).toBeUndefined()
  })

  it('seeds a new integration with caller-provided credentials', async () => {
    mockingoose(System).toReturn(null, 'findOne')
    mockingoose(System).toReturn(mockIntegration, 'save')
    const createSpy = jest.spyOn(System, 'create')

    const seededClientId = '3db2eed5-9d44-4dc2-ab27-74a2254f4c32'
    const res = await server.server.inject({
      method: 'POST',
      url: '/createIntegration',
      payload: {
        name: 'MOSIP',
        scopes: [
          { type: 'record.register', options: { event: ['birth', 'death'] } }
        ],
        clientId: seededClientId,
        clientSecret: 'seeded-client-secret'
      },
      headers: {
        Authorization: `Bearer ${integrationCreatorToken}`
      }
    })

    expect(res.statusCode).toBe(201)
    const body = JSON.parse(res.payload)
    // The provided client id is used verbatim rather than a generated UUID
    expect(body.clientId).toBe(seededClientId)
    // The secret is still never echoed back
    expect(body.clientSecret).toBeUndefined()
    // The seeded client id is persisted; the secret is stored hashed, never raw
    const created = createSpy.mock.calls[0][0] as Record<string, unknown>
    expect(created.client_id).toBe(seededClientId)
    expect(created.secretHash).toBeDefined()
    expect(created.secretHash).not.toBe('seeded-client-secret')
  })

  it('reconciles scopes but never the secret when re-registering a seeded integration', async () => {
    mockingoose(System).toReturn(mockIntegration, 'findOne')
    mockingoose(System).toReturn({}, 'updateOne')
    const updateSpy = jest.spyOn(System, 'updateOne')
    const createSpy = jest.spyOn(System, 'create')

    const res = await server.server.inject({
      method: 'POST',
      url: '/createIntegration',
      payload: {
        name: 'MOSIP',
        scopes: [
          { type: 'record.register', options: { event: ['birth', 'death'] } }
        ],
        clientId: mockIntegration.client_id,
        clientSecret: 'seeded-client-secret'
      },
      headers: {
        Authorization: `Bearer ${integrationCreatorToken}`
      }
    })

    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.payload)
    expect(body.clientId).toBe(mockIntegration.client_id)
    expect(body.sha_secret).toBe(mockIntegration.sha_secret)
    // Only the scopes are reconciled — the update payload carries no secret
    // fields, and no new system is created
    expect(updateSpy).toHaveBeenCalledWith(
      { name: 'MOSIP' },
      { scope: ['record.register[event=birth|death]'] }
    )
    expect(createSpy).not.toHaveBeenCalled()
  })

  it('updates scopes of an existing integration without regenerating credentials', async () => {
    mockingoose(System).toReturn(mockIntegration, 'findOne')
    mockingoose(System).toReturn({}, 'updateOne')
    const updateSpy = jest.spyOn(System, 'updateOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/createIntegration',
      payload: {
        name: 'MOSIP',
        scopes: [
          { type: 'record.register', options: { event: ['birth', 'death'] } }
        ]
      },
      headers: {
        Authorization: `Bearer ${integrationCreatorToken}`
      }
    })

    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.payload)
    expect(body.clientId).toBe(mockIntegration.client_id)
    expect(body.sha_secret).toBe(mockIntegration.sha_secret)
    // Only the scopes may change on restart — never the secret, otherwise a
    // National System Admin's "Refresh secret" would be undone on redeploy
    expect(updateSpy).toHaveBeenCalledWith(
      { name: 'MOSIP' },
      { scope: ['record.register[event=birth|death]'] }
    )
  })

  it('rejects scopes outside the record scope allowlist', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/createIntegration',
      payload: {
        name: 'MOSIP',
        scopes: [{ type: 'user.create', options: { event: [] } }]
      },
      headers: {
        Authorization: `Bearer ${integrationCreatorToken}`
      }
    })

    expect(res.statusCode).toBe(400)
  })

  it('return an error if a token scope check fails', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/createIntegration',
      payload: {
        name: 'MOSIP',
        scopes: [
          { type: 'record.register', options: { event: ['birth', 'death'] } }
        ]
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(403)
  })
})
