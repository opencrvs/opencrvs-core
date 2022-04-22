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
import {
  generateBirthRegPoint,
  generateDeathRegPoint,
  generatePaymentPoint,
  generateDeclarationStartedPoint,
  generateRejectedPoints
} from '@metrics/features/registration/pointGenerator'
import {
  testDeclaration,
  testPayload,
  testDeathPayload,
  testDeathCertPayload
} from '@metrics/features/registration/testUtils'
import { cloneDeep } from 'lodash'
import { Events } from '@metrics/features/metrics/constants'

import * as api from '@metrics/api'

const fetchLocation = api.fetchLocation as jest.Mock
const fetchParentLocationByLocationID =
  api.fetchParentLocationByLocationID as jest.Mock
const fetchTaskHistory = api.fetchTaskHistory as jest.Mock

const AUTH_HEADER = {
  Authorization: 'Bearer mock-token'
}

export const location = {
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
        data:
          // tslint:disable: max-line-length
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

beforeEach(() => {
  fetchLocation.mockReset()
  fetchLocation.mockResolvedValueOnce(location)
})

describe('Verify point generation', () => {
  it('Return valid birth registration point to insert in influx', async () => {
    Date.prototype.toISOString = jest.fn(() => '2019-03-12T07:35:42.043Z')
    fetchParentLocationByLocationID
      .mockResolvedValueOnce('Location/4')
      .mockResolvedValueOnce('Location/3')
      .mockResolvedValueOnce('Location/2')

    const point = await generateBirthRegPoint(
      cloneDeep(testPayload),
      'mark-existing-declaration-registered',
      AUTH_HEADER
    )

    expect(point).toMatchObject({
      measurement: 'birth_reg',
      tags: {
        regStatus: 'mark-existing-declaration-registered',
        gender: 'male',
        officeLocation: 'Location/b49503bf-531d-4642-ae1b-13f647b88ec6',
        locationLevel5: 'Location/308c35b4-04f8-4664-83f5-9790e790cde1',
        locationLevel4: 'Location/4',
        locationLevel3: 'Location/3',
        locationLevel2: 'Location/2'
      },
      fields: {
        compositionId: 'b2fbb82c-a68d-4793-98e1-87484fc785c4',
        ageInDays: 435
      }
    })
  })
  it('Only populates level5 and office location data if rest of the tree is missing', async () => {
    const payload = cloneDeep(testPayload)

    // @ts-ignore
    payload.entry[2].resource = {
      resourceType: 'Patient',
      active: true,
      id: '3b5c1496-2794-4deb-aba0-c3c034695029',
      name: [
        {
          use: 'bn',
          family: ['মকবুলনিউ']
        }
      ],
      gender: 'male'
    }

    Date.prototype.toISOString = jest.fn(() => '2019-03-12T07:35:42.043Z')

    const point = await generateBirthRegPoint(
      payload,
      'mark-existing-declaration-registered',
      AUTH_HEADER
    )
    expect(point).toMatchObject({
      measurement: 'birth_reg',
      tags: {
        regStatus: 'mark-existing-declaration-registered',
        gender: 'male',
        officeLocation: 'Location/b49503bf-531d-4642-ae1b-13f647b88ec6',
        locationLevel5: 'Location/308c35b4-04f8-4664-83f5-9790e790cde1'
      },
      fields: {
        compositionId: 'b2fbb82c-a68d-4793-98e1-87484fc785c4',
        ageInDays: undefined
      }
    })
  })
  it('Populates partial location tree in-case data unavailibility', async () => {
    Date.prototype.toISOString = jest.fn(() => '2019-03-12T07:35:42.043Z')

    fetchParentLocationByLocationID
      .mockResolvedValueOnce('Location/4')
      .mockResolvedValueOnce(null)
    const point = await generateBirthRegPoint(
      cloneDeep(testPayload),
      'mark-existing-declaration-registered',
      AUTH_HEADER
    )
    expect(point).toMatchObject({
      measurement: 'birth_reg',
      tags: {
        regStatus: 'mark-existing-declaration-registered',
        gender: 'male',
        officeLocation: 'Location/b49503bf-531d-4642-ae1b-13f647b88ec6',
        locationLevel5: 'Location/308c35b4-04f8-4664-83f5-9790e790cde1',
        locationLevel4: 'Location/4'
      },
      fields: {
        compositionId: 'b2fbb82c-a68d-4793-98e1-87484fc785c4',
        ageInDays: 435
      }
    })
  })
  it('Throw error when no child section found', () => {
    const payload = cloneDeep(testPayload)
    // @ts-ignore
    payload.entry[2] = {
      fullUrl: 'urn:uuid:048d3e42-40c3-4e46-81f0-e3869251b74a'
    }
    expect(
      generateBirthRegPoint(
        payload,
        'mark-existing-declaration-registered',
        AUTH_HEADER
      )
    ).rejects.toThrowError('No child found!')
  })
  it('Return valid death registration point to insert in influx', async () => {
    Date.prototype.toISOString = jest.fn(() => '2019-03-12T07:35:42.043Z')

    fetchParentLocationByLocationID
      .mockResolvedValueOnce('Location/4')
      .mockResolvedValueOnce('Location/3')
      .mockResolvedValueOnce('Location/2')
    const point = await generateDeathRegPoint(
      cloneDeep(testDeathPayload),
      'mark-existing-declaration-registered',
      AUTH_HEADER
    )
    expect(point).toMatchObject({
      measurement: 'death_reg',
      tags: {
        regStatus: 'mark-existing-declaration-registered',
        gender: 'male',
        causeOfDeath: 'Old age',
        mannerOfDeath: 'NATURAL_CAUSES',
        officeLocation: 'Location/232ed3db-6b3f-4a5c-875e-f57aacadb2d3',
        locationLevel5: 'Location/9a3c7389-bf06-4f42-b1b3-202ced23b3af',
        locationLevel4: 'Location/4',
        locationLevel3: 'Location/3',
        locationLevel2: 'Location/2'
      },
      fields: {
        compositionId: 'ef8b8775-5770-4bf7-8fba-e0ba4d334433',
        ageInYears: 43,
        deathDays: -53
      }
    })
  })
  it('Throw error when no deceased found', () => {
    const payload = cloneDeep(testDeathPayload)
    // @ts-ignore
    payload.entry[0] = {}
    expect(
      generateDeathRegPoint(
        payload,
        'mark-existing-declaration-registered',
        AUTH_HEADER
      )
    ).rejects.toThrowError('No section found for given code: deceased-details')
  })
  it('returns payment point', async () => {
    const point = await generatePaymentPoint(
      cloneDeep(testDeathCertPayload),
      AUTH_HEADER,
      'certification'
    )
    expect(point).toMatchObject({
      measurement: 'payment',
      tags: {
        paymentType: 'certification',
        eventType: 'DEATH',
        officeLocation: 'Location/232ed3db-6b3f-4a5c-875e-f57aacadb2d3',
        locationLevel5: 'Location/9a3c7389-bf06-4f42-b1b3-202ced23b3af'
      },
      fields: {
        compositionId: 'ef8b8775-5770-4bf7-8fba-e0ba4d334433',
        total: 25
      }
    })
  })
  it('Throw error when no task found to attribute to event for payment point', () => {
    const payload = cloneDeep(testDeathCertPayload)
    // @ts-ignore
    payload.entry[1] = {}
    expect(
      generatePaymentPoint(payload, AUTH_HEADER, 'certification')
    ).rejects.toThrowError('Task not found')
  })
  it('Throw error when no reconciliation found for payment point', () => {
    const payload = cloneDeep(testDeathCertPayload)
    // @ts-ignore
    payload.entry[4] = {}
    expect(
      generatePaymentPoint(payload, AUTH_HEADER, 'certification')
    ).rejects.toThrowError('Payment reconciliation not found')
  })
  it('returns declarations started point for field agent', async () => {
    fetchParentLocationByLocationID
      .mockResolvedValueOnce('Location/4')
      .mockResolvedValueOnce('Location/3')
      .mockResolvedValueOnce('Location/2')
    const point = await generateDeclarationStartedPoint(
      cloneDeep(testDeclaration),
      AUTH_HEADER,
      Events.NEW_DEC
    )
    expect(point).toMatchObject({
      measurement: 'declarations_started',
      tags: {
        eventType: 'BIRTH',
        practitionerId: 'cae39955-557d-49d3-bc79-521f86f9a182',
        officeLocation: 'Location/232ed3db-6b3f-4a5c-875e-f57aacadb2d3',
        locationLevel4: 'Location/4',
        locationLevel3: 'Location/3',
        locationLevel2: 'Location/2',
        locationLevel5: 'Location/9a3c7389-bf06-4f42-b1b3-202ced23b3af'
      },
      fields: {
        compositionId: '9f24f539-8126-4261-baa0-243eea374004',
        status: 'DECLARED',
        role: 'FIELD_AGENT'
      }
    })
  })
  it('returns declarations started point for registration agent', async () => {
    fetchParentLocationByLocationID
      .mockResolvedValueOnce('Location/4')
      .mockResolvedValueOnce('Location/3')
      .mockResolvedValueOnce('Location/2')
    const point = await generateDeclarationStartedPoint(
      cloneDeep(testDeclaration),
      AUTH_HEADER,
      Events.REQUEST_FOR_REGISTRAR_VALIDATION
    )
    expect(point).toMatchObject({
      measurement: 'declarations_started',
      tags: {
        eventType: 'BIRTH',
        practitionerId: 'cae39955-557d-49d3-bc79-521f86f9a182',
        officeLocation: 'Location/232ed3db-6b3f-4a5c-875e-f57aacadb2d3',
        locationLevel4: 'Location/4',
        locationLevel3: 'Location/3',
        locationLevel2: 'Location/2',
        locationLevel5: 'Location/9a3c7389-bf06-4f42-b1b3-202ced23b3af'
      },
      fields: {
        compositionId: '9f24f539-8126-4261-baa0-243eea374004',
        status: 'DECLARED',
        role: 'REGISTRATION_AGENT'
      }
    })
  })
  it('returns declarations started point for registrar', async () => {
    fetchParentLocationByLocationID
      .mockResolvedValueOnce('Location/4')
      .mockResolvedValueOnce('Location/3')
      .mockResolvedValueOnce('Location/2')
    const point = await generateDeclarationStartedPoint(
      cloneDeep(testDeclaration),
      AUTH_HEADER,
      Events.REGISTRAR_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION
    )
    expect(point).toMatchObject({
      measurement: 'declarations_started',
      tags: {
        locationLevel3: 'Location/3',
        locationLevel2: 'Location/2',
        officeLocation: 'Location/232ed3db-6b3f-4a5c-875e-f57aacadb2d3',
        locationLevel5: 'Location/9a3c7389-bf06-4f42-b1b3-202ced23b3af'
      },
      fields: {
        compositionId: '9f24f539-8126-4261-baa0-243eea374004',
        status: 'DECLARED',
        role: 'REGISTRAR'
      }
    })
  })
  it('returns declarations started point for field agent', async () => {
    fetchParentLocationByLocationID
      .mockResolvedValueOnce('Location/4')
      .mockResolvedValueOnce('Location/3')
      .mockResolvedValueOnce('Location/2')
    const point = await generateDeclarationStartedPoint(
      cloneDeep(testDeclaration),
      AUTH_HEADER,
      Events.IN_PROGRESS_DEC
    )
    expect(point).toMatchObject({
      measurement: 'declarations_started',
      tags: {
        eventType: 'BIRTH',
        practitionerId: 'cae39955-557d-49d3-bc79-521f86f9a182',
        officeLocation: 'Location/232ed3db-6b3f-4a5c-875e-f57aacadb2d3',
        locationLevel4: 'Location/4',
        locationLevel3: 'Location/3',
        locationLevel2: 'Location/2',
        locationLevel5: 'Location/9a3c7389-bf06-4f42-b1b3-202ced23b3af'
      },
      fields: {
        compositionId: '9f24f539-8126-4261-baa0-243eea374004',
        status: 'DECLARED',
        role: 'FIELD_AGENT'
      }
    })
  })
  it('returns declarations started point for notification api', async () => {
    const payload = cloneDeep(testDeclaration)
    // @ts-ignore
    payload.entry[0].resource.type?.coding[0].code = 'birth-notification'

    fetchParentLocationByLocationID
      .mockResolvedValueOnce('Location/4')
      .mockResolvedValueOnce('Location/3')
      .mockResolvedValueOnce('Location/2')
    const point = await generateDeclarationStartedPoint(
      cloneDeep(payload),
      AUTH_HEADER,
      Events.IN_PROGRESS_DEC
    )
    expect(point).toMatchObject({
      measurement: 'declarations_started',
      tags: {
        locationLevel4: 'Location/4',
        locationLevel3: 'Location/3',
        locationLevel2: 'Location/2',
        locationLevel5: 'Location/9a3c7389-bf06-4f42-b1b3-202ced23b3af'
      },
      fields: {
        compositionId: '9f24f539-8126-4261-baa0-243eea374004',
        status: 'DECLARED',
        role: 'NOTIFICATION_API_USER'
      }
    })
  })
  it('returns rejected point', async () => {
    const payload = require('./test-data/rejected.json')
    const taskHistory = require('./test-data/task-history.json')

    fetchTaskHistory.mockResolvedValueOnce(taskHistory)
    fetchParentLocationByLocationID
      .mockResolvedValueOnce('Location/4')
      .mockResolvedValueOnce('Location/3')
      .mockResolvedValueOnce('Location/2')
    const point = await generateRejectedPoints(payload, AUTH_HEADER)
    expect(point).toMatchObject({
      measurement: 'declarations_rejected',
      tags: {
        eventType: 'BIRTH',
        startedBy: 'fe16875f-3e5f-47bc-85d6-16482a63e7df',
        officeLocation: 'Location/2a520dc1-0a9a-48a1-a4b8-66f3075a9155',
        locationLevel4: 'Location/4',
        locationLevel3: 'Location/3',
        locationLevel2: 'Location/2',
        locationLevel5: 'Location/acb24f46-83ec-45c3-b00f-5ded939ecfd8'
      },
      fields: {
        compositionId: '81278acf-6105-435e-b1c2-91619c8cf6e1'
      }
    })
  })
})
