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
import { getLocations } from '@resources/zmb/features/administrative/service/service'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

const locationBundle = JSON.stringify({
  resourceType: 'Bundle',
  id: '2cae4afb-7508-496d-bc8c-136335729978',
  meta: {
    lastUpdated: '2019-02-20T07:10:25.739+00:00'
  },
  type: 'searchset',
  total: 5,
  link: [
    {
      relation: 'self',
      url: 'http://localhost:3447/fhir/Location?type=ADMIN_STRUCTURE'
    },
    {
      relation: 'next',
      url:
        'http://localhost:3447/fhir/Location?type=ADMIN_STRUCTURE&_getpagesoffset=10&_count=10'
    }
  ],
  entry: [
    {
      fullUrl:
        'http://localhost:3447/fhir/Location/f8bebc4c-1bd2-4b72-961b-379a78f347a2/_history/4439e980-2e0e-4029-8598-a700b09c4a1b',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/geo-id',
            value: '1'
          },
          {
            system: 'http://opencrvs.org/specs/id/bbs-code',
            value: '10'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DIVISION'
          }
        ],
        name: 'Barisal',
        alias: ['বরিশাল'],
        description: 'division=1',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/0'
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
              data: ''
            }
          }
        ],
        id: 'f8bebc4c-1bd2-4b72-961b-379a78f347a2',
        meta: {
          lastUpdated: '2019-01-30T12:26:06.357+00:00',
          versionId: '4439e980-2e0e-4029-8598-a700b09c4a1b'
        }
      },
      request: {
        method: 'PUT',
        url: 'Location/f8bebc4c-1bd2-4b72-961b-379a78f347a2'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Location/0adfddb7-f499-44fb-b640-2123c90b685b/_history/4cddebcb-239e-42c5-b2c5-51845337e923',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/geo-id',
            value: '2'
          },
          {
            system: 'http://opencrvs.org/specs/id/bbs-code',
            value: '20'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DIVISION'
          }
        ],
        name: 'Chittagong',
        alias: ['চট্টগ্রাম'],
        description: 'division=2',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/0'
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
              data: ''
            }
          }
        ],
        id: '0adfddb7-f499-44fb-b640-2123c90b685b',
        meta: {
          lastUpdated: '2019-01-30T12:26:06.496+00:00',
          versionId: '4cddebcb-239e-42c5-b2c5-51845337e923'
        }
      },
      request: {
        method: 'PUT',
        url: 'Location/0adfddb7-f499-44fb-b640-2123c90b685b'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Location/9975af98-cefb-4025-8c0f-d3fa63a17eed/_history/9f43ec42-065c-49ac-8e2c-a08592f5cd29',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/geo-id',
            value: '3'
          },
          {
            system: 'http://opencrvs.org/specs/id/bbs-code',
            value: '30'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DIVISION'
          }
        ],
        name: 'Dhaka',
        alias: ['ঢাকা'],
        description: 'division=3',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/0'
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
              data: ''
            }
          }
        ],
        id: '9975af98-cefb-4025-8c0f-d3fa63a17eed',
        meta: {
          lastUpdated: '2019-01-30T12:26:06.511+00:00',
          versionId: '9f43ec42-065c-49ac-8e2c-a08592f5cd29'
        }
      },
      request: {
        method: 'PUT',
        url: 'Location/9975af98-cefb-4025-8c0f-d3fa63a17eed'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Location/c05b71cc-800c-415f-8db7-a78f81a59aa8/_history/7de4fe92-4131-4e7c-a596-e2abe2594d00',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/geo-id',
            value: '4'
          },
          {
            system: 'http://opencrvs.org/specs/id/bbs-code',
            value: '40'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DIVISION'
          }
        ],
        name: 'Khulna',
        alias: ['খুলনা'],
        description: 'division=4',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/0'
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
              data: ''
            }
          }
        ],
        id: 'c05b71cc-800c-415f-8db7-a78f81a59aa8',
        meta: {
          lastUpdated: '2019-01-30T12:26:06.529+00:00',
          versionId: '7de4fe92-4131-4e7c-a596-e2abe2594d00'
        }
      },
      request: {
        method: 'PUT',
        url: 'Location/c05b71cc-800c-415f-8db7-a78f81a59aa8'
      }
    },
    {
      fullUrl:
        'http://localhost:3447/fhir/Location/013c77b5-aa9f-40e5-9f7b-abb43d86724b/_history/d5582953-1a44-442d-85fd-8b2f94eb5ba0',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/geo-id',
            value: '5'
          },
          {
            system: 'http://opencrvs.org/specs/id/bbs-code',
            value: '50'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DIVISION'
          }
        ],
        name: 'Rajshahi',
        alias: ['রাজশাহী'],
        description: 'division=5',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/0'
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
              data: ''
            }
          }
        ],
        id: '013c77b5-aa9f-40e5-9f7b-abb43d86724b',
        meta: {
          lastUpdated: '2019-01-30T12:26:06.548+00:00',
          versionId: 'd5582953-1a44-442d-85fd-8b2f94eb5ba0'
        }
      },
      request: {
        method: 'PUT',
        url: 'Location/013c77b5-aa9f-40e5-9f7b-abb43d86724b'
      }
    }
  ]
})

