import {
  pushTrackingId,
  setupRegistrationType,
  setupRegistrationWorkflow,
  setupLastRegUser
} from './fhir-bundle-modifier'
import { OPENCRVS_SPECIFICATION_URL, EVENT_TYPE } from './constants'
import { testFhirBundle } from 'src/test/utils'
import { cloneDeep } from 'lodash'

describe('Verify fhir bundle modifier functions', () => {
  it('PushTrackingId successfully modified the provided fhirBundle with trackingid', () => {
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

  it('PushTrackingId throws error if invalid fhir bundle is provided', () => {
    const invalidData = { ...testFhirBundle, entry: [] }
    expect(() => pushTrackingId(invalidData)).toThrowError(
      'Invalid FHIR bundle found for declaration'
    )
  })

  it('PushTrackingId will push the composite resource identifier if it is missing on fhirDoc', () => {
    const fhirBundle = pushTrackingId({
      ...testFhirBundle,
      entry: [{ resource: {} }]
    })
    const composition = fhirBundle.entry[0].resource as fhir.Composition

    expect(composition.identifier.value).toMatch(/^B/)
    expect(composition.identifier.value.length).toBe(7)
  })

  it('SetupRegistrationType will push the proper event type on fhirDoc', () => {
    const fhirBundle = setupRegistrationType(testFhirBundle, EVENT_TYPE.BIRTH)

    expect(fhirBundle.entry[1].resource.code.coding[0].code).toBeDefined()
    expect(fhirBundle.entry[1].resource.code.coding[0].code).toEqual(
      EVENT_TYPE.BIRTH.toString()
    )
  })

  it('SetupRegistrationType will push code section with proper event type on fhirDoc if it is missing', () => {
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

  it('SetupRegistrationWorkflow will push the registration status on fhirDoc', () => {
    const tokenPayload = {
      iss: '',
      iat: 1541576965,
      exp: 1573112965,
      aud: '',
      sub: '1',
      scope: ['declare']
    }
    const fhirBundle = setupRegistrationWorkflow(testFhirBundle, tokenPayload)

    expect(
      fhirBundle.entry[1].resource.businessStatus.coding[0].code
    ).toBeDefined()
    expect(fhirBundle.entry[1].resource.businessStatus.coding[0].code).toEqual(
      'DECLARED'
    )
  })
  it('SetupRegistrationWorkflow will update existing registration status on fhirDoc', () => {
    const tokenPayload = {
      iss: '',
      iat: 1541576965,
      exp: 1573112965,
      aud: '',
      sub: '1',
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
    expect(fhirBundle.entry[1].resource.businessStatus.coding[0].code).toEqual(
      'REGISTERED'
    )
  })

  it('SetupLastRegUser will push the last modified by userinfo on fhirDoc', () => {
    const tokenPayload = {
      iss: '',
      iat: 1541576965,
      exp: 1573112965,
      aud: '',
      subject: 'anik',
      scope: ['declare']
    }
    const fhirBundle = setupLastRegUser(testFhirBundle, tokenPayload)

    expect(fhirBundle.entry[1].resource.extension[1].valueString).toBeDefined()
    expect(fhirBundle.entry[1].resource.extension[1].valueString).toEqual(
      'anik'
    )
  })

  it('SetupLastRegUser will push the last modified by userinfo even if no extension is defined yet on task resource', () => {
    const tokenPayload = {
      iss: '',
      iat: 1541576965,
      exp: 1573112965,
      aud: '',
      subject: 'anik',
      scope: ['declare']
    }
    let fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[1].resource.extension = undefined
    fhirBundle = setupLastRegUser(fhirBundle, tokenPayload)

    expect(fhirBundle.entry[1].resource.extension[0].valueString).toBeDefined()
    expect(fhirBundle.entry[1].resource.extension[0].valueString).toEqual(
      'anik'
    )
  })

  it('SetupLastRegUser will update the last modified by userinfo instead of always adding a new extension', () => {
    const tokenPayload = {
      iss: '',
      iat: 1541576965,
      exp: 1573112965,
      aud: '',
      subject: 'DUMMY',
      scope: ['declare']
    }
    const lengthOfTaskExtensions =
      testFhirBundle.entry[1].resource.extension.length
    const fhirBundle = setupLastRegUser(testFhirBundle, tokenPayload)

    expect(fhirBundle.entry[1].resource.extension.length).toBe(
      lengthOfTaskExtensions
    )
    expect(fhirBundle.entry[1].resource.extension[1].valueString).toEqual(
      'DUMMY'
    )
  })
})
