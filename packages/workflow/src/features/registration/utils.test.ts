import {
  generateBirthTrackingId,
  generateDeathTrackingId,
  convertStringToASCII,
  sendEventNotification
} from '@workflow/features/registration/utils'
import { setTrackingId } from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import { logger } from '@workflow/logger'
import {
  testFhirBundle,
  testFhirBundleWithIdsForDeath
} from '@workflow/test/utils'
import { Events } from '@workflow/features/events/handler'

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
  it('send Birth registration notification successfully', async () => {
    const fhirBundle = setTrackingId(testFhirBundle)
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
  it('send Death registration notification successfully', async () => {
    const fhirBundle = setTrackingId(testFhirBundleWithIdsForDeath)
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
})
