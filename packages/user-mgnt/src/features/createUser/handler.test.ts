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
import { createServer } from '@user-mgnt/server'
import User, { IUser } from '@user-mgnt/model/user'
import UsernameRecord from '@user-mgnt/model/usernameRecord'
import { readFileSync } from 'fs'
import * as fetchMock from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import mockingoose from 'mockingoose'

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
      [
        JSON.stringify({ id: '11', partOf: { reference: 'Location/22' } }),
        { status: 200 }
      ],
      [
        JSON.stringify({ id: '22', partOf: { reference: 'Location/33' } }),
        { status: 200 }
      ],
      [
        JSON.stringify({ id: '33', partOf: { reference: 'Location/44' } }),
        { status: 200 }
      ],
      [
        JSON.stringify({ id: '44', partOf: { reference: 'Location/0' } }),
        { status: 200 }
      ],
      ['', { status: 201, headers: { Location: 'PractitionerRole/123' } }],
      ['', { status: 200 }]
    )

    mockingoose(UsernameRecord).toReturn(null, 'findOne')
    mockingoose(UsernameRecord).toReturn(null, 'save')
    mockingoose(User).toReturn(mockUser, 'save')

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
        identifiers: [{ system: 'NID', value: '1234' }],
        email: 'j.doe@gmail.com',
        mobile: '+880123445568',
        type: 'SOME_TYPE',
        primaryOfficeId: '321',
        catchmentAreaIds: [],
        deviceId: 'D444',
        password: 'test'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const expectedPractitioner = {
      resourceType: 'Practitioner',
      identifier: [{ system: 'NID', value: '1234' }],
      telecom: [
        { system: 'phone', value: '+880123445568' },
        { system: 'email', value: 'j.doe@gmail.com' }
      ],
      name: [{ use: 'en', given: ['John', 'William'], family: 'Doe' }]
    }

    const expectedPractitionerROle = {
      resourceType: 'PractitionerRole',
      practitioner: { reference: 'Practitioner/123' },
      code: [
        {
          coding: [
            {
              system: 'http://opencrvs.org/specs/roles',
              code: 'FIELD_AGENT'
            }
          ]
        },
        {
          coding: [
            { system: 'http://opencrvs.org/specs/types', code: 'SOME_TYPE' }
          ]
        }
      ],
      location: [
        { reference: 'Location/321' },
        { reference: 'Location/11' },
        { reference: 'Location/22' },
        { reference: 'Location/33' },
        { reference: 'Location/44' }
      ]
    }

    expect(fetch.mock.calls.length).toBe(7)
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(
      expectedPractitioner
    )
    expect(JSON.parse(fetch.mock.calls[5][1].body)).toEqual(
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

    expect(fetch.mock.calls.length).toBe(3)
    expect(fetch.mock.calls[2][0]).toEqual(
      'http://localhost:5001/fhir/Practitioner/123'
    )
    expect(fetch.mock.calls[2][1].method).toEqual('DELETE')
    expect(res.statusCode).toBe(500)
  })

  it('send 500 if mongoose operation throws error', async () => {
    fetch.mockResponses(
      ['', { status: 201, headers: { Location: 'Practitioner/123' } }],
      ['', { status: 201, headers: { Location: 'PractitionerRole/123' } }]
    )

    mockingoose(UsernameRecord).toReturn(
      { username: 'jw.doe', count: 1 },
      'findOne'
    )
    mockingoose(UsernameRecord).toReturn(
      new Error('Failed to update'),
      'update'
    )

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
