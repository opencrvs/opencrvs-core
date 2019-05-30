import { createServer } from '../..'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import * as fetch from 'jest-fetch-mock'
import { IUser } from '../../model/user'
import User from '../../model/user'

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
const mockUser: IUser = {
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
  deviceId: 'D444'
}

describe('createUser handler', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('creates and saves fhir resources and adds user using mongoose', async () => {
    fetch.mockResponses(
      ['', { status: 201, headers: { Location: 'Practitioner/123' } }],
      ['', { status: 201, headers: { Location: 'PractitionerRole/123' } }]
    )

    const spy = jest.spyOn(User, 'create').mockResolvedValue({})

    const res = await server.server.inject({
      method: 'POST',
      url: '/createUser',
      payload: mockUser,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(201)
  })
})
