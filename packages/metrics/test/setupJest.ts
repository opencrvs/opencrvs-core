/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { join } from 'path'
import * as fetch from 'jest-fetch-mock'

jest.setMock('node-fetch', { default: fetch })
jest.mock('@metrics/influxdb/client', () => ({
  __esModule: true,
  writePoints: jest.fn().mockReturnValue(Promise.resolve()),
  query: jest.fn()
}))

const taskHistory = require('./test-data/task-history-response.json')

jest.mock('@metrics/api', () => ({
  __esModule: true,
  fetchTaskHistory: jest.fn(),
  fetchLocation: jest.fn(),
  fetchChildLocationsByParentId: jest.fn(),
  fetchFromResource: jest.fn(),
  fetchAllFromSearch: jest.fn(),
  fetchParentLocationByLocationID: jest.fn(),
  fetchFHIR: jest.fn(),
  fetchPractitionerRole: jest.fn()
}))

export const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEACTIVATED: 'deactivated'
}

jest.mock('@metrics/configApi', () => {
  const originalModule = jest.requireActual('@metrics/configApi')
  return {
    __esModule: true,
    ...originalModule,
    getApplicationConfig: () =>
      Promise.resolve({
        API_GATEWAY_URL: 'http://localhost:7070/',
        CONFIG_API_URL: 'http://localhost:2021',
        LOGIN_URL: 'http://localhost:3020',
        AUTH_URL: 'http://localhost:4040',
        MINIO_URL: 'http://localhost:3535',
        RESOURCES_URL: 'http://localhost:3040',
        APPLICATION_NAME: 'Farajaland CRVS',
        FIELD_AGENT_AUDIT_LOCATIONS: 'DISTRICT',
        DECLARATION_AUDIT_LOCATIONS: 'DISTRICT',
        EXTERNAL_VALIDATION_WORKQUEUE: false,
        PHONE_NUMBER_PATTERN: '/^0(7|9)[0-9]{1}[0-9]{7}$/',
        NID_NUMBER_PATTERN: '/^[0-9]{9}$/',
        CURRENCY: {
          isoCode: 'ZMW',
          languagesAndCountry: ['en-ZM']
        }
      })
  }
})

process.env.CERT_PUBLIC_KEY_PATH = join(__dirname, './cert.key.pub')
process.env.NODE_ENV = 'test'

