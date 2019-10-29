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
import { createServer } from '@notification/index'
import { createServerWithEnvironment } from '@notification/tests/util'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any
describe('Verify handlers', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('smsHandler returns OK if the sms gets sent', async () => {
    const spy = fetch.once('')

    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:notification-user'
    })

    const res = await server.server.inject({
      method: 'POST',
      url: '/sms',
      payload: { msisdn: '447789778823', message: 'foo' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(200)
  })
  it('smsHandler returns 500 if invalid sms provider is given', async () => {
    server = await createServerWithEnvironment({ SMS_PROVIDER: 'invalid' })
    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:notification-user'
    })

    const res = await server.server.inject({
      method: 'POST',
      url: '/sms',
      payload: { msisdn: '447789778823', message: 'foo' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(500)
  })
})
