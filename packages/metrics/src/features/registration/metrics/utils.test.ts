import {
  calculateInterval,
  fetchEstimateByLocation
} from '@metrics/features/registration/metrics/utils'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

describe('verify metrics util', () => {
  describe('verify calculateInterval', () => {
    it('Should return 365d', () => {
      const interval = calculateInterval(
        '1293818400000000000',
        '1555670997414000000000'
      )
      expect(interval).toBe('365d')
    })

    it('Should return 30d', () => {
      const interval = calculateInterval(
        '1548957600000000000',
        '1555670997414000000000'
      )
      expect(interval).toBe('30d')
    })

    it('Should return 7d', () => {
      const interval = calculateInterval(
        '1555696800000000000',
        '1555670997414000000000'
      )
      expect(interval).toBe('7d')
    })
  })
  describe('verify fetchEstimateByLocation', () => {
    it('Returns estimate properly', async () => {
      fetch.mockResponse(
        JSON.stringify({
          resourceType: 'Location',
          name: 'Dhaka',
          alias: ['ঢাকা'],
          description: 'division=3',
          status: 'active',
          partOf: {
            reference: 'Location/0'
          },
          extension: [
            {
              url: 'http://opencrvs.org/specs/id/statistics-total-populations',
              valueString:
                '[{"2007":"40383972"},{"2008":"40407624"},{"2009":"40407624"},{"2010":"42156664"},{"2011":"42890545"},{"2012":"43152770"},{"2013":"50723777"},{"2014":"50743648"},{"2015":"34899211"},{"2016":"35461299"},{"2017":"37247123"}]'
            },
            {
              url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
              valueString:
                '[{"2007":"22.1"},{"2008":"20.2"},{"2009":"19.5"},{"2010":"19.7"},{"2011":"19.7"},{"2012":"20.7"},{"2013":"20.6"},{"2014":"19.9"},{"2015":"19.4"},{"2016":"19.1"},{"2017":"17.3"}]'
            }
          ],
          id: 'b21ce04e-7ccd-4d65-929f-453bc193a736'
        })
      )
      const result = await fetchEstimateByLocation(
        '1',
        { Authorization: 'bearer token' },
        2017
      )
      expect(result).toEqual({
        estimation: 644375,
        locationId: '1'
      })
    })
    it('Throws error if location doesnot have extension', async () => {
      fetch.mockResponse(
        JSON.stringify({
          resourceType: 'Location',
          name: 'Dhaka',
          alias: ['ঢাকা'],
          description: 'division=3',
          status: 'active',
          partOf: {
            reference: 'Location/0'
          },
          id: 'b21ce04e-7ccd-4d65-929f-453bc193a736'
        })
      )
      expect(
        fetchEstimateByLocation('1', { Authorization: 'bearer token' }, 2017)
      ).rejects.toThrowError('Invalid location data found')
    })
    it('Throws error if location is not partOf address', async () => {
      fetch.mockResponse(
        JSON.stringify({
          resourceType: 'Location',
          name: 'Dhaka',
          alias: ['ঢাকা'],
          description: 'division=3',
          status: 'active',
          extension: [],
          id: 'b21ce04e-7ccd-4d65-929f-453bc193a736'
        })
      )
      expect(
        fetchEstimateByLocation('1', { Authorization: 'bearer token' }, 2017)
      ).rejects.toThrowError('Unable to fetch estimate data from location tree')
    })
    it('Returns the estimatedFigures for right location', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            resourceType: 'Location',
            name: 'Dhaka',
            alias: ['ঢাকা'],
            description: 'division=3',
            status: 'active',
            extension: [],
            partOf: {
              reference: 'Location/0'
            },
            id: 'b21ce04e-7ccd-4d65-929f-453bc193a736'
          })
        ],
        [
          JSON.stringify({
            resourceType: 'Location',
            name: 'Dhaka',
            alias: ['ঢাকা'],
            description: 'division=3',
            status: 'active',
            extension: [
              {
                url:
                  'http://opencrvs.org/specs/id/statistics-total-populations',
                valueString:
                  '[{"2007":"40383972"},{"2008":"40407624"},{"2009":"40407624"},{"2010":"42156664"},{"2011":"42890545"},{"2012":"43152770"},{"2013":"50723777"},{"2014":"50743648"},{"2015":"34899211"},{"2016":"35461299"},{"2017":"37247123"}]'
              },
              {
                url:
                  'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
                valueString:
                  '[{"2007":"22.1"},{"2008":"20.2"},{"2009":"19.5"},{"2010":"19.7"},{"2011":"19.7"},{"2012":"20.7"},{"2013":"20.6"},{"2014":"19.9"},{"2015":"19.4"},{"2016":"19.1"},{"2017":"17.3"}]'
              }
            ],
            id: 'b21ce04e-7ccd-4d65-929f-453bc193a736'
          })
        ]
      )
      const result = await fetchEstimateByLocation(
        '1',
        { Authorization: 'bearer token' },
        2017
      )
      expect(result).toEqual({
        estimation: 644375,
        locationId: '0'
      })
    })
  })
})
