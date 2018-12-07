import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { createServer } from '../../../'
import { testFhirTaskBundle, testFhirBundleWithNote } from 'src/test/utils'
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
            }
          ]
        }),
        { status: 200 }
      ]
    )
    const payload = await modifyTaskBundle(testFhirTaskBundle, token)
    const fhirTask = payload.entry[0].resource as fhir.Task
    expect(fhirTask.note[0].authorString).toEqual(
      'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
    )
  })
})
