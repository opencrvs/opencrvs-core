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
import * as handler from '@metrics/features/applicationsStarted/handler'

const readPoints = influx.query as jest.Mock

describe('verify applicationsStarted handler', () => {
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
    readPoints
      .mockResolvedValueOnce([
        {
          role: 2
        }
      ])
      .mockResolvedValueOnce([
        {
          role: 2
        }
      ])
      .mockResolvedValueOnce([
        {
          role: 2
        }
      ])
      .mockResolvedValueOnce([
        {
          role: 2
        }
      ])

    const res = await server.server.inject({
      method: 'GET',
      url:
        '/applicationsStarted?timeStart=1552469068679&timeEnd=1554814894419&locationId=1490d3dd-71a9-47e8-b143-f9fc64f71294',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })

  it('returns 400 for required params', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url: '/applicationsStarted',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(400)
  })

  it('returns counts', async () => {
    readPoints
      .mockResolvedValueOnce([
        {
          role: 2
        }
      ])
      .mockResolvedValueOnce([
        {
          role: 2
        }
      ])
      .mockResolvedValueOnce([
        {
          role: 2
        }
      ])
      .mockResolvedValueOnce([
        {
          role: 2
        }
      ])

    const res = await handler.fetchLocationWiseApplicationsStarted(
      '1552469068679',
      '1554814894419',
      '1490d3dd-71a9-47e8-b143-f9fc64f71294'
    )

    expect(res).toEqual({
      fieldAgentApplications: 2,
      hospitalApplications: 2,
      officeApplications: 4
    })
  })

  it('returns zero counts on influx error', async () => {
    jest
      .spyOn(handler, 'fetchLocationWiseApplicationsStarted')
      .mockImplementation(() => {
        throw new Error()
      })
    const res = await server.server.inject({
      method: 'GET',
      url:
        '/applicationsStarted?timeStart=1552469068679&timeEnd=1554814894419&locationId=1490d3dd-71a9-47e8-b143-f9fc64f71294',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.result).toEqual({
      fieldAgentApplications: 0,
      hospitalApplications: 0,
      officeApplications: 0
    })
  })
})
