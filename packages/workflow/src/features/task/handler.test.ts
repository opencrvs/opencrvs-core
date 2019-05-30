import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { createServer } from '../..'
import {
  userMock,
  fieldAgentPractitionerMock,
  fieldAgentPractitionerRoleMock,
  districtMock,
  upazilaMock,
  unionMock,
  officeMock,
  testFhirTaskBundle,
  testFhirBundleWithIdsForDeath
} from '@workflow/test/utils'

import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

describe('Verify handler', () => {
  let server: any

  beforeEach(async () => {
    fetch.resetMocks()
    server = await createServer()
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
  })
  it('updateTaskHandler returns OK for a correctly authenticated user for birth', async () => {
    fetch.mockResponse(
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
      method: 'PUT',
      url: '/fhir/Task/123',
      payload: testFhirTaskBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
  it('updateTaskHandler returns OK for a correctly authenticated user for death', async () => {
    fetch.mockResponse(
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
      method: 'PUT',
      url: '/fhir/Task/123',
      payload: testFhirBundleWithIdsForDeath,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
  it('updateTaskHandler throws error if invalid fhir data is provided', async () => {
    fetch.mockResponse(
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
      method: 'PUT',
      url: '/fhir/Task/123',
      payload: { data: 'INVALID' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(500)
  })
  it('updateTaskHandler throws error if fhir returns an error', async () => {
    fetch.mockImplementation(() => new Error('boom'))

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
      method: 'PUT',
      url: '/fhir/Task/123',
      payload: testFhirTaskBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(500)
  })
})
