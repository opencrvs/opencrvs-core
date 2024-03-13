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
import * as mockingoose from 'mockingoose'
import User, { IUser } from '@user-mgnt/model/user'

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
  systemRole: 'LOCAL_REGISTRAR',
  status: 'pending',
  primaryOfficeId: '321',
  catchmentAreaIds: [],
  scope: ['register'],
  device: 'D444',
  passwordHash: '$2a$10$fyVfYYctO8oqs9euSvtgVeNyezpOy486VHmvQJgSg/qD81xpr1f.i',
  salt: '$2a$10$fyVfYYctO8oqs9euSvtgVe'
}

let server: any

beforeEach(async () => {
  server = await createServer()
})

test("verifyPassHandler should throw with 401 when user doesn't exist", async () => {
  const spy = jest.spyOn(User, 'findOne').mockResolvedValueOnce(null)

  const res = await server.server.inject({
    method: 'POST',
    url: '/verifyPassword',
    payload: { username: '27555555555', password: 'test' }
  })

  expect(res.result.statusCode).toBe(401)
  expect(spy).toBeCalled()
})

test("verifyPassHandler should throw with 401 when password hash doesn't match", async () => {
  mockingoose(User).toReturn(mockUser, 'findOne')

  const res = await server.server.inject({
    method: 'POST',
    url: '/verifyPassword',
    payload: { username: 'j.doe1', password: 'test1' }
  })

  expect(res.result.statusCode).toBe(401)
})

test('verifyPassHandler should return 200 and the user scope when the user exists and the password hash matches', async () => {
  mockingoose(User).toReturn(mockUser, 'findOne')

  const res = await server.server.inject({
    method: 'POST',
    url: '/verifyPassword',
    payload: { username: 'j.doe1', password: 'test' }
  })

  expect([...res.result.scope]).toMatchObject(['register'])
})

test('verifyPassHandler should throw when User.findOne throws', async () => {
  const spy = jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
    throw new Error('boom')
  })
  const res = await server.server.inject({
    method: 'POST',
    url: '/verifyPassword',
    payload: { username: '27555555555', password: 'test' }
  })
  expect(res.result.statusCode).toBe(500)

  expect(spy).toBeCalled()
})
