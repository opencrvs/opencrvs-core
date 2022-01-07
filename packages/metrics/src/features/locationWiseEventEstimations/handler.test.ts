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
import * as api from '@metrics/api'
const fetchChildLocationsByParentId = api.fetchChildLocationsByParentId as jest.Mock

const readPoints = influx.query as jest.Mock

describe('verify locationWiseEventEstimations handler', () => {
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
    fetchChildLocationsByParentId.mockReset()
    fetchChildLocationsByParentId.mockResolvedValueOnce([
      {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'FACILITY000002'
          }
        ],
        name: 'Moktarpur Union Parishad',
        alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/9e7ce1b1-a28e-46fd-9aad-8a9cd215b15c'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'CRVS_OFFICE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'bu',
              display: 'Building'
            }
          ]
        },
        telecom: [
          {
            system: 'phone',
            value: ''
          },
          {
            system: 'email',
            value: ''
          }
        ],
        address: {
          line: ['Moktarpur', 'Kaliganj'],
          district: 'Gazipur',
          state: 'Dhaka'
        },
        meta: {
          lastUpdated: '2019-09-05T14:13:52.662+00:00',
          versionId: '7907e8b8-83dd-4837-a088-1c77a320ecca'
        },
        id: 'b2b3ca8b-a14f-41c6-b97f-7cb99a1299e5'
      }
    ])
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
        '/locationWiseEventEstimations?timeStart=2020-03-01T18:00:00.000Z&timeEnd=2020-03-30T17:59:59.999Z' +
        '&locationId=1490d3dd-71a9-47e8-b143-f9fc64f71294&event=BIRTH',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })

  it('ingnore estimation data for invalid childlocations', async () => {
    const utilService = require('../metrics/utils')
    fetchChildLocationsByParentId.mockReset()
    fetchChildLocationsByParentId.mockResolvedValueOnce([
      {
        resourceType: 'Invalid'
      },
      {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'FACILITY000002'
          }
        ],
        name: 'Moktarpur Union Parishad',
        alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/9e7ce1b1-a28e-46fd-9aad-8a9cd215b15c'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'CRVS_OFFICE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'bu',
              display: 'Building'
            }
          ]
        },
        telecom: [
          {
            system: 'phone',
            value: ''
          },
          {
            system: 'email',
            value: ''
          }
        ],
        address: {
          line: ['Moktarpur', 'Kaliganj'],
          district: 'Gazipur',
          state: 'Dhaka'
        },
        meta: {
          lastUpdated: '2019-09-05T14:13:52.662+00:00',
          versionId: '7907e8b8-83dd-4837-a088-1c77a320ecca'
        },
        id: 'b2b3ca8b-a14f-41c6-b97f-7cb99a1299e5'
      }
    ])
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
        '/locationWiseEventEstimations?timeStart=2020-03-01T18:00:00.000Z&timeEnd=2020-03-30T17:59:59.999Z' +
        '&locationId=1490d3dd-71a9-47e8-b143-f9fc64f71294&event=BIRTH',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
    expect(res.result.length).toBe(1)
  })

  it('returns 400 for required params', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url: '/locationWiseEventEstimations',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(400)
  })
})
