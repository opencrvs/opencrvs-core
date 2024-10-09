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
import { server as mswServer } from '@test/setupServer'
import { rest } from 'msw'
import {
  setupRegistrationWorkflow,
  setupLastRegUser,
  validateDeceasedDetails
} from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import { OPENCRVS_SPECIFICATION_URL } from '@workflow/features/registration/fhir/constants'
import {
  testFhirBundle,
  mosipSuccessMock,
  mosipConfigMock,
  mosipDeceasedPatientMock,
  mosipBirthPatientBundleMock,
  mosipUpdatedDeceasedPatientMock
} from '@workflow/test/utils'
import { Practitioner, Task } from '@opencrvs/commons/types'
import { cloneDeep } from 'lodash'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import * as fetchAny from 'jest-fetch-mock'
import { MOSIP_TOKEN_SEEDER_URL } from '@workflow/constants'

const fetch = fetchAny as any

describe('Verify fhir bundle modifier functions', () => {
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
        testFhirBundle.entry[1].resource as Task,
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

        const taskResource = await setupRegistrationWorkflow(
          fhirBundle.entry[1].resource as Task,
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
    const practitioner: Practitioner = {
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
          testFhirBundle.entry[1].resource as Task,
          practitioner
        ) as any
        if (
          taskResource &&
          taskResource.extension &&
          taskResource.extension[4] &&
          taskResource.extension[4].valueReference &&
          taskResource.extension[4].valueReference.reference
        ) {
          expect(
            taskResource.extension[4].valueReference.reference
          ).toBeDefined()
          expect(taskResource.extension[4].valueReference.reference).toEqual(
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
        fhirBundle.entry[1].resource.extension = [
          { url: '', valueString: '' }
        ] as any
        const taskResource = setupLastRegUser(
          fhirBundle.entry[1].resource as Task,
          practitioner
        ) as any

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
          testFhirBundle.entry[1].resource as Task,
          practitioner
        ) as any
        if (
          taskResource &&
          taskResource.extension &&
          taskResource.extension[4] &&
          taskResource.extension[4].valueReference &&
          taskResource.extension[4].valueReference.reference
        ) {
          expect(taskResource.extension.length).toBe(lengthOfTaskExtensions)
          expect(taskResource.extension[4].valueReference.reference).toEqual(
            'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
          )
        }
      }
    })
  })
})

describe('validateDeceasedDetails functions', () => {
  let token: string
  let authHeader: { Authorization: string }
  beforeEach(async () => {
    fetch.resetMocks()
    token = jwt.sign({ scope: ['register'] }, readFileSync('./test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:workflow-user'
    })

    authHeader = {
      Authorization: `Bearer ${token}`
    }
  })
  it('Validates deceased details and modifies bundle', async () => {
    mswServer.use(
      rest.get('http://localhost:2021/integrationConfig', (_, res, ctx) => {
        return res(ctx.json(mosipConfigMock))
      })
    )

    mswServer.use(
      rest.post(`${MOSIP_TOKEN_SEEDER_URL}/authtoken/json`, (_, res, ctx) =>
        res(ctx.json(mosipSuccessMock))
      )
    )

    mswServer.use(
      rest.get('http://localhost:3447/fhir/Patient', (_, res, ctx) =>
        res(ctx.json(mosipBirthPatientBundleMock))
      )
    )

    mswServer.use(
      rest.put(
        'http://localhost:3447/fhir/Patient/1c9add9b-9215-49d7-bfaa-226c82ac47d2',
        (_, res, ctx) => res(ctx.json({}))
      )
    )

    const validateResponse = await validateDeceasedDetails(
      mosipDeceasedPatientMock,
      authHeader
    )
    expect(validateResponse).toEqual(mosipUpdatedDeceasedPatientMock)
  })
  afterAll(async () => {
    jest.clearAllMocks()
  })
})
