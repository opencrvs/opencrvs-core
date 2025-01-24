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
import User from '@user-mgnt/model/user'
import { createServer } from '@user-mgnt/server'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import { Types } from 'mongoose'
import { SCOPES } from '@opencrvs/commons/authentication'

let server: any

beforeEach(async () => {
  server = await createServer()
})

const token = jwt.sign(
  { scope: [SCOPES.ORGANISATION_READ_LOCATIONS] },
  readFileSync('./test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:user-mgnt-user'
  }
)
const dummyUserList = [
  {
    name: [
      {
        use: 'en',
        given: ['Sakib Al'],
        family: ['Hasan']
      }
    ],
    username: 'sakibal.hasan',
    mobile: '+8801711111111',
    email: 'test@test.org',
    passwordHash:
      'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
    salt: '12345',
    role: new Types.ObjectId('6348acd2e1a47ca32e79f46f'),
    status: 'active',
    practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
    primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
    creationDate: 1559054406433
  },
  {
    name: [
      {
        use: 'en',
        given: ['Md. Ariful'],
        family: ['Islam']
      }
    ],
    username: 'mdariful.islam',
    mobile: '+8801740012994',
    email: 'test@test.org',
    passwordHash:
      'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
    salt: '12345',
    role: new Types.ObjectId('6348acd2e1a47ca32e79f46f'),
    status: 'active',
    practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
    primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
    creationDate: 1559054406444
  },
  {
    name: [
      {
        use: 'en',
        given: ['Mohammad'],
        family: ['Ashraful']
      }
    ],
    username: 'mohammad.ashraful',
    mobile: '+8801733333333',
    email: 'test@test.org',
    passwordHash:
      'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
    salt: '12345',
    status: 'active',
    practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
    primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
    creationDate: 1559054406555
  }
]
describe('searchUsers tests', () => {
  it('Successfully returns full user list', async () => {
    User.find = jest.fn().mockReturnValue(dummyUserList)
    User.find().populate = jest.fn().mockReturnValue(dummyUserList)
    User.find().skip = jest.fn().mockReturnValue(dummyUserList)
    User.find().skip(0).limit = jest.fn().mockReturnValue(dummyUserList)
    User.find().skip(0).limit(10).sort = jest
      .fn()
      .mockReturnValue(dummyUserList)
    User.find().count = jest.fn().mockReturnValue(dummyUserList.length)

    const res = await server.server.inject({
      method: 'POST',
      url: '/searchUsers',
      payload: { count: 10, skip: 0, sortOrder: 'desc' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.result.totalItems).toBe(dummyUserList.length)
    expect(res.result.results).toEqual(dummyUserList)
  })
  it('Successfully returns filtered user list', async () => {
    const filteredUserList = [dummyUserList[2]]
    User.find = jest.fn().mockReturnValue(filteredUserList)
    User.find().populate = jest.fn().mockReturnValue(filteredUserList)
    User.find().skip = jest.fn().mockReturnValue(filteredUserList)
    User.find().skip(0).limit = jest.fn().mockReturnValue(filteredUserList)
    User.find().skip(0).limit(10).sort = jest
      .fn()
      .mockReturnValue(filteredUserList)
    User.find().count = jest.fn().mockReturnValue(filteredUserList.length)

    const res = await server.server.inject({
      method: 'POST',
      url: '/searchUsers',
      payload: {
        count: 10,
        skip: 0,
        sortOrder: 'asc',
        username: 'mohammad.ashraful',
        mobile: '+8801733333333',
        primaryOfficeId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
        status: 'active'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.result.results).toEqual(filteredUserList)
  })
})
