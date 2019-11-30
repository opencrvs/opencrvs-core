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
  generatePaymentPoint
} from '@metrics/features/registration/pointGenerator'
import {
  testPayload,
  testDeathPayload,
  testDeathCertPayload
} from '@metrics/features/registration/testUtils'
import { cloneDeep } from 'lodash'

import * as api from '@metrics/api'
const fetchLocation = api.fetchLocation as jest.Mock
const fetchParentLocationByLocationID = api.fetchParentLocationByLocationID as jest.Mock

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
      {
        Authorization: 'Bearer mock-token'
      }
    )
    expect(point).toEqual({
      measurement: 'birth_reg',
      tags: {
        regStatus: 'mark-existing-application-registered',
        gender: 'male'
      },
      fields: {
        compositionId: 'b2fbb82c-a68d-4793-98e1-87484fc785c4',
        locationLevel5: 'Location/308c35b4-04f8-4664-83f5-9790e790cde1',
        locationLevel4: 'Location/4',
        locationLevel3: 'Location/3',
        locationLevel2: 'Location/2',
        ageInDays: 435
      }
    })
  })
  it('Only populates level5 location data if rest of the tree is missing', async () => {
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
      {
        Authorization: 'Bearer mock-token'
      }
    )
    expect(point).toEqual({
      measurement: 'birth_reg',
      tags: {
        regStatus: 'mark-existing-application-registered',
        gender: 'male'
      },
      fields: {
        compositionId: 'b2fbb82c-a68d-4793-98e1-87484fc785c4',
        locationLevel5: 'Location/308c35b4-04f8-4664-83f5-9790e790cde1',
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
      {
        Authorization: 'Bearer mock-token'
      }
    )
    expect(point).toEqual({
      measurement: 'birth_reg',
      tags: {
        regStatus: 'mark-existing-application-registered',
        gender: 'male'
      },
      fields: {
        compositionId: 'b2fbb82c-a68d-4793-98e1-87484fc785c4',
        locationLevel5: 'Location/308c35b4-04f8-4664-83f5-9790e790cde1',
        locationLevel4: 'Location/4',
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
      generateBirthRegPoint(payload, 'mark-existing-application-registered', {
        Authorization: 'Bearer mock-token'
      })
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
      {
        Authorization: 'Bearer mock-token'
      }
    )
    expect(point).toEqual({
      measurement: 'death_reg',
      tags: {
        regStatus: 'mark-existing-application-registered',
        gender: 'male',
        causeOfDeath: 'Old age',
        mannerOfDeath: 'NATURAL_CAUSES'
      },
      fields: {
        compositionId: 'ef8b8775-5770-4bf7-8fba-e0ba4d334433',
        locationLevel5: 'Location/9a3c7389-bf06-4f42-b1b3-202ced23b3af',
        locationLevel4: 'Location/4',
        locationLevel3: 'Location/3',
        locationLevel2: 'Location/2',
        ageInYears: 43
      }
    })
  })
  it('Throw error when no deceased found', () => {
    const payload = cloneDeep(testDeathPayload)
    // @ts-ignore
    payload.entry[0] = {}
    expect(
      generateDeathRegPoint(payload, 'mark-existing-application-registered', {
        Authorization: 'Bearer mock-token'
      })
    ).rejects.toThrowError('No section found for given code: deceased-details')
  })
  it('returns payment point', async () => {
    const point = await generatePaymentPoint(cloneDeep(testDeathCertPayload))
    expect(point).toEqual({
      measurement: 'certification_payment',
      tags: {
        eventType: 'DEATH'
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
    expect(generatePaymentPoint(payload)).rejects.toThrowError('Task not found')
  })
  it('Throw error when no reconciliation found for payment point', () => {
    const payload = cloneDeep(testDeathCertPayload)
    // @ts-ignore
    payload.entry[4] = {}
    expect(generatePaymentPoint(payload)).rejects.toThrowError(
      'Payment reconciliation not found'
    )
  })
})
