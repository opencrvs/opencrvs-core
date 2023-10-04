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
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import {
  userMock,
  fieldAgentPractitionerMock,
  fieldAgentPractitionerRoleMock,
  districtMock,
  upazilaMock,
  unionMock,
  officeMock,
  testFhirTaskBundle,
  taskResouceMock
} from '@workflow/test/utils'
import { Task } from '@opencrvs/commons/types'
import { modifyTaskBundle } from '@workflow/features/task/fhir/fhir-bundle-modifier'
import { cloneDeep } from 'lodash'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any
let token: string
describe('Verify handler', () => {
  beforeEach(() => {
    token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )
  })

  it('modifyTaskBundle returns correct bundle', async () => {
    fetch.mockResponses(
      [taskResouceMock, { status: 200 }],
      [userMock, { status: 200 }],
      [fieldAgentPractitionerMock, { status: 200 }],
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
    const clonedTestFhirTaskBundle = cloneDeep(testFhirTaskBundle)
    clonedTestFhirTaskBundle.entry[0].resource.businessStatus.coding[0].code =
      'REJECTED'
    const payload = await modifyTaskBundle(clonedTestFhirTaskBundle, token)
    if (
      payload &&
      payload.entry &&
      payload.entry[0] &&
      payload.entry[0].resource
    ) {
      const fhirTask = payload.entry[0].resource as Task
      if (
        fhirTask &&
        fhirTask.note &&
        fhirTask.note[0] &&
        fhirTask.note[0].authorString
      ) {
        expect(fhirTask.note[0].authorString).toEqual(
          'Practitioner/eacae600-a501-42d6-9d59-b8b94f3e50c1'
        )
      }
    } else {
      throw new Error('Failed')
    }
  })

  it('Throws error if declaration is already rejected', () => {
    fetch.mockResponses(
      [
        JSON.stringify({
          id: 'ba0412c6-5125-4447-bd32-fb5cf336ddbc',
          businessStatus: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/reg-status',
                code: 'REJECTED'
              }
            ]
          }
        }),
        { status: 200 }
      ],
      [userMock, { status: 200 }],
      [fieldAgentPractitionerMock, { status: 200 }],
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
    expect(modifyTaskBundle(testFhirTaskBundle, token)).rejects.toThrowError()
  })
})
