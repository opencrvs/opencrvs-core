import { resolvers } from '@gateway/features/search/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

beforeEach(() => {
  fetch.resetMocks()
})

describe('Search root resolvers', () => {
  describe('searchEvents()', () => {
    it('returns an array of composition results for eventType', async () => {
      fetch.mockResponse(
        JSON.stringify({
          hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          eventType: 'Birth'
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results for status', async () => {
      fetch.mockResponse(
        JSON.stringify({
          hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          status: 'DECLARED'
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results for locationIds', async () => {
      fetch.mockResponse(
        JSON.stringify({
          hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          locationIds: ['0411ff3d-78a4-4348-8eb7-b023a0ee6dce']
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results for searchContent', async () => {
      fetch.mockResponse(
        JSON.stringify({
          hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          searchContent: '01622688231'
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results for trackingId', async () => {
      fetch.mockResponse(
        JSON.stringify({
          hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          trackingId: 'B123456'
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results for registrationNumber', async () => {
      fetch.mockResponse(
        JSON.stringify({
          hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          registrationNumber: 'D2019123258D1234562'
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results for contactNumber', async () => {
      fetch.mockResponse(
        JSON.stringify({
          hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          contactNumber: '01622688231'
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results for userId', async () => {
      fetch.mockResponse(
        JSON.stringify({
          hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          userId: '1'
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns an array of composition results with given count', async () => {
      fetch.mockResponse(
        JSON.stringify({
          hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          count: 10,
          skip: 2
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toBeInstanceOf(Array)
      expect(result.totalItems).toBe(1)
    })
    it('returns total item as 0 and an empty array in-case of invalid result found from elastic', async () => {
      fetch.mockResponse(
        JSON.stringify({
          hits: null
        })
      )
      const result = await resolvers.Query.searchEvents(
        {},
        {
          eventType: 'Birth',
          status: 'DECLARED',
          locationIds: ['0411ff3d-78a4-4348-8eb7-b023a0ee6dce'],
          searchContent: '01622688231'
        }
      )

      expect(result).toBeDefined()
      expect(result.results).toEqual([])
      expect(result.totalItems).toBe(0)
    })
  })
  describe('countEvents()', () => {
    it('returns counts for different statuses of events', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            hits: {
              total: 2,
              hits: [
                { _type: 'composition', _source: {} },
                { _type: 'composition', _source: {} }
              ]
            }
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            hits: {
              total: 5,
              hits: [
                { _type: 'composition', _source: {} },
                { _type: 'composition', _source: {} },
                { _type: 'composition', _source: {} }
              ]
            }
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            hits: {
              total: 3,
              hits: [
                { _type: 'composition', _source: {} },
                { _type: 'composition', _source: {} },
                { _type: 'composition', _source: {} }
              ]
            }
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            hits: { total: 1, hits: [{ _type: 'composition', _source: {} }] }
          }),
          { status: 200 }
        ]
      )
      const result = await resolvers.Query.countEvents(
        {},
        {
          locationIds: ['1']
        }
      )

      expect(result).toBeDefined()
      expect(result.declared).toBe(2)
      expect(result.validated).toBe(5)
      expect(result.registered).toBe(3)
      expect(result.rejected).toBe(1)
    })
  })
  it('in case of invalid respose from elastic, returns 0 as count for different statuses of events', async () => {
    fetch.mockResponses(
      [
        JSON.stringify({
          hits: {}
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          hits: {}
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          hits: {}
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          hits: {}
        }),
        { status: 200 }
      ]
    )
    const result = await resolvers.Query.countEvents(
      {},
      {
        locationIds: ['1']
      }
    )

    expect(result).toBeDefined()
    expect(result.declared).toBe(0)
    expect(result.validated).toBe(0)
    expect(result.registered).toBe(0)
    expect(result.rejected).toBe(0)
  })
})
