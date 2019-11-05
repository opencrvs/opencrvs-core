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
        keyFigures: {},
        regByAge: [
          {
            label: '45d',
            value: 200
          },
          {
            label: '46d - 1yr',
            value: 105
          },
          {
            label: '1yr',
            value: 300
          },
          {
            label: '2yr',
            value: 0
          },
          {
            label: '3yr',
            value: 0
          },
          {
            label: '4yr',
            value: 500
          },
          {
            label: '5yr',
            value: 0
          },
          {
            label: '6yr',
            value: 0
          },
          {
            label: '7yr',
            value: 0
          },
          {
            label: '8yr',
            value: 0
          },
          {
            label: '9r',
            value: 3
          },
          {
            label: '10yr',
            value: 0
          }
        ],
        regWithin$5d: {}
      })
    )

    const data = await resolvers.Query.fetchBirthRegistrationMetrics(
      {},
      { timeStart: '1552469068679', timeEnd: '1554814894419' }
    )

    expect(data).toBeDefined()
    expect(data.regByAge).toBeInstanceOf(Array)
    expect(data.regByAge.length).toBe(12)
  })
  it('returns an empty array of birth registraiton metrics when the reponse is not valid', async () => {
    fetch.mockResponse(JSON.stringify({ statusCode: 500, error: 'ERROR' }))
    const data = await resolvers.Query.fetchBirthRegistrationMetrics({}, {})

    expect(data).toBeDefined()
    expect(data.regByAge).toBeInstanceOf(Array)
    expect(data.regByAge.length).toBe(0)
  })
  it('returns an empty array of birth registraiton metrics when error is thrown', async () => {
    fetch.mockReject(new Error('error'))
    await expect(
      resolvers.Query.fetchBirthRegistrationMetrics({}, {})
    ).rejects.toThrowError('Metrics request failed: error')
  })
})
