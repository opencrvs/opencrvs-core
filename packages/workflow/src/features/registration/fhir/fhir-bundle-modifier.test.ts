import {
  setTrackingId,
  pushBRN,
  setupRegistrationType,
  setupRegistrationWorkflow,
  setupLastRegUser,
  setupLastRegLocation,
  setupAuthorOnNotes
} from './fhir-bundle-modifier'
import { OPENCRVS_SPECIFICATION_URL, EVENT_TYPE } from './constants'
import {
  testFhirBundle,
  userMock,
  fieldAgentPractitionerMock,
  fieldAgentPractitionerRoleMock,
  districtMock,
  upazilaMock,
  unionMock,
  officeMock
} from '../../../test/utils'
import { cloneDeep } from 'lodash'
import * as fetch from 'jest-fetch-mock'

describe('Verify fhir bundle modifier functions', () => {
  describe('setTrackingId', () => {
    it('Successfully modified the provided fhirBundle with trackingid', () => {
      const fhirBundle = setTrackingId(testFhirBundle)
      const composition = fhirBundle.entry[0].resource as fhir.Composition
      const task = fhirBundle.entry[1].resource as fhir.Task

      expect(composition.identifier.value).toMatch(/^B/)
      expect(composition.identifier.value.length).toBe(7)
      expect(task.identifier[1]).toEqual({
        system: `${OPENCRVS_SPECIFICATION_URL}id/birth-tracking-id`,
        value: composition.identifier.value
      })
    })

    it('Throws error if invalid fhir bundle is provided', () => {
      const invalidData = { ...testFhirBundle, entry: [] }
      expect(() => setTrackingId(invalidData)).toThrowError(
        'Invalid FHIR bundle found for declaration'
      )
    })

    it('Will push the composite resource identifier if it is missing on fhirDoc', () => {
      const fhirBundle = setTrackingId({
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
      const taskResource = setupRegistrationType(
        testFhirBundle.entry[1].resource,
        EVENT_TYPE.BIRTH
      )

      expect(taskResource.code.coding[0].code).toBeDefined()
      expect(taskResource.code.coding[0].code).toEqual(
        EVENT_TYPE.BIRTH.toString()
      )
    })

    it('Will push code section with proper event type on fhirDoc if it is missing', () => {
      const fhirBundle = cloneDeep(testFhirBundle)
      fhirBundle.entry[1].resource.code = undefined
      const taskResource = setupRegistrationType(
        fhirBundle.entry[1].resource,
        EVENT_TYPE.BIRTH
      )

      expect(taskResource.code).toBeDefined()
      expect(taskResource.code).toEqual({
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
      const taskResource = setupRegistrationWorkflow(
        testFhirBundle.entry[1].resource,
        tokenPayload
      )

      expect(taskResource.businessStatus.coding[0].code).toBeDefined()
      expect(taskResource.businessStatus.coding[0].code).toEqual('DECLARED')
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
      const fhirBundle = cloneDeep(testFhirBundle)
      fhirBundle.entry[1].resource.businessStatus = {
        coding: [
          {
            system: `${OPENCRVS_SPECIFICATION_URL}reg-status`,
            code: 'DECLARED'
          }
        ]
      }
      const taskResource = setupRegistrationWorkflow(
        fhirBundle.entry[1].resource,
        tokenPayload
      )

      expect(taskResource.businessStatus.coding.length).toBe(1)
      expect(taskResource.businessStatus.coding[0].code).toEqual('REGISTERED')
    })
  })
  describe('SetupLastRegUser', () => {
    const practitioner = {
      resourceType: 'Practitioner',
      identifier: [{ use: 'official', system: 'mobile', value: '01711111111' }],
      telecom: [{ system: 'phone', value: '01711111111' }],
      name: [
        { use: 'en', family: 'Al Hasan', given: ['Shakib'] },
        { use: 'bn', family: '', given: [''] }
      ],
      gender: 'male',
      meta: {
        lastUpdated: '2018-11-25T17:31:08.062+00:00',
        versionId: '7b21f3ac-2d92-46fc-9b87-c692aa81c858'
      },
      id: 'e0daf66b-509e-4f45-86f3-f922b74f3dbf'
    }
    it('Will push the last modified by userinfo on fhirDoc', () => {
      const taskResource = setupLastRegUser(
        testFhirBundle.entry[1].resource,
        practitioner
      )

      expect(taskResource.extension[1].valueReference.reference).toBeDefined()
      expect(taskResource.extension[1].valueReference.reference).toEqual(
        'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
      )
    })

    it('Will push the last modified by userinfo even if no extension is defined yet on task resource', () => {
      const fhirBundle = cloneDeep(testFhirBundle)
      fhirBundle.entry[1].resource.extension = undefined
      const taskResource = setupLastRegUser(
        fhirBundle.entry[1].resource,
        practitioner
      )

      expect(taskResource.extension[0].valueReference.reference).toBeDefined()
      expect(taskResource.extension[0].valueReference.reference).toEqual(
        'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
      )
    })

    it('Will update the last modified by userinfo instead of always adding a new extension', () => {
      const lengthOfTaskExtensions =
        testFhirBundle.entry[1].resource.extension.length
      const taskResource = setupLastRegUser(
        testFhirBundle.entry[1].resource,
        practitioner
      )

      expect(taskResource.extension.length).toBe(lengthOfTaskExtensions)
      expect(taskResource.extension[1].valueReference.reference).toEqual(
        'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
      )
    })
  })
  it('setupAuthorOnNotes will update the author name on notes', () => {
    const practitioner = {
      resourceType: 'Practitioner',
      identifier: [{ use: 'official', system: 'mobile', value: '01711111111' }],
      telecom: [{ system: 'phone', value: '01711111111' }],
      name: [
        { use: 'en', family: 'Al Hasan', given: ['Shakib'] },
        { use: 'bn', family: '', given: [''] }
      ],
      gender: 'male',
      meta: {
        lastUpdated: '2018-11-25T17:31:08.062+00:00',
        versionId: '7b21f3ac-2d92-46fc-9b87-c692aa81c858'
      },
      id: 'e0daf66b-509e-4f45-86f3-f922b74f3dbf'
    }
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[1].resource.note = [
      {
        text: 'this is a test note',
        time: '2018-10-31T09:45:05+10:00'
      }
    ]
    const taskResource = setupAuthorOnNotes(
      fhirBundle.entry[1].resource,
      practitioner
    )

    expect(taskResource.note.length).toBe(1)
    expect(taskResource.note[0]).toEqual({
      authorString: 'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf',
      text: 'this is a test note',
      time: '2018-10-31T09:45:05+10:00'
    })
  })
  describe('pushBRN', () => {
    const practitioner = {
      resourceType: 'Practitioner',
      identifier: [{ use: 'official', system: 'mobile', value: '01711111111' }],
      telecom: [{ system: 'phone', value: '01711111111' }],
      name: [
        { use: 'en', family: 'Al Hasan', given: ['Shakib'] },
        { use: 'bn', family: '', given: [''] }
      ],
      gender: 'male',
      meta: {
        lastUpdated: '2018-11-25T17:31:08.062+00:00',
        versionId: '7b21f3ac-2d92-46fc-9b87-c692aa81c858'
      },
      id: 'e0daf66b-509e-4f45-86f3-f922b74f3dbf'
    }
    beforeEach(() => {
      fetch.mockResponses(
        [fieldAgentPractitionerRoleMock, { status: 200 }],
        [districtMock, { status: 200 }],
        [upazilaMock, { status: 200 }],
        [unionMock, { status: 200 }],
        [officeMock, { status: 200 }],
        [fieldAgentPractitionerRoleMock, { status: 200 }],
        [districtMock, { status: 200 }],
        [upazilaMock, { status: 200 }],
        [unionMock, { status: 200 }],
        [officeMock, { status: 200 }]
      )
    })
    it('Successfully modified the provided fhirBundle with brn', async () => {
      const birthTrackingId = 'B5WGYJE'
      const brnChecksum = 1
      testFhirBundle.entry[1].resource.identifier[1].value = birthTrackingId

      const task = await pushBRN(testFhirBundle.entry[1].resource, practitioner)

      expect(task.identifier[2].system).toEqual(
        `${OPENCRVS_SPECIFICATION_URL}id/birth-registration-number`
      )
      expect(task.identifier[2].value).toBeDefined()
      expect(task.identifier[2].value).toMatch(
        new RegExp(
          `^${new Date().getFullYear()}103421${birthTrackingId}${brnChecksum}`
        )
      )
    })

    it('Throws error if invalid fhir bundle is provided', async () => {
      const invalidData = undefined
      expect(pushBRN(invalidData, practitioner)).rejects.toThrowError(
        'Invalid Task resource found for registration'
      )
    })
    it('If fhirBundle already have a brn then it will update the exiting one instead of creating a new one', async () => {
      const oldTask = testFhirBundle.entry[1].resource as fhir.Task
      oldTask.identifier[2].value = 'DUMMYBRN'
      const indentifierLength = oldTask.identifier.length

      const fhirBundle = cloneDeep(testFhirBundle)

      const birthTrackingId = 'B5WGYJE'
      const brnChecksum = 1
      fhirBundle.entry[1].resource.identifier[1].value = birthTrackingId
      const newTask = await pushBRN(fhirBundle.entry[1].resource, practitioner)

      expect(newTask.identifier.length).toBe(indentifierLength)
      expect(newTask.identifier[2].system).toEqual(
        `${OPENCRVS_SPECIFICATION_URL}id/birth-registration-number`
      )
      expect(newTask.identifier[2].value).toBeDefined()
      expect(newTask.identifier[2].value).toMatch(
        new RegExp(
          `^${new Date().getFullYear()}103421${birthTrackingId}${brnChecksum}`
        )
      )
      expect(newTask.identifier[2].value).not.toEqual(
        oldTask.identifier[2].value
      )
    })
  })
  describe('setupLastRegLocation', () => {
    it('set regLastLocation properly', async () => {
      const taskResource = await setupLastRegLocation(
        testFhirBundle.entry[1].resource as fhir.Task,
        JSON.parse(fieldAgentPractitionerMock)
      )
      expect(taskResource.extension[2]).toEqual({
        url: 'http://opencrvs.org/specs/extension/regLastLocation',
        valueReference: {
          reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdy48y'
        }
      })
    })
    it('set regLastOffice properly', async () => {
      const taskResource = await setupLastRegLocation(
        testFhirBundle.entry[1].resource as fhir.Task,
        JSON.parse(fieldAgentPractitionerMock)
      )
      expect(taskResource.extension[3]).toEqual({
        url: 'http://opencrvs.org/specs/extension/regLastOffice',
        valueReference: {
          reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacd12yy'
        }
      })
    })
    it('throws error if invalid practitioner is provided', async () => {
      const practitioner = JSON.parse(fieldAgentPractitionerMock)
      practitioner.id = undefined
      expect(
        setupLastRegLocation(
          testFhirBundle.entry[1].resource as fhir.Task,
          practitioner
        )
      ).rejects.toThrowError('Invalid practitioner data found')
    })
  })
})
