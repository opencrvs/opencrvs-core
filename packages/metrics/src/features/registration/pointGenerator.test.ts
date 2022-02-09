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
  generateApplicationStartedPoint,
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

describe('Verify point generation', () => {
  it('Return valid birth registration point to insert in influx', async () => {
    Date.prototype.toISOString = jest.fn(() => '2019-03-12T07:35:42.043Z')
    fetchLocation.mockReset()
    fetchParentLocationByLocationID
      .mockResolvedValueOnce('Location/4')
      .mockResolvedValueOnce('Location/3')
      .mockResolvedValueOnce('Location/2')
    const point = await generateBirthRegPoint(
      cloneDeep(testPayload),
      'mark-existing-application-registered',
      AUTH_HEADER
    )
    expect(point).toMatchObject({
      measurement: 'birth_reg',
      tags: {
        regStatus: 'mark-existing-application-registered',
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
    fetchLocation.mockReset()
    fetchLocation.mockResolvedValueOnce({})

    const point = await generateBirthRegPoint(
      payload,
      'mark-existing-application-registered',
      AUTH_HEADER
    )
    expect(point).toMatchObject({
      measurement: 'birth_reg',
      tags: {
        regStatus: 'mark-existing-application-registered',
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
    fetchLocation.mockReset()
    fetchParentLocationByLocationID
      .mockResolvedValueOnce('Location/4')
      .mockResolvedValueOnce(null)
    const point = await generateBirthRegPoint(
      cloneDeep(testPayload),
      'mark-existing-application-registered',
      AUTH_HEADER
    )
    expect(point).toMatchObject({
      measurement: 'birth_reg',
      tags: {
        regStatus: 'mark-existing-application-registered',
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
        'mark-existing-application-registered',
        AUTH_HEADER
      )
    ).rejects.toThrowError('No child found!')
  })
  it('Return valid death registration point to insert in influx', async () => {
    Date.prototype.toISOString = jest.fn(() => '2019-03-12T07:35:42.043Z')
    fetchLocation.mockReset()
    fetchParentLocationByLocationID
      .mockResolvedValueOnce('Location/4')
      .mockResolvedValueOnce('Location/3')
      .mockResolvedValueOnce('Location/2')
    const point = await generateDeathRegPoint(
      cloneDeep(testDeathPayload),
      'mark-existing-application-registered',
      AUTH_HEADER
    )
    expect(point).toMatchObject({
      measurement: 'death_reg',
      tags: {
        regStatus: 'mark-existing-application-registered',
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
        'mark-existing-application-registered',
        AUTH_HEADER
      )
    ).rejects.toThrowError('No section found for given code: deceased-details')
  })
  it('returns payment point', async () => {
    const point = await generatePaymentPoint(
      cloneDeep(testDeathCertPayload),
      AUTH_HEADER
    )
    expect(point).toMatchObject({
      measurement: 'certification_payment',
      tags: {
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
    expect(generatePaymentPoint(payload, AUTH_HEADER)).rejects.toThrowError(
      'Task not found'
    )
  })
  it('Throw error when no reconciliation found for payment point', () => {
    const payload = cloneDeep(testDeathCertPayload)
    // @ts-ignore
    payload.entry[4] = {}
    expect(generatePaymentPoint(payload, AUTH_HEADER)).rejects.toThrowError(
      'Payment reconciliation not found'
    )
  })
  it('returns applications started point for field agent', async () => {
    fetchLocation.mockReset()
    fetchParentLocationByLocationID
      .mockResolvedValueOnce('Location/4')
      .mockResolvedValueOnce('Location/3')
      .mockResolvedValueOnce('Location/2')
    const point = await generateApplicationStartedPoint(
      cloneDeep(testDeclaration),
      AUTH_HEADER,
      Events.NEW_DEC
    )
    expect(point).toMatchObject({
      measurement: 'applications_started',
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
  it('returns applications started point for registration agent', async () => {
    fetchLocation.mockReset()
    fetchParentLocationByLocationID
      .mockResolvedValueOnce('Location/4')
      .mockResolvedValueOnce('Location/3')
      .mockResolvedValueOnce('Location/2')
    const point = await generateApplicationStartedPoint(
      cloneDeep(testDeclaration),
      AUTH_HEADER,
      Events.NEW_VALIDATE
    )
    expect(point).toMatchObject({
      measurement: 'applications_started',
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
  it('returns applications started point for registrar', async () => {
    fetchLocation.mockReset()
    fetchParentLocationByLocationID
      .mockResolvedValueOnce('Location/4')
      .mockResolvedValueOnce('Location/3')
      .mockResolvedValueOnce('Location/2')
    const point = await generateApplicationStartedPoint(
      cloneDeep(testDeclaration),
      AUTH_HEADER,
      Events.NEW_WAITING_VALIDATION
    )
    expect(point).toMatchObject({
      measurement: 'applications_started',
      tags: {
        eventType: 'BIRTH',
        practitionerId: 'cae39955-557d-49d3-bc79-521f86f9a182',
        locationLevel4: 'Location/4',
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
  it('returns applications started point for field agent', async () => {
    fetchLocation.mockReset()
    fetchParentLocationByLocationID
      .mockResolvedValueOnce('Location/4')
      .mockResolvedValueOnce('Location/3')
      .mockResolvedValueOnce('Location/2')
    const point = await generateApplicationStartedPoint(
      cloneDeep(testDeclaration),
      AUTH_HEADER,
      Events.IN_PROGRESS_DEC
    )
    expect(point).toMatchObject({
      measurement: 'applications_started',
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
  it('returns applications started point for notification api', async () => {
    const payload = cloneDeep(testDeclaration)
    // @ts-ignore
    payload.entry[0].resource.type?.coding[0].code = 'birth-notification'
    fetchLocation.mockReset()
    fetchParentLocationByLocationID
      .mockResolvedValueOnce('Location/4')
      .mockResolvedValueOnce('Location/3')
      .mockResolvedValueOnce('Location/2')
    const point = await generateApplicationStartedPoint(
      cloneDeep(payload),
      AUTH_HEADER,
      Events.IN_PROGRESS_DEC
    )
    expect(point).toMatchObject({
      measurement: 'applications_started',
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
        role: 'NOTIFICATION_API_USER'
      }
    })
  })
  it('returns rejected point', async () => {
    const payload = require('./test-data/rejected.json')
    const taskHistory = require('./test-data/task-history.json')
    // @ts-ignore
    fetchLocation.mockReset()
    fetchTaskHistory.mockResolvedValueOnce(taskHistory)
    fetchParentLocationByLocationID
      .mockResolvedValueOnce('Location/4')
      .mockResolvedValueOnce('Location/3')
      .mockResolvedValueOnce('Location/2')
    const point = await generateRejectedPoints(payload, AUTH_HEADER)
    expect(point).toMatchObject({
      measurement: 'applications_rejected',
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
