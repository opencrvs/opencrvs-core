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
import { referenceApi } from '@client/utils/referenceApi'
import * as fetchMock from 'jest-fetch-mock'

jest.unmock('@client/utils/referenceApi')

const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock

export const mockFetchLocations = {
  data: {
    'ba819b89-57ec-4d8b-8b91-e8865579a40f': {
      id: 'ba819b89-57ec-4d8b-8b91-e8865579a40f',
      name: 'Barisal',
      alias: 'বরিশাল',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    }
  }
}

export const mockFetchFacilities = {
  data: [
    {
      id: '3fadd4e1-bcfd-470b-a997-07bc09631e2c',
      name: 'Moktarpur Union Parishad',
      alias: 'মোক্তারপুর ইউনিয়ন পরিষদ',
      physicalType: 'Building',
      type: 'CRVS_OFFICE',
      partOf: 'Location/9ce9fdba-ae24-467f-87ab-5b5498a0217f'
    }
  ]
}

describe('referenceApi', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  it('retrieves the locations.json from the server', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockFetchLocations))

    const data = await referenceApi.loadLocations()
    expect(data).toEqual(mockFetchLocations.data)
  })

  it('retrieves the facilities.json from the server', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockFetchFacilities))

    const data = await referenceApi.loadFacilities()
    expect(data).toEqual(mockFetchFacilities.data)
  })
})