beforeEach(() => {
  jest.clearAllMocks()
  const {
    fetchTaskHistory,
    fetchLocation,
    fetchChildLocationsByParentId,
    fetchFromResource,
    fetchAllFromSearch,
    fetchPractitionerRole
  }: {
    fetchTaskHistory: jest.Mock
    fetchLocation: jest.Mock
    fetchChildLocationsByParentId: jest.Mock
    fetchFromResource: jest.Mock
    fetchAllFromSearch: jest.Mock
    fetchPractitionerRole: jest.Mock
  } = require('@metrics/api')
  fetchTaskHistory.mockResolvedValue(taskHistory)
  fetchFromResource.mockResolvedValueOnce({ crudeDeathRate: 5.1 })
  fetchChildLocationsByParentId.mockResolvedValueOnce([
    {
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
    }
  ])
  fetchLocation
    .mockResolvedValueOnce({
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
    .mockResolvedValueOnce({
      resourceType: 'Location',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/geo-id',
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
          url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
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
    .mockResolvedValueOnce({
      resourceType: 'Location',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/geo-id',
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
          url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
          valueAttachment: {
            contentType: 'application/geo+json',
            data: 'eyJ0eXBlIjoiRmVhdHVyZSIsInByb3BlcnRpZXMiOnsiTmFtZSI6IkthbGlnYW5qIiwiZGVzY3JpcHRpb24iOm51bGwsImFsdGl0dWRlTW9kZSI6ImNsYW1wVG9Hcm91bmQiLCJBRE0xX0VOIjoiRGhha2EiLCJBRE0zX0VOIjoiS2FsaWdhbmoiLCJBRE0zQUxUMUVOIjoiIiwiZGF0ZSI6IjIwMTUtMDEtMDEiLCJBRE0zX1JFRiI6IiIsIkFETTJfUENPREUiOiIzMDMzIiwiQURNMl9FTiI6IkdhemlwdXIiLCJJblBvbHlfRklEIjoiMjQ2IiwidmFsaWRPbiI6IjIwMTgtMDQtMTAiLCJBRE0wX1BDT0RFIjoiQkQiLCJBRE0xX1BDT0RFIjoiMzAiLCJ2YWxpZFRvIjoiPE51bGw+IiwiU2ltUGduRmxhZyI6IjAiLCJNaW5TaW1wVG9sIjoiMC4wMDg5OTMiLCJGSUQiOiIyNDYiLCJBRE0wX0VOIjoiQmFuZ2xhZGVzaCIsIlNoYXBlX0xlbmciOiIwLjk3MDg5NCIsIkFETTNfUENPREUiOiIzMDMzMzQiLCJNYXhTaW1wVG9sIjoiMC4wMDg5OTMiLCJBRE0zQUxUMkVOIjoiIiwiRmllbGRfMSI6IkthbGlnYW5qIn0sImdlb21ldHJ5Ijp7InR5cGUiOiJNdWx0aVBvbHlnb24iLCJjb29yZGluYXRlcyI6W1tbWzkwLjU2NzQ5ODgxODAwMDA1LDI0LjAyNzY3MDI5NDAwMDA3XSxbOTAuNTUxNTQ0NjQzMDAwMDYsMjQuMDQ3MzE3MzU1MDAwMDhdLFs5MC40OTgxNzI5MzMwMDAwMywyNC4wMzc3Nzc4NDQwMDAwNl0sWzkwLjQ5MjM2NTk3ODAwMDA3LDI0LjAyNzY5NTM0ODAwMDA3XSxbOTAuNDk0MDk0ODMzMDAwMDgsMjMuOTg3MzAyMDYxMDAwMDRdLFs5MC41MTQ4OTM5NDcwMDAwOCwyMy45NjY4ODcwNjAwMDAwM10sWzkwLjQ5MDM5MTg2MjAwMDA4LDIzLjk2MTM1OTQ0MTAwMDA3XSxbOTAuNTE0MTMzODA4MDAwMDUsMjMuOTU4OTI5NDUyMDAwMDZdLFs5MC41MTMzNjQ2NDYwMDAwNywyMy45MzUzMTQwMDUwMDAwN10sWzkwLjQ5MDAyOTEyMzAwMDA2LDIzLjkzNjM5OTU1MTAwMDAyXSxbOTAuNDkyMjcxNTg5MDAwMDQsMjMuOTE1NTMwNzY4MDAwMDVdLFs5MC40NjE1NjY5MTYwMDAwNCwyMy44ODMzNzA4OTYwMDAwM10sWzkwLjQ2NDA3MDA3NDAwMDA2LDIzLjg0NjMwMTc3MzAwMDA1XSxbOTAuNDcxMjY5NDIzMDAwMDgsMjMuODQ3MzA4Mjk2MDAwMDVdLFs5MC41MDIyNzIxNzcwMDAwNywyMy44NTc5MDA4MjMwMDAwMl0sWzkwLjUyNTY3NjQ1NjAwMDA0LDIzLjg5NjUxNDA1OTAwMDAzXSxbOTAuNTQ5Mzc0MTM4MDAwMDgsMjMuODg1MjczNjUzMDAwMDddLFs5MC41NzA2Njc4NzAwMDAwOCwyMy44OTQ5ODkzMTMwMDAwNV0sWzkwLjU2MDM5MTIyOTAwMDA2LDIzLjkxMTA5NTM0NjAwMDAyXSxbOTAuNjE0MTAxOTAzMDAwMDYsMjMuOTI4MDk0MTIxMDAwMDddLFs5MC42MTgwOTQyMTAwMDAwNCwyMy45Njg0MTgxNTcwMDAwM10sWzkwLjY1Nzk3MjI4MTAwMDA3LDI0LjAxMzQ3MzIwOTAwMDA0XSxbOTAuNjUwMzEwNjYxMDAwMDUsMjQuMDM2ODY3MDIzMDAwMDddLFs5MC42MTIzNTk2OTMwMDAwMywyNC4wNDUxNzAyOTgwMDAwN10sWzkwLjU2NzQ5ODgxODAwMDA1LDI0LjAyNzY3MDI5NDAwMDA3XV1dXX19'
          }
        }
      ],
      id: '6e3b90fe-8d70-483e-994c-4659d449a4db',
      meta: {
        lastUpdated: '2019-09-05T14:13:49.018+00:00',
        versionId: '632052a4-8604-4e2d-a2fd-d142d490c2df'
      }
    })
    .mockResolvedValueOnce({
      resourceType: 'Location',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/geo-id',
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
            data: 'eyJ0eXBlIjoiRmVhdHVyZSIsInByb3BlcnRpZXMiOnsiTmFtZSI6IkdhemlwdXIiLCJkZXNjcmlwdGlvbiI6bnVsbCwiYWx0aXR1ZGVNb2RlIjoiY2xhbXBUb0dyb3VuZCIsIkFETTFfRU4iOiJEaGFrYSIsIkFETTJBTFQyRU4iOiIiLCJBRE0wX0VOIjoiQmFuZ2xhZGVzaCIsIkFETTJfUENPREUiOiIzMDMzIiwiQURNMl9FTiI6IkdhemlwdXIiLCJJblBvbHlfRklEIjoiMTciLCJ2YWxpZE9uIjoiMjAxOC0wNC0xMCIsIkFETTJBTFQxRU4iOiIiLCJBRE0wX1BDT0RFIjoiQkQiLCJBRE0xX1BDT0RFIjoiMzAiLCJTaW1QZ25GbGFnIjoiMCIsIk1pblNpbXBUb2wiOiIwLjAwODk5MyIsIkZJRCI6IjE3IiwiZGF0ZSI6IjIwMTUtMDEtMDEiLCJTaGFwZV9MZW5nIjoiMi40NjEyOSIsIk1heFNpbXBUb2wiOiIwLjAwODk5MyIsIkFETTJfUkVGIjoiIiwiVmFsaWRUbyI6IjxOdWxsPiIsIkZpZWxkXzEiOiJHYXppcHVyIn0sImdlb21ldHJ5Ijp7InR5cGUiOiJNdWx0aVBvbHlnb24iLCJjb29yZGluYXRlcyI6W1tbWzkwLjUyOTAxMDg0NTAwMDA3LDI0LjMwMzI5NDc4ODAwMDA3XSxbOTAuNDQzMDM5OTI2MDAwMDQsMjQuMzQxMTM4MjAzMDAwMDddLFs5MC40MDI0MjQ3ODYwMDAwNCwyNC4yODI2ODgzMjEwMDAwMl0sWzkwLjM2MjQ5ODU1NDAwMDA3LDI0LjI4MTAwNDk4MzAwMDA2XSxbOTAuMzU5Mjg0MTk4MDAwMDcsMjQuMzAwMTM3MDk4MDAwMDVdLFs5MC4zMjUzNTc1MTMwMDAwOSwyNC4yOTkxODk1NTQwMDAwN10sWzkwLjI5MDQ5Nzc2ODAwMDA4LDI0LjI3Nzc3NDkxMjAwMDA0XSxbOTAuMzAwODMyODYxMDAwMDYsMjQuMjY5MzU2MjIxMDAwMDddLFs5MC4yOTAwMTY1NjgwMDAwNiwyNC4yMjYwNzczMDIwMDAwOF0sWzkwLjI2NjE1ODQ1ODAwMDA2LDI0LjIxNTExNTkwNTAwMDA2XSxbOTAuMjI1OTU2Njk1MDAwMDQsMjQuMTYyNTA0NTU5MDAwMDddLFs5MC4yMTcxOTQ5NTcwMDAwNiwyNC4xMjg0MTEzMzQwMDAwOF0sWzkwLjIzMDQzMjczMzAwMDA0LDI0LjEwNjAzNDQ4MDAwMDA2XSxbOTAuMjAwOTI1NjM4MDAwMDYsMjQuMDkzNzc5OTAwMDAwMDddLFs5MC4xNzMzNTg4MjMwMDAwNiwyNC4xMDgwMjAxODcwMDAwMl0sWzkwLjE3Njk5ODI4NTAwMDA4LDI0LjA3NDc5ODg3ODAwMDAyXSxbOTAuMTU3NzYxMzY1MDAwMDYsMjQuMDY0MjczMDcyMDAwMDVdLFs5MC4xNDc1NTI2MTgwMDAwOCwyNC4wMzM1NDMwMDUwMDAwN10sWzkwLjE3NjM3ODU3NjAwMDA1LDI0LjAwMDMzMDA2NDAwMDAyXSxbOTAuMTkxNzgxNDMyMDAwMDgsMjQuMDE0MDQwMTM0MDAwMDNdLFs5MC4yMzk3MTM4NzIwMDAwNCwyNC4wMDkyMTA5NTEwMDAwNl0sWzkwLjI0NjAyOTgwNTAwMDAzLDI0LjAzMzMxOTk1NzAwMDA2XSxbOTAuMjYwMDI2MTgwMDAwMDcsMjQuMDE0ODI3NTM3MDAwMDNdLFs5MC4yNTAwNjc3MjcwMDAwNCwyMy45OTIxNjQwMDMwMDAwM10sWzkwLjI2MDEzMjU2MTAwMDAzLDIzLjk3MTEzMTMwOTAwMDA0XSxbOTAuMjk3ODEyMDM0MDAwMDYsMjMuOTYxODc0MTI4MDAwMDNdLFs5MC4zMDAxNzM5NTYwMDAwNCwyMy45NDg4MzU4NzQwMDAwNV0sWzkwLjM0MDg0MjE2MDAwMDA4LDIzLjk1NTU2OTgzNzAwMDA0XSxbOTAuMzUwMTg3NDEyMDAwMDgsMjMuODgyMzM0ODg4MDAwMDZdLFs5MC4zNzcxNTMwMzkwMDAwNiwyMy44OTgwNDAwOTEwMDAwNF0sWzkwLjM5NTcxNTMzMDAwMDA5LDIzLjg4MDE1NzAxMDAwMDA2XSxbOTAuNDM4MjAwNjI4MDAwMDYsMjMuOTAxMDYzNDE4MDAwMDRdLFs5MC40NTc4MDA2MjAwMDAwNiwyMy44OTY0NDcxMDAwMDAwNV0sWzkwLjQ3MTI2OTQyMzAwMDA4LDIzLjg0NzMwODI5NjAwMDA1XSxbOTAuNTAyMjcyMTc3MDAwMDcsMjMuODU3OTAwODIzMDAwMDJdLFs5MC41MjU2NzY0NTYwMDAwNCwyMy44OTY1MTQwNTkwMDAwM10sWzkwLjU0OTM3NDEzODAwMDA4LDIzLjg4NTI3MzY1MzAwMDA3XSxbOTAuNTcwNjY3ODcwMDAwMDgsMjMuODk0OTg5MzEzMDAwMDVdLFs5MC41NjAzOTEyMjkwMDAwNiwyMy45MTEwOTUzNDYwMDAwMl0sWzkwLjYwODE1MzM4MDAwMDAzLDIzLjkyMTUxNzAwMTAwMDA0XSxbOTAuNjE4MDk0MjEwMDAwMDQsMjMuOTY4NDE4MTU3MDAwMDNdLFs5MC42NTc5NzIyODEwMDAwNywyNC4wMTM0NzMyMDkwMDAwNF0sWzkwLjYzNTMzNDA1MjAwMDA4LDI0LjA3MDc3ODcxNTAwMDA3XSxbOTAuNjM5Njk0ODYxMDAwMDcsMjQuMTA2MDg3MDQ4MDAwMDZdLFs5MC42NTY2MjkxMTMwMDAwNiwyNC4wOTIzMDM3NTUwMDAwNV0sWzkwLjcwMjk2MSwyNC4xMDY1NjA0NjgwMDAwNV0sWzkwLjY3NjMwMjUwNjAwMDA3LDI0LjExNTUyOTY4MzAwMDAzXSxbOTAuNjk1MzAwMDExMDAwMDksMjQuMTM5OTU4MzExMDAwMDRdLFs5MC42NzE2ODk0MTMwMDAwOCwyNC4yMDQ4NDMwNjQwMDAwNF0sWzkwLjY4Mjk1MDMwMDAwMDA3LDI0LjI0NDM0ODMyMDAwMDAzXSxbOTAuNjQ5MjkzNDMzMDAwMDgsMjQuMjU3OTg3ODQ5MDAwMDddLFs5MC42MjE4Mjc0MTQwMDAwNSwyNC4yNjg1NTg0OTIwMDAwN10sWzkwLjU3MjkwODM3NzAwMDAzLDI0LjI0NjQ1MTI2MzAwMDA0XSxbOTAuNTIxMDYyNzI0MDAwMDUsMjQuMjg3NzAyOTU1MDAwMDRdLFs5MC41MjkwMTA4NDUwMDAwNywyNC4zMDMyOTQ3ODgwMDAwN11dXV19fQ=='
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
    })
  fetchAllFromSearch.mockResolvedValueOnce({
    body: {
      took: 19,
      timed_out: false,
      _shards: { total: 5, successful: 5, skipped: 0, failed: 0 },
      hits: {
        total: { value: 6 },
        max_score: null,
        hits: [
          {
            _index: 'ocrvs',
            _type: 'compositions',
            _id: '0299daa0-fa97-439b-92ed-652d7db186c7',
            _score: null,
            _source: {
              event: 'Birth',
              createdAt: '1587384348363',
              operationHistories: [
                {
                  operatedOn: '2020-04-20T12:05:30.001Z',
                  operatorFirstNames: 'Shakib',
                  operatorFamilyNameLocale: '',
                  operatorFamilyName: 'Al Hasan',
                  operatorFirstNamesLocale: '',
                  operatorOfficeName: 'Baniajan Union Parishad',
                  operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                  operationType: 'DECLARED',
                  operatorRole: 'FIELD_AGENT'
                },
                {
                  operatedOn: '2020-04-20T12:05:48.163Z',
                  operatorFirstNames: 'Mohammad',
                  operatorFamilyNameLocale: '',
                  operatorFamilyName: 'Ashraful',
                  operatorFirstNamesLocale: '',
                  operatorOfficeName: 'Baniajan Union Parishad',
                  operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                  operationType: 'WAITING_VALIDATION',
                  operatorRole: 'LOCAL_REGISTRAR'
                },
                {
                  operatedOn: '2020-04-20T12:05:48.163Z',
                  operatorFirstNames: 'Mohammad',
                  operatorFamilyNameLocale: '',
                  operatorFamilyName: 'Ashraful',
                  operatorFirstNamesLocale: '',
                  operatorOfficeName: 'Baniajan Union Parishad',
                  operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                  operationType: 'REGISTERED',
                  operatorRole: 'LOCAL_REGISTRAR'
                }
              ],
              childFamilyName: 'Spivak',
              childFamilyNameLocal: 'স্পিভক',
              childDoB: '2018-10-17',
              gender: 'female',
              eventLocationId: 'c5ef7007-3100-45d1-99b9-cfe90021c758',
              motherFamilyName: 'Begum',
              motherFamilyNameLocal: 'বেগম',
              motherDoB: '1900-07-08',
              motherIdentifier: '14982808347893336',
              informantFamilyName: 'Begum',
              informantFamilyNameLocal: 'বেগম',
              contactNumber: '+8801529148197',
              type: 'REGISTERED',
              dateOfDeclaration: '2020-04-20T12:05:48.163Z',
              trackingId: 'BYW6MFW',
              declarationLocationId: '5d88627e-879c-4631-aff8-f5789551cb2b',
              compositionType: 'birth-declaration',
              createdBy: 'f361cae7-205a-4251-9f31-125118da1625',
              updatedBy: '8d14843a-1c2e-4456-b5d1-420c7c9d9d78',
              modifiedAt: '1587384350751',
              registrationNumber: '20187210411000112'
            },
            sort: [1587384348163]
          },
          {
            _index: 'ocrvs',
            _type: 'compositions',
            _id: 'ca09dfa9-9e31-40ed-8aa6-9446b4ceb71a',
            _score: null,
            _source: {
              event: 'Birth',
              createdAt: '1587384430106',
              operationHistories: [
                {
                  operatedOn: '2020-04-20T12:06:49.935Z',
                  operatorFirstNames: 'Shakib',
                  operatorFamilyNameLocale: '',
                  operatorFamilyName: 'Al Hasan',
                  operatorFirstNamesLocale: '',
                  operatorOfficeName: 'Baniajan Union Parishad',
                  operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                  operationType: 'DECLARED',
                  operatorRole: 'FIELD_AGENT'
                },
                {
                  operatedOn: '2020-04-20T12:07:10.000Z',
                  operatorFirstNames: 'Mohammad',
                  operatorFamilyNameLocale: '',
                  operatorFamilyName: 'Ashraful',
                  operatorFirstNamesLocale: '',
                  operatorOfficeName: 'Baniajan Union Parishad',
                  operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                  operationType: 'WAITING_VALIDATION',
                  operatorRole: 'LOCAL_REGISTRAR'
                },
                {
                  operatedOn: '2020-04-20T12:07:10.000Z',
                  operatorFirstNames: 'Mohammad',
                  operatorFamilyNameLocale: '',
                  operatorFamilyName: 'Ashraful',
                  operatorFirstNamesLocale: '',
                  operatorOfficeName: 'Baniajan Union Parishad',
                  operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                  operationType: 'REGISTERED',
                  operatorRole: 'LOCAL_REGISTRAR'
                }
              ],
              childFirstNames: 'Maruf',
              childFamilyName: 'Hossain',
              childFirstNamesLocal: 'মারুফ',
              childFamilyNameLocal: 'হোসাইন',
              childDoB: '1994-10-22',
              gender: 'male',
              eventLocationId: 'c5ef7007-3100-45d1-99b9-cfe90021c758',
              motherFirstNames: 'Habiba',
              motherFamilyName: 'Aktar',
              motherFirstNamesLocal: 'হাবিবা',
              motherFamilyNameLocal: 'আক্তার',
              motherDoB: '1971-10-23',
              motherIdentifier: '19922613235317496',
              fatherFirstNames: 'Borhan',
              fatherFamilyName: 'Uddin',
              fatherFirstNamesLocal: 'বোরহান',
              fatherFamilyNameLocal: 'উদ্দিন',
              fatherDoB: '1966-08-01',
              fatherIdentifier: '19988273235317496',
              informantFirstNames: 'Habiba',
              informantFamilyName: 'Aktar',
              informantFirstNamesLocal: 'হাবিবা',
              informantFamilyNameLocal: 'আক্তার',
              contactNumber: '+8801526972106',
              type: 'REGISTERED',
              dateOfDeclaration: '2020-04-20T12:07:10.000Z',
              trackingId: 'BPWW3PW',
              declarationLocationId: '5d88627e-879c-4631-aff8-f5789551cb2b',
              compositionType: 'birth-declaration',
              createdBy: 'f361cae7-205a-4251-9f31-125118da1625',
              updatedBy: '8d14843a-1c2e-4456-b5d1-420c7c9d9d78',
              modifiedAt: '1587384432456',
              registrationNumber: '19947210411000113'
            },
            sort: [1587384430000]
          },
          {
            _index: 'ocrvs',
            _type: 'compositions',
            _id: '1a0dbdfd-550f-4113-ac23-e650596c7bea',
            _score: null,
            _source: {
              event: 'Birth',
              createdAt: '1587384453470',
              operationHistories: [
                {
                  operatedOn: '2020-04-20T12:07:33.230Z',
                  operatorFirstNames: 'Shakib',
                  operatorFamilyNameLocale: '',
                  operatorFamilyName: 'Al Hasan',
                  operatorFirstNamesLocale: '',
                  operatorOfficeName: 'Baniajan Union Parishad',
                  operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                  operationType: 'DECLARED',
                  operatorRole: 'FIELD_AGENT'
                },
                {
                  operatedOn: '2020-04-20T12:07:49.162Z',
                  operatorFirstNames: 'Mohammad',
                  rejectReason: 'other',
                  operatorFamilyNameLocale: '',
                  operatorFamilyName: 'Ashraful',
                  operatorFirstNamesLocale: '',
                  rejectComment:
                    'Lack of information, please notify informant about it.',
                  operatorOfficeName: 'Baniajan Union Parishad',
                  operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                  operationType: 'REJECTED',
                  operatorRole: 'LOCAL_REGISTRAR'
                }
              ],
              childFamilyName: 'Chowdhury',
              childFamilyNameLocal: 'চৌধুরী',
              childDoB: '1991-10-22',
              gender: 'male',
              eventLocationId: 'c5ef7007-3100-45d1-99b9-cfe90021c758',
              motherFamilyName: 'Aktar',
              motherFamilyNameLocal: 'আক্তার',
              motherDoB: '1971-10-23',
              motherIdentifier: '19988010143317496',
              informantFamilyName: 'Aktar',
              informantFamilyNameLocal: 'আক্তার',
              contactNumber: '+8801526972106',
              type: 'REJECTED',
              dateOfDeclaration: '2020-04-20T12:07:33.230Z',
              trackingId: 'B5DU8KU',
              declarationLocationId: '5d88627e-879c-4631-aff8-f5789551cb2b',
              compositionType: 'birth-declaration',
              createdBy: 'f361cae7-205a-4251-9f31-125118da1625',
              updatedBy: '8d14843a-1c2e-4456-b5d1-420c7c9d9d78',
              rejectReason: 'other',
              modifiedAt: '1587384469376',
              rejectComment:
                'Lack of information, please notify informant about it.'
            },
            sort: [1587384453230]
          },
          {
            _index: 'ocrvs',
            _type: 'compositions',
            _id: '9867aaef-b994-4744-b5b3-abdd3f520793',
            _score: null,
            _source: {
              event: 'Birth',
              createdAt: '1587384532791',
              operationHistories: [
                {
                  operatedOn: '2020-04-20T12:08:52.456Z',
                  operatorFirstNames: 'Shakib',
                  operatorFamilyNameLocale: '',
                  operatorFamilyName: 'Al Hasan',
                  operatorFirstNamesLocale: '',
                  operatorOfficeName: 'Baniajan Union Parishad',
                  operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                  operationType: 'DECLARED',
                  operatorRole: 'FIELD_AGENT'
                },
                {
                  operatedOn: '2020-04-20T12:09:16.255Z',
                  operatorFirstNames: 'Mohammad',
                  rejectReason: 'other',
                  operatorFamilyNameLocale: '',
                  operatorFamilyName: 'Ashraful',
                  operatorFirstNamesLocale: '',
                  rejectComment:
                    'Lack of information, please notify informant about it.',
                  operatorOfficeName: 'Baniajan Union Parishad',
                  operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                  operationType: 'REJECTED',
                  operatorRole: 'LOCAL_REGISTRAR'
                }
              ],
              childFirstNames: 'Tahmid',
              childFamilyName: 'Rahman',
              childFirstNamesLocal: 'তাহ্মিদ',
              childFamilyNameLocal: 'রহমান',
              childDoB: '1989-01-01',
              gender: 'male',
              eventLocationId: 'c5ef7007-3100-45d1-99b9-cfe90021c758',
              motherFirstNames: 'Namisa',
              motherFamilyName: 'Begum',
              motherFirstNamesLocal: 'নমিসা',
              motherFamilyNameLocal: 'বেগম',
              motherDoB: '1961-12-02',
              motherIdentifier: '19988010143317496',
              fatherFirstNames: 'Hamidur',
              fatherFamilyName: 'Rahman',
              fatherFirstNamesLocal: 'হামিদুর',
              fatherFamilyNameLocal: 'রহমান',
              fatherDoB: '1959-05-01',
              fatherIdentifier: '19988010143317496',
              informantFirstNames: 'Namisa',
              informantFamilyName: 'Begum',
              informantFirstNamesLocal: 'নমিসা',
              informantFamilyNameLocal: 'বেগম',
              contactNumber: '+8801526972106',
              type: 'REJECTED',
              dateOfDeclaration: '2020-04-20T12:08:52.456Z',
              trackingId: 'BQOPG9I',
              declarationLocationId: '5d88627e-879c-4631-aff8-f5789551cb2b',
              compositionType: 'birth-declaration',
              createdBy: 'f361cae7-205a-4251-9f31-125118da1625',
              updatedBy: '8d14843a-1c2e-4456-b5d1-420c7c9d9d78',
              rejectReason: 'other',
              modifiedAt: '1587384556491',
              rejectComment:
                'Lack of information, please notify informant about it.'
            },
            sort: [1587384532456]
          },
          {
            _index: 'ocrvs',
            _type: 'compositions',
            _id: 'b25ca75b-af0a-4cf4-94a8-359d1a7e190f',
            _score: null,
            _source: {
              event: 'Birth',
              createdAt: '1587384621467',
              operationHistories: [
                {
                  operatedOn: '2020-04-20T12:10:21.368Z',
                  operatorFirstNames: 'Mohammad',
                  operatorFamilyNameLocale: '',
                  operatorFamilyName: 'Ashraful',
                  operatorFirstNamesLocale: '',
                  operatorOfficeName: 'Baniajan Union Parishad',
                  operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                  operationType: 'WAITING_VALIDATION',
                  operatorRole: 'LOCAL_REGISTRAR'
                },
                {
                  operatedOn: '2020-04-20T12:10:21.368Z',
                  operatorFirstNames: 'Mohammad',
                  operatorFamilyNameLocale: '',
                  operatorFamilyName: 'Ashraful',
                  operatorFirstNamesLocale: '',
                  operatorOfficeName: 'Baniajan Union Parishad',
                  operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                  operationType: 'REGISTERED',
                  operatorRole: 'LOCAL_REGISTRAR'
                }
              ],
              childFirstNames: 'Maruf',
              childFamilyName: 'Hossain',
              childFirstNamesLocal: 'মারুফ',
              childFamilyNameLocal: 'হোসাইন',
              childDoB: '1994-10-22',
              gender: 'male',
              eventLocationId: 'c5ef7007-3100-45d1-99b9-cfe90021c758',
              motherFirstNames: 'Habiba',
              motherFamilyName: 'Aktar',
              motherFirstNamesLocal: 'হাবিবা',
              motherFamilyNameLocal: 'আক্তার',
              motherDoB: '1971-10-23',
              motherIdentifier: '19988010143317496',
              fatherFirstNames: 'Borhan',
              fatherFamilyName: 'Uddin',
              fatherFirstNamesLocal: 'বোরহান',
              fatherFamilyNameLocal: 'উদ্দিন',
              fatherDoB: '1966-08-01',
              fatherIdentifier: '19988010143317496',
              informantFirstNames: 'Habiba',
              informantFamilyName: 'Aktar',
              informantFirstNamesLocal: 'হাবিবা',
              informantFamilyNameLocal: 'আক্তার',
              contactNumber: '+8801526972106',
              type: 'REGISTERED',
              dateOfDeclaration: '2020-04-20T12:10:21.368Z',
              trackingId: 'BEDYGYJ',
              declarationLocationId: '5d88627e-879c-4631-aff8-f5789551cb2b',
              compositionType: 'birth-declaration',
              createdBy: '8d14843a-1c2e-4456-b5d1-420c7c9d9d78',
              updatedBy: '8d14843a-1c2e-4456-b5d1-420c7c9d9d78',
              relatesTo: ['ca09dfa9-9e31-40ed-8aa6-9446b4ceb71a'],
              modifiedAt: '1587384624163',
              registrationNumber: '19947210411000114'
            },
            sort: [1587384621368]
          },
          {
            _index: 'ocrvs',
            _type: 'compositions',
            _id: 'b8779830-49ca-48ed-8a21-fd43121e65ce',
            _score: null,
            _source: {
              event: 'Birth',
              createdAt: '1587384661428',
              operationHistories: [
                {
                  operatedOn: '2020-04-20T12:10:46.015Z',
                  operatorFirstNames: 'Shakib',
                  operatorFamilyNameLocale: '',
                  operatorFamilyName: 'Al Hasan',
                  operatorFirstNamesLocale: '',
                  operatorOfficeName: 'Baniajan Union Parishad',
                  operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                  operationType: 'DECLARED',
                  operatorRole: 'FIELD_AGENT'
                },
                {
                  operatedOn: '2020-04-20T12:11:01.315Z',
                  operatorFirstNames: 'Mohammad',
                  operatorFamilyNameLocale: '',
                  operatorFamilyName: 'Ashraful',
                  operatorFirstNamesLocale: '',
                  operatorOfficeName: 'Baniajan Union Parishad',
                  operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                  operationType: 'WAITING_VALIDATION',
                  operatorRole: 'LOCAL_REGISTRAR'
                },
                {
                  operatedOn: '2020-04-20T12:11:01.315Z',
                  operatorFirstNames: 'Mohammad',
                  operatorFamilyNameLocale: '',
                  operatorFamilyName: 'Ashraful',
                  operatorFirstNamesLocale: '',
                  operatorOfficeName: 'Baniajan Union Parishad',
                  operatorOfficeAlias: ['বানিয়াজান ইউনিয়ন পরিষদ'],
                  operationType: 'REGISTERED',
                  operatorRole: 'LOCAL_REGISTRAR'
                }
              ],
              childFamilyName: 'Bobita',
              childFamilyNameLocal: 'ববিতা',
              childDoB: '2018-08-01',
              gender: 'female',
              eventLocationId: 'c5ef7007-3100-45d1-99b9-cfe90021c758',
              informantFamilyName: 'Begum',
              informantFamilyNameLocal: 'বেগম',
              contactNumber: '+8801526972106',
              type: 'REGISTERED',
              dateOfDeclaration: '2020-04-20T12:11:01.315Z',
              trackingId: 'BFY2ECB',
              declarationLocationId: '5d88627e-879c-4631-aff8-f5789551cb2b',
              compositionType: 'birth-declaration',
              createdBy: 'f361cae7-205a-4251-9f31-125118da1625',
              updatedBy: '8d14843a-1c2e-4456-b5d1-420c7c9d9d78',
              modifiedAt: '1587384663775',
              registrationNumber: '20187210411000115'
            },
            sort: [1587384661315]
          }
        ]
      }
    },
    statusCode: 200,
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'content-length': '12943'
    },
    warnings: null,
    meta: {
      context: null,
      request: {
        params: {
          method: 'POST',
          path: '/ocrvs/_search',
          body: '{"query":{"match_all":{}},"sort":[{"dateOfDeclaration":"asc"}]}',
          querystring: '',
          headers: {
            'User-Agent':
              'elasticsearch-js/6.8.5 (darwin 18.7.0-x64; Node.js v13.5.0)',
            'Content-Type': 'application/json',
            'Content-Length': '63'
          },
          timeout: 30000
        },
        options: { ignore: [404], warnings: null },
        id: 269
      },
      name: 'elasticsearch-js',
      connection: {
        url: 'http://localhost:9200/',
        id: 'http://localhost:9200/',
        headers: {},
        deadCount: 0,
        resurrectTimeout: 0,
        _openRequests: 0,
        status: 'alive',
        roles: { master: true, data: true, ingest: true, ml: false }
      },
      attempts: 0,
      aborted: false
    }
  })
  fetchPractitionerRole.mockResolvedValue('FIELD_AGENT')
})
