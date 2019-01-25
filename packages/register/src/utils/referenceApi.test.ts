import { referenceApi } from './referenceApi'
import * as fetch from 'jest-fetch-mock'
import { config } from 'src/config'

import * as nock from 'nock'

const mockFetchLocations = {
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

nock(config.RESOURCES_URL)
  .get('/locations')
  .reply(200, mockFetchLocations)

describe('referenceApi', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  it('retrieves the locations.json from the server', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockFetchLocations))

    return referenceApi.loadLocations().then(data => {
      expect(data).toEqual(mockFetchLocations)
    })
  })
})
