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
import * as fetchMock from 'jest-fetch-mock'

const readPoints = influx.query as jest.Mock
const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock

jest.mock('./utils', () => {
  const originalModule = jest.requireActual('./utils')
  return {
    __esModule: true,
    ...originalModule,
    getRegistrationTargetDays: () => 45
  }
})

jest.mock('../../influxdb/client', () => {
  const originalModule = jest.requireActual('../../influxdb/client')
  return {
    __esModule: true,
    ...originalModule,
    deleteMeasurements: () =>
      Promise.resolve({
        status: 'ok'
      })
  }
})

const mockLocationBundle = {
  entry: [{ resource: { id: '1490d3dd-71a9-47e8-b143-f9fc64f71294' } }]
}

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

  it('returns ok for valid request for birth', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockLocationBundle))
    readPoints.mockResolvedValueOnce([
      {
        locationLevel2: 'Location/1490d3dd-71a9-47e8-b143-f9fc64f71294',
        locationLevel3: 'Location/94429795-0a09-4de8-8e1e-27dab01877d2'
      }
    ])

    readPoints.mockResolvedValueOnce([
      {
        regWithinTargetd: 1,
        regWithinTargetdTo1yr: 3,
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

    readPoints.mockResolvedValueOnce([
      {
        withInTargetDay: 1,
        locationLevel2: 'Location/0eaa73dd-2a21-4998-b1e6-b08430595201'
      }
    ])
    const utilService = require('./utils')
    jest
      .spyOn(utilService, 'fetchEstimateForTargetDaysByLocationId')
      .mockReturnValue({
        estimation: 100,
        locationId: 'Location/0eaa73dd-2a21-4998-b1e6-b08430595201',
        locationLevel: 'DISTRICT',
        estimationYear: 2017
      })

    const res = await server.server.inject({
      method: 'GET',
      url: '/metrics?timeStart=1552469068679&timeEnd=1554814894419&locationId=1490d3dd-71a9-47e8-b143-f9fc64f71294&event=birth',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })

  it('returns ok for valid request for death', async () => {
    readPoints.mockResolvedValueOnce([
      {
        locationLevel2: 'Location/1490d3dd-71a9-47e8-b143-f9fc64f71294',
        locationLevel3: 'Location/94429795-0a09-4de8-8e1e-27dab01877d2'
      }
    ])

    readPoints.mockResolvedValueOnce([
      {
        regWithinTargetd: 1,
        regWithinTargetdTo1yr: 3,
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
    readPoints.mockResolvedValueOnce([
      {
        withInTargetDay: 1,
        locationLevel2: 'Location/0eaa73dd-2a21-4998-b1e6-b08430595201'
      }
    ])
    const utilService = require('./utils')
    jest
      .spyOn(utilService, 'fetchEstimateForTargetDaysByLocationId')
      .mockReturnValue({
        estimation: 100,
        locationId: 'Location/0eaa73dd-2a21-4998-b1e6-b08430595201',
        locationLevel: 'DISTRICT',
        estimationYear: 2017
      })

    const res = await server.server.inject({
      method: 'GET',
      url: '/metrics?timeStart=1552469068679&timeEnd=1554814894419&locationId=1490d3dd-71a9-47e8-b143-f9fc64f71294&event=death',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })

  it('returns 400 for required params', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url: '/metrics',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(400)
  })
})

describe('delete metrics measurement handler', () => {
  let server: any
  const token = jwt.sign(
    { scope: ['declare', 'natlsysadmin'] },
    readFileSync('../auth/test/cert.key'),
    {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:metrics-user'
    }
  )

  beforeEach(async () => {
    server = await createServer()
    jest.clearAllMocks()
  })

  it('returns ok when scope is NATLSYSADMIN and Successfully drop all measurement', async () => {
    const res = await server.server.inject({
      method: 'DELETE',
      url: '/influxMeasurement',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })
})
