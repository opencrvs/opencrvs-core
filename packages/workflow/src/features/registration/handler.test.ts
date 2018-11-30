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
  describe('createBirthRegistrationHandler', () => {
    it('returns OK', async () => {
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
      jest
        .spyOn(require('./utils'), 'sendBirthNotification')
        .mockReturnValue('')

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
    it('throws error if invalid fhir data is provided', async () => {
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
    it('throws error if fhir returns an error', async () => {
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
  describe('markBirthAsRegisteredHandler', () => {
    beforeEach(() => {
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
                    { use: 'en', family: ['Al Hasan'], given: ['Shakib'] },
                    { use: 'bn', family: [''], given: [''] }
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
        ],
        [
          JSON.stringify({
            entry: [
              {
                fullUrl:
                  'http://localhost:3447/fhir/PractitionerRole/9c8b8ac2-9044-4b66-8d31-07c5a4b4348d',
                resource: {
                  resourceType: 'PractitionerRole',
                  practitioner: {
                    reference:
                      'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
                  },
                  code: [
                    {
                      coding: [
                        {
                          system: 'http://opencrvs.org/specs/roles',
                          code: 'FIELD_AGENT'
                        }
                      ]
                    }
                  ],
                  location: [
                    {
                      reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacd9173'
                    },
                    {
                      reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdxxx'
                    },
                    {
                      reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdyyyy'
                    }
                  ],
                  meta: {
                    lastUpdated: '2018-11-25T17:31:08.096+00:00',
                    versionId: '2f79ee2d-3b78-4c90-91d8-278e4a28caf7'
                  },
                  id: '9c8b8ac2-9044-4b66-8d31-07c5a4b4348d'
                }
              }
            ]
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Location',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/a2i-internal-id',
                value: '165'
              },
              { system: 'http://opencrvs.org/specs/id/bbs-code', value: '34' },
              {
                system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                value: 'UPAZILA'
              }
            ]
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Location',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/a2i-internal-id',
                value: '165'
              },
              { system: 'http://opencrvs.org/specs/id/bbs-code', value: '21' },
              {
                system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                value: 'UNION'
              }
            ]
          }),
          { status: 200 }
        ],
        [
          JSON.stringify({
            resourceType: 'Location',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/a2i-internal-id',
                value: '165'
              },
              { system: 'http://opencrvs.org/specs/id/bbs-code', value: '10' },
              {
                system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                value: 'DISTRICT'
              }
            ]
          }),
          { status: 200 }
        ]
      )
    })
    it('returns OK', async () => {
      const token = jwt.sign(
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:workflow-user'
        }
      )

      fetch.mockResponse(
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              response: { location: 'Patient/12423/_history/1' }
            }
          ]
        })
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/markBirthAsRegistered',
        payload: testFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(200)
    })
    it('throws error if invalid fhir data is provided', async () => {
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
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:workflow-user'
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/markBirthAsRegistered',
        payload: { data: 'INVALID' },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(500)
    })
    it('throws error if fhir returns an error', async () => {
      fetch.mockImplementation(() => new Error('boom'))

      const token = jwt.sign(
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:workflow-user'
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/markBirthAsRegistered',
        payload: testFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(500)
    })
  })
})
