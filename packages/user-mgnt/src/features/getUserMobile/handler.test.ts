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
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import mockingoose from 'mockingoose'

let server: any

beforeEach(async () => {
  server = await createServer()
})

const token = jwt.sign(
  { scope: ['declare'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:user-mgnt-user'
  }
)

test("getUserMobile should throw with 401 when user doesn't exist", async () => {
  const spy = jest.spyOn(User, 'findOne').mockResolvedValueOnce(null)

  const res = await server.server.inject({
    method: 'POST',
    url: '/getUserMobile',
    payload: { userId: '5bfd2507c8bf7b6b4b3eb3aa' },
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  expect(res.result.statusCode).toBe(401)
  expect(spy).toBeCalled()
})

test('getUserMobile should return 200 and the mobile number', async () => {
  const entry = {
    mobile: '27555555555',
    passwordHash:
      'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
    salt: '12345',
    scope: ['test']
  }

  mockingoose(User).toReturn(entry, 'findOne')

  const res = await server.server.inject({
    method: 'POST',
    url: '/getUserMobile',
    payload: { userId: '5bfd2507c8bf7b6b4b3eb3aa' },
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  expect(res.result).toMatchObject({ mobile: '27555555555' })
})
