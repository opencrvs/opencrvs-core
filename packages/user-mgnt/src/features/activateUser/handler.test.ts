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
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import * as fetchMock from 'jest-fetch-mock'
import User, { IUser } from '@user-mgnt/model/user'
import { logger } from '@user-mgnt/logger'
import mockingoose from 'mockingoose'
import { cloneDeep } from 'lodash'

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
  role: 'LOCAL_REGISTRAR',
  type: 'SOME_TYPE',
  status: 'pending',
  primaryOfficeId: '321',
  catchmentAreaIds: [],
  scope: ['register'],
  device: 'D444',
  passwordHash:
    'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
  salt: '12345'
}

describe('activateUser handler', () => {
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
      url: '/activateUser',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        password: 'new_password',
        securityQNAs: [
          {
            questionKey: 'HOME_TOWN',
            answer: 'test'
          },
          {
            questionKey: 'FIRST_SCHOOL',
            answer: 'test'
          },
          {
            questionKey: 'FAVORITE_COLOR',
            answer: 'test'
          }
        ]
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(201)
  })
  it('returns 401 for invalid user', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    mockingoose(User).toReturn(null, 'findOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/activateUser',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        password: 'new_password',
        securityQNAs: [
          {
            questionKey: 'HOME_TOWN',
            answer: 'test'
          },
          {
            questionKey: 'FIRST_SCHOOL',
            answer: 'test'
          },
          {
            questionKey: 'FAVORITE_COLOR',
            answer: 'test'
          }
        ]
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
  it('returns 401 for already active user', async () => {
    const clonedUser = cloneDeep(mockUser)
    clonedUser.status = 'active'
    const logSpy = jest.spyOn(logger, 'error')
    mockingoose(User).toReturn(clonedUser, 'findOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/activateUser',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        password: 'new_password',
        securityQNAs: [
          {
            questionKey: 'HOME_TOWN',
            answer: 'test'
          },
          {
            questionKey: 'FIRST_SCHOOL',
            answer: 'test'
          },
          {
            questionKey: 'FAVORITE_COLOR',
            answer: 'test'
          }
        ]
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(logSpy).toHaveBeenLastCalledWith(
      'User is not in pending state for given userid: 5d10885374be318fa7689f0b'
    )
    expect(res.statusCode).toBe(401)
  })
  it('returns 400 for mongo error of user update', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    mockingoose(User).toReturn(mockUser, 'findOne')
    mockingoose(User).toReturn(new Error('boom'), 'update')

    const res = await server.server.inject({
      method: 'POST',
      url: '/activateUser',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        password: 'new_password',
        securityQNAs: [
          {
            questionKey: 'HOME_TOWN',
            answer: 'test'
          },
          {
            questionKey: 'FIRST_SCHOOL',
            answer: 'test'
          },
          {
            questionKey: 'FAVORITE_COLOR',
            answer: 'test'
          }
        ]
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(logSpy).toHaveBeenLastCalledWith('boom')
    expect(res.statusCode).toBe(400)
  })
})
