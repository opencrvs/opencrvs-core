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
import { createServer } from '@user-mgnt/server'
import { logger } from '@user-mgnt/logger'
import User, { AUDIT_ACTION, AUDIT_REASON, IUser } from '@user-mgnt/model/user'
import { readFileSync } from 'fs'
import * as fetchMock from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import mockingoose from 'mockingoose'

const fetch = fetchMock as fetchMock.FetchMock

const token = jwt.sign(
  { scope: ['sysadmin'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:user-mgnt-user'
  }
)

// @ts-ignore
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
  mobile: '+880123445568',
  role: 'LOCAL_REGISTRAR',
  status: 'active',
  primaryOfficeId: '321',
  catchmentAreaIds: [],
  scope: ['register'],
  device: 'D444',
  passwordHash:
    'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
  salt: '12345'
}

describe('Audit user handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('returns 400 for mongo error of user update', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    mockingoose(User).toReturn(mockUser, 'findOne')
    mockingoose(User).toReturn(new Error('boom'), 'update')

    const res = await server.server.inject({
      method: 'POST',
      url: '/auditUser',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        auditedBy: '1023984asd89asfj23asdf4',
        action: AUDIT_ACTION[AUDIT_ACTION.DEACTIVATE],
        reason: AUDIT_REASON[AUDIT_REASON.SUSPICIOUS]
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(logSpy).toHaveBeenLastCalledWith('boom')
    expect(res.statusCode).toBe(400)
  })
  it('Deactivate user', async () => {
    mockingoose(User).toReturn(mockUser, 'findOne')
    mockingoose(User).toReturn({}, 'update')

    const res = await server.server.inject({
      method: 'POST',
      url: '/auditUser',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        auditedBy: '1023984asd89asfj23asdf4',
        action: AUDIT_ACTION[AUDIT_ACTION.DEACTIVATE],
        reason: AUDIT_REASON[AUDIT_REASON.SUSPICIOUS]
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })
  it('reactivate user', async () => {
    const deactivatedMockUser = mockUser
    deactivatedMockUser.status = 'deactivated'
    deactivatedMockUser.auditHistory = [
      {
        auditedBy: '1023984asd89asfj23asdf4',
        auditedOn: 982348971234,
        action: AUDIT_ACTION[AUDIT_ACTION.DEACTIVATE],
        reason: AUDIT_REASON[AUDIT_REASON.SUSPICIOUS]
      }
    ]

    mockingoose(User).toReturn(deactivatedMockUser, 'findOne')
    mockingoose(User).toReturn({}, 'update')

    const res = await server.server.inject({
      method: 'POST',
      url: '/auditUser',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        auditedBy: '1023984asd89asfj23asdf4',
        action: AUDIT_ACTION[AUDIT_ACTION.REACTIVATE],
        reason: AUDIT_REASON[AUDIT_REASON.NOT_SUSPICIOUS]
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })
  it('returns 401 for invalid user', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    mockingoose(User).toReturn(null, 'findOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/auditUser',
      payload: {
        userId: '5d10885374be318fa7689f0b',
        auditedBy: '1023984asd89asfj23asdf4',
        action: AUDIT_ACTION[AUDIT_ACTION.DEACTIVATE],
        reason: AUDIT_REASON[AUDIT_REASON.SUSPICIOUS]
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(logSpy).toHaveBeenLastCalledWith(
      'No user details found for requested userId: 5d10885374be318fa7689f0b'
    )
    expect(res.statusCode).toBe(401)
  })
})
