import { createServer } from '@user-mgnt/index'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import * as fetchMock from 'jest-fetch-mock'
import User, { IUser } from '@user-mgnt/model/user'
import mockingoose from 'mockingoose'

const fetch = fetchMock as fetchMock.FetchMock

const token = jwt.sign(
  { scope: ['system'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:user-mgnt-user'
  }
)

// @ts-ignore
const mockUser: IUser & { password: string } = {
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
  password: 'test'
}

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
      ['', { status: 201, headers: { Location: 'PractitionerRole/123' } }]
    )

    mockingoose(User).toReturn(mockUser, 'save')

    const res = await server.server.inject({
      method: 'POST',
      url: '/createUser',
      payload: mockUser,
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
              code: 'LOCAL_REGISTRAR'
            }
          ]
        },
        {
          coding: [
            { system: 'http://opencrvs.org/specs/types', code: 'SOME_TYPE' }
          ]
        }
      ],
      location: [{ reference: 'Location/321' }]
    }

    expect(fetch.mock.calls.length).toBe(2)
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

  /*it('returns an error and rollsback if the user object is invalid', async () => {
    fetch.mockResponses(
      ['', { status: 201, headers: { Location: 'Practitioner/123' } }],
      ['', { status: 201, headers: { Location: 'PractitionerRole/123' } }],
      ['', { status: 200 }],
      ['', { status: 200 }]
    )
    // tslint:disable-next-line
    const copyMockUser = Object.assign({}, mockUser)
    delete copyMockUser.password

    const res = await server.server.inject({
      method: 'POST',
      url: '/createUser',
      payload: copyMockUser,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(fetch.mock.calls.length).toBe(4)
    expect(fetch.mock.calls[2][0]).toEqual(
      'http://localhost:5001/fhir/Practitioner/123'
    )
    expect(fetch.mock.calls[2][1].method).toEqual('DELETE')
    expect(fetch.mock.calls[3][0]).toEqual(
      'http://localhost:5001/fhir/PractitionerRole/123'
    )
    expect(fetch.mock.calls[3][1].method).toEqual('DELETE')
    expect(res.statusCode).toBe(400)
  })*/
})
