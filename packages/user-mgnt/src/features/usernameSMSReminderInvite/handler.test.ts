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
import * as mockingoose from 'mockingoose'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import { createServer } from '@user-mgnt/server'
import User, { IUser } from '@user-mgnt/model/user'
import { Types } from 'mongoose'

const sysAdminToken = jwt.sign(
  { scope: ['sysadmin', 'demo'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:user-mgnt-user'
  }
)

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
  mobile: '+8801234567890',
  systemRole: 'LOCAL_REGISTRAR',
  role: new Types.ObjectId('6348acd2e1a47ca32e79f46f'),
  status: 'pending',
  primaryOfficeId: '321',
  practitionerId: '123',
  signature: {
    type: 'image/png',
    data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlwAAAK8CAYAAAA6WGEyAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2h'
  },
  creationDate: 1608189840208,
  localRegistrar: {
    name: [
      {
        use: 'en',
        given: ['John', 'William'],
        family: 'Doe'
      }
    ],
    signature: {
      type: 'image/png',
      data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlwAAAK8CAYAAAA6WGEyAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2h'
    }
  },
  catchmentAreaIds: [],
  scope: ['register'],
  device: 'D444',
  passwordHash:
    'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
  salt: '12345',
  securityQuestionAnswers: [
    {
      questionKey: 'Question?',
      answerHash: 'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077'
    }
  ]
}

describe('usernameSMSReminderInvite handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
  })

  it('returns 401 if no user corresponding to mobile number found', async () => {
    mockingoose(User).toReturn(null, 'findOne')
    const res = await server.server.inject({
      method: 'POST',
      url: '/usernameReminder',
      payload: {
        userId: '5d10885374be318fa7689f0b'
      },
      headers: {
        Authorization: `Bearer ${sysAdminToken}`
      }
    })

    expect(res.statusCode).toBe(401)
  })

  it('returns 201 if handler success', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    mockingoose(User).toReturn(null, 'update')
    const res = await server.server.inject({
      method: 'POST',
      url: '/usernameReminder',
      payload: {
        userId: '5d10885374be318fa7689f0b'
      },
      headers: {
        Authorization: `Bearer ${sysAdminToken}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
})
