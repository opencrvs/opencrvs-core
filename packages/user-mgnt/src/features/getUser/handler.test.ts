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
import * as fetchMock from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import * as mockingoose from 'mockingoose'
import { SCOPES } from '@opencrvs/commons/authentication'

const fetch = fetchMock as fetchMock.FetchMock

let server: any

beforeEach(async () => {
  server = await createServer()
})

const token = jwt.sign(
  { scope: [SCOPES.USER_READ] },
  readFileSync('./test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:user-mgnt-user'
  }
)
const dummyUser = {
  _id: '5d027bc403b93b17526323f6',
  id: '5d027bc403b93b17526323f6',
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
  role: 'Field Agent',
  status: 'active',
  practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
  primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
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
  auditHistory: [],
  searches: [
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

describe('getUser tests', () => {
  beforeEach(() => {
    mockingoose.resetAll()
  })
  it('Successfully returns user with user id', async () => {
    User.schema.path('role', Object)
    mockingoose(User).toReturn(dummyUser, 'findOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/getUser',
      payload: { userId: '5d027bc403b93b17526323f6' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const parsedResult = JSON.parse(JSON.stringify(res.result))
    expect(parsedResult).toEqual(dummyUser)
  })
  it('Successfully returns user with practitioner id', async () => {
    mockingoose(User).toReturn(dummyUser, 'findOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/getUser',
      payload: { practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const parsedResult = JSON.parse(JSON.stringify(res.result))
    expect(parsedResult).toEqual(dummyUser)
  })

  it('Returns signature when there is one', async () => {
    const practitionerMock = {
      _id: {
        $oid: '677fb08739cc37001dd27dcf'
      },
      resourceType: 'Practitioner',
      telecom: [
        {
          system: 'phone',
          value: '+260915151515'
        },
        {
          system: 'email',
          value: 'kalush.abwalya17@gmail.com'
        }
      ],
      name: [
        {
          use: 'en',
          given: ['Joseph'],
          family: 'Musonda'
        }
      ],
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/employee-signature',
          valueAttachment: {
            contentType: 'image/png',
            url: '/ocrvs/2bc24648-d600-4232-a81f-22b34b210f4b.png',
            creation: '1747825563684'
          }
        }
      ],
      id: '49f04ad3-7c27-45f9-beff-6a98eb9793ff',
      meta: {
        lastUpdated: '2025-05-21T11:06:03.695+00:00',
        versionId: '7913b35b-d1bd-40c6-a3fa-456846dc89fe'
      },
      _transforms: {
        meta: {
          lastUpdated: {
            $date: '2025-05-21T11:06:03.695Z'
          }
        }
      },
      _request: {
        method: 'PUT'
      }
    }

    mockingoose(User).toReturn(dummyUser, 'findOne')
    fetch.mockResponseOnce(JSON.stringify(practitionerMock))

    const res = await server.server.inject({
      method: 'POST',
      url: '/getUser',
      payload: { practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const parsedResult = JSON.parse(JSON.stringify(res.result))

    expect(parsedResult).toEqual({
      ...dummyUser,
      signature: practitionerMock.extension[0].valueAttachment.url
    })
  })

  it('returns 400 for an invalid userid', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/getUser',
      payload: { userId: 'XXX' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.result.statusCode).toEqual(400)
  })
})
