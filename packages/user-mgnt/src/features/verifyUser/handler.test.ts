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
import * as mockingoose from 'mockingoose'

let server: any

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

test('verifyUserHandler should return 200 and the user scope when the user exists', async () => {
  const entry = {
    mobile: '+8801711111111',
    scope: ['test'],
    status: 'active',
    securityQuestionAnswers: [{ questionKey: 'sample', answerHash: '##' }],
    id: '123',
    username: 'user'
  }
  mockingoose(User).toReturn(entry, 'findOne')

  const res = await server.server.inject({
    method: 'POST',
    url: '/verifyUser',
    payload: { mobile: '+8801711111111' }
  })

  expect([...res.result.scope]).toMatchObject(['test'])
})

test('verifyUserHandler should respond with conflict when there are now security answers', async () => {
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
