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
import { fetchJSON } from '@opencrvs/commons'
import User from '@user-mgnt/model/user'
import { createServer } from '@user-mgnt/server'
import * as mockingoose from 'mockingoose'

let server: any

jest.mock('@opencrvs/commons', () => {
  const originalModule = jest.requireActual('@opencrvs/commons')
  return {
    ...originalModule,
    fetchJSON: jest.fn()
  }
})

beforeEach(async () => {
  server = await createServer()
})

test("verifyUserHandler should throw with 401 when user doesn't exist", async () => {
  const spy = jest.spyOn(User, 'findOne').mockResolvedValueOnce(null)

  const res = await server.server.inject({
    method: 'POST',
    url: '/verifyUser',
    payload: { mobile: '+8801711111111' }
  })

  expect(res.result.statusCode).toBe(401)
  expect(spy).toBeCalled()
})

test('verifyUserHandler should respond with conflict when there are no security answers', async () => {
  const entry = {
    mobile: '+8801711111111',
    scope: ['test'],
    status: 'active',
    id: '123',
    username: 'user'
  }
  mockingoose(User).toReturn(entry, 'findOne')

  const res = await server.server.inject({
    method: 'POST',
    url: '/verifyUser',
    payload: { mobile: '+8801711111111' }
  })
  expect(res.result.statusCode).toBe(409)
})

test('verifyUserHandler should throw when User.findOne throws', async () => {
  const spy = jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
    throw new Error('boom')
  })
  const res = await server.server.inject({
    method: 'POST',
    url: '/verifyUser',
    payload: { mobile: '+8801711111111' }
  })
  expect(res.result.statusCode).toBe(500)

  expect(spy).toBeCalled()
})

test('verifyUserHandler should find user regardless of email case', async () => {
  ;(fetchJSON as jest.Mock).mockResolvedValueOnce([
    { id: 'FIELD_AGENT', scopes: ['test-scope'] }
  ])

  const entry = {
    name: [
      {
        use: 'en',
        given: ['John', 'William'],
        family: 'Doe'
      }
    ],
    username: 'f.shez',
    emailForNotification: 'shez@gmail.com',
    status: 'active',
    mobile: '+8801711111111',
    id: '68f8d6b6f3ca974d8c2d4f37',
    securityQuestionAnswers: [{ key: 'q1', answer: 'a1' }],
    role: 'FIELD_AGENT',
    practitionerId: 'p123'
  }

  mockingoose(User).toReturn(entry, 'findOne')

  const res = await server.server.inject({
    method: 'POST',
    url: '/verifyUser',
    payload: { email: 'Shez@GMAIL.com' }
  })

  expect(res.statusCode).toBe(200)
  expect(res.result.email).toBe('shez@gmail.com')
  expect(res.result.username).toBe('f.shez')
})
