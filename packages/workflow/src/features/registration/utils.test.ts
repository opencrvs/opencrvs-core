import {
  generateBirthTrackingId,
  generateDeathTrackingId,
  sendBirthNotification,
  convertStringToASCII,
  sendEventNotification
} from './utils'
import { setTrackingId } from './fhir/fhir-bundle-modifier'
import { logger } from '../../logger'
import * as fetch from 'jest-fetch-mock'
import { testFhirBundle } from 'src/test/utils'

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

    expect(ascii).toBeDefined
    expect(ascii).toBe('66538771897469')
  })

  it('send Birth notification successfully', async () => {
    const fhirBundle = setTrackingId(testFhirBundle)
    expect(
      sendEventNotification(fhirBundle, '01711111111', {
        Authorization: 'bearer acd '
      })
    ).toBeDefined()
  })
  it('send Birth notification logs an error in case of invalid data', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    fetch.mockImplementationOnce(() => {
      throw new Error('Mock Error')
    })
    sendEventNotification(testFhirBundle, '01711111111', {
      Authorization: 'bearer acd '
    })
    expect(logSpy).toHaveBeenLastCalledWith(
      'Unable to send notification for error : Error: Mock Error'
    )
  })
})