describe('admin service', () => {
  describe('getLocations()', () => {
    it('returns locations in a simplified format', async () => {
      fetch.once(locationBundle)
      const locations = await getLocations()
      expect(locations.data).toBeDefined()
      expect(locations.data).toEqual({
        'f8bebc4c-1bd2-4b72-961b-379a78f347a2': {
          id: 'f8bebc4c-1bd2-4b72-961b-379a78f347a2',
          name: 'Barisal',
          alias: 'বরিশাল',
          physicalType: 'Jurisdiction',
          jurisdictionType: 'DIVISION',
          type: 'ADMIN_STRUCTURE',
          partOf: 'Location/0'
        },
        '0adfddb7-f499-44fb-b640-2123c90b685b': {
          id: '0adfddb7-f499-44fb-b640-2123c90b685b',
          name: 'Chittagong',
          alias: 'চট্টগ্রাম',
          physicalType: 'Jurisdiction',
          jurisdictionType: 'DIVISION',
          type: 'ADMIN_STRUCTURE',
          partOf: 'Location/0'
        },
        '9975af98-cefb-4025-8c0f-d3fa63a17eed': {
          id: '9975af98-cefb-4025-8c0f-d3fa63a17eed',
          name: 'Dhaka',
          alias: 'ঢাকা',
          physicalType: 'Jurisdiction',
          jurisdictionType: 'DIVISION',
          type: 'ADMIN_STRUCTURE',
          partOf: 'Location/0'
        },
        'c05b71cc-800c-415f-8db7-a78f81a59aa8': {
          id: 'c05b71cc-800c-415f-8db7-a78f81a59aa8',
          name: 'Khulna',
          alias: 'খুলনা',
          physicalType: 'Jurisdiction',
          jurisdictionType: 'DIVISION',
          type: 'ADMIN_STRUCTURE',
          partOf: 'Location/0'
        },
        '013c77b5-aa9f-40e5-9f7b-abb43d86724b': {
          id: '013c77b5-aa9f-40e5-9f7b-abb43d86724b',
          name: 'Rajshahi',
          alias: 'রাজশাহী',
          physicalType: 'Jurisdiction',
          jurisdictionType: 'DIVISION',
          type: 'ADMIN_STRUCTURE',
          partOf: 'Location/0'
        }
      })
    })

    it('throw an error when the fetch fails', async () => {
      fetch.mockRejectOnce(new Error('boom'))
      expect(getLocations()).rejects.toThrowError('boom')
    })
  })
})
