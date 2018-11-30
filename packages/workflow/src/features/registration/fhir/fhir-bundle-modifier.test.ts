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
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import * as fetch from 'jest-fetch-mock'

describe('Verify fhir bundle modifier functions', () => {
  describe('PushTrackingId', () => {
    it('Successfully modified the provided fhirBundle with trackingid', () => {
      const fhirBundle = pushTrackingId(testFhirBundle)
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
    it('Will push the last modified by userinfo on fhirDoc', () => {
      const tokenPayload = {
        iss: '',
        iat: 1541576965,
        exp: 1573112965,
        aud: '',
        subject: '1',
        scope: ['declare']
      }
      const taskResource = setupLastRegUser(
        testFhirBundle.entry[1].resource,
        tokenPayload
      )

      expect(taskResource.extension[1].valueString).toBeDefined()
      expect(taskResource.extension[1].valueString).toEqual('1')
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
      const fhirBundle = cloneDeep(testFhirBundle)
      fhirBundle.entry[1].resource.extension = undefined
      const taskResource = setupLastRegUser(
        fhirBundle.entry[1].resource,
        tokenPayload
      )

      expect(taskResource.extension[0].valueString).toBeDefined()
      expect(taskResource.extension[0].valueString).toEqual('1')
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
      const taskResource = setupLastRegUser(
        testFhirBundle.entry[1].resource,
        tokenPayload
      )

      expect(taskResource.extension.length).toBe(lengthOfTaskExtensions)
      expect(taskResource.extension[1].valueString).toEqual('1')
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
    const fhirBundle = cloneDeep(testFhirBundle)
    fhirBundle.entry[1].resource.note = [
      {
        text: 'this is a test note',
        time: '2018-10-31T09:45:05+10:00'
      }
    ]
    const taskResource = setupAuthorOnNotes(
      fhirBundle.entry[1].resource,
      tokenPayload
    )

    expect(taskResource.note.length).toBe(1)
    expect(taskResource.note[0]).toEqual({
      authorString: '1',
      text: 'this is a test note',
      time: '2018-10-31T09:45:05+10:00'
    })
  })
  describe('pushBRN', () => {
    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('../auth/test/cert.key'),
      {
        subject: '5bdc55ece42c82de9a529c36',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )
    beforeEach(() => {
      fetch.mockResponses(
        [
          JSON.stringify({
            mobile: '+880711111111'
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            id: 'eacae600-a501-42d6-9d59-b8b94f3e50c1',
            meta: { lastUpdated: '2018-11-27T17:13:20.662+00:00' },
            type: 'searchset',
            total: 1,
            link: [
              {
                relation: 'self',
                url:
                  'http://localhost:3447/fhir/Practitioner?telecom=phone%7C01711111111'
              }
            ],
            entry: [
              {
                fullUrl:
                  'http://localhost:3447/fhir/Practitioner/b1f46aba-075d-431e-8aeb-ebc57a4a0ad0',
                resource: {
                  resourceType: 'Practitioner',
                  identifier: [
                    { use: 'official', system: 'mobile', value: '01711111111' }
                  ],
                  telecom: [{ system: 'phone', value: '01711111111' }],
                  name: [
                    { use: 'en', family: ['Al Hasan'], given: ['Shakib'] },
                    { use: 'bn', family: [''], given: [''] }
                  ],
                  gender: 'male',
                  meta: {
                    lastUpdated: '2018-11-25T17:31:08.062+00:00',
                    versionId: '7b21f3ac-2d92-46fc-9b87-c692aa81c858'
                  },
                  id: 'e0daf66b-509e-4f45-86f3-f922b74f3dbf'
                }
              }
            ]
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            entry: [
              {
                fullUrl:
                  'http://localhost:3447/fhir/PractitionerRole/9c8b8ac2-9044-4b66-8d31-07c5a4b4348d',
                resource: {
                  resourceType: 'PractitionerRole',
                  practitioner: {
                    reference:
                      'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
                  },
                  code: [
                    {
                      coding: [
                        {
                          system: 'http://opencrvs.org/specs/roles',
                          code: 'FIELD_AGENT'
                        }
                      ]
                    }
                  ],
                  location: [
                    {
                      reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacd9173'
                    },
                    {
                      reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdxxx'
                    },
                    {
                      reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdyyyy'
                    }
                  ],
                  meta: {
                    lastUpdated: '2018-11-25T17:31:08.096+00:00',
                    versionId: '2f79ee2d-3b78-4c90-91d8-278e4a28caf7'
                  },
                  id: '9c8b8ac2-9044-4b66-8d31-07c5a4b4348d'
                }
              }
            ]
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Location',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/a2i-internal-id',
                value: '165'
              },
              { system: 'http://opencrvs.org/specs/id/bbs-code', value: '34' },
              {
                system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                value: 'upazila'
              }
            ]
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Location',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/a2i-internal-id',
                value: '165'
              },
              { system: 'http://opencrvs.org/specs/id/bbs-code', value: '21' },
              {
                system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                value: 'union'
              }
            ]
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Location',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/a2i-internal-id',
                value: '165'
              },
              { system: 'http://opencrvs.org/specs/id/bbs-code', value: '10' },
              {
                system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                value: 'district'
              }
            ]
          }),
          { status: 200 }
        ]
      )
    })
    it('Successfully modified the provided fhirBundle with brn', async () => {
      const task = await pushBRN(testFhirBundle.entry[1].resource, token)

      expect(task.identifier[2].system).toEqual(
        `${OPENCRVS_SPECIFICATION_URL}id/birth-registration-number`
      )
      expect(task.identifier[2].value).toBeDefined()
      expect(task.identifier[2].value).toMatch(
        new RegExp(`^${new Date().getFullYear()}10342112345678`)
      )
    })

    it('Throws error if invalid fhir bundle is provided', async () => {
      const invalidData = undefined
      expect(pushBRN(invalidData, token)).rejects.toThrowError(
        'Invalid Task resource found for registration'
      )
    })
    it('If fhirBundle already have a brn then it will update the exiting one instead of creating a new one', async () => {
      const oldTask = testFhirBundle.entry[1].resource as fhir.Task
      oldTask.identifier[2].value = 'DUMMYBRN'
      const indentifierLength = oldTask.identifier.length

      const fhirBundle = cloneDeep(testFhirBundle)
      const newTask = await pushBRN(fhirBundle.entry[1].resource, token)

      expect(newTask.identifier.length).toBe(indentifierLength)
      expect(newTask.identifier[2].system).toEqual(
        `${OPENCRVS_SPECIFICATION_URL}id/birth-registration-number`
      )
      expect(newTask.identifier[2].value).toBeDefined()
      expect(newTask.identifier[2].value).toMatch(
        new RegExp(`^${new Date().getFullYear()}10342112345678`)
      )
      expect(newTask.identifier[2].value).not.toEqual(
        oldTask.identifier[2].value
      )
    })
  })
})
