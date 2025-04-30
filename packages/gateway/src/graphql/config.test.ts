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
import { getApolloConfig } from './config'
import { cloneDeep } from 'lodash'

import * as fetchAny from 'jest-fetch-mock'
import { Context } from './context'
import { Request } from '@hapi/hapi'
import { ApolloServer } from '@apollo/server'
import { Headers } from 'node-fetch'
const fetch = fetchAny as fetchAny.FetchMock

describe('Test apollo server config', () => {
  const token = jwt.sign(
    { scope: ['register'] },
    readFileSync('./test/cert.key'),
    {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:gateway-user'
    }
  )
  const mockUser = {
    _id: 'ba7022f0ff4822',
    name: [
      {
        use: 'en',
        given: ['Tamim'],
        family: ['Iqbal']
      }
    ],
    username: 'tamim.iqlbal',
    mobile: '+8801711111111',
    email: 'test@test.org',
    identifiers: [{ system: 'NATIONAL_ID', value: '1010101010' }],
    passwordHash:
      'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
    salt: '12345',
    role: 'REGISTRATION_AGENT',
    scope: ['register'],
    status: 'active',
    practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
    primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
    creationDate: 1559054406433
  }

  beforeEach(() => {
    fetch.resetMocks()
  })

  it('return config object with valid context', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockUser), { status: 200 })

    const request = {
      headers: {
        authorization: `Bearer ${token}`,
        'user-agent': 'OpenCRVS'
      },
      info: {
        remoteAddress: '1.1.1.1'
      }
    }

    const context = new Context(request as unknown as Request)
    const { dataSources, ...config } = context

    expect(config).toStrictEqual({
      presignDocumentUrls: true,
      request,
      headers: {
        Authorization: `Bearer ${token}`,
        'x-correlation-id': '1',
        'x-real-ip': '1.1.1.1',
        'x-real-user-agent': 'OpenCRVS'
      }
    })
  })

  it('throws authentication error when the token holder does not exist', async () => {
    fetch.mockResponses(
      [JSON.stringify(null), { status: 200 }],
      [JSON.stringify(null), { status: 200 }]
    )
    const config = getApolloConfig()

    const testServer = new ApolloServer(config)
    const request = {
      auth: {
        isAuthenticated: true,
        credentials: jwt.decode(token)
      },
      headers: new Headers({
        authorization: `Bearer ${token}`,
        'user-agent': 'OpenCRVS'
      }),
      info: {
        remoteAddress: '1.1.1.1'
      }
    }

    const response = await testServer.executeOperation(
      {
        query:
          'query fetchBirthRegistration($id: ID!) { fetchBirthRegistration(id: $id) { id } }',
        variables: { id: '123-123-123-123' }
      },
      {
        contextValue: new Context(request as unknown as Request)
      }
    )
    expect(
      response.body.kind == 'single' &&
        response.body.singleResult.errors![0].message
    ).toBe('Authentication failed')
  })
  it('throws authentication error when the token holder is not an active user', async () => {
    const deactivatedUser = cloneDeep(mockUser)
    deactivatedUser.status = 'deactivated'

    fetch.mockResponseOnce(JSON.stringify(deactivatedUser), { status: 200 })
    const config = getApolloConfig()

    const testServer = new ApolloServer(config)
    const request = {
      auth: {
        isAuthenticated: true,
        credentials: jwt.decode(token)
      },
      headers: new Headers({
        authorization: `Bearer ${token}`,
        'user-agent': 'OpenCRVS'
      }),
      info: {
        remoteAddress: '1.1.1.1'
      }
    }

    const response = await testServer.executeOperation(
      {
        query:
          'query fetchBirthRegistration($id: ID!) { fetchBirthRegistration(id: $id) { id } }',
        variables: { id: '123-123-123-123' }
      },
      {
        contextValue: new Context(request as unknown as Request)
      }
    )
    expect(
      response.body.kind == 'single' &&
        response.body.singleResult.errors![0].message
    ).toBe('Authentication failed')
  })
  it('throws authentication error when the token holder has different scope', async () => {
    const userWithDifferentScope = cloneDeep(mockUser)
    userWithDifferentScope.status = 'active'
    userWithDifferentScope.scope = ['declare']

    fetch.mockResponseOnce(JSON.stringify(userWithDifferentScope), {
      status: 200
    })
    const config = getApolloConfig()

    const testServer = new ApolloServer(config)
    const request = {
      auth: {
        isAuthenticated: true,
        credentials: jwt.decode(token)
      },
      headers: new Headers({
        authorization: `Bearer ${token}`,
        'user-agent': 'OpenCRVS'
      }),
      info: {
        remoteAddress: '1.1.1.1'
      }
    }

    const response = await testServer.executeOperation(
      {
        query:
          'query fetchBirthRegistration($id: ID!) { fetchBirthRegistration(id: $id) { id } }',
        variables: { id: '123-123-123-123' }
      },
      {
        contextValue: new Context(request as unknown as Request)
      }
    )
    expect(
      response.body.kind == 'single' &&
        response.body.singleResult.errors![0].message
    ).toBe('User does not have enough scope')
  })
})
