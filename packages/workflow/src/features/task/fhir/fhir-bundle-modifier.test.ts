import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { createServer } from '../../../'
import {
  userMock,
  fieldAgentPractitionerMock,
  fieldAgentPractitionerRoleMock,
  districtMock,
  upazilaMock,
  unionMock,
  officeMock,
  testFhirTaskBundle
} from 'src/test/utils'
import { modifyTaskBundle } from './fhir-bundle-modifier'
import * as fetch from 'jest-fetch-mock'

describe('Verify handler', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })
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
    const fhirTask = payload.entry[0].resource as fhir.Task
    expect(fhirTask.note[0].authorString).toEqual(
      'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
    )
  })
})
