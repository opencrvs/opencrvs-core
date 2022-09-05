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
  setTrackingId,
  setupRegistrationType,
  setupRegistrationWorkflow,
  setupLastRegUser,
  setupLastRegLocation,
  setupAuthorOnNotes,
  setupRegAssigned
} from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import {
  OPENCRVS_SPECIFICATION_URL,
  EVENT_TYPE
} from '@workflow/features/registration/fhir/constants'
import {
  testFhirBundle,
  testDeathFhirBundle,
  fieldAgentPractitionerMock,
  fieldAgentPractitionerRoleMock,
  districtMock,
  upazilaMock,
  unionMock,
  officeMock
} from '@workflow/test/utils'
import { cloneDeep } from 'lodash'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

const validateToken = jwt.sign(
  { scope: ['validate'], sub: '123' },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:workflow-user'
  }
)

describe('Verify fhir bundle modifier functions', () => {
  describe('setTrackingId', () => {
    it('Successfully modified the provided fhirBundle with birth trackingid', () => {
      const fhirBundle = setTrackingId(testFhirBundle)
      if (
        fhirBundle &&
        fhirBundle.entry &&
        fhirBundle.entry[0] &&
        fhirBundle.entry[0].resource &&
        fhirBundle.entry[1] &&
        fhirBundle.entry[1].resource
      ) {
        const composition = fhirBundle.entry[0].resource as fhir.Composition
        const task = fhirBundle.entry[1].resource as fhir.Task
        if (
          composition &&
          composition.identifier &&
          composition.identifier.value
        ) {
          expect(composition.identifier.value).toMatch(/^B/)
          expect(composition.identifier.value.length).toBe(7)
          if (task && task.identifier && task.identifier[1]) {
            expect(task.identifier[1]).toEqual({
              system: `${OPENCRVS_SPECIFICATION_URL}id/birth-tracking-id`,
              value: composition.identifier.value
            })
          }
        }
      }
    })

    it('Successfully modified the provided fhirBundle with death trackingid', () => {
      const fhirBundle = setTrackingId(testDeathFhirBundle)
      if (
        fhirBundle &&
        fhirBundle.entry &&
        fhirBundle.entry[0] &&
        fhirBundle.entry[0].resource &&
        fhirBundle.entry[10].resource
      ) {
        const composition = fhirBundle.entry[0].resource as fhir.Composition
        const task = fhirBundle.entry[10].resource as fhir.Task
        if (
          composition &&
          composition.identifier &&
          composition.identifier.value
        ) {
          expect(composition.identifier.value).toMatch(/^D/)
          expect(composition.identifier.value.length).toBe(7)
          if (task && task.identifier && task.identifier[0]) {
            expect(task.identifier[0]).toEqual({
              system: `${OPENCRVS_SPECIFICATION_URL}id/death-tracking-id`,
              value: composition.identifier.value
            })
          }
        }
      }
    })

    it('Throws error if invalid fhir bundle is provided', () => {
      const invalidData = { ...testFhirBundle, entry: [] }
      expect(() => setTrackingId(invalidData)).toThrowError(
        'Invalid FHIR bundle found'
      )
    })

    it('Will push the composite resource identifier if it is missing on fhirDoc', () => {
      const fhirBundle = setTrackingId({
        ...testFhirBundle,
        entry: [{ resource: {} }]
      })

      if (
        fhirBundle &&
        fhirBundle.entry &&
        fhirBundle.entry[0] &&
        fhirBundle.entry[0].resource
      ) {
        const composition = fhirBundle.entry[0].resource as fhir.Composition
        if (
          composition &&
          composition.identifier &&
          composition.identifier.value
        ) {
          expect(composition.identifier.value).toMatch(/^B/)
          expect(composition.identifier.value.length).toBe(7)
        }
      }
    })
  })
  describe('SetupRegistrationType', () => {
    it('Will push the proper event type on fhirDoc', () => {
      const taskResource = setupRegistrationType(
        testFhirBundle.entry[1].resource as fhir.Task,
        EVENT_TYPE.BIRTH
      )
      if (
        taskResource &&
        taskResource.code &&
        taskResource.code.coding &&
        taskResource.code.coding[0] &&
        taskResource.code.coding[0].code
      ) {
        expect(taskResource.code.coding[0].code).toBeDefined()
        expect(taskResource.code.coding[0].code).toEqual(
          EVENT_TYPE.BIRTH.toString()
        )
      }
    })

    it('Will push code section with proper event type on fhirDoc if it is missing', () => {
      const fhirBundle = cloneDeep(testFhirBundle)
      fhirBundle.entry[1].resource.code = undefined
      const taskResource = setupRegistrationType(
        fhirBundle.entry[1].resource as fhir.Task,
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
    it('Will push the registration status on fhirDoc', async () => {
      const tokenPayload = {
        iss: '',
        iat: 1541576965,
        exp: '1573112965',
        sub: '',
        algorithm: '',
        aud: '',
        subject: '1',
        scope: ['declare']
      }
      const taskResource = await setupRegistrationWorkflow(
        testFhirBundle.entry[1].resource as fhir.Task,
        tokenPayload
      )

      if (
        taskResource &&
        taskResource.businessStatus &&
        taskResource.businessStatus.coding &&
        taskResource.businessStatus.coding[0] &&
        taskResource.businessStatus.coding[0].code
      ) {
        expect(taskResource.businessStatus.coding[0].code).toBeDefined()
        expect(taskResource.businessStatus.coding[0].code).toEqual('DECLARED')
      }
    })
    it('Will update existing registration status on fhirDoc', async () => {
      const tokenPayload = {
        iss: '',
        iat: 1541576965,
        exp: '1573112965',
        sub: '',
        algorithm: '',
        aud: '',
        subject: '1',
        scope: ['register']
      }
      const fhirBundle = cloneDeep(testFhirBundle)
      /* tslint:disable:no-string-literal */
      if (
        fhirBundle &&
        fhirBundle.entry &&
        fhirBundle.entry[1] &&
        fhirBundle.entry[1].resource
      ) {
        fhirBundle.entry[1].resource['businessStatus'] = {
          coding: [
            {
              system: `${OPENCRVS_SPECIFICATION_URL}reg-status`,
              code: 'DECLARED'
            }
          ]
        }
        /* tslint:enable:no-string-literal */
        const taskResource = await setupRegistrationWorkflow(
          fhirBundle.entry[1].resource as fhir.Task,
          tokenPayload
        )

        if (
          taskResource &&
          taskResource.businessStatus &&
          taskResource.businessStatus.coding &&
          taskResource.businessStatus.coding[0] &&
          taskResource.businessStatus.coding[0].code
        ) {
          expect(taskResource.businessStatus.coding.length).toBe(1)
          expect(taskResource.businessStatus.coding[0].code).toEqual(
            'REGISTERED'
          )
        }
      }
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
      if (
        testFhirBundle &&
        testFhirBundle.entry &&
        testFhirBundle.entry[1] &&
        testFhirBundle.entry[1].resource
      ) {
        const taskResource = setupLastRegUser(
          testFhirBundle.entry[1].resource as fhir.Task,
          practitioner
        )
        if (
          taskResource &&
          taskResource.extension &&
          taskResource.extension[3] &&
          taskResource.extension[3].valueReference &&
          taskResource.extension[3].valueReference.reference
        ) {
          expect(
            taskResource.extension[3].valueReference.reference
          ).toBeDefined()
          expect(taskResource.extension[3].valueReference.reference).toEqual(
            'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
          )
        }
      }
    })

    it('Will push the last modified by userinfo even if no extension is defined yet on task resource', () => {
      const fhirBundle = cloneDeep(testFhirBundle)
      if (
        fhirBundle &&
        fhirBundle.entry &&
        fhirBundle.entry[1] &&
        fhirBundle.entry[1].resource
      ) {
        fhirBundle.entry[1].resource.extension = [{ url: '', valueString: '' }]
        const taskResource = setupLastRegUser(
          fhirBundle.entry[1].resource as fhir.Task,
          practitioner
        )

        if (
          taskResource &&
          taskResource.extension &&
          taskResource.extension[0] &&
          taskResource.extension[0].valueReference &&
          taskResource.extension[0].valueReference.reference
        ) {
          expect(
            taskResource.extension[0].valueReference.reference
          ).toBeDefined()
          expect(taskResource.extension[0].valueReference.reference).toEqual(
            'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
          )
        }
      }
    })

    it('Will update the last modified by userinfo instead of always adding a new extension', () => {
      if (
        testFhirBundle &&
        testFhirBundle.entry &&
        testFhirBundle.entry[1] &&
        testFhirBundle.entry[1].resource &&
        testFhirBundle.entry[1].resource.extension
      ) {
        const lengthOfTaskExtensions =
          testFhirBundle.entry[1].resource.extension.length
        const taskResource = setupLastRegUser(
          testFhirBundle.entry[1].resource as fhir.Task,
          practitioner
        )
        if (
          taskResource &&
          taskResource.extension &&
          taskResource.extension[3] &&
          taskResource.extension[3].valueReference &&
          taskResource.extension[3].valueReference.reference
        ) {
          expect(taskResource.extension.length).toBe(lengthOfTaskExtensions)
          expect(taskResource.extension[3].valueReference.reference).toEqual(
            'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
          )
        }
      }
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
    /* tslint:disable:no-string-literal */
    fhirBundle.entry[1].resource['note'] = [
      {
        text: 'this is a test note',
        time: '2018-10-31T09:45:05+10:00'
      }
    ]
    const taskResource = setupAuthorOnNotes(
      fhirBundle.entry[1].resource as fhir.Task,
      practitioner
    )
    if (taskResource && taskResource.note && taskResource.note[0]) {
      expect(taskResource.note.length).toBe(1)
      expect(taskResource.note[0]).toEqual({
        authorString: 'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf',
        text: 'this is a test note',
        time: '2018-10-31T09:45:05+10:00'
      })
    }
    /* tslint:enable:no-string-literal */
  })
  describe('setupLastRegLocation', () => {
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
    it('set regLastLocation properly', async () => {
      const taskResource = await setupLastRegLocation(
        testFhirBundle.entry[1].resource as fhir.Task,
        JSON.parse(fieldAgentPractitionerMock)
      )
      if (taskResource && taskResource.extension && taskResource.extension[4]) {
        expect(taskResource.extension[4]).toEqual({
          url: 'http://opencrvs.org/specs/extension/regLastLocation',
          valueReference: {
            reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdy48y'
          }
        })
      }
    })
    it('set regLastOffice properly', async () => {
      const taskResource = await setupLastRegLocation(
        testFhirBundle.entry[1].resource as fhir.Task,
        JSON.parse(fieldAgentPractitionerMock)
      )
      if (taskResource && taskResource.extension && taskResource.extension[2]) {
        expect(taskResource.extension[2]).toEqual({
          url: 'http://opencrvs.org/specs/extension/regLastOffice',
          valueReference: {
            reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacd12yy'
          }
        })
      }
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

  describe('setupRegAssigned', () => {
    beforeAll(() => {
      fetch.resetMocks()
      fetch.mockResponseOnce(
        JSON.stringify({
          catchmentAreaIds: [
            'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
            'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
            'b09122df-81f8-41a0-b5c6-68cba4145cab',
            '7dbf10a9-23d9-4038-8b1c-9f6547ab4877'
          ],
          scope: ['validate', 'performance', 'certify', 'demo'],
          status: 'active',
          name: [
            {
              given: ['Alanna'],
              use: 'en',
              family: 'Barrows'
            }
          ],
          role: 'REGISTRATION_AGENT',
          type: '',
          identifiers: [
            {
              system: 'NATIONAL_ID',
              value: '583835744'
            }
          ],
          primaryOfficeId: 'c9c4d6e9-981c-4646-98fe-4014fddebd5e',
          email: 'Olga_Daniel62@hotmail.com',
          mobile: '+260909522271',
          salt: '3c8446be-ffa1-4edf-a681-fbaa26b6b8ef',
          passwordHash:
            '2f6e767bd59310d8183ed409e1e8c3daf13ce54e4897baadffb7bb2d0fb1482f035d4458902390a5ad57a63f23a46e72eeca206add3f0f7d269415c81adeaee8',
          practitionerId: 'd1fbae31-1f22-4b30-94a6-964c7b445812',
          username: 'a.barrows',
          securityQuestionAnswers: [],
          creationDate: 1661936216466.0,
          auditHistory: [],
          __v: 0
        })
      )
    })
    afterAll(() => {
      fetch.resetMocks()
    })

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

    it('assignment is not done for reg agent downloading validated declaration', async () => {
      const taskResource = testFhirBundle.entry[1].resource
      taskResource?.extension?.push({
        url: `${OPENCRVS_SPECIFICATION_URL}extension/regAssigned`,
        valueString: 'VALIDATED'
      })
      const modifiedTaskResource = await setupRegAssigned(
        taskResource,
        practitioner,
        validateToken
      )

      expect(taskResource).toEqual(modifiedTaskResource)
    })
  })
})
