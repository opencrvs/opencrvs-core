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
import { readFileSync } from 'fs'
import * as fetch from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import { getApolloConfig } from './config'

describe('Test apollo server config', () => {
  const token = jwt.sign(
    { scope: ['register'] },
    readFileSync('../auth/test/cert.key'),
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
    scope: ['certify'],
    status: 'active',
    practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
    primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
    catchmentAreaIds: [
      'b21ce04e-7ccd-4d65-929f-453bc193a736',
      '95754572-ab6f-407b-b51a-1636cb3d0683',
      '7719942b-16a7-474a-8af1-cd0c94c730d2',
      '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
    ],
    creationDate: 1559054406433
  }

  beforeEach(() => {
    fetch.resetMocks()
  })

  it('return config object with valid context', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockUser), { status: 200 })
    const config = getApolloConfig()

    // @ts-ignore
    const context = await config.context({
      request: {
        headers: {
          authorization: `Bearer ${token}`
        }
      },
      h: {}
    })
    expect(context).toStrictEqual({ Authorization: `Bearer ${token}` })
  })
  it('throws authentication error when the token holder does not exist', async () => {
    fetch.mockResponseOnce(JSON.stringify(null), { status: 200 })
    const config = getApolloConfig()

    await expect(
      // @ts-ignore
      config.context({
        request: {
          headers: {
            authorization: `Bearer ${token}`
          }
        },
        h: {}
      })
    ).rejects.toThrowError('AuthenticationError: Authentication failed')
  })
  it('throws authentication error when the token holder is not an active user', async () => {
    const deactivatedUser = mockUser
    deactivatedUser.status = 'deactivated'

    fetch.mockResponseOnce(JSON.stringify(deactivatedUser), { status: 200 })
    const config = getApolloConfig()

    await expect(
      // @ts-ignore
      config.context({
        request: {
          headers: {
            authorization: `Bearer ${token}`
          }
        },
        h: {}
      })
    ).rejects.toThrowError('AuthenticationError: Authentication failed')
  })
  it('throws authentication for unexpected error in user detection', async () => {
    const config = getApolloConfig()

    await expect(
      // @ts-ignore
      config.context({
        request: {
          headers: {
            authorization: `Bearer abc`
          }
        },
        h: {}
      })
    ).rejects.toThrowError(
      "Error: getTokenPayload: Error occurred during token decode : InvalidTokenError: Invalid token specified: Cannot read property 'replace' of undefined"
    )
  })
})
