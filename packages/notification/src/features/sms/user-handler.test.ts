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
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import * as utils from '@notification/features/sms/utils'
import { createServer } from '@notification/index'
import { createServerWithEnvironment } from '@notification/tests/util'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any
describe('Verify user handlers', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })
  it('userCredentials returns OK if the sms gets sent', async () => {
    server = await createServerWithEnvironment({ SMS_PROVIDER: 'clickatell' })
    const spy = fetch.once('')

    const token = jwt.sign(
      { scope: ['sysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/userCredentialsSMS',
      payload: {
        msisdn: '447789778823',
        username: 'anik',
        password: 'B123456'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(200)
  })
  it('userCredentials returns 400 if called with no username', async () => {
    const spy = fetch.once('')

    const token = jwt.sign(
      { scope: ['sysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/userCredentialsSMS',
      payload: {
        msisdn: '447789778823',
        password: 'B123456'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(400)
  })
  it('userCredentials returns 500 the sms is not sent', async () => {
    const spy = jest
      .spyOn(utils, 'buildAndSendSMS')
      .mockImplementationOnce(() => Promise.reject(new Error()))

    const token = jwt.sign(
      { scope: ['sysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/userCredentialsSMS',
      payload: {
        msisdn: '447789778823',
        username: 'anik',
        password: 'B123456'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(500)
  })
  it('retrieveUserName returns OK if the sms gets sent', async () => {
    const spy = fetch.once('')

    const token = jwt.sign(
      { scope: ['sysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/retrieveUserNameSMS',
      payload: {
        msisdn: '447789778823',
        username: 'anik'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(200)
  })
  it('retrieveUserName returns 400 if called with no username', async () => {
    const spy = fetch.once('')

    const token = jwt.sign(
      { scope: ['sysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/retrieveUserNameSMS',
      payload: {
        msisdn: '447789778823'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(400)
  })
  it('retrieveUserName returns 500 the sms is not sent', async () => {
    const spy = jest
      .spyOn(utils, 'buildAndSendSMS')
      .mockImplementationOnce(() => Promise.reject(new Error()))

    const token = jwt.sign(
      { scope: ['sysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/retrieveUserNameSMS',
      payload: {
        msisdn: '447789778823',
        username: 'anik'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(500)
  })
})
