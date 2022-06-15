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
import User from '@user-mgnt/model/user'
import { createServer } from '@user-mgnt/server'
import mockingoose from 'mockingoose'
import * as fetchAny from 'jest-fetch-mock'

const dummyUser = {
  _id: '5d027bc403b93b17526323f6',
  name: [
    {
      use: 'en',
      given: ['Sakib Al'],
      family: 'Hasan'
    }
  ],
  username: 'sakibal.hasan',
  mobile: '+8801711111111',
  email: 'test@test.org',
  identifiers: [],
  passwordHash:
    'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
  salt: '12345',
  scope: ['register'],
  role: 'Field Agent',
  status: 'active',
  avatar: {
    type: 'image/jpg',
    data: 'data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAACCAYAAABllJ3tAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAAXSURBVAiZY1RWVv7PgAcw4ZNkYGBgAABYyAFsic1CfAAAAABJRU5ErkJggg=='
  },
  practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
  primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
  catchmentAreaIds: [
    'b21ce04e-7ccd-4d65-929f-453bc193a736',
    '95754572-ab6f-407b-b51a-1636cb3d0683',
    '7719942b-16a7-474a-8af1-cd0c94c730d2',
    '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
  ],
  securityQuestionAnswers: [
    {
      questionKey: 'BIRTH_TOWN',
      answerHash: '$2a$10$uHhZhgHqgOdt7CZdkKCysO/sVyYHwbEhB5q5TPE.fN9O1kiz0OxVG'
    },
    {
      questionKey: 'MOTHER_NICK_NAME',
      answerHash: '$2a$10$uHhZhgHqgOdt7CZdkKCysO/sVyYHwbEhB5q5TPE.fN9O1kiz0OxVG'
    },
    {
      questionKey: 'FAVORITE_MOVIE',
      answerHash: '$2a$10$uHhZhgHqgOdt7CZdkKCysO/sVyYHwbEhB5q5TPE.fN9O1kiz0OxVG'
    }
  ],
  creationDate: 1559054406433,
  auditHistory: []
}

let server: any
const fetch = fetchAny as fetchAny.FetchMock

beforeEach(async () => {
  server = await createServer()
})

describe('getUserAvatar tests', () => {
  beforeEach(() => {
    mockingoose.resetAll()
  })
  it('Successfully returns user avatar with user id', async () => {
    mockingoose(User).toReturn(dummyUser, 'findOne')
    const res = await server.server.inject({
      method: 'GET',
      url: '/users/5d027bc403b93b17526323f6/avatar'
    })
    const parsedResult = res.result
    expect(parsedResult).toBeDefined()
  })
  it('returns 200 for if has no avatar for userId', async () => {
    delete dummyUser.avatar
    mockingoose(User).toReturn(dummyUser, 'findOne')
    fetch.mockResponse(JSON.stringify({ data: 'buffer' }))
    const res = await server.server.inject({
      method: 'GET',
      url: '/users/5d027bc403b93b17526323f6/avatar'
    })
    expect(res.statusCode).toEqual(200)
  })

  it('returns 400 for if has no user for userId', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url: '/users/123/avatar'
    })
    expect(res.statusCode).toEqual(400)
  })
})
