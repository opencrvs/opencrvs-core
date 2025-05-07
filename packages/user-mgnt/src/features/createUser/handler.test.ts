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
import { readFileSync } from 'fs'
import * as fetchMock from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import * as mockingoose from 'mockingoose'
import { SCOPES } from '@opencrvs/commons/authentication'

const fetch = fetchMock as fetchMock.FetchMock

const token = jwt.sign(
  { scope: [SCOPES.USER_CREATE] },
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
  email: 'j.doe@gmail.com',
  mobile: '+880123445568',
  role: 'LOCAL_REGISTRAR',
  primaryOfficeId: '321',
  deviceId: 'D444',
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

describe('createUser handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('creates and saves fhir resources and adds user using mongoose', async () => {
    fetch.mockResponses(
      ['', { status: 201, headers: { Location: 'Practitioner/123' } }],
      ['', { status: 201, headers: { Location: 'PractitionerRole/123' } }],
      ['', { status: 200 }]
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/createUser',
      payload: {
        name: [
          {
            use: 'en',
            given: ['John', 'William'],
            family: 'Doe'
          }
        ],
        username: 'j.doe1',
        emailForNotification: 'j.doe@gmail.com',
        mobile: '+880123445568',
        role: 'FIELD_AGENT',
        primaryOfficeId: '321',
        deviceId: 'D444',
        password: 'test'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const expectedPractitioner = {
      resourceType: 'Practitioner',
      telecom: [
        { system: 'phone', value: '+880123445568' },
        { system: 'email', value: 'j.doe@gmail.com' }
      ],
      name: [{ use: 'en', given: ['John', 'William'], family: 'Doe' }]
    }

    const expectedPractitionerROle = {
      resourceType: 'PractitionerRole',
      practitioner: { reference: 'Practitioner/123' },
      location: [{ reference: 'Location/321' }],
      code: [
        {
          coding: [
            {
              code: 'FIELD_AGENT',
              system: 'http://opencrvs.org/specs/roles'
            }
          ]
        }
      ]
    }

    expect(fetch.mock.calls.length).toBe(4)
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(
      expectedPractitioner
    )
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual(
      expectedPractitionerROle
    )

    expect(res.statusCode).toBe(201)
  })

  it('return an error if practitioner id not returned', async () => {
    fetch.mockResponseOnce('', { status: 201 })

    const res = await server.server.inject({
      method: 'POST',
      url: '/createUser',
      payload: mockUser,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(fetch.mock.calls.length).toBe(1)
    expect(res.statusCode).toBe(500)
  })

  it('return an error if a fetch fails', async () => {
    fetch.mockReject(new Error('boom'))

    const res = await server.server.inject({
      method: 'POST',
      url: '/createUser',
      payload: mockUser,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(fetch.mock.calls.length).toBe(1)
    expect(res.statusCode).toBe(500)
  })

  it('return an error if a practitioner fetch returns a error code', async () => {
    fetch.mockResponseOnce('', { status: 404 })

    const res = await server.server.inject({
      method: 'POST',
      url: '/createUser',
      payload: mockUser,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(fetch.mock.calls.length).toBe(1)
    expect(res.statusCode).toBe(500)
  })

  it('return an error and rollsback if a practitionerRole Id isnt returned', async () => {
    fetch.mockResponses(
      [JSON.stringify({ refUrl: 'mock.minio.com' }), { status: 200 }],
      ['', { status: 201, headers: { Location: 'Practitioner/123' } }],
      ['', { status: 201 }],
      ['', { status: 200 }]
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/createUser',
      payload: mockUser,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(fetch.mock.calls.length).toBe(4)
    expect(fetch.mock.calls[3][0]).toEqual(
      'http://localhost:3447/fhir/Practitioner/123'
    )
    expect(fetch.mock.calls[3][1].method).toEqual('DELETE')
    expect(res.statusCode).toBe(500)
  })

  it('send 500 if mongoose operation throws error', async () => {
    fetch.mockResponses(
      ['', { status: 201, headers: { Location: 'Practitioner/123' } }],
      ['', { status: 202 }],
      ['', { status: 202 }]
    )

    mockingoose(User).toReturn(new Error(), 'findOne')
    const res = await server.server.inject({
      method: 'POST',
      url: '/createUser',
      payload: mockUser,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(500)
    mockingoose.resetAll()
  })
})
