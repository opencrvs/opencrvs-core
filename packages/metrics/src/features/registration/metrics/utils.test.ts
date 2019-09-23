import {
  calculateInterval,
  fetchEstimateByLocation,
  getDistrictLocation
} from '@metrics/features/registration/metrics/utils'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any
const location = {
  resourceType: 'Location',
  identifier: [
    {
      system: 'http://opencrvs.org/specs/id/a2i-internal-id',
      value: '20'
    },
    {
      system: 'http://opencrvs.org/specs/id/bbs-code',
      value: '33'
    },
    {
      system: 'http://opencrvs.org/specs/id/jurisdiction-type',
      value: 'DISTRICT'
    }
  ],
  name: 'Gazipur',
  alias: ['গাজীপুর '],
  description: 'division=3&district=20',
  status: 'active',
  mode: 'instance',
  partOf: {
    reference: 'Location/512f48c5-a686-4774-90ba-93f78e5ac32b'
  },
  type: {
    coding: [
      {
        system: 'http://opencrvs.org/specs/location-type',
        code: 'ADMIN_STRUCTURE'
      }
    ]
  },
  physicalType: {
    coding: [
      {
        code: 'jdn',
        display: 'Jurisdiction'
      }
    ]
  },
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
      valueAttachment: {
        contentType: 'application/geo+json',
        data:
          'eyJ0eXBlIjoiRmVhdHVyZSIsInByb3BlcnRpZXMiOnsiTmFtZSI6IkdhemlwdXIiLCJkZXNjcmlwdGlvbiI6bnVsbCwiYWx0aXR1ZGVNb2RlIjoiY2xhbXBUb0dyb3VuZCIsIkFETTFfRU4iOiJEaGFrYSIsIkFETTJBTFQyRU4iOiIiLCJBRE0wX0VOIjoiQmFuZ2xhZGVzaCIsIkFETTJfUENPREUiOiIzMDMzIiwiQURNMl9FTiI6IkdhemlwdXIiLCJJblBvbHlfRklEIjoiMTciLCJ2YWxpZE9uIjoiMjAxOC0wNC0xMCIsIkFETTJBTFQxRU4iOiIiLCJBRE0wX1BDT0RFIjoiQkQiLCJBRE0xX1BDT0RFIjoiMzAiLCJTaW1QZ25GbGFnIjoiMCIsIk1pblNpbXBUb2wiOiIwLjAwODk5MyIsIkZJRCI6IjE3IiwiZGF0ZSI6IjIwMTUtMDEtMDEiLCJTaGFwZV9MZW5nIjoiMi40NjEyOSIsIk1heFNpbXBUb2wiOiIwLjAwODk5MyIsIkFETTJfUkVGIjoiIiwiVmFsaWRUbyI6IjxOdWxsPiIsIkZpZWxkXzEiOiJHYXppcHVyIn0sImdlb21ldHJ5Ijp7InR5cGUiOiJNdWx0aVBvbHlnb24iLCJjb29yZGluYXRlcyI6W1tbWzkwLjUyOTAxMDg0NTAwMDA3LDI0LjMwMzI5NDc4ODAwMDA3XSxbOTAuNDQzMDM5OTI2MDAwMDQsMjQuMzQxMTM4MjAzMDAwMDddLFs5MC40MDI0MjQ3ODYwMDAwNCwyNC4yODI2ODgzMjEwMDAwMl0sWzkwLjM2MjQ5ODU1NDAwMDA3LDI0LjI4MTAwNDk4MzAwMDA2XSxbOTAuMzU5Mjg0MTk4MDAwMDcsMjQuMzAwMTM3MDk4MDAwMDVdLFs5MC4zMjUzNTc1MTMwMDAwOSwyNC4yOTkxODk1NTQwMDAwN10sWzkwLjI5MDQ5Nzc2ODAwMDA4LDI0LjI3Nzc3NDkxMjAwMDA0XSxbOTAuMzAwODMyODYxMDAwMDYsMjQuMjY5MzU2MjIxMDAwMDddLFs5MC4yOTAwMTY1NjgwMDAwNiwyNC4yMjYwNzczMDIwMDAwOF0sWzkwLjI2NjE1ODQ1ODAwMDA2LDI0LjIxNTExNTkwNTAwMDA2XSxbOTAuMjI1OTU2Njk1MDAwMDQsMjQuMTYyNTA0NTU5MDAwMDddLFs5MC4yMTcxOTQ5NTcwMDAwNiwyNC4xMjg0MTEzMzQwMDAwOF0sWzkwLjIzMDQzMjczMzAwMDA0LDI0LjEwNjAzNDQ4MDAwMDA2XSxbOTAuMjAwOTI1NjM4MDAwMDYsMjQuMDkzNzc5OTAwMDAwMDddLFs5MC4xNzMzNTg4MjMwMDAwNiwyNC4xMDgwMjAxODcwMDAwMl0sWzkwLjE3Njk5ODI4NTAwMDA4LDI0LjA3NDc5ODg3ODAwMDAyXSxbOTAuMTU3NzYxMzY1MDAwMDYsMjQuMDY0MjczMDcyMDAwMDVdLFs5MC4xNDc1NTI2MTgwMDAwOCwyNC4wMzM1NDMwMDUwMDAwN10sWzkwLjE3NjM3ODU3NjAwMDA1LDI0LjAwMDMzMDA2NDAwMDAyXSxbOTAuMTkxNzgxNDMyMDAwMDgsMjQuMDE0MDQwMTM0MDAwMDNdLFs5MC4yMzk3MTM4NzIwMDAwNCwyNC4wMDkyMTA5NTEwMDAwNl0sWzkwLjI0NjAyOTgwNTAwMDAzLDI0LjAzMzMxOTk1NzAwMDA2XSxbOTAuMjYwMDI2MTgwMDAwMDcsMjQuMDE0ODI3NTM3MDAwMDNdLFs5MC4yNTAwNjc3MjcwMDAwNCwyMy45OTIxNjQwMDMwMDAwM10sWzkwLjI2MDEzMjU2MTAwMDAzLDIzLjk3MTEzMTMwOTAwMDA0XSxbOTAuMjk3ODEyMDM0MDAwMDYsMjMuOTYxODc0MTI4MDAwMDNdLFs5MC4zMDAxNzM5NTYwMDAwNCwyMy45NDg4MzU4NzQwMDAwNV0sWzkwLjM0MDg0MjE2MDAwMDA4LDIzLjk1NTU2OTgzNzAwMDA0XSxbOTAuMzUwMTg3NDEyMDAwMDgsMjMuODgyMzM0ODg4MDAwMDZdLFs5MC4zNzcxNTMwMzkwMDAwNiwyMy44OTgwNDAwOTEwMDAwNF0sWzkwLjM5NTcxNTMzMDAwMDA5LDIzLjg4MDE1NzAxMDAwMDA2XSxbOTAuNDM4MjAwNjI4MDAwMDYsMjMuOTAxMDYzNDE4MDAwMDRdLFs5MC40NTc4MDA2MjAwMDAwNiwyMy44OTY0NDcxMDAwMDAwNV0sWzkwLjQ3MTI2OTQyMzAwMDA4LDIzLjg0NzMwODI5NjAwMDA1XSxbOTAuNTAyMjcyMTc3MDAwMDcsMjMuODU3OTAwODIzMDAwMDJdLFs5MC41MjU2NzY0NTYwMDAwNCwyMy44OTY1MTQwNTkwMDAwM10sWzkwLjU0OTM3NDEzODAwMDA4LDIzLjg4NTI3MzY1MzAwMDA3XSxbOTAuNTcwNjY3ODcwMDAwMDgsMjMuODk0OTg5MzEzMDAwMDVdLFs5MC41NjAzOTEyMjkwMDAwNiwyMy45MTEwOTUzNDYwMDAwMl0sWzkwLjYwODE1MzM4MDAwMDAzLDIzLjkyMTUxNzAwMTAwMDA0XSxbOTAuNjE4MDk0MjEwMDAwMDQsMjMuOTY4NDE4MTU3MDAwMDNdLFs5MC42NTc5NzIyODEwMDAwNywyNC4wMTM0NzMyMDkwMDAwNF0sWzkwLjYzNTMzNDA1MjAwMDA4LDI0LjA3MDc3ODcxNTAwMDA3XSxbOTAuNjM5Njk0ODYxMDAwMDcsMjQuMTA2MDg3MDQ4MDAwMDZdLFs5MC42NTY2MjkxMTMwMDAwNiwyNC4wOTIzMDM3NTUwMDAwNV0sWzkwLjcwMjk2MSwyNC4xMDY1NjA0NjgwMDAwNV0sWzkwLjY3NjMwMjUwNjAwMDA3LDI0LjExNTUyOTY4MzAwMDAzXSxbOTAuNjk1MzAwMDExMDAwMDksMjQuMTM5OTU4MzExMDAwMDRdLFs5MC42NzE2ODk0MTMwMDAwOCwyNC4yMDQ4NDMwNjQwMDAwNF0sWzkwLjY4Mjk1MDMwMDAwMDA3LDI0LjI0NDM0ODMyMDAwMDAzXSxbOTAuNjQ5MjkzNDMzMDAwMDgsMjQuMjU3OTg3ODQ5MDAwMDddLFs5MC42MjE4Mjc0MTQwMDAwNSwyNC4yNjg1NTg0OTIwMDAwN10sWzkwLjU3MjkwODM3NzAwMDAzLDI0LjI0NjQ1MTI2MzAwMDA0XSxbOTAuNTIxMDYyNzI0MDAwMDUsMjQuMjg3NzAyOTU1MDAwMDRdLFs5MC41MjkwMTA4NDUwMDAwNywyNC4zMDMyOTQ3ODgwMDAwN11dXV19fQ=='
      }
    },
    {
      url: 'http://opencrvs.org/specs/id/statistics-male-populations',
      valueString:
        '[{"2007":"1292568"},{"2008":"1250993"},{"2009":"1246376"},{"2010":"1279752"},{"2011":"1293470"},{"2012":"1291684"},{"2013":"1756173"},{"2014":"1788473"},{"2015":"1167891"},{"2016":"1225971"},{"2017":"1159078"}]'
    },
    {
      url: 'http://opencrvs.org/specs/id/statistics-female-populations',
      valueString:
        '[{"2007":"1261767"},{"2008":"1221096"},{"2009":"1214677"},{"2010":"1240638"},{"2011":"1257481"},{"2012":"1241730"},{"2013":"1724403"},{"2014":"1758485"},{"2015":"1151860"},{"2016":"1228886"},{"2017":"1168980"}]'
    },
    {
      url: 'http://opencrvs.org/specs/id/statistics-total-populations',
      valueString:
        '[{"2007":"2554927"},{"2008":"2472586"},{"2009":"2461610"},{"2010":"2520874"},{"2011":"2551523"},{"2012":"2533688"},{"2013":"3480570"},{"2014":"3546954"},{"2015":"2319748"},{"2016":"2454857"},{"2017":"2328051"}]'
    },
    {
      url: 'http://opencrvs.org/specs/id/statistics-male-female-ratios',
      valueString:
        '[{"2007":"102.4"},{"2008":"102.4"},{"2009":"102.6"},{"2010":"103.2"},{"2011":"102.9"},{"2012":"104"},{"2013":"101.8"},{"2014":"101.7"},{"2015":"101.4"},{"2016":"99.8"},{"2017":"99.2"}]'
    },
    {
      url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
      valueString:
        '[{"2007":"19.6"},{"2008":"19.4"},{"2009":"19"},{"2010":"18.5"},{"2011":"15.8"},{"2012":"20"},{"2013":"20.1"},{"2014":"18.7"},{"2015":"23.2"},{"2016":"19.1"},{"2017":"22.3"}]'
    }
  ],
  id: '0eaa73dd-2a21-4998-b1e6-b08430595201',
  meta: {
    lastUpdated: '2019-09-05T14:14:04.382+00:00',
    versionId: '6feda4ca-6168-4f6e-b47e-2a2b81916668'
  }
}

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
      const result = await fetchEstimateByLocation(location, 2017)
      expect(result).toEqual({
        estimation: 51916,
        locationId: '0eaa73dd-2a21-4998-b1e6-b08430595201'
      })
    })
    it('Throws error if location doesnot have extension', async () => {
      expect(fetchEstimateByLocation({ id: '' }, 2017)).rejects.toThrowError(
        'Invalid location data found'
      )
    })
    it('Throws error if location is not partOf address', async () => {
      expect(fetchEstimateByLocation(location, 2017)).rejects.toThrowError(
        'Unable to fetch estimate data from location tree'
      )
    })
    it('Returns the estimatedFigures for right location', async () => {
      const result = await fetchEstimateByLocation(location, 2017)
      expect(result).toEqual({
        estimation: 51916,
        locationId: '0eaa73dd-2a21-4998-b1e6-b08430595201'
      })
    })

    it('Returns the district location', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            resourceType: 'Location',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/internal-id',
                value: 'FACILITY000002'
              }
            ],
            name: 'Moktarpur Union Parishad',
            alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
            status: 'active',
            mode: 'instance',
            partOf: {
              reference: 'Location/9e7ce1b1-a28e-46fd-9aad-8a9cd215b15c'
            },
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/location-type',
                  code: 'CRVS_OFFICE'
                }
              ]
            },
            physicalType: {
              coding: [
                {
                  code: 'bu',
                  display: 'Building'
                }
              ]
            },
            telecom: [
              {
                system: 'phone',
                value: ''
              },
              {
                system: 'email',
                value: ''
              }
            ],
            address: {
              line: ['Moktarpur', 'Kaliganj'],
              district: 'Gazipur',
              state: 'Dhaka'
            },
            meta: {
              lastUpdated: '2019-09-05T14:13:52.662+00:00',
              versionId: '7907e8b8-83dd-4837-a088-1c77a320ecca'
            },
            id: 'b2b3ca8b-a14f-41c6-b97f-7cb99a1299e5'
          })
        ],
        [
          JSON.stringify({
            resourceType: 'Location',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/a2i-internal-id',
                value: '3476'
              },
              {
                system: 'http://opencrvs.org/specs/id/bbs-code',
                value: '94'
              },
              {
                system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                value: 'UNION'
              }
            ],
            name: 'Moktarpur',
            alias: ['মোক্তারপুর'],
            description: 'division=3&district=20&upazila=165&union=3476',
            status: 'active',
            mode: 'instance',
            partOf: {
              reference: 'Location/6e3b90fe-8d70-483e-994c-4659d449a4db'
            },
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/location-type',
                  code: 'ADMIN_STRUCTURE'
                }
              ]
            },
            physicalType: {
              coding: [
                {
                  code: 'jdn',
                  display: 'Jurisdiction'
                }
              ]
            },
            extension: [
              {
                url:
                  'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
                valueAttachment: {
                  contentType: 'application/geo+json',
                  data: '<base64>'
                }
              }
            ],
            meta: {
              lastUpdated: '2019-09-05T14:08:29.217+00:00',
              versionId: '7750cfc1-f3bd-4991-8c1d-eed6b3ee94ac'
            },
            id: '9e7ce1b1-a28e-46fd-9aad-8a9cd215b15c'
          })
        ],
        [
          JSON.stringify({
            resourceType: 'Location',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/a2i-internal-id',
                value: '165'
              },
              {
                system: 'http://opencrvs.org/specs/id/bbs-code',
                value: '34'
              },
              {
                system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                value: 'UPAZILA'
              }
            ],
            name: 'Kaliganj',
            alias: ['কালীগঞ্জ'],
            description: 'division=3&district=20&upazila=165',
            status: 'active',
            mode: 'instance',
            partOf: {
              reference: 'Location/0eaa73dd-2a21-4998-b1e6-b08430595201'
            },
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/location-type',
                  code: 'ADMIN_STRUCTURE'
                }
              ]
            },
            physicalType: {
              coding: [
                {
                  code: 'jdn',
                  display: 'Jurisdiction'
                }
              ]
            },
            extension: [
              {
                url:
                  'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
                valueAttachment: {
                  contentType: 'application/geo+json',
                  data:
                    'eyJ0eXBlIjoiRmVhdHVyZSIsInByb3BlcnRpZXMiOnsiTmFtZSI6IkthbGlnYW5qIiwiZGVzY3JpcHRpb24iOm51bGwsImFsdGl0dWRlTW9kZSI6ImNsYW1wVG9Hcm91bmQiLCJBRE0xX0VOIjoiRGhha2EiLCJBRE0zX0VOIjoiS2FsaWdhbmoiLCJBRE0zQUxUMUVOIjoiIiwiZGF0ZSI6IjIwMTUtMDEtMDEiLCJBRE0zX1JFRiI6IiIsIkFETTJfUENPREUiOiIzMDMzIiwiQURNMl9FTiI6IkdhemlwdXIiLCJJblBvbHlfRklEIjoiMjQ2IiwidmFsaWRPbiI6IjIwMTgtMDQtMTAiLCJBRE0wX1BDT0RFIjoiQkQiLCJBRE0xX1BDT0RFIjoiMzAiLCJ2YWxpZFRvIjoiPE51bGw+IiwiU2ltUGduRmxhZyI6IjAiLCJNaW5TaW1wVG9sIjoiMC4wMDg5OTMiLCJGSUQiOiIyNDYiLCJBRE0wX0VOIjoiQmFuZ2xhZGVzaCIsIlNoYXBlX0xlbmciOiIwLjk3MDg5NCIsIkFETTNfUENPREUiOiIzMDMzMzQiLCJNYXhTaW1wVG9sIjoiMC4wMDg5OTMiLCJBRE0zQUxUMkVOIjoiIiwiRmllbGRfMSI6IkthbGlnYW5qIn0sImdlb21ldHJ5Ijp7InR5cGUiOiJNdWx0aVBvbHlnb24iLCJjb29yZGluYXRlcyI6W1tbWzkwLjU2NzQ5ODgxODAwMDA1LDI0LjAyNzY3MDI5NDAwMDA3XSxbOTAuNTUxNTQ0NjQzMDAwMDYsMjQuMDQ3MzE3MzU1MDAwMDhdLFs5MC40OTgxNzI5MzMwMDAwMywyNC4wMzc3Nzc4NDQwMDAwNl0sWzkwLjQ5MjM2NTk3ODAwMDA3LDI0LjAyNzY5NTM0ODAwMDA3XSxbOTAuNDk0MDk0ODMzMDAwMDgsMjMuOTg3MzAyMDYxMDAwMDRdLFs5MC41MTQ4OTM5NDcwMDAwOCwyMy45NjY4ODcwNjAwMDAwM10sWzkwLjQ5MDM5MTg2MjAwMDA4LDIzLjk2MTM1OTQ0MTAwMDA3XSxbOTAuNTE0MTMzODA4MDAwMDUsMjMuOTU4OTI5NDUyMDAwMDZdLFs5MC41MTMzNjQ2NDYwMDAwNywyMy45MzUzMTQwMDUwMDAwN10sWzkwLjQ5MDAyOTEyMzAwMDA2LDIzLjkzNjM5OTU1MTAwMDAyXSxbOTAuNDkyMjcxNTg5MDAwMDQsMjMuOTE1NTMwNzY4MDAwMDVdLFs5MC40NjE1NjY5MTYwMDAwNCwyMy44ODMzNzA4OTYwMDAwM10sWzkwLjQ2NDA3MDA3NDAwMDA2LDIzLjg0NjMwMTc3MzAwMDA1XSxbOTAuNDcxMjY5NDIzMDAwMDgsMjMuODQ3MzA4Mjk2MDAwMDVdLFs5MC41MDIyNzIxNzcwMDAwNywyMy44NTc5MDA4MjMwMDAwMl0sWzkwLjUyNTY3NjQ1NjAwMDA0LDIzLjg5NjUxNDA1OTAwMDAzXSxbOTAuNTQ5Mzc0MTM4MDAwMDgsMjMuODg1MjczNjUzMDAwMDddLFs5MC41NzA2Njc4NzAwMDAwOCwyMy44OTQ5ODkzMTMwMDAwNV0sWzkwLjU2MDM5MTIyOTAwMDA2LDIzLjkxMTA5NTM0NjAwMDAyXSxbOTAuNjE0MTAxOTAzMDAwMDYsMjMuOTI4MDk0MTIxMDAwMDddLFs5MC42MTgwOTQyMTAwMDAwNCwyMy45Njg0MTgxNTcwMDAwM10sWzkwLjY1Nzk3MjI4MTAwMDA3LDI0LjAxMzQ3MzIwOTAwMDA0XSxbOTAuNjUwMzEwNjYxMDAwMDUsMjQuMDM2ODY3MDIzMDAwMDddLFs5MC42MTIzNTk2OTMwMDAwMywyNC4wNDUxNzAyOTgwMDAwN10sWzkwLjU2NzQ5ODgxODAwMDA1LDI0LjAyNzY3MDI5NDAwMDA3XV1dXX19'
                }
              }
            ],
            id: '6e3b90fe-8d70-483e-994c-4659d449a4db',
            meta: {
              lastUpdated: '2019-09-05T14:13:49.018+00:00',
              versionId: '632052a4-8604-4e2d-a2fd-d142d490c2df'
            }
          })
        ],
        [
          JSON.stringify({
            resourceType: 'Location',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/a2i-internal-id',
                value: '20'
              },
              {
                system: 'http://opencrvs.org/specs/id/bbs-code',
                value: '33'
              },
              {
                system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                value: 'DISTRICT'
              }
            ],
            name: 'Gazipur',
            alias: ['গাজীপুর '],
            description: 'division=3&district=20',
            status: 'active',
            mode: 'instance',
            partOf: {
              reference: 'Location/512f48c5-a686-4774-90ba-93f78e5ac32b'
            },
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/location-type',
                  code: 'ADMIN_STRUCTURE'
                }
              ]
            },
            physicalType: {
              coding: [
                {
                  code: 'jdn',
                  display: 'Jurisdiction'
                }
              ]
            },
            extension: [
              {
                url:
                  'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
                valueAttachment: {
                  contentType: 'application/geo+json',
                  data:
                    'eyJ0eXBlIjoiRmVhdHVyZSIsInByb3BlcnRpZXMiOnsiTmFtZSI6IkdhemlwdXIiLCJkZXNjcmlwdGlvbiI6bnVsbCwiYWx0aXR1ZGVNb2RlIjoiY2xhbXBUb0dyb3VuZCIsIkFETTFfRU4iOiJEaGFrYSIsIkFETTJBTFQyRU4iOiIiLCJBRE0wX0VOIjoiQmFuZ2xhZGVzaCIsIkFETTJfUENPREUiOiIzMDMzIiwiQURNMl9FTiI6IkdhemlwdXIiLCJJblBvbHlfRklEIjoiMTciLCJ2YWxpZE9uIjoiMjAxOC0wNC0xMCIsIkFETTJBTFQxRU4iOiIiLCJBRE0wX1BDT0RFIjoiQkQiLCJBRE0xX1BDT0RFIjoiMzAiLCJTaW1QZ25GbGFnIjoiMCIsIk1pblNpbXBUb2wiOiIwLjAwODk5MyIsIkZJRCI6IjE3IiwiZGF0ZSI6IjIwMTUtMDEtMDEiLCJTaGFwZV9MZW5nIjoiMi40NjEyOSIsIk1heFNpbXBUb2wiOiIwLjAwODk5MyIsIkFETTJfUkVGIjoiIiwiVmFsaWRUbyI6IjxOdWxsPiIsIkZpZWxkXzEiOiJHYXppcHVyIn0sImdlb21ldHJ5Ijp7InR5cGUiOiJNdWx0aVBvbHlnb24iLCJjb29yZGluYXRlcyI6W1tbWzkwLjUyOTAxMDg0NTAwMDA3LDI0LjMwMzI5NDc4ODAwMDA3XSxbOTAuNDQzMDM5OTI2MDAwMDQsMjQuMzQxMTM4MjAzMDAwMDddLFs5MC40MDI0MjQ3ODYwMDAwNCwyNC4yODI2ODgzMjEwMDAwMl0sWzkwLjM2MjQ5ODU1NDAwMDA3LDI0LjI4MTAwNDk4MzAwMDA2XSxbOTAuMzU5Mjg0MTk4MDAwMDcsMjQuMzAwMTM3MDk4MDAwMDVdLFs5MC4zMjUzNTc1MTMwMDAwOSwyNC4yOTkxODk1NTQwMDAwN10sWzkwLjI5MDQ5Nzc2ODAwMDA4LDI0LjI3Nzc3NDkxMjAwMDA0XSxbOTAuMzAwODMyODYxMDAwMDYsMjQuMjY5MzU2MjIxMDAwMDddLFs5MC4yOTAwMTY1NjgwMDAwNiwyNC4yMjYwNzczMDIwMDAwOF0sWzkwLjI2NjE1ODQ1ODAwMDA2LDI0LjIxNTExNTkwNTAwMDA2XSxbOTAuMjI1OTU2Njk1MDAwMDQsMjQuMTYyNTA0NTU5MDAwMDddLFs5MC4yMTcxOTQ5NTcwMDAwNiwyNC4xMjg0MTEzMzQwMDAwOF0sWzkwLjIzMDQzMjczMzAwMDA0LDI0LjEwNjAzNDQ4MDAwMDA2XSxbOTAuMjAwOTI1NjM4MDAwMDYsMjQuMDkzNzc5OTAwMDAwMDddLFs5MC4xNzMzNTg4MjMwMDAwNiwyNC4xMDgwMjAxODcwMDAwMl0sWzkwLjE3Njk5ODI4NTAwMDA4LDI0LjA3NDc5ODg3ODAwMDAyXSxbOTAuMTU3NzYxMzY1MDAwMDYsMjQuMDY0MjczMDcyMDAwMDVdLFs5MC4xNDc1NTI2MTgwMDAwOCwyNC4wMzM1NDMwMDUwMDAwN10sWzkwLjE3NjM3ODU3NjAwMDA1LDI0LjAwMDMzMDA2NDAwMDAyXSxbOTAuMTkxNzgxNDMyMDAwMDgsMjQuMDE0MDQwMTM0MDAwMDNdLFs5MC4yMzk3MTM4NzIwMDAwNCwyNC4wMDkyMTA5NTEwMDAwNl0sWzkwLjI0NjAyOTgwNTAwMDAzLDI0LjAzMzMxOTk1NzAwMDA2XSxbOTAuMjYwMDI2MTgwMDAwMDcsMjQuMDE0ODI3NTM3MDAwMDNdLFs5MC4yNTAwNjc3MjcwMDAwNCwyMy45OTIxNjQwMDMwMDAwM10sWzkwLjI2MDEzMjU2MTAwMDAzLDIzLjk3MTEzMTMwOTAwMDA0XSxbOTAuMjk3ODEyMDM0MDAwMDYsMjMuOTYxODc0MTI4MDAwMDNdLFs5MC4zMDAxNzM5NTYwMDAwNCwyMy45NDg4MzU4NzQwMDAwNV0sWzkwLjM0MDg0MjE2MDAwMDA4LDIzLjk1NTU2OTgzNzAwMDA0XSxbOTAuMzUwMTg3NDEyMDAwMDgsMjMuODgyMzM0ODg4MDAwMDZdLFs5MC4zNzcxNTMwMzkwMDAwNiwyMy44OTgwNDAwOTEwMDAwNF0sWzkwLjM5NTcxNTMzMDAwMDA5LDIzLjg4MDE1NzAxMDAwMDA2XSxbOTAuNDM4MjAwNjI4MDAwMDYsMjMuOTAxMDYzNDE4MDAwMDRdLFs5MC40NTc4MDA2MjAwMDAwNiwyMy44OTY0NDcxMDAwMDAwNV0sWzkwLjQ3MTI2OTQyMzAwMDA4LDIzLjg0NzMwODI5NjAwMDA1XSxbOTAuNTAyMjcyMTc3MDAwMDcsMjMuODU3OTAwODIzMDAwMDJdLFs5MC41MjU2NzY0NTYwMDAwNCwyMy44OTY1MTQwNTkwMDAwM10sWzkwLjU0OTM3NDEzODAwMDA4LDIzLjg4NTI3MzY1MzAwMDA3XSxbOTAuNTcwNjY3ODcwMDAwMDgsMjMuODk0OTg5MzEzMDAwMDVdLFs5MC41NjAzOTEyMjkwMDAwNiwyMy45MTEwOTUzNDYwMDAwMl0sWzkwLjYwODE1MzM4MDAwMDAzLDIzLjkyMTUxNzAwMTAwMDA0XSxbOTAuNjE4MDk0MjEwMDAwMDQsMjMuOTY4NDE4MTU3MDAwMDNdLFs5MC42NTc5NzIyODEwMDAwNywyNC4wMTM0NzMyMDkwMDAwNF0sWzkwLjYzNTMzNDA1MjAwMDA4LDI0LjA3MDc3ODcxNTAwMDA3XSxbOTAuNjM5Njk0ODYxMDAwMDcsMjQuMTA2MDg3MDQ4MDAwMDZdLFs5MC42NTY2MjkxMTMwMDAwNiwyNC4wOTIzMDM3NTUwMDAwNV0sWzkwLjcwMjk2MSwyNC4xMDY1NjA0NjgwMDAwNV0sWzkwLjY3NjMwMjUwNjAwMDA3LDI0LjExNTUyOTY4MzAwMDAzXSxbOTAuNjk1MzAwMDExMDAwMDksMjQuMTM5OTU4MzExMDAwMDRdLFs5MC42NzE2ODk0MTMwMDAwOCwyNC4yMDQ4NDMwNjQwMDAwNF0sWzkwLjY4Mjk1MDMwMDAwMDA3LDI0LjI0NDM0ODMyMDAwMDAzXSxbOTAuNjQ5MjkzNDMzMDAwMDgsMjQuMjU3OTg3ODQ5MDAwMDddLFs5MC42MjE4Mjc0MTQwMDAwNSwyNC4yNjg1NTg0OTIwMDAwN10sWzkwLjU3MjkwODM3NzAwMDAzLDI0LjI0NjQ1MTI2MzAwMDA0XSxbOTAuNTIxMDYyNzI0MDAwMDUsMjQuMjg3NzAyOTU1MDAwMDRdLFs5MC41MjkwMTA4NDUwMDAwNywyNC4zMDMyOTQ3ODgwMDAwN11dXV19fQ=='
                }
              },
              {
                url: 'http://opencrvs.org/specs/id/statistics-male-populations',
                valueString:
                  '[{"2007":"1292568"},{"2008":"1250993"},{"2009":"1246376"},{"2010":"1279752"},{"2011":"1293470"},{"2012":"1291684"},{"2013":"1756173"},{"2014":"1788473"},{"2015":"1167891"},{"2016":"1225971"},{"2017":"1159078"}]'
              },
              {
                url:
                  'http://opencrvs.org/specs/id/statistics-female-populations',
                valueString:
                  '[{"2007":"1261767"},{"2008":"1221096"},{"2009":"1214677"},{"2010":"1240638"},{"2011":"1257481"},{"2012":"1241730"},{"2013":"1724403"},{"2014":"1758485"},{"2015":"1151860"},{"2016":"1228886"},{"2017":"1168980"}]'
              },
              {
                url:
                  'http://opencrvs.org/specs/id/statistics-total-populations',
                valueString:
                  '[{"2007":"2554927"},{"2008":"2472586"},{"2009":"2461610"},{"2010":"2520874"},{"2011":"2551523"},{"2012":"2533688"},{"2013":"3480570"},{"2014":"3546954"},{"2015":"2319748"},{"2016":"2454857"},{"2017":"2328051"}]'
              },
              {
                url:
                  'http://opencrvs.org/specs/id/statistics-male-female-ratios',
                valueString:
                  '[{"2007":"102.4"},{"2008":"102.4"},{"2009":"102.6"},{"2010":"103.2"},{"2011":"102.9"},{"2012":"104"},{"2013":"101.8"},{"2014":"101.7"},{"2015":"101.4"},{"2016":"99.8"},{"2017":"99.2"}]'
              },
              {
                url:
                  'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
                valueString:
                  '[{"2007":"19.6"},{"2008":"19.4"},{"2009":"19"},{"2010":"18.5"},{"2011":"15.8"},{"2012":"20"},{"2013":"20.1"},{"2014":"18.7"},{"2015":"23.2"},{"2016":"19.1"},{"2017":"22.3"}]'
              }
            ],
            id: '0eaa73dd-2a21-4998-b1e6-b08430595201',
            meta: {
              lastUpdated: '2019-09-05T14:14:04.382+00:00',
              versionId: '6feda4ca-6168-4f6e-b47e-2a2b81916668'
            }
          })
        ]
      )
      const result = await getDistrictLocation(
        'b2b3ca8b-a14f-41c6-b97f-7cb99a1299e5',
        { Authorization: 'bearer token' }
      )
      expect(result.id).toEqual('0eaa73dd-2a21-4998-b1e6-b08430595201')
    })
    it('Throws error for invalid location', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            resourceType: 'Location',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/internal-id',
                value: 'FACILITY000002'
              }
            ],
            name: 'Moktarpur Union Parishad',
            alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
            status: 'active',
            mode: 'instance',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/location-type',
                  code: 'CRVS_OFFICE'
                }
              ]
            },
            physicalType: {
              coding: [
                {
                  code: 'bu',
                  display: 'Building'
                }
              ]
            },
            telecom: [
              {
                system: 'phone',
                value: ''
              },
              {
                system: 'email',
                value: ''
              }
            ],
            address: {
              line: ['Moktarpur', 'Kaliganj'],
              district: 'Gazipur',
              state: 'Dhaka'
            },
            meta: {
              lastUpdated: '2019-09-05T14:13:52.662+00:00',
              versionId: '7907e8b8-83dd-4837-a088-1c77a320ecca'
            },
            id: 'b2b3ca8b-a14f-41c6-b97f-7cb99a1299e5'
          })
        ],
        [JSON.stringify(null)]
      )
      expect(
        getDistrictLocation('b2b3ca8b-a14f-41c6-b97f-7cb99a1299e5', {
          Authorization: 'bearer token'
        })
      ).rejects.toThrowError('No district location found')
    })
  })
})
