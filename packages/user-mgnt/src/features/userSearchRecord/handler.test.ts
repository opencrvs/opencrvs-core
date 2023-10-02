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
import { logger } from '@user-mgnt/logger'
import User, { IUser } from '@user-mgnt/model/user'
import { readFileSync } from 'fs'
import * as fetchMock from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import * as mockingoose from 'mockingoose'

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
// @ts-ignore
const mockUser: IUser & { _id: string } = {
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
  systemRole: 'LOCAL_REGISTRAR',
  status: 'active',
  primaryOfficeId: '321',
  catchmentAreaIds: [],
  scope: ['register'],
  device: 'D444',
  passwordHash:
    'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
  salt: '12345'
}

const mockUserWithSearchRecord = {
  searchList: [
    {
      searchId: '121212',
      name: 'Advanced Search',
      parameters: {
        event: 'birth',
        registrationStatuses: []
      }
    }
  ]
}

describe('createSearchHandler & removeSearchHandler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it("createSearchHandler should throw with 401 when user doesn't exist", async () => {
    const logSpy = jest.spyOn(logger, 'error')
    mockingoose(User).toReturn(null, 'findOne')
    const res = await server.server.inject({
      method: 'POST',
      url: '/searches',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        name: 'Advance Search',
        parameters: {
          event: 'birth'
        }
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(logSpy).toHaveBeenLastCalledWith(
      'No user details found by given userid: 5d10885374be318fa7689f0b'
    )
    expect(res.statusCode).toBe(401)
  })

  it('create search entry in user', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    mockingoose(User).toReturn(mockUserWithSearchRecord, 'updateOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/searches',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        name: 'Advance Search',
        parameters: {
          event: 'birth'
        }
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.result.searchList.length).toBe(1)
    expect(res.statusCode).toBe(201)
  })

  it("removeSearchHandler should throw with 401 when user doesn't exist", async () => {
    const logSpy = jest.spyOn(logger, 'error')
    mockingoose(User).toReturn(null, 'findOne')
    const res = await server.server.inject({
      method: 'DELETE',
      url: '/searches',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        searchId: '7a10234254be318fa7607823df'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(logSpy).toHaveBeenLastCalledWith(
      'No user or search details found by given userid: 5d10885374be318fa7689f0b'
    )
    expect(res.statusCode).toBe(401)
  })

  it('remove search entry from user', async () => {
    mockingoose(User).toReturn(mockUserWithSearchRecord, 'findOne')
    mockingoose(User).toReturn({}, 'updateOne')

    const res = await server.server.inject({
      method: 'DELETE',
      url: '/searches',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        searchId: '7a10234254be318fa7607823df'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.result.searchList.length).toBe(0)
    expect(res.statusCode).toBe(200)
  })
})
