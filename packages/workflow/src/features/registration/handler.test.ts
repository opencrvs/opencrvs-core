import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import * as fetch from 'jest-fetch-mock'
import { createServer } from '../..'
import { testFhirBundle } from 'src/test/utils'

describe('Verify handler', () => {
  let server: any

  beforeEach(async () => {
    fetch.resetMocks()
    server = await createServer()
  })
  it('createBirthRegistrationHandler returns OK', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        resourceType: 'Bundle',
        entry: [
          {
            response: { location: 'Patient/12423/_history/1' }
          }
        ]
      })
    )
    jest.spyOn(require('./utils'), 'sendBirthNotification').mockReturnValue('')

    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/createBirthRegistration',
      payload: testFhirBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
  it('createBirthRegistrationHandler throws error if invalid fhir data is provided', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        resourceType: 'Bundle',
        entry: [
          {
            response: { location: 'Patient/12423/_history/1' }
          }
        ]
      })
    )

    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/createBirthRegistration',
      payload: { data: 'INVALID' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(500)
  })
  it('createBirthRegistrationHandler throws error if fhir returns an error', async () => {
    fetch.mockImplementationOnce(() => new Error('boom'))

    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/createBirthRegistration',
      payload: testFhirBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(500)
  })
})
