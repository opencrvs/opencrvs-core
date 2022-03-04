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
import UsernameRecord from '@user-mgnt/model/usernameRecord'
import { readFileSync } from 'fs'
import * as fetchMock from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import * as mockingoose from 'mockingoose'

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
  id: '12345',
  name: [
    {
      use: 'en',
      given: ['John', 'William'],
      family: 'Doe'
    }
  ],
  username: 'jw.doe',
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

const mockPractitioner = {
  resourceType: 'Practitioner',
  identifier: [
    {
      use: 'official',
      system: 'mobile',
      value: '01711111111'
    }
  ],
  telecom: [
    {
      system: 'phone',
      value: '01711111111'
    }
  ],
  name: [
    {
      use: 'en',
      family: ['Al Hasan'],
      given: ['Shakib']
    }
  ],
  gender: 'male',
  extension: [],
  meta: {
    lastUpdated: '2020-01-09T08:38:06.547+00:00',
    versionId: 'fc29499a-d6c9-4db1-b813-c123005e6f7e'
  },
  id: '4393c845-0d1c-42c7-a501-f0b4fcb031a2'
}

const mockPractitionerRole = {
  resourceType: 'PractitionerRole',
  practitioner: {
    reference: 'Practitioner/4393c845-0d1c-42c7-a501-f0b4fcb031a2'
  },
  code: [
    {
      coding: [
        {
          system: 'http://opencrvs.org/specs/roles',
          code: 'FIELD_AGENT'
        }
      ]
    }
  ],
  location: [
    {
      reference: 'Location/e7fa94ba-5582-48f9-ba43-cf41d88253c6'
    },
    {
      reference: 'Location/d70fbec1-2b26-474b-adbc-bb83783bdf29'
    },
    {
      reference: 'Location/59a18c46-9a3d-4bfa-a77a-36ad8dcf9ebb'
    },
    {
      reference: 'Location/0fbb6749-8ac3-4e90-89d5-69bad295e0ae'
    },
    {
      reference: 'Location/258f7b76-3eba-4e5b-91d8-9c90a2422105'
    },
    {
      reference: 'Location/258f7b76-3eba-4e5b-91d8-9c90a2422105'
    }
  ],
  meta: {
    lastUpdated: '2020-01-09T08:38:06.571+00:00',
    versionId: 'cdfa531b-0aca-4430-a7d1-8919e1a5a6f3'
  },
  id: '703112e2-2bbf-42c4-a397-b7bfeb35a625'
}

describe('updateUser handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('update fhir resources and update user using mongoose', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    fetch.mockResponseOnce(JSON.stringify(mockPractitioner))
    fetch.mockResponseOnce(JSON.stringify(mockPractitionerRole))
    fetch.mockResponses(
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
      ['', { status: 201, headers: { Location: 'Practitioner/123' } }],
      ['', { status: 201, headers: { Location: 'PractitionerRole/123' } }]
    )

    mockingoose(UsernameRecord).toReturn(null, 'findOne')
    mockingoose(UsernameRecord).toReturn(null, 'save')
    mockingoose(User).toReturn(mockUser, 'update')

    const res = await server.server.inject({
      method: 'POST',
      url: '/updateUser',
      payload: {
        id: '12345',
        name: [
          {
            use: 'en',
            given: ['Euan', 'Millar'],
            family: 'Doe'
          }
        ],
        identifiers: [{ system: 'NID', value: '1234' }],
        email: 'j.doe@gmail.com',
        mobile: '+880123445568',
        type: 'SOME_TYPE',
        primaryOfficeId: '322',
        catchmentAreaIds: [],
        deviceId: 'D444'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(201)
  })
  it('update fhir resources and update user without any username change', async () => {
    mockingoose.resetAll()
    mockingoose(User).toReturn(mockUser, 'findOne')
    fetch.mockResponseOnce(JSON.stringify(mockPractitioner))
    fetch.mockResponseOnce(JSON.stringify(mockPractitionerRole))
    fetch.mockResponses(
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
      ['', { status: 201, headers: { Location: 'Practitioner/123' } }],
      ['', { status: 201, headers: { Location: 'PractitionerRole/123' } }]
    )

    mockingoose(UsernameRecord).toReturn(null, 'findOne')
    mockingoose(UsernameRecord).toReturn(null, 'save')
    mockingoose(User).toReturn(mockUser, 'update')

    const res = await server.server.inject({
      method: 'POST',
      url: '/updateUser',
      payload: {
        id: '12345',
        name: [
          {
            use: 'en',
            given: ['John', 'William'],
            family: 'Doe'
          }
        ],
        identifiers: [{ system: 'NID', value: '1234' }],
        email: 'j.doe@gmail.com',
        mobile: '+880123111111',
        type: 'SOME_TYPE',
        primaryOfficeId: '323',
        catchmentAreaIds: [],
        deviceId: 'D444'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(201)
  })
  it('return an error if no existing user found for given id', async () => {
    mockingoose(User).toReturn(null, 'findOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/updateUser',
      payload: mockUser,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(500)
  })
  it('return an error if no existing practitioner found for given user', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    fetch.mockResponseOnce('', { status: 404 })

    const res = await server.server.inject({
      method: 'POST',
      url: '/updateUser',
      payload: mockUser,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(500)
  })
  it('send 500 if mongoose operation throws error', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    fetch.mockResponseOnce(JSON.stringify(mockPractitioner))
    fetch.mockResponseOnce(JSON.stringify(mockPractitionerRole))
    fetch.mockResponses(
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
      ['', { status: 201, headers: { Location: 'Practitioner/123' } }],
      ['', { status: 201, headers: { Location: 'PractitionerRole/123' } }]
    )
    mockingoose(UsernameRecord).toReturn(
      new Error('Failed to update'),
      'update'
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/updateUser',
      payload: mockUser,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(500)
    mockingoose.resetAll()
  })
  it('return 400 if mongoose throws an error for user update ', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    fetch.mockResponseOnce(JSON.stringify(mockPractitioner))
    fetch.mockResponseOnce(JSON.stringify(mockPractitionerRole))
    fetch.mockResponses(
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
      ['', { status: 201, headers: { Location: 'Practitioner/123' } }],
      ['', { status: 201, headers: { Location: 'PractitionerRole/123' } }]
    )

    mockingoose(UsernameRecord).toReturn(null, 'findOne')
    mockingoose(UsernameRecord).toReturn(null, 'save')
    mockingoose(User).toReturn(new Error('Unable to update the user'), 'update')
    fetch.mockResponses(
      ['', { status: 201, headers: { Location: 'Practitioner/123' } }],
      ['', { status: 201, headers: { Location: 'PractitionerRole/123' } }]
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/updateUser',
      payload: {
        id: '12345',
        name: [
          {
            use: 'en',
            given: ['Euan', 'Millar'],
            family: 'Doe'
          }
        ],
        identifiers: [{ system: 'NID', value: '1234' }],
        email: 'j.doe@gmail.com',
        mobile: '+880123445568',
        type: 'SOME_TYPE',
        primaryOfficeId: '322',
        catchmentAreaIds: [],
        deviceId: 'D444'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(400)
  })
})
