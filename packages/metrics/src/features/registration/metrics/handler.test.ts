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
    readPoints.mockResolvedValueOnce([
      {
        locationLevel2: 'Location/1490d3dd-71a9-47e8-b143-f9fc64f71294',
        locationLevel3: 'Location/94429795-0a09-4de8-8e1e-27dab01877d2'
      }
    ])

    readPoints.mockResolvedValueOnce([
      {
        regWithin45d: 1,
        regWithin45dTo1yr: 3,
        regWithin1yrTo5yr: 0,
        regOver5yr: 3,
        locationLevel3: 'Location/94429795-0a09-4de8-8e1e-27dab01877d2'
      }
    ])

    readPoints.mockResolvedValueOnce([])

    readPoints.mockResolvedValueOnce([
      {
        gender: 'male',
        over18: 5,
        under18: 2,
        locationLevel3: 'Location/94429795-0a09-4de8-8e1e-27dab01877d2'
      },
      {
        gender: 'female',
        over18: 3,
        under18: 2,
        locationLevel3: 'Location/94429795-0a09-4de8-8e1e-27dab01877d2'
      }
    ])

    const res = await server.server.inject({
      method: 'GET',
      url:
        '/metrics/birth?timeStart=1552469068679&timeEnd=1554814894419&locationId=1490d3dd-71a9-47e8-b143-f9fc64f71294',
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
})
