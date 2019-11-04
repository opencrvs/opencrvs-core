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
import { createServer } from '@metrics/index'
import * as influx from '@metrics/influxdb/client'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'

const readPoints = influx.readPoints as jest.Mock

describe('verify metrics handler', () => {
  let server: any
  const token = jwt.sign(
    { scope: ['declare'] },
    readFileSync('../auth/test/cert.key'),
    {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:metrics-user'
    }
  )

  beforeEach(async () => {
    server = await createServer()
  })

  it('returns ok for valid request', async () => {
    readPoints.mockResolvedValue([
      {
        total: 28334,
        gender: 'male'
      },
      {
        total: 28124,
        gender: 'female'
      }
    ])

    const res = await server.server.inject({
      method: 'GET',
      url:
        '/metrics/birth?timeStart=1552469068679&timeEnd=1554814894419&locationId=Location/b21ce04e-7ccd-4d65-929f-453bc193a736',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })

  it('returns 400 for required params', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url: '/metrics/birth',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(400)
  })

  it('returns empty keyfigure if no matching data found', async () => {
    readPoints.mockResolvedValue(null)

    const res = await server.server.inject({
      method: 'GET',
      url:
        '/metrics/birth?timeStart=1552469068679&timeEnd=1554814894419&locationId=Location/b21ce04e-7ccd-4d65-929f-453bc193a736',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })
})
