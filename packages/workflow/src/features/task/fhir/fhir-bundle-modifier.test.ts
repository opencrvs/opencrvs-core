import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { createServer } from '../../../'
import { testFhirTaskBundle, testFhirBundleWithNote } from 'src/test/utils'
import { modifyTaskBundle } from './fhir-bundle-modifier'

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
    const payload = modifyTaskBundle(testFhirTaskBundle, token)
    const fhirTask = payload.entry[0].resource as fhir.Task
    expect(fhirTask.note[0].authorString).toEqual('DUMMY')
  })
})
