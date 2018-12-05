import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import * as fetch from 'jest-fetch-mock'
import { createServer } from '../..'
import { testFhirTaskBundle } from 'src/test/utils'

describe('Verify handler', () => {
  let server: any

  beforeEach(async () => {
    fetch.resetMocks()
    server = await createServer()
  })
  it('updateTaskHandler returns OK', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        resourceType: 'Bundle',
        entry: [
          {
            response: { resourceType: 'Task' }
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
      url: '/updateTask',
      payload: testFhirTaskBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
  it('updateTaskHandler throws error if invalid fhir data is provided', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        resourceType: 'Bundle',
        entry: [
          {
            response: { resourceType: 'Task' }
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
      url: '/updateTask',
      payload: { data: 'INVALID' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(500)
  })
  it('updateTaskHandler throws error if fhir returns an error', async () => {
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
      url: '/updateTask',
      payload: testFhirTaskBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(500)
  })
})
