import { createServer } from '@user-mgnt/index'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import * as fetchMock from 'jest-fetch-mock'
import User, { IUser } from '@user-mgnt/model/user'

import mockingoose from 'mockingoose'

const fetch = fetchMock as fetchMock.FetchMock

const token = jwt.sign(
  { scope: ['sysadmin'] },
  readFileSync('../auth/test/cert.key'),
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
  identifiers: [{ system: 'NID', value: '1234' }],
  email: 'j.doe@gmail.com',
  mobile: '+880123445568',
  role: 'LOCAL_REGISTRAR',
  type: 'SOME_TYPE',
  status: 'pending',
  primaryOfficeId: '321',
  catchmentAreaIds: [],
  scope: ['register'],
  deviceId: 'D444',
  passwordHash:
    'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
  salt: '12345'
}

describe('changePassword handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('activate existing pending user using mongoose', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    mockingoose(User).toReturn({}, 'update')

    const res = await server.server.inject({
      method: 'POST',
      url: '/changePassword',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        password: 'new_password'
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
      url: '/changePassword',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        password: 'new_password'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(401)
  })
})
