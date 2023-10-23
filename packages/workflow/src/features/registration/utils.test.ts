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
import {
  generateTrackingIdForEvents,
  convertStringToASCII,
  sendEventNotification,
  getMosipUINToken
} from '@workflow/features/registration/utils'
import { setTrackingId } from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import { logger } from '@workflow/logger'
import {
  testFhirBundle,
  testFhirBundleWithIdsForDeath,
  officeMock,
  mosipDeceasedPatientMock,
  mosipSuccessMock
} from '@workflow/test/utils'
import { Events } from '@workflow/features/events/utils'
import * as fetchAny from 'jest-fetch-mock'
import { EVENT_TYPE } from '@workflow/features/registration/fhir/constants'

const fetch = fetchAny as any

describe('Verify utility functions', () => {
  beforeEach(async () => {
    fetch.resetMocks()
  })

  it('Generates proper birth tracking id successfully', async () => {
    const trackingId = generateTrackingIdForEvents(EVENT_TYPE.BIRTH)
    expect(trackingId).toBeDefined()
    expect(trackingId.length).toBe(7)
    expect(trackingId).toMatch(/^B/)
  })

  it('Generates proper death tracking id successfully', async () => {
    const trackingId = generateTrackingIdForEvents(EVENT_TYPE.DEATH)

    expect(trackingId).toBeDefined()
    expect(trackingId.length).toBe(7)
    expect(trackingId).toMatch(/^D/)
  })

  it('Generates proper marriage tracking id successfully', async () => {
    const trackingId = generateTrackingIdForEvents(EVENT_TYPE.MARRIAGE)

    expect(trackingId).toBeDefined()
    expect(trackingId.length).toBe(7)
    expect(trackingId).toMatch(/^M/)
  })

  it('Converts string to corresponding ascii successfully', async () => {
    const ascii = convertStringToASCII('B5WGYJE')

    expect(ascii).toBeDefined()
    expect(ascii).toBe('66538771897469')
  })

  it('send in-progress birth declaration notification successfully', async () => {
    const fhirBundle = setTrackingId(testFhirBundle)
    fetch.mockResponse(officeMock)
    expect(
      sendEventNotification(
        fhirBundle,
        Events.BIRTH_IN_PROGRESS_DEC,
        { sms: '01711111111', email: 'email@email.com' },
        {
          Authorization: 'bearer acd '
        }
      )
    ).resolves.not.toThrow()
  })
  it('send Birth declaration notification successfully', async () => {
    const fhirBundle = setTrackingId(testFhirBundle)
    fetch.mockResponse(officeMock)
    expect(
      sendEventNotification(
        fhirBundle,
        Events.BIRTH_NEW_DEC,
        { sms: '01711111111', email: 'email@email.com' },
        {
          Authorization: 'bearer acd '
        }
      )
    ).resolves.not.toThrow()
  })
  it('send Birth declaration notification logs an error in case of invalid data', async () => {
    const logSpy = jest.spyOn(logger, 'error')

    fetch.mockResponses([officeMock, { status: 200 }])
    fetch.mockRejectedValueOnce(new Error('Mock Error'))

    await sendEventNotification(
      testFhirBundle,
      Events.BIRTH_NEW_DEC,
      { sms: '01711111111', email: 'email@email.com' },
      {
        Authorization: 'bearer acd '
      }
    )
    expect(logSpy).toHaveBeenLastCalledWith(
      'Unable to send notification for error : Error: Mock Error'
    )
  })
  it('send mark birth registration notification successfully', async () => {
    const fhirBundle = setTrackingId(testFhirBundle)
    fetch.mockResponse(officeMock)
    //@ts-ignore
    fhirBundle.entry[1].resource.identifier.push({
      system: 'http://opencrvs.org/specs/id/birth-registration-number',
      value: '20196816020000129'
    })
    expect(
      sendEventNotification(
        fhirBundle,
        Events.BIRTH_MARK_REG,
        { sms: '01711111111', email: 'email@email.com' },
        {
          Authorization: 'bearer acd '
        }
      )
    ).resolves.not.toThrow()
  })
  it('send Birth registration notification logs an error in case of invalid data', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    fetch.mockResponses([officeMock, { status: 200 }])
    fetch.mockRejectedValueOnce(new Error('Mock Error'))
    await sendEventNotification(
      testFhirBundle,
      Events.BIRTH_NEW_DEC,
      { sms: '01711111111', email: 'email@email.com' },
      {
        Authorization: 'bearer acd '
      }
    )
    expect(logSpy).toHaveBeenLastCalledWith(
      'Unable to send notification for error : Error: Mock Error'
    )
  })
  it('send Birth rejection notification successfully', async () => {
    const fhirBundle = setTrackingId(testFhirBundle)
    fetch.mockResponse(officeMock)
    expect(
      sendEventNotification(
        fhirBundle,
        Events.BIRTH_MARK_VOID,
        { sms: '01711111111', email: 'email@email.com' },
        {
          Authorization: 'bearer acd '
        }
      )
    ).toBeDefined()
  })
  it('send in-progress death declaration notification successfully', async () => {
    const fhirBundle = setTrackingId(testFhirBundleWithIdsForDeath)
    fetch.mockResponse(officeMock)
    expect(
      sendEventNotification(
        fhirBundle,
        Events.DEATH_IN_PROGRESS_DEC,
        { sms: '01711111111', email: 'email@email.com' },
        {
          Authorization: 'bearer acd '
        }
      )
    ).toBeDefined()
  })
  it('send Death declaration notification successfully', async () => {
    const fhirBundle = setTrackingId(testFhirBundleWithIdsForDeath)
    fetch.mockResponse(officeMock)
    expect(
      sendEventNotification(
        fhirBundle,
        Events.DEATH_NEW_DEC,
        { sms: '01711111111', email: 'email@email.com' },
        {
          Authorization: 'bearer acd '
        }
      )
    ).toBeDefined()
  })
  it('send Death declaration notification logs an error in case of invalid data', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    fetch.mockResponses([officeMock, { status: 200 }])
    fetch.mockRejectedValueOnce(new Error('Mock Error'))
    await sendEventNotification(
      testFhirBundleWithIdsForDeath,
      Events.DEATH_NEW_DEC,
      { sms: '01711111111', email: 'email@email.com' },
      {
        Authorization: 'bearer acd '
      }
    )
    expect(logSpy).toHaveBeenLastCalledWith(
      'Unable to send notification for error : Error: Mock Error'
    )
  })
  it('send mark death registration notification successfully', async () => {
    const fhirBundle = setTrackingId(testFhirBundleWithIdsForDeath)
    //@ts-ignore
    fhirBundle.entry[1].resource.identifier.push({
      system: 'http://opencrvs.org/specs/id/death-registration-number',
      value: '20196816020000129'
    })
    fetch.mockResponses([officeMock, { status: 200 }])
    expect(
      sendEventNotification(
        fhirBundle,
        Events.DEATH_MARK_REG,
        { sms: '01711111111', email: 'email@email.com' },
        {
          Authorization: 'bearer acd '
        }
      )
    ).toBeDefined()
  })
  it('send Death registration notification logs an error in case of invalid data', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    fetch.mockResponses([officeMock, { status: 200 }])
    fetch.mockRejectedValueOnce(new Error('Mock Error'))
    await sendEventNotification(
      testFhirBundleWithIdsForDeath,
      Events.DEATH_MARK_REG,
      { sms: '01711111111', email: 'email@email.com' },
      {
        Authorization: 'bearer acd '
      }
    )
    expect(logSpy).toHaveBeenLastCalledWith(
      'Unable to send notification for error : Error: Mock Error'
    )
  })
  it('send Death rejection notification successfully', async () => {
    const fhirBundle = setTrackingId(testFhirBundleWithIdsForDeath)
    fetch.mockResponses([officeMock, { status: 200 }])
    expect(
      sendEventNotification(
        fhirBundle,
        Events.DEATH_MARK_VOID,
        { sms: '01711111111', email: 'email@email.com' },
        {
          Authorization: 'bearer acd '
        }
      )
    ).toBeDefined()
  })
  it('send Death declaration notification successfully', async () => {
    const fhirBundle = setTrackingId(testFhirBundleWithIdsForDeath)
    fetch.mockResponses([officeMock, { status: 200 }])
    expect(
      sendEventNotification(
        fhirBundle,
        Events.DEATH_NEW_DEC,
        { sms: '01711111111', email: 'email@email.com' },
        {
          Authorization: 'bearer acd '
        }
      )
    ).toBeDefined()
  })
})

describe('getMosipUINToken functions', () => {
  it('Calls mosip token seeder function and returns success', async () => {
    fetch.mockResponse(mosipSuccessMock)
    const mosipResponse = await getMosipUINToken(mosipDeceasedPatientMock)
    const response = await JSON.parse(mosipSuccessMock)
    expect(mosipResponse).toEqual(response)
  })
})
