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
import { resolvers } from '@gateway/features/metrics/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any
beforeEach(() => {
  fetch.resetMocks()
})

describe('get event estimation metrics', () => {
  it('returns estimated data for both birth and death', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        birthTargetDayMetrics: {
          actualRegistration: 50,
          estimatedRegistration: 356,
          estimatedPercentage: 14,
          malePercentage: 50,
          femalePercentage: 50
        },
        deathTargetDayMetrics: {
          actualRegistration: 0,
          estimatedRegistration: 150,
          estimatedPercentage: 0,
          malePercentage: 0,
          femalePercentage: 0
        }
      })
    )

    const data = await resolvers.Query.getEventEstimationMetrics(
      {},
      {
        timeStart: '2019-10-24T18:00:00.000Z',
        timeEnd: '2019-12-24T18:00:00.000Z',
        locationId: 'b809ac98-2a98-4970-9d64-c92086f887a9'
      }
    )

    expect(data).toBeDefined()
    expect(data.birthTargetDayMetrics).toBeInstanceOf(Object)
    expect(data.birthTargetDayMetrics.estimatedPercentage).toBe(14)
    expect(data.deathTargetDayMetrics).toBeInstanceOf(Object)
    expect(data.deathTargetDayMetrics.estimatedPercentage).toBe(0)
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
      }
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
          actualTotalRegistration: 120,
          actualTargetDayRegistration: 50,
          estimatedRegistration: 356,
          estimatedTargetDayPercentage: 14,
          month: 'January',
          year: '2020'
        },
        {
          actualTotalRegistration: 10,
          actualTargetDayRegistration: 0,
          estimatedRegistration: 356,
          estimatedTargetDayPercentage: 0,
          month: 'February',
          year: '2020'
        }
      ])
    )

    const data = await resolvers.Query.fetchMonthWiseEventMetrics(
      {},
      {
        timeStart: '2019-10-24T18:00:00.000Z',
        timeEnd: '2019-12-24T18:00:00.000Z',
        locationId: 'b809ac98-2a98-4970-9d64-c92086f887a9',
        event: 'birth'
      }
    )

    expect(data).toBeDefined()
    expect(data.details.length).toBe(2)
    expect(data.total.actualTotalRegistration).toBe(130)
  })
})
describe('get location wise event estimation metrics', () => {
  it('returns estimated data for both birth', async () => {
    fetch.mockResponseOnce(
      JSON.stringify([
        {
          actualTotalRegistration: 120,
          actualTargetDayRegistration: 50,
          estimatedRegistration: 356,
          estimatedTargetDayPercentage: 14,
          locationName: 'Baniajan Union Parishod',
          locationId: '123'
        },
        {
          actualTotalRegistration: 10,
          actualTargetDayRegistration: 0,
          estimatedRegistration: 356,
          estimatedTargetDayPercentage: 0,
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
      }
    )

    expect(data).toBeDefined()
    expect(data.details.length).toBe(2)
    expect(data.details[0].locationName).toEqual('Baniajan Union Parishod')
    expect(data.total.actualTotalRegistration).toBe(130)
  })
})
describe('get practitioner wise time logged metrics', () => {
  it('returns estimated data by practitioner and location', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        results: [
          {
            status: 'DECLARED',
            trackingId: 'D23S2D0',
            eventType: 'DEATH',
            timeSpentEditing: 120,
            time: '2019-03-31T18:00:00.000Z'
          }
        ],
        totalItems: 1
      })
    )

    const data = await resolvers.Query.fetchTimeLoggedMetricsByPractitioner(
      {},
      {
        timeStart: '2019-10-24T18:00:00.000Z',
        timeEnd: '2019-12-24T18:00:00.000Z',
        locationId: 'b809ac98-2a98-4970-9d64-c92086f887a9',
        practitionerId: '94429795-0a09-4de8-8e1e-27dab01877d2',
        count: 10
      }
    )

    expect(data).toBeDefined()
    expect(data.results[0].trackingId).toBe('D23S2D0')
    expect(data.totalItems).toBe(1)
  })
})
