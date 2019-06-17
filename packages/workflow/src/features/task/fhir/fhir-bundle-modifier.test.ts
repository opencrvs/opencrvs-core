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
  testFhirTaskBundle
} from '@workflow/test/utils'
import { modifyTaskBundle } from '@workflow/features/task/fhir/fhir-bundle-modifier'

import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

describe('Verify handler', () => {
  it('modifyTaskBundle returns correct bundle', async () => {
    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )
    fetch.mockResponses(
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
    const payload = await modifyTaskBundle(testFhirTaskBundle, token)
    if (
      payload &&
      payload.entry &&
      payload.entry[0] &&
      payload.entry[0].resource
    ) {
      const fhirTask = payload.entry[0].resource as fhir.Task
      if (
        fhirTask &&
        fhirTask.note &&
        fhirTask.note[0] &&
        fhirTask.note[0].authorString
      ) {
        expect(fhirTask.note[0].authorString).toEqual(
          'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
        )
      }
    } else {
      throw new Error('Failed')
    }
  })
})
