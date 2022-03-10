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
  generateBirthTrackingId,
  generateDeathTrackingId,
  convertStringToASCII,
  sendEventNotification,
  hasReinstatedExtension
} from '@workflow/features/registration/utils'
import { setTrackingId } from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import { logger } from '@workflow/logger'
import {
  testFhirBundle,
  testFhirBundleWithIdsForDeath,
  testFhirTaskBundle,
  officeMock
} from '@workflow/test/utils'
import { Events } from '@workflow/features/events/handler'
import { REINSTATED_EXTENSION_URL } from '@workflow/features/task/fhir/constants'

import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

describe('Verify utility functions', () => {
  it('Generates proper birth tracking id successfully', async () => {
    const trackingId = generateBirthTrackingId()

    expect(trackingId).toBeDefined()
    expect(trackingId.length).toBe(7)
    expect(trackingId).toMatch(/^B/)
  })

  it('Generates proper death tracking id successfully', async () => {
    const trackingId = generateDeathTrackingId()

    expect(trackingId).toBeDefined()
    expect(trackingId.length).toBe(7)
    expect(trackingId).toMatch(/^D/)
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
        '01711111111',
        {
          Authorization: 'bearer acd '
        }
      )
    ).toBeDefined()
  })
  it('send Birth declaration notification successfully', async () => {
    const fhirBundle = setTrackingId(testFhirBundle)
    expect(
      sendEventNotification(fhirBundle, Events.BIRTH_NEW_DEC, '01711111111', {
        Authorization: 'bearer acd '
      })
    ).toBeDefined()
  })
  it('send Birth declaration notification logs an error in case of invalid data', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    fetch.mockImplementationOnce(() => {
      throw new Error('Mock Error')
    })
    await sendEventNotification(
      testFhirBundle,
      Events.BIRTH_NEW_DEC,
      '01711111111',
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
    //@ts-ignore
    fhirBundle.entry[1].resource.identifier.push({
      system: 'http://opencrvs.org/specs/id/birth-registration-number',
      value: '20196816020000129'
    })
    expect(
      sendEventNotification(fhirBundle, Events.BIRTH_MARK_REG, '01711111111', {
        Authorization: 'bearer acd '
      })
    ).toBeDefined()
  })
  it('send Birth registration notification logs an error in case of invalid data', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    fetch.mockImplementationOnce(() => {
      throw new Error('Mock Error')
    })
    sendEventNotification(
      testFhirBundle,
      Events.BIRTH_MARK_REG,
      '01711111111',
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
    expect(
      sendEventNotification(fhirBundle, Events.BIRTH_MARK_VOID, '01711111111', {
        Authorization: 'bearer acd '
      })
    ).toBeDefined()
  })
  it('send in-progress death declaration notification successfully', async () => {
    const fhirBundle = setTrackingId(testFhirBundleWithIdsForDeath)
    fetch.mockResponse(officeMock)
    expect(
      sendEventNotification(
        fhirBundle,
        Events.DEATH_IN_PROGRESS_DEC,
        '01711111111',
        {
          Authorization: 'bearer acd '
        }
      )
    ).toBeDefined()
  })
  it('send Death declaration notification successfully', async () => {
    const fhirBundle = setTrackingId(testFhirBundleWithIdsForDeath)
    expect(
      sendEventNotification(fhirBundle, Events.DEATH_NEW_DEC, '01711111111', {
        Authorization: 'bearer acd '
      })
    ).toBeDefined()
  })
  it('send Death declaration notification logs an error in case of invalid data', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    fetch.mockImplementationOnce(() => {
      throw new Error('Mock Error')
    })
    await sendEventNotification(
      testFhirBundleWithIdsForDeath,
      Events.DEATH_NEW_DEC,
      '01711111111',
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
    expect(
      sendEventNotification(fhirBundle, Events.DEATH_MARK_REG, '01711111111', {
        Authorization: 'bearer acd '
      })
    ).toBeDefined()
  })
  it('send Death registration notification logs an error in case of invalid data', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    fetch.mockImplementationOnce(() => {
      throw new Error('Mock Error')
    })
    sendEventNotification(
      testFhirBundleWithIdsForDeath,
      Events.DEATH_MARK_REG,
      '01711111111',
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
    expect(
      sendEventNotification(fhirBundle, Events.DEATH_MARK_VOID, '01711111111', {
        Authorization: 'bearer acd '
      })
    ).toBeDefined()
  })
  it('send Death declaration notification successfully', async () => {
    const fhirBundle = setTrackingId(testFhirBundleWithIdsForDeath)
    expect(
      sendEventNotification(fhirBundle, Events.DEATH_NEW_DEC, '01711111111', {
        Authorization: 'bearer acd '
      })
    ).toBeDefined()
  })

  describe('hasReinstatedExtension()', () => {
    it('should return false if task has no reinstated extension', () => {
      expect(
        hasReinstatedExtension(testFhirTaskBundle.entry[0].resource)
      ).toBeFalsy()
    })

    it('should return true if task has reinstated extension', () => {
      const mockTask = {
        ...testFhirTaskBundle.entry[0].resource,
        extension: [
          {
            url: REINSTATED_EXTENSION_URL,
            valueString: 'DECLARED'
          }
        ]
      }
      expect(hasReinstatedExtension(mockTask)).toBeTruthy()
    })
  })
})
