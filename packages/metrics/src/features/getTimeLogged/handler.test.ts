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
import { createServer } from '@metrics/server'
import * as influx from '@metrics/influxdb/client'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
const readPoints = influx.query as jest.Mock

describe('verify time logged handler', () => {
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
        timeSpentEditing: 70
      }
    ])

    const res = await server.server.inject({
      method: 'GET',
      url: '/timeLogged?compositionId=94429795-0a09-4de8-8e1e-27dab01877d2&status=REGISTERED',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })

  it('returns 200 even if no time logged data found for given status', async () => {
    readPoints.mockResolvedValueOnce([])

    const res = await server.server.inject({
      method: 'GET',
      url: '/timeLogged?compositionId=94429795-0a09-4de8-8e1e-27dab01877d2&status=REGISTERED',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })

  it('returns 400 for required params', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url: '/timeLogged',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(400)
  })
})
describe('verify time logged by practitioner handler', () => {
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
        status: 'DECLARED',
        trackingId: 'D23S2D0',
        eventType: 'DEATH',
        timeSpentEditing: 120,
        time: '2019-03-31T18:00:00.000Z'
      }
    ])

    const res = await server.server.inject({
      method: 'GET',
      url:
        '/timeLoggedMetricsByPractitioner?timeStart=1552469068679&timeEnd=1554814894419&' +
        'practitionerId=94429795-0a09-4de8-8e1e-27dab01877d2&' +
        'locationId=94429795-0a09-4de8-8e1e-dssdr323&count=10',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })
  it('returns 400 for required params', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url: '/timeLoggedMetricsByPractitioner',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(400)
  })
})
