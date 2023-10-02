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
import { createServer } from '@config/server'
import InformantSMSNotification from '@config/models/informantSMSNotifications'
import * as fetchMock from 'jest-fetch-mock'
import * as mockingoose from 'mockingoose'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

const token = jwt.sign(
  { scope: ['natlsysadmin'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:config-user'
  }
)

const fetch = fetchMock as fetchMock.FetchMock

const informantSMSNotificationMock = [
  {
    _id: '6399adb1d9f62e3dbe63f93b',
    name: 'Health Notification',
    enabled: true,
    updatedAt: 1671015997842,
    createdAt: 1671015857450,
    __v: 0
  },
  {
    _id: '6399adbfd9f62e3dbe63f93e',
    name: 'SMS Notification',
    enabled: false,
    updatedAt: 1671015871107,
    createdAt: 1671015871107,
    __v: 0
  }
]

describe('createInformantSMSNotification test', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
    fetch.resetMocks()
  })

  it('should create informantSMSNotification using mongoose', async () => {
    mockingoose(InformantSMSNotification).toReturn(
      informantSMSNotificationMock[0],
      'insertMany'
    )
    mockingoose(InformantSMSNotification).toReturn(
      informantSMSNotificationMock,
      'find'
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/informantSMSNotification',
      payload: [
        {
          name: 'Health Notification',
          enabled: true
        }
      ],
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(201)
  })

  it('should return error if payload is invalid while create informantSMSNotification', async () => {
    mockingoose(InformantSMSNotification).toReturn(
      informantSMSNotificationMock[0],
      'insertMany'
    )
    mockingoose(InformantSMSNotification).toReturn(
      informantSMSNotificationMock,
      'find'
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/informantSMSNotification',
      payload: [
        {
          name: 'Health Notification',
          enabled: 'active'
        }
      ],
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(400)
  })
})
