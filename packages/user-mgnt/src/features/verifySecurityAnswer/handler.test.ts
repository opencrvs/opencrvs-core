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
import * as fetchMock from 'jest-fetch-mock'
import User, { IUser } from '@user-mgnt/model/user'
import { generateHash } from '@user-mgnt/utils/hash'

import mockingoose from 'mockingoose'

const fetch = fetchMock as fetchMock.FetchMock

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
  securityQuestionAnswers: [
    {
      questionKey: 'TEST_QUESTION_1',
      answerHash: generateHash('correct answer for q1', '12345')
    },
    {
      questionKey: 'TEST_QUESTION_2',
      answerHash: generateHash('correct answer for q2', '12345')
    },
    {
      questionKey: 'TEST_QUESTION_3',
      answerHash: generateHash('correct answer for q3', '12345')
    }
  ],
  scope: ['register'],
  device: 'D444',
  passwordHash:
    'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
  salt: '12345'
}

let server: any

beforeEach(async () => {
  mockingoose.resetAll()
  server = await createServer()
  fetch.resetMocks()
})

describe('verifying a security question answer', () => {
  it('responds with an error code when user id is incorrect', async () => {
    mockingoose(User).toReturn(null, 'findOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/verifySecurityAnswer',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        questionKey: 'TEST_QUESTION_1',
        answer: 'incorrect answer'
      }
    })

    expect(res.statusCode).toBe(401)
  })
  it('responds with an error code when user doesnt have answers', async () => {
    mockingoose(User).toReturn(
      { ...mockUser, securityQuestionAnswers: [] },
      'findOne'
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/verifySecurityAnswer',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        questionKey: 'TEST_QUESTION_1',
        answer: 'correct answer'
      }
    })

    expect(res.statusCode).toBe(409)
  })
  it('responds with matched as true when answer is correct', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/verifySecurityAnswer',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        questionKey: 'TEST_QUESTION_1',
        answer: 'correct answer for q1'
      }
    })

    expect(res.result.matched).toBe(true)
  })
  it('responds with matched as false and a new questionKey when answer is incorrect', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/verifySecurityAnswer',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        questionKey: 'TEST_QUESTION_1',
        answer: 'incorrect answer for q1'
      }
    })

    expect(res.result.matched).toBe(false)
    expect(res.result.questionKey).toBeDefined()
    expect(res.result.questionKey).not.toBe('TEST_QUESTION_1')
  })
})
