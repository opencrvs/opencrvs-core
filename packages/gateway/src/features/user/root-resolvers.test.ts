import { resolvers } from '@gateway/features/user/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

beforeEach(() => {
  fetch.resetMocks()
})

describe('User root resolvers', () => {
  describe('getUser()', () => {
    it('returns a user object', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            mobile: '+880711111111'
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            id: 'eacae600-a501-42d6-9d59-b8b94f3e50c1',
            meta: { lastUpdated: '2018-11-27T17:13:20.662+00:00' },
            type: 'searchset',
            total: 1,
            link: [
              {
                relation: 'self',
                url:
                  'http://localhost:3447/fhir/Practitioner?telecom=phone%7C01711111111'
              }
            ],
            entry: [
              {
                fullUrl:
                  'http://localhost:3447/fhir/Practitioner/b1f46aba-075d-431e-8aeb-ebc57a4a0ad0',
                resource: {
                  resourceType: 'Practitioner',
                  identifier: [
                    { use: 'official', system: 'mobile', value: '01711111111' }
                  ],
                  telecom: [{ system: 'phone', value: '01711111111' }],
                  name: [
                    { use: 'en', family: ['Al Hasan'], given: ['Shakib'] },
                    { use: 'bn', family: [''], given: [''] }
                  ],
                  gender: 'male',
                  meta: {
                    lastUpdated: '2018-11-25T17:31:08.062+00:00',
                    versionId: '7b21f3ac-2d92-46fc-9b87-c692aa81c858'
                  },
                  id: 'e0daf66b-509e-4f45-86f3-f922b74f3dbf'
                }
              }
            ]
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            entry: [
              {
                fullUrl:
                  'http://localhost:3447/fhir/PractitionerRole/9c8b8ac2-9044-4b66-8d31-07c5a4b4348d',
                resource: {
                  resourceType: 'PractitionerRole',
                  practitioner: {
                    reference:
                      'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
                  },
                  code: [
                    {
                      coding: [
                        {
                          system: 'http://opencrvs.org/specs/roles',
                          code: 'FIELD_AGENT'
                        }
                      ]
                    }
                  ],
                  location: [
                    {
                      reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacd9173'
                    }
                  ],
                  meta: {
                    lastUpdated: '2018-11-25T17:31:08.096+00:00',
                    versionId: '2f79ee2d-3b78-4c90-91d8-278e4a28caf7'
                  },
                  id: '9c8b8ac2-9044-4b66-8d31-07c5a4b4348d'
                }
              }
            ]
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Location',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/a2i-internal-id',
                value: '165'
              },
              { system: 'http://opencrvs.org/specs/id/bbs-code', value: '34' },
              {
                system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                value: 'UPAZILA'
              }
            ],
            name: 'KALIGANJ',
            alias: ['কালীগঞ্জ'],
            description: 'division=3&district=20&upazila=165',
            status: 'active',
            mode: 'instance',
            partOf: {
              reference: 'Location/1f97b133-3480-46bb-9812-14d97df63729'
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
              coding: [{ code: 'jdn', display: 'Jurisdiction' }]
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
            id: 'd33e4cb2-670e-4564-a8ed-c72baacd9173',
            meta: {
              lastUpdated: '2018-11-25T17:30:53.816+00:00',
              versionId: '277c56f5-b055-4739-8cc7-069bdcd08c9a'
            }
          }),
          { status: 200 }
        ]
      )
      // @ts-ignore
      const composition = await resolvers.Query.getUser(
        {},
        { userId: '9c8b8ac2-9044-4b66-8d31-07c5a4b4348d' }
      )

      expect(composition).toBeDefined()
    })
    it('Throws an error if PractitionerRole has no role code', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            mobile: '+880711111111'
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            id: 'eacae600-a501-42d6-9d59-b8b94f3e50c1',
            meta: { lastUpdated: '2018-11-27T17:13:20.662+00:00' },
            type: 'searchset',
            total: 1,
            link: [
              {
                relation: 'self',
                url:
                  'http://localhost:3447/fhir/Practitioner?telecom=phone%7C01711111111'
              }
            ],
            entry: [
              {
                fullUrl:
                  'http://localhost:3447/fhir/Practitioner/b1f46aba-075d-431e-8aeb-ebc57a4a0ad0',
                resource: {
                  resourceType: 'Practitioner',
                  identifier: [
                    { use: 'official', system: 'mobile', value: '01711111111' }
                  ],
                  telecom: [{ system: 'phone', value: '01711111111' }],
                  name: [
                    { use: 'en', family: ['Al Hasan'], given: ['Shakib'] },
                    { use: 'bn', family: [''], given: [''] }
                  ],
                  gender: 'male',
                  meta: {
                    lastUpdated: '2018-11-25T17:31:08.062+00:00',
                    versionId: '7b21f3ac-2d92-46fc-9b87-c692aa81c858'
                  },
                  id: 'e0daf66b-509e-4f45-86f3-f922b74f3dbf'
                }
              }
            ]
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            entry: [
              {
                fullUrl:
                  'http://localhost:3447/fhir/PractitionerRole/9c8b8ac2-9044-4b66-8d31-07c5a4b4348d',
                resource: {
                  resourceType: 'PractitionerRole',
                  practitioner: {
                    reference:
                      'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
                  },
                  location: [
                    {
                      reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacd9173'
                    }
                  ],
                  meta: {
                    lastUpdated: '2018-11-25T17:31:08.096+00:00',
                    versionId: '2f79ee2d-3b78-4c90-91d8-278e4a28caf7'
                  },
                  id: '9c8b8ac2-9044-4b66-8d31-07c5a4b4348d'
                }
              }
            ]
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Location',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/a2i-internal-id',
                value: '165'
              },
              { system: 'http://opencrvs.org/specs/id/bbs-code', value: '34' },
              {
                system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                value: 'UPAZILA'
              }
            ],
            name: 'KALIGANJ',
            alias: ['কালীগঞ্জ'],
            description: 'division=3&district=20&upazila=165',
            status: 'active',
            mode: 'instance',
            partOf: {
              reference: 'Location/1f97b133-3480-46bb-9812-14d97df63729'
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
              coding: [{ code: 'jdn', display: 'Jurisdiction' }]
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
            id: 'd33e4cb2-670e-4564-a8ed-c72baacd9173',
            meta: {
              lastUpdated: '2018-11-25T17:30:53.816+00:00',
              versionId: '277c56f5-b055-4739-8cc7-069bdcd08c9a'
            }
          }),
          { status: 200 }
        ]
      )
      await expect(
        // @ts-ignore
        resolvers.Query.getUser(
          {},
          { userId: '9c8b8ac2-9044-4b66-8d31-07c5a4b4348d' }
        )
      ).rejects.toThrowError('PractitionerRole has no role code')
    })
    it('Throws an error if PractitionerRole has no location', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            mobile: '+880711111111'
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            id: 'eacae600-a501-42d6-9d59-b8b94f3e50c1',
            meta: { lastUpdated: '2018-11-27T17:13:20.662+00:00' },
            type: 'searchset',
            total: 1,
            link: [
              {
                relation: 'self',
                url:
                  'http://localhost:3447/fhir/Practitioner?telecom=phone%7C01711111111'
              }
            ],
            entry: [
              {
                fullUrl:
                  'http://localhost:3447/fhir/Practitioner/b1f46aba-075d-431e-8aeb-ebc57a4a0ad0',
                resource: {
                  resourceType: 'Practitioner',
                  identifier: [
                    { use: 'official', system: 'mobile', value: '01711111111' }
                  ],
                  telecom: [{ system: 'phone', value: '01711111111' }],
                  name: [
                    { use: 'en', family: ['Al Hasan'], given: ['Shakib'] },
                    { use: 'bn', family: [''], given: [''] }
                  ],
                  gender: 'male',
                  meta: {
                    lastUpdated: '2018-11-25T17:31:08.062+00:00',
                    versionId: '7b21f3ac-2d92-46fc-9b87-c692aa81c858'
                  },
                  id: 'e0daf66b-509e-4f45-86f3-f922b74f3dbf'
                }
              }
            ]
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            entry: [
              {
                fullUrl:
                  'http://localhost:3447/fhir/PractitionerRole/9c8b8ac2-9044-4b66-8d31-07c5a4b4348d',
                resource: {
                  resourceType: 'PractitionerRole',
                  practitioner: {
                    reference:
                      'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
                  },
                  code: [
                    {
                      coding: [
                        {
                          system: 'http://opencrvs.org/specs/roles',
                          code: 'FIELD_AGENT'
                        }
                      ]
                    }
                  ],
                  meta: {
                    lastUpdated: '2018-11-25T17:31:08.096+00:00',
                    versionId: '2f79ee2d-3b78-4c90-91d8-278e4a28caf7'
                  },
                  id: '9c8b8ac2-9044-4b66-8d31-07c5a4b4348d'
                }
              }
            ]
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Location',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/a2i-internal-id',
                value: '165'
              },
              { system: 'http://opencrvs.org/specs/id/bbs-code', value: '34' },
              {
                system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                value: 'UPAZILA'
              }
            ],
            name: 'KALIGANJ',
            alias: ['কালীগঞ্জ'],
            description: 'division=3&district=20&upazila=165',
            status: 'active',
            mode: 'instance',
            partOf: {
              reference: 'Location/1f97b133-3480-46bb-9812-14d97df63729'
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
              coding: [{ code: 'jdn', display: 'Jurisdiction' }]
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
            id: 'd33e4cb2-670e-4564-a8ed-c72baacd9173',
            meta: {
              lastUpdated: '2018-11-25T17:30:53.816+00:00',
              versionId: '277c56f5-b055-4739-8cc7-069bdcd08c9a'
            }
          }),
          { status: 200 }
        ]
      )
      await expect(
        // @ts-ignore
        resolvers.Query.getUser(
          {},
          { userId: '9c8b8ac2-9044-4b66-8d31-07c5a4b4348d' }
        )
      ).rejects.toThrowError('PractitionerRole has no locations associated')
    })
    it('Throws an error if PractitionerRole has no location', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            mobile: '+880711111111'
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            id: 'eacae600-a501-42d6-9d59-b8b94f3e50c1',
            meta: { lastUpdated: '2018-11-27T17:13:20.662+00:00' },
            type: 'searchset',
            total: 1,
            link: [
              {
                relation: 'self',
                url:
                  'http://localhost:3447/fhir/Practitioner?telecom=phone%7C01711111111'
              }
            ],
            entry: [
              {
                fullUrl:
                  'http://localhost:3447/fhir/Practitioner/b1f46aba-075d-431e-8aeb-ebc57a4a0ad0',
                resource: {
                  resourceType: 'Practitioner',
                  identifier: [
                    { use: 'official', system: 'mobile', value: '01711111111' }
                  ],
                  telecom: [{ system: 'phone', value: '01711111111' }],
                  name: [
                    { use: 'en', family: ['Al Hasan'], given: ['Shakib'] },
                    { use: 'bn', family: [''], given: [''] }
                  ],
                  gender: 'male',
                  meta: {
                    lastUpdated: '2018-11-25T17:31:08.062+00:00',
                    versionId: '7b21f3ac-2d92-46fc-9b87-c692aa81c858'
                  },
                  id: 'e0daf66b-509e-4f45-86f3-f922b74f3dbf'
                }
              }
            ]
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            entry: [
              {
                fullUrl:
                  'http://localhost:3447/fhir/PractitionerRole/9c8b8ac2-9044-4b66-8d31-07c5a4b4348d',
                resource: {
                  resourceType: 'PractitionerRole',
                  practitioner: {
                    reference:
                      'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
                  },
                  code: [
                    {
                      coding: [
                        {
                          system: 'http://opencrvs.org/specs/roles',
                          code: 'FIELD_AGENT'
                        }
                      ]
                    }
                  ],
                  location: [
                    {
                      reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacd9173'
                    }
                  ],
                  meta: {
                    lastUpdated: '2018-11-25T17:31:08.096+00:00',
                    versionId: '2f79ee2d-3b78-4c90-91d8-278e4a28caf7'
                  },
                  id: '9c8b8ac2-9044-4b66-8d31-07c5a4b4348d'
                }
              }
            ]
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Location',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/a2i-internal-id',
                value: '165'
              },
              { system: 'http://opencrvs.org/specs/id/bbs-code', value: '34' },
              {
                system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                value: 'UPAZILA'
              }
            ],
            name: 'KALIGANJ',
            alias: ['কালীগঞ্জ'],
            description: 'division=3&district=20&upazila=165',
            status: 'active',
            mode: 'instance',
            partOf: {
              reference: 'Location/1f97b133-3480-46bb-9812-14d97df63729'
            },
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/location-type',
                  code: 'ADMIN_STRUCTURE'
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
            id: 'd33e4cb2-670e-4564-a8ed-c72baacd9173',
            meta: {
              lastUpdated: '2018-11-25T17:30:53.816+00:00',
              versionId: '277c56f5-b055-4739-8cc7-069bdcd08c9a'
            }
          }),
          { status: 200 }
        ]
      )
      await expect(
        // @ts-ignore
        resolvers.Query.getUser(
          {},
          { userId: '9c8b8ac2-9044-4b66-8d31-07c5a4b4348d' }
        )
      ).rejects.toThrowError('PractitionerRole has no physicalType')
    })
  })
})
