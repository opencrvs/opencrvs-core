import { referenceApi } from '@register/utils/referenceApi'
import * as fetchMock from 'jest-fetch-mock'

jest.unmock('@register/utils/referenceApi')

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
