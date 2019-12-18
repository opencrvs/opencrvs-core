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
        payments: [],
        timeFrames: [
          {
            locationId: 'fake',
            regWithin45d: 0,
            regWithin45dTo1yr: 0,
            regWithin1yrTo5yr: 0,
            regOver5yr: 0,
            total: 0
          }
        ]
      })
    )

    const data = await resolvers.Query.fetchBirthRegistrationMetrics(
      {},
      { timeStart: '1552469068679', timeEnd: '1554814894419' }
    )

    expect(data).toBeDefined()
    expect(data.timeFrames).toBeInstanceOf(Array)
    expect(data.timeFrames.length).toBe(1)
  })

  it('returns an empty array of birth registraiton metrics when error is thrown', async () => {
    fetch.mockReject(new Error('error'))
    await expect(
      resolvers.Query.fetchBirthRegistrationMetrics({}, {})
    ).rejects.toThrowError('Metrics request failed: error')
  })
})
