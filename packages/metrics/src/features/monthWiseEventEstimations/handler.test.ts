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

const readPoints = influx.query as jest.Mock

describe('verify monthWiseEventEstimations handler', () => {
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
    const utilService = require('../metrics/utils')
    readPoints.mockResolvedValueOnce([
      {
        gender: 'male',
        total: 5
      },
      {
        gender: 'female',
        total: 2
      }
    ])
    jest
      .spyOn(utilService, 'fetchEstimateForTargetDaysByLocationId')
      .mockReturnValue({
        totalEstimation: 100,
        maleEstimation: 60,
        femaleEstimation: 40,
        locationId: 'Location/0eaa73dd-2a21-4998-b1e6-b08430595201',
        locationLevel: 'DISTRICT',
        estimationYear: 2017
      })
    readPoints.mockResolvedValueOnce([
      {
        total: 12
      }
    ])

    const res = await server.server.inject({
      method: 'GET',
      url:
        '/monthWiseEventEstimations?timeStart=2020-03-01T18:00:00.000Z&timeEnd=2020-03-30T17:59:59.999Z' +
        '&locationId=1490d3dd-71a9-47e8-b143-f9fc64f71294&event=BIRTH',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })

  it('returns 400 for required params', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url: '/monthWiseEventEstimations',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(400)
  })
})
