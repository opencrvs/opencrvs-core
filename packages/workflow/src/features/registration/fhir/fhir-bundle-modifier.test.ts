import {
  pushTrackingId,
  pushBRN,
  setupRegistrationType,
  setupRegistrationWorkflow,
  setupLastRegUser,
  setupAuthorOnNotes
} from './fhir-bundle-modifier'
import { OPENCRVS_SPECIFICATION_URL, EVENT_TYPE } from './constants'
import { testFhirBundle } from 'src/test/utils'
import { cloneDeep } from 'lodash'

describe('Verify fhir bundle modifier functions', () => {
  describe('PushTrackingId', () => {
    it('Successfully modified the provided fhirBundle with trackingid', () => {
      const fhirBundle = pushTrackingId(testFhirBundle)
      const composition = fhirBundle.entry[0].resource as fhir.Composition
      const task = fhirBundle.entry[1].resource as fhir.Task

      expect(composition.identifier.value).toMatch(/^B/)
      expect(composition.identifier.value.length).toBe(7)
      expect(task.identifier[0]).toEqual({
        system: `${OPENCRVS_SPECIFICATION_URL}id/birth-tracking-id`,
        value: composition.identifier.value
      })
    })

    it('Throws error if invalid fhir bundle is provided', () => {
      const invalidData = { ...testFhirBundle, entry: [] }
      expect(() => pushTrackingId(invalidData)).toThrowError(
        'Invalid FHIR bundle found for declaration'
      )
    })

    it('Will push the composite resource identifier if it is missing on fhirDoc', () => {
      const fhirBundle = pushTrackingId({
        ...testFhirBundle,
        entry: [{ resource: {} }]
      })
      const composition = fhirBundle.entry[0].resource as fhir.Composition

      expect(composition.identifier.value).toMatch(/^B/)
      expect(composition.identifier.value.length).toBe(7)
    })
  })
  describe('SetupRegistrationType', () => {
    it('Will push the proper event type on fhirDoc', () => {
      const fhirBundle = setupRegistrationType(testFhirBundle, EVENT_TYPE.BIRTH)

      expect(fhirBundle.entry[1].resource.code.coding[0].code).toBeDefined()
      expect(fhirBundle.entry[1].resource.code.coding[0].code).toEqual(
        EVENT_TYPE.BIRTH.toString()
      )
    })

    it('Will push code section with proper event type on fhirDoc if it is missing', () => {
      let fhirBundle = cloneDeep(testFhirBundle)
      fhirBundle.entry[1].resource.code = undefined
      fhirBundle = setupRegistrationType(fhirBundle, EVENT_TYPE.BIRTH)

      expect(fhirBundle.entry[1].resource.code).toBeDefined()
      expect(fhirBundle.entry[1].resource.code).toEqual({
        coding: [
          {
            system: `${OPENCRVS_SPECIFICATION_URL}types`,
            code: EVENT_TYPE.BIRTH.toString()
          }
        ]
      })
    })
  })
  describe('SetupRegistrationWorkflow', () => {
    it('Will push the registration status on fhirDoc', () => {
      const tokenPayload = {
        iss: '',
        iat: 1541576965,
        exp: 1573112965,
        aud: '',
        subject: '1',
        scope: ['declare']
      }
      const fhirBundle = setupRegistrationWorkflow(testFhirBundle, tokenPayload)

      expect(
        fhirBundle.entry[1].resource.businessStatus.coding[0].code
      ).toBeDefined()
      expect(
        fhirBundle.entry[1].resource.businessStatus.coding[0].code
      ).toEqual('DECLARED')
    })
    it('Will update existing registration status on fhirDoc', () => {
      const tokenPayload = {
        iss: '',
        iat: 1541576965,
        exp: 1573112965,
        aud: '',
        subject: '1',
        scope: ['register']
      }
      let fhirBundle = cloneDeep(testFhirBundle)
      fhirBundle.entry[1].resource.businessStatus = {
        coding: [
          {
            system: `${OPENCRVS_SPECIFICATION_URL}reg-status`,
            code: 'DECLARED'
          }
        ]
      }
      fhirBundle = setupRegistrationWorkflow(fhirBundle, tokenPayload)

      expect(fhirBundle.entry[1].resource.businessStatus.coding.length).toBe(1)
      expect(
        fhirBundle.entry[1].resource.businessStatus.coding[0].code
      ).toEqual('REGISTERED')
    })
  })
  describe('SetupLastRegUser', () => {
    it('Will push the last modified by userinfo on fhirDoc', () => {
      const tokenPayload = {
        iss: '',
        iat: 1541576965,
        exp: 1573112965,
        aud: '',
        subject: '1',
        scope: ['declare']
      }
      const fhirBundle = setupLastRegUser(testFhirBundle, tokenPayload)

      expect(
        fhirBundle.entry[1].resource.extension[1].valueString
      ).toBeDefined()
      expect(fhirBundle.entry[1].resource.extension[1].valueString).toEqual('1')
    })

    it('Will push the last modified by userinfo even if no extension is defined yet on task resource', () => {
      const tokenPayload = {
        iss: '',
        iat: 1541576965,
        exp: 1573112965,
        aud: '',
        subject: '1',
        scope: ['declare']
      }
      let fhirBundle = cloneDeep(testFhirBundle)
      fhirBundle.entry[1].resource.extension = undefined
      fhirBundle = setupLastRegUser(fhirBundle, tokenPayload)

      expect(
        fhirBundle.entry[1].resource.extension[0].valueString
      ).toBeDefined()
      expect(fhirBundle.entry[1].resource.extension[0].valueString).toEqual('1')
    })

    it('Will update the last modified by userinfo instead of always adding a new extension', () => {
      const tokenPayload = {
        iss: '',
        iat: 1541576965,
        exp: 1573112965,
        aud: '',
        subject: '1',
        scope: ['declare']
      }
      const lengthOfTaskExtensions =
        testFhirBundle.entry[1].resource.extension.length
      const fhirBundle = setupLastRegUser(testFhirBundle, tokenPayload)

      expect(fhirBundle.entry[1].resource.extension.length).toBe(
        lengthOfTaskExtensions
      )
      expect(fhirBundle.entry[1].resource.extension[1].valueString).toEqual('1')
    })
  })
  it('setupAuthorOnNotes will update the author name on notes', () => {
    const tokenPayload = {
      iss: '',
      iat: 1541576965,
      exp: 1573112965,
      aud: '',
      subject: '1',
      scope: ['declare']
    }
    let fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[1].resource.note = [
      {
        text: 'this is a test note',
        time: '2018-10-31T09:45:05+10:00'
      }
    ]
    fhirBundle = setupAuthorOnNotes(fhirBundle, tokenPayload)

    expect(fhirBundle.entry[1].resource.note.length).toBe(1)
    expect(fhirBundle.entry[1].resource.note[0]).toEqual({
      authorString: '1',
      text: 'this is a test note',
      time: '2018-10-31T09:45:05+10:00'
    })
  })
  describe('pushBRN', () => {
    it('Successfully modified the provided fhirBundle with brn', () => {
      const tokenPayload = {
        iss: '',
        iat: 1541576965,
        exp: 1573112965,
        aud: '',
        subject: '1',
        scope: ['register']
      }
      const fhirBundle = pushBRN(testFhirBundle, tokenPayload)
      const task = fhirBundle.entry[1].resource as fhir.Task

      expect(task.identifier[1].system).toEqual(
        `${OPENCRVS_SPECIFICATION_URL}id/birth-registration-number`
      )
      expect(task.identifier[1].value).toBeDefined()
      expect(task.identifier[1].value.length).toBe(12)
    })

    it('Throws error if invalid fhir bundle is provided', () => {
      const tokenPayload = {
        iss: '',
        iat: 1541576965,
        exp: 1573112965,
        aud: '',
        subject: '1',
        scope: ['register']
      }

      const invalidData = { ...testFhirBundle, entry: [] }
      expect(() => pushBRN(invalidData, tokenPayload)).toThrowError(
        'Invalid FHIR bundle found for registration'
      )
    })
    it('If fhirBundle already have a brn then it will update the exiting one instead of creating a new one', () => {
      const tokenPayload = {
        iss: '',
        iat: 1541576965,
        exp: 1573112965,
        aud: '',
        subject: '1',
        scope: ['register']
      }
      const oldTask = testFhirBundle.entry[1].resource as fhir.Task
      oldTask.identifier[1].value = 'DUMMYBRN'
      const indentifierLength = oldTask.identifier.length

      let fhirBundle = cloneDeep(testFhirBundle)
      fhirBundle = pushBRN(fhirBundle, tokenPayload)
      const newTask = fhirBundle.entry[1].resource as fhir.Task

      expect(newTask.identifier.length).toBe(indentifierLength)
      expect(newTask.identifier[1].system).toEqual(
        `${OPENCRVS_SPECIFICATION_URL}id/birth-registration-number`
      )
      expect(newTask.identifier[1].value).toBeDefined()
      expect(newTask.identifier[1].value.length).toBe(12)
      expect(newTask.identifier[1].value).not.toEqual(
        oldTask.identifier[1].value
      )
    })
  })
})
