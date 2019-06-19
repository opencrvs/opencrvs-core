import { referenceApi } from '@register/utils/referenceApi'
import * as fetchMock from 'jest-fetch-mock'
import nock from 'nock'

const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock

export const mockFetchLocations = {
  data: [
    {
      id: 'ba819b89-57ec-4d8b-8b91-e8865579a40f',
      name: 'Barisal',
      nameBn: 'বরিশাল',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    }
  ]
}

export const mockFetchFacilities = {
  data: [
    {
      id: '3fadd4e1-bcfd-470b-a997-07bc09631e2c',
      name: 'Moktarpur Union Parishad',
      nameBn: 'মোক্তারপুর ইউনিয়ন পরিষদ',
      physicalType: 'Building',
      type: 'CRVS_OFFICE',
      partOf: 'Location/9ce9fdba-ae24-467f-87ab-5b5498a0217f'
    }
  ]
}

nock(window.config.RESOURCES_URL)
  .get('/locations')
  .reply(200, mockFetchLocations)

nock(window.config.RESOURCES_URL)
  .get('/facilities')
  .reply(200, mockFetchFacilities)

describe('referenceApi', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  /*
   * TODO: Need to resolve the weared travis issue "TypeError: Cannot read property 'body' of null"
   */
  it.skip('retrieves the locations.json from the server', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockFetchLocations))

    return referenceApi.loadLocations().then(data => {
      expect(data).toEqual(mockFetchLocations)
    })
  })

  /*
   * TODO: Need to resolve the weared travis issue "TypeError: Cannot read property 'body' of null"
   */
  it.skip('retrieves the facilities.json from the server', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockFetchFacilities))

    return referenceApi.loadFacilities().then(data => {
      expect(data).toEqual(mockFetchFacilities)
    })
  })
})
