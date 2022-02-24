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

jest.mock('../../configApi', () => {
  const originalModule = jest.requireActual('../../configApi')
  return {
    __esModule: true,
    ...originalModule,
    getApplicationConfig: () =>
      Promise.resolve({
        API_GATEWAY_URL: 'http://localhost:7070/',
        CONFIG_API_URL: 'http://localhost:2021',
        LOGIN_URL: 'http://localhost:3020',
        AUTH_URL: 'http://localhost:4040',
        RESOURCES_URL: 'http://localhost:3040',
        CERTIFICATE_PRINT_CHARGE_FREE_PERIOD: 36500,
        CERTIFICATE_PRINT_CHARGE_UP_LIMIT: 36500,
        CERTIFICATE_PRINT_LOWEST_CHARGE: 0,
        CERTIFICATE_PRINT_HIGHEST_CHARGE: 0,
        UI_POLLING_INTERVAL: 5000,
        FIELD_AGENT_AUDIT_LOCATIONS: 'DISTRICT',
        APPLICATION_AUDIT_LOCATIONS: 'DISTRICT',
        INFORMANT_MINIMUM_AGE: 16,
        HIDE_EVENT_REGISTER_INFORMATION: false,
        EXTERNAL_VALIDATION_WORKQUEUE: false,
        PHONE_NUMBER_PATTERN: {
          pattern: '/^0(7|9)[0-9]{1}[0-9]{7}$/',
          example: '0970545855',
          start: '0[7|9]',
          num: '10',
          mask: {
            startForm: 4,
            endBefore: 2
          }
        },
        SENTRY: 'https://f892d643aab642108f44e2d1795706bc@sentry.io/1774604',
        LOGROCKET: 'opencrvs-foundation/opencrvs-zambia',
        NID_NUMBER_PATTERN: {
          pattern: '/^[0-9]{9}$/',
          example: '4837281940',
          num: '9'
        },
        COUNTRY: 'zmb',
        LANGUAGES: 'en'
      })
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
