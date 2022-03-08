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
import * as service from '@metrics/features/applicationsStarted/service'

const readPoints = influx.query as jest.Mock

jest.mock('../metrics/utils', () => {
  const originalModule = jest.requireActual('../metrics//utils')
  return {
    __esModule: true,
    ...originalModule,
    getRegistrationTargetDays: () => 45
  }
})

describe('verify applicationsStarted', () => {
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

  describe('applicationsStartedHandler', () => {
    it('returns ok for valid request', async () => {
      readPoints
        .mockResolvedValueOnce([
          {
            count: 2
          }
        ])
        .mockResolvedValueOnce([
          {
            count: 4
          }
        ])
        .mockResolvedValueOnce([
          {
            count: 2
          }
        ])

      const res = await server.server.inject({
        method: 'GET',
        url: '/applicationsStarted?timeStart=1552469068679&timeEnd=1554814894419&locationId=1490d3dd-71a9-47e8-b143-f9fc64f71294',
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
            count: 2
          }
        ])
        .mockResolvedValueOnce([
          {
            count: 4
          }
        ])
        .mockResolvedValueOnce([
          {
            count: 2
          }
        ])

      const res = await service.fetchLocationWiseApplicationsStarted(
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
        .spyOn(service, 'fetchLocationWiseApplicationsStarted')
        .mockImplementation(() => {
          throw new Error()
        })
      const res = await server.server.inject({
        method: 'GET',
        url: '/applicationsStarted?timeStart=1552469068679&timeEnd=1554814894419&locationId=1490d3dd-71a9-47e8-b143-f9fc64f71294',
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
  describe('applicationStartedMetricsByPractitionersHandler', () => {
    it('returns ok for valid request', async () => {
      readPoints
        .mockResolvedValueOnce([
          {
            practitionerId: 'f361cae7-205a-4251-9f31-125118da1625',
            totalStarted: 14
          }
        ])
        .mockResolvedValueOnce([
          {
            practitionerId: 'f361cae7-205a-4251-9f31-125118da1625',
            totalStarted: 4
          }
        ])
        .mockResolvedValueOnce([
          {
            startedBy: 'f361cae7-205a-4251-9f31-125118da1625',
            totalStarted: 2
          }
        ])
        .mockResolvedValueOnce([
          {
            practitionerId: 'f361cae7-205a-4251-9f31-125118da1625',
            totalApplications: 6,
            totalTimeSpent: 874
          }
        ])

      const res = await server.server.inject({
        method: 'POST',
        url: '/applicationStartedMetricsByPractitioners',
        headers: {
          Authorization: `Bearer ${token}`
        },
        payload: {
          timeStart: '2019-03-31T18:00:00.000Z',
          timeEnd: '2020-06-30T17:59:59.999Z',
          locationId: 'bfe8306c-0910-48fe-8bf5-0db906cf3155',
          practitionerIds: ['f361cae7-205a-4251-9f31-125118da1625']
        }
      })
      expect(res.statusCode).toBe(200)
    })
  })
  it('returns ok for specific events also', async () => {
    readPoints
      .mockResolvedValueOnce([
        {
          practitionerId: 'f361cae7-205a-4251-9f31-125118da1625',
          totalStarted: 8
        }
      ])
      .mockResolvedValueOnce([
        {
          practitionerId: 'f361cae7-205a-4251-9f31-125118da1625',
          totalStarted: 3
        }
      ])
      .mockResolvedValueOnce([
        {
          startedBy: 'f361cae7-205a-4251-9f31-125118da1625',
          totalStarted: 2
        }
      ])
      .mockResolvedValueOnce([
        {
          practitionerId: 'f361cae7-205a-4251-9f31-125118da1625',
          totalApplications: 4,
          totalTimeSpent: 674
        }
      ])

    const res = await server.server.inject({
      method: 'POST',
      url: '/applicationStartedMetricsByPractitioners',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload: {
        timeStart: '2019-03-31T18:00:00.000Z',
        timeEnd: '2020-06-30T17:59:59.999Z',
        locationId: 'bfe8306c-0910-48fe-8bf5-0db906cf3155',
        practitionerIds: ['f361cae7-205a-4251-9f31-125118da1625'],
        event: 'BIRTH'
      }
    })
    expect(res.statusCode).toBe(200)
  })
  it('returns zero counts on influx error', async () => {
    jest
      .spyOn(service, 'getNumberOfAppStartedByPractitioners')
      .mockImplementation(() => {
        throw new Error('')
      })
    const res = await server.server.inject({
      method: 'POST',
      url: '/applicationStartedMetricsByPractitioners',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload: {
        timeStart: '2019-03-31T18:00:00.000Z',
        timeEnd: '2020-06-30T17:59:59.999Z',
        locationId: 'bfe8306c-0910-48fe-8bf5-0db906cf3155',
        practitionerIds: ['f361cae7-205a-4251-9f31-125118da1625'],
        event: 'BIRTH'
      }
    })
    expect(res.statusCode).toBe(200)
    expect(res.payload).toEqual(
      JSON.stringify([
        {
          practitionerId: 'f361cae7-205a-4251-9f31-125118da1625',
          locationId: 'bfe8306c-0910-48fe-8bf5-0db906cf3155',
          totalNumberOfApplicationStarted: 0,
          averageTimeForDeclaredApplications: 0,
          totalNumberOfInProgressAppStarted: 0,
          totalNumberOfRejectedApplications: 0
        }
      ])
    )
  })
})
