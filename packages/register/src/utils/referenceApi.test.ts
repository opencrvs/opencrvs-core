import { referenceApi } from './referenceApi'
import * as fetch from 'jest-fetch-mock'

const mockFetchLocations = {
  data: [
    {
      id: 'ba819b89-57ec-4d8b-8b91-e8865579a40f',
      name: 'Barisal',
      nameBn: 'বরিশাল',
      physicalType: 'Jurisdiction',
      juristictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    }
  ]
}

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
