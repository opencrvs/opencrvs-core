/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { resolvers as rootResolvers } from '@gateway/features/metrics/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'
const resolvers = rootResolvers as any
const fetch = fetchAny as any
beforeEach(() => {
  fetch.resetMocks()
})

describe('get total metrics', () => {
  it('returns estimated data for event', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        estimated: {
          totalEstimation: 263977,
          maleEstimation: 127633,
          femaleEstimation: 136838,
          locationId: 'Location/0',
          locationLevel: 'COUNTRY'
        },
        results: [
          {
            total: 1,
            gender: 'male',
            eventLocationType: 'HEALTH_FACILITY',
            timeLabel: 'withinTarget',
            practitionerRole: 'LOCAL_REGISTRAR'
          }
        ]
      })
    )

    const data = await resolvers.Query.getTotalMetrics(
      {},
      {
        timeStart: '2019-10-24T18:00:00.000Z',
        timeEnd: '2019-12-24T18:00:00.000Z',
        event: 'BIRTH'
      },
      { headers: undefined }
    )

    expect(data).toBeDefined()
    expect(data).toBeInstanceOf(Object)
    expect(data.results).toHaveLength(1)
  })
})
describe('get declarations started metrics', () => {
  it('returns declarations started', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        fieldAgentDeclarations: 2,
        hospitalDeclarations: 2,
        officeDeclarations: 4
      })
    )

    const data = await resolvers.Query.getDeclarationsStartedMetrics(
      {},
      {
        timeStart: '2019-10-24T18:00:00.000Z',
        timeEnd: '2019-12-24T18:00:00.000Z',
        locationId: 'b809ac98-2a98-4970-9d64-c92086f887a9'
      },
      { headers: undefined }
    )

    expect(data).toBeDefined()
    expect(data.fieldAgentDeclarations).toBe(2)
  })
})
describe('get month wise event estimation metrics', () => {
  it('returns estimated data for both birth', async () => {
    fetch.mockResponseOnce(
      JSON.stringify([
        {
          total: 120,
          withinTarget: 50,
          within1Year: 100,
          within5Years: 300,
          estimated: 356,
          month: 0,
          year: 2020
        },
        {
          total: 10,
          withinTarget: 0,
          within1Year: 17,
          within5Years: 34,
          estimated: 356,
          month: 1,
          year: 2020
        }
      ])
    )

    const data = await resolvers.Query.fetchMonthWiseEventMetrics(
      {},
      {
        timeStart: '2019-10-24T18:00:00.000Z',
        timeEnd: '2019-12-24T18:00:00.000Z',
        locationId: 'b809ac98-2a98-4970-9d64-c92086f887a9',
        event: 'BIRTH'
      },
      { headers: undefined }
    )

    expect(data).toBeDefined()
    expect(data.length).toBe(2)
    expect(data[0].total).toBe(120)
  })
})
describe('get location wise event estimation metrics', () => {
  it('returns estimated data for both birth', async () => {
    fetch.mockResponseOnce(
      JSON.stringify([
        {
          total: 120,
          withinTarget: 50,
          within1Year: 100,
          within5Years: 300,
          estimated: 356,
          locationName: 'Baniajan Union Parishod',
          locationId: '123'
        },
        {
          total: 10,
          withinTarget: 0,
          within1Year: 100,
          within5Years: 310,
          estimated: 356,
          locationName: 'Atarpar Union Parishod',
          locationId: '123'
        }
      ])
    )

    const data = await resolvers.Query.fetchLocationWiseEventMetrics(
      {},
      {
        timeStart: '2019-10-24T18:00:00.000Z',
        timeEnd: '2019-12-24T18:00:00.000Z',
        locationId: 'b809ac98-2a98-4970-9d64-c92086f887a9',
        event: 'birth'
      },
      { headers: undefined }
    )

    expect(data).toBeDefined()
    expect(data.length).toBe(2)
    expect(data[0].locationName).toEqual('Baniajan Union Parishod')
    expect(data[1].total).toBe(10)
  })
})
