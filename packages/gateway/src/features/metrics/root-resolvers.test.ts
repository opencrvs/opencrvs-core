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

describe('fetch birth registration metrics', () => {
  it('returns an array of birth registraiton metrics', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        payments: [
          {
            locationId: 'fake',
            total: 0
          }
        ],
        timeFrames: [
          {
            locationId: 'fake',
            regWithin45d: 0,
            regWithin45dTo1yr: 0,
            regWithin1yrTo5yr: 0,
            regOver5yr: 0,
            total: 0
          }
        ],
        genderBasisMetrics: [
          {
            locationId: 'fake',
            maleUnder18: 0,
            femaleUnder18: 0,
            maleOver18: 0,
            femaleOver18: 0,
            total: 0
          }
        ],
        estimated45DayMetrics: [
          {
            locationId: 'fake',
            estimatedRegistration: 0,
            registrationIn45Day: 0,
            estimationPercentage: 0
          }
        ]
      })
    )

    const data = await resolvers.Query.fetchRegistrationMetrics(
      {},
      {
        timeStart: '2019-10-24T18:00:00.000Z',
        timeEnd: '2019-12-24T18:00:00.000Z',
        locationId: 'b809ac98-2a98-4970-9d64-c92086f887a9',
        event: 'birth'
      }
    )

    expect(data).toBeDefined()
    expect(data.timeFrames).toBeInstanceOf(Object)
    expect(data.timeFrames.details.length).toBe(1)
    expect(data.genderBasisMetrics).toBeInstanceOf(Object)
    expect(data.genderBasisMetrics.details.length).toBe(1)
    expect(data.payments).toBeInstanceOf(Object)
    expect(data.payments.details.length).toBe(1)
    expect(data.genderBasisMetrics).toBeInstanceOf(Object)
    expect(data.genderBasisMetrics.details.length).toBe(1)
    expect(data.estimated45DayMetrics).toBeInstanceOf(Object)
    expect(data.estimated45DayMetrics.details.length).toBe(1)
  })

  it('returns an empty array of birth registraiton metrics when error is thrown', async () => {
    fetch.mockReject(new Error('error'))
    await expect(
      resolvers.Query.fetchRegistrationMetrics({}, {})
    ).rejects.toThrowError('Metrics request failed: error')
  })
})
describe('get event estimation metrics', () => {
  it('returns estimated data for both birth and death', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        birth45DayMetrics: {
          actualRegistration: 50,
          estimatedRegistration: 356,
          estimatedPercentage: 14,
          malePercentage: 50,
          femalePercentage: 50
        },
        death45DayMetrics: {
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
    expect(data.birth45DayMetrics).toBeInstanceOf(Object)
    expect(data.birth45DayMetrics.estimatedPercentage).toBe(14)
    expect(data.death45DayMetrics).toBeInstanceOf(Object)
    expect(data.death45DayMetrics.estimatedPercentage).toBe(0)
  })
})
describe('get applications started metrics', () => {
  it('returns applications started', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        fieldAgentApplications: 2,
        hospitalApplications: 2,
        officeApplications: 4
      })
    )

    const data = await resolvers.Query.getApplicationsStartedMetrics(
      {},
      {
        timeStart: '2019-10-24T18:00:00.000Z',
        timeEnd: '2019-12-24T18:00:00.000Z',
        locationId: 'b809ac98-2a98-4970-9d64-c92086f887a9'
      }
    )

    expect(data).toBeDefined()
    expect(data.fieldAgentApplications).toBe(2)
  })
})
