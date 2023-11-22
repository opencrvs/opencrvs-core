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
/* eslint-disable @typescript-eslint/no-var-requires */
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
// eslint-disable-next-line import/no-relative-parent-imports
import {
  Bundle,
  Composition,
  Encounter,
  Location,
  Observation,
  Patient,
  RelatedPerson,
  Task,
  TrackingID,
  URNReference
} from '@opencrvs/commons/types'
import { populateCompositionWithID } from '@workflow/features/registration/handler'
import {
  ASSIGNED_EXTENSION_URL,
  DOWNLOADED_EXTENSION_URL,
  UNASSIGNED_EXTENSION_URL
} from '@workflow/features/task/fhir/constants'
import { createServer } from '@workflow/server'
import {
  compositionMock,
  deathCompositionMock,
  deathTaskMock,
  districtMock,
  fieldAgentPractitionerMock,
  fieldAgentPractitionerRoleMock,
  hearthResponseMock,
  informantSMSNotificationMock,
  mockFormDraft,
  motherMock,
  officeMock,
  patientMock,
  relatedPersonMock,
  taskResourceMock,
  testFhirBundle,
  testFhirBundleWithIds,
  testFhirBundleWithIdsForDeath,
  testFhirTaskBundle,
  testInProgressDeathFhirBundle,
  testInProgressFhirBundle,
  unionMock,
  upazilaMock,
  userMock,
  userResponseMock,
  wrapInBundle
} from '@workflow/test/utils'
import * as fetchAny from 'jest-fetch-mock'
import { cloneDeep } from 'lodash'
const fetch = fetchAny as any

const mockInput = [
  {
    valueCode: 'child',
    valueId: 'name',
    type: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/action-type',
          code: 'update'
        }
      ]
    },
    valueString: 'Khaby Lame'
  },
  {
    valueCode: 'mother',
    valueId: 'name',
    type: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/action-type',
          code: 'update'
        }
      ]
    },
    valueString: 'First Name Last Name'
  }
]

const mockOutput = [
  {
    valueCode: 'child',
    valueId: 'name',
    type: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/action-type',
          code: 'update'
        }
      ]
    },
    valueString: 'Khaby Lame Corrected'
  },
  {
    valueCode: 'mother',
    valueId: 'name',
    type: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/action-type',
          code: 'update'
        }
      ]
    },
    valueString: 'Mother Family Name'
  }
]
const bundleWithInputOutput: any = cloneDeep(testFhirBundleWithIds)
const bundleWithInputOutputDeath: any = cloneDeep(testFhirBundleWithIdsForDeath)

bundleWithInputOutput.entry[1].resource.input = mockInput
bundleWithInputOutputDeath.entry[1].resource.input = mockInput

bundleWithInputOutput.entry[1].resource.output = mockOutput
bundleWithInputOutputDeath.entry[1].resource.output = mockOutput

const getMarkBundleAndPostToHearthMockResponses = [
  [userMock, { status: 200 }],
  [fieldAgentPractitionerMock, { status: 200 }],
  [taskResourceMock, { status: 200 }],
  [fieldAgentPractitionerRoleMock, { status: 200 }],
  [districtMock, { status: 200 }],
  [upazilaMock, { status: 200 }],
  [unionMock, { status: 200 }],
  [officeMock, { status: 200 }],
  [fieldAgentPractitionerRoleMock, { status: 200 }],
  [districtMock, { status: 200 }],
  [upazilaMock, { status: 200 }],
  [unionMock, { status: 200 }],
  [officeMock, { status: 200 }],
  [hearthResponseMock, { status: 200 }]
]

describe('Verify handler', () => {
  let server: any

  beforeEach(async () => {
    fetch.resetMocks()
    server = await createServer()
  })

  describe('createRegistrationHandler', () => {
    beforeEach(() => {
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
    it('returns OK for a correctly authenticated user  with birth declaration', async () => {
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
        .spyOn(require('./utils'), 'sendEventNotification')
        .mockReturnValue('')

      const token = jwt.sign(
        { scope: ['declare'] },
        readFileSync('./test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:workflow-user'
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/fhir',
        payload: testFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(200)
    })

    it('returns OK for a correctly authenticated user  with in-progress birth declaration', async () => {
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
        .spyOn(require('./utils'), 'sendEventNotification')
        .mockReturnValue('')

      const token = jwt.sign(
        { scope: ['declare'] },
        readFileSync('./test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:workflow-user'
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/fhir',
        payload: testInProgressFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(200)
    })

    it('returns OK for a correctly authenticated user  with in-progress death declaration', async () => {
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
        .spyOn(require('./utils'), 'sendEventNotification')
        .mockReturnValue('')

      const token = jwt.sign(
        { scope: ['declare'] },
        readFileSync('./test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:workflow-user'
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/fhir',
        payload: testInProgressDeathFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(200)
    })

    it('returns OK for a correctly authenticated user birth validation', async () => {
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
        [officeMock, { status: 200 }],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                response: { location: 'Patient/12423/_history/1' }
              }
            ]
          })
        ]
      )

      const token = jwt.sign(
        { scope: ['validate'] },
        readFileSync('./test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:workflow-user'
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/fhir',
        payload: testFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(200)
    })

    it('returns OK for a registrar user', async () => {
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
        [officeMock, { status: 200 }],
        [hearthResponseMock, { status: 200 }],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                fullUrl: 'urn:uuid:104ad8fd-e7b8-4e3e-8193-abc2c473f2c9',
                resource: {
                  resourceType: 'Task',
                  status: 'ready',
                  code: {
                    coding: [
                      {
                        system: 'http://opencrvs.org/specs/types',
                        code: 'birth-registration'
                      }
                    ]
                  },
                  identifier: [
                    {
                      system: 'http://opencrvs.org/specs/id/paper-form-id',
                      value: '12345678'
                    },
                    {
                      system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                      value: 'B5WGYJE'
                    }
                  ],
                  extension: [
                    {
                      url: 'http://opencrvs.org/specs/extension/contact-person',
                      valueString: 'MOTHER'
                    }
                  ],
                  id: '104ad8fd-e7b8-4e3e-8193-abc2c473f2c9'
                }
              }
            ]
          })
        ],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                response: { location: 'Patient/12423/_history/1' }
              }
            ]
          })
        ]
      )
      jest
        .spyOn(require('./utils'), 'sendEventNotification')
        .mockReturnValue('')

      const token = jwt.sign(
        { scope: ['register'] },
        readFileSync('./test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:workflow-user'
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/fhir',
        payload: testFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(200)
    })

    it('throws error if fhir returns an error', async () => {
      fetch.mockImplementationOnce(() => new Error('boom'))

      const token = jwt.sign(
        { scope: ['declare'] },
        readFileSync('./test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:workflow-user'
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/fhir',
        payload: testFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(500)
    })

    it('generates a new tracking id and repeats the request if a 409 is received from hearth', async () => {
      fetch.mockResponses(
        ['', { status: 409 }],
        ['', { status: 409 }],
        [
          JSON.stringify({
            resourceType: 'Bundle',
            entry: [
              {
                response: { location: 'Patient/12423/_history/1' }
              }
            ]
          })
        ]
      )

      const token = jwt.sign(
        { scope: ['declare'] },
        readFileSync('./test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:workflow-user'
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/fhir',
        payload: testFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(200)
    })

    it('fails after trying to generate a new trackingID and sending to Hearth 5 times', async () => {
      fetch.mockResponses(
        ['', { status: 409 }],
        ['', { status: 409 }],
        ['', { status: 409 }],
        ['', { status: 409 }],
        ['', { status: 409 }]
      )

      const token = jwt.sign(
        { scope: ['declare'] },
        readFileSync('./test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:workflow-user'
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/fhir',
        payload: testFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(500)
    })
  })
})

describe('markEventAsValidatedHandler handler', () => {
  let server: any

  beforeEach(async () => {
    fetch.resetMocks()
    server = await createServer()
    fetch.mockResponses(
      ...getMarkBundleAndPostToHearthMockResponses,
      // For triggering DECLARATION_UPDATED event
      [{}, { status: 200 }],
      // This is needed only for the bundle with input output
      ...getMarkBundleAndPostToHearthMockResponses
    )
  })

  it('returns OK with full fhir bundle as payload', async () => {
    const token = jwt.sign(
      { scope: ['validate'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir',
      payload: testFhirBundleWithIds,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('returns OK with full fhir bundle as payload for death', async () => {
    const token = jwt.sign(
      { scope: ['validate'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir',
      payload: testFhirBundleWithIdsForDeath,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('returns OK with full fhir bundle with input output as payload', async () => {
    const token = jwt.sign(
      { scope: ['validate'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )
    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir',
      payload: bundleWithInputOutput,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('returns OK with full fhir bundl with input outpute as payload for death', async () => {
    const token = jwt.sign(
      { scope: ['validate'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir',
      payload: bundleWithInputOutputDeath,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
})

describe('markEventAsRegisteredHandler handler', () => {
  let server: any

  beforeEach(async () => {
    fetch.resetMocks()
    server = await createServer()
    fetch.mockResponses(
      [userMock, { status: 200 }],
      [fieldAgentPractitionerMock, { status: 200 }],
      [taskResourceMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }],
      [hearthResponseMock, { status: 200 }]
    )
  })

  it('returns OK with full fhir bundle as payload', async () => {
    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    fetch.mockResponseOnce(
      JSON.stringify({
        resourceType: 'Bundle',
        entry: [
          {
            fullUrl: 'urn:uuid:104ad8fd-e7b8-4e3e-8193-abc2c473f2c9',
            resource: {
              resourceType: 'Task',
              status: 'ready',
              code: {
                coding: [
                  {
                    system: 'http://opencrvs.org/specs/types',
                    code: 'birth-registration'
                  }
                ]
              },
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/paper-form-id',
                  value: '12345678'
                },
                {
                  system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                  value: 'B5WGYJE'
                }
              ],
              extension: [
                {
                  url: 'http://opencrvs.org/specs/extension/contact-person',
                  valueString: 'MOTHER'
                }
              ],
              id: '104ad8fd-e7b8-4e3e-8193-abc2c473f2c9'
            }
          }
        ]
      })
    )
    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir',
      payload: testFhirBundleWithIds,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('returns OK with full fhir bundle as payload for death', async () => {
    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    fetch.mockResponseOnce(
      JSON.stringify({
        resourceType: 'Bundle',
        entry: [
          {
            fullUrl: 'urn:uuid:104ad8fd-e7b8-4e3e-8193-abc2c473f2c9',
            resource: {
              resourceType: 'Task',
              status: 'ready',
              code: {
                coding: [
                  {
                    system: 'http://opencrvs.org/specs/types',
                    code: 'death-registration'
                  }
                ]
              },
              identifier: [
                {
                  system: 'http://opencrvs.org/specs/id/death-tracking-id',
                  value: 'D5WGYJE'
                }
              ],
              id: '104ad8fd-e7b8-4e3e-8193-abc2c473f2c9'
            }
          }
        ]
      })
    )
    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir',
      payload: testFhirBundleWithIdsForDeath,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('returns OK with task entry as payload for birth', async () => {
    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    fetch.resetMocks()
    fetch.mockResponses(
      [userMock, { status: 200 }],
      [fieldAgentPractitionerMock, { status: 200 }],
      [taskResourceMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }],
      [
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              response: { location: 'Task/12423/_history/1' }
            }
          ]
        })
      ],
      [compositionMock, { status: 200 }],
      [motherMock, { status: 200 }]
    )
    const taskBundle = {
      resourceType: 'Bundle',
      type: 'document',
      entry: [
        {
          fullUrl: 'urn:uuid:104ad8fd-e7b8-4e3e-8193-abc2c473f2c9',
          resource: {
            resourceType: 'Task',
            status: 'ready',
            focus: {
              reference: 'Composition/95035079-ec2c-451c-b514-664e838e8a5b'
            },
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/types',
                  code: 'BIRTH'
                }
              ]
            },
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/paper-form-id',
                value: '12345678'
              },
              {
                system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                value: 'B5WGYJE'
              }
            ],
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/contact-person',
                valueString: 'MOTHER'
              }
            ],
            id: '104ad8fd-e7b8-4e3e-8193-abc2c473f2c9'
          }
        }
      ]
    }

    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir',
      payload: taskBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
  it('returns OK with task entry as payload for death', async () => {
    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    fetch.resetMocks()
    fetch.mockResponses(
      [userMock, { status: 200 }],
      [fieldAgentPractitionerMock, { status: 200 }],
      [taskResourceMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }],
      [
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              response: { location: 'Task/12423/_history/1' }
            }
          ]
        })
      ],
      [deathCompositionMock, { status: 200 }],
      [
        JSON.stringify({
          resourceType: 'RelatedPerson',
          relationship: {
            coding: [
              {
                system:
                  'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
                code: 'MOTHER'
              }
            ]
          },
          patient: {
            reference: 'urn:uuid:030b5690-c5c9-4dc5-a55d-045c2f9b9bd7'
          }
        })
      ],
      [motherMock, { status: 200 }]
    )
    const taskBundle = {
      resourceType: 'Bundle',
      type: 'document',
      entry: [
        {
          fullUrl: 'urn:uuid:104ad8fd-e7b8-4e3e-8193-abc2c473f2c9',
          resource: {
            resourceType: 'Task',
            status: 'ready',
            focus: {
              reference: 'Composition/95035079-ec2c-451c-b514-664e838e8a5b'
            },
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/types',
                  code: 'DEATH'
                }
              ]
            },
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/death-tracking-id',
                value: 'D5WGYJE'
              }
            ],
            id: '104ad8fd-e7b8-4e3e-8193-abc2c473f2c9'
          }
        }
      ]
    }

    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir',
      payload: taskBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
})

describe('markEventAsRegisteredCallbackHandler', () => {
  let server: any
  let token: any
  beforeEach(async () => {
    token = jwt.sign({ scope: ['register'] }, readFileSync('./test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:workflow-user'
    })
    fetch.resetMocks()
    server = await createServer()

    jest
      .spyOn(require('./fhir/fhir-utils'), 'getInformantName')
      .mockReturnValue('informant name')
  })

  it('returns error', async () => {
    fetch.mockResponses(
      [officeMock, { status: 200 }],
      [relatedPersonMock, { status: 200 }],
      [motherMock, { status: 200 }]
    )
    const res = await server.server.inject({
      method: 'POST',
      url: '/confirm/registration',
      payload: {
        trackingId: 'B1mW7jA',
        registrationNumber: '12345678'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(500)
  })

  it('returns OK with birth registration', async () => {
    fetch.mockResponses(
      [wrapInBundle(taskResourceMock), { status: 200 }],
      [compositionMock, { status: 200 }],
      [JSON.stringify({}), { status: 200 }],
      [JSON.stringify({}), { status: 200 }],
      [JSON.stringify({}), { status: 200 }],
      [patientMock, { status: 200 }],
      [motherMock, { status: 200 }],
      [JSON.stringify(informantSMSNotificationMock), { status: 200 }]
    )
    const res = await server.server.inject({
      method: 'POST',
      url: '/confirm/registration',
      payload: {
        trackingId: 'B1mW7jA',
        registrationNumber: '12345678'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('returns OK with death registration', async () => {
    fetch.mockResponses(
      [wrapInBundle(JSON.parse(deathTaskMock)), { status: 200 }],
      [deathCompositionMock, { status: 200 }],
      [JSON.stringify({}), { status: 200 }],
      [JSON.stringify({}), { status: 200 }],
      [JSON.stringify([]), { status: 200 }],
      [JSON.stringify([]), { status: 200 }],
      [patientMock, { status: 200 }],
      [motherMock, { status: 200 }],
      [motherMock, { status: 200 }]
    )
    const res = await server.server.inject({
      method: 'POST',
      url: '/confirm/registration',
      payload: {
        trackingId: 'B1mW7jA',
        registrationNumber: '12345678'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
})

describe('downloaded action handler', () => {
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
      [officeMock, { status: 200 }],
      [userResponseMock, { status: 200 }],
      [hearthResponseMock, { status: 200 }],
      [mockFormDraft, { status: 200 }]
    )
  })

  it('returns OK with full fhir bundle as payload', async () => {
    const token = jwt.sign(
      { scope: ['validate'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )
    const bundleWithDownloadExtension: any = cloneDeep(testFhirTaskBundle)
    bundleWithDownloadExtension.entry[0].resource.extension = [
      ...bundleWithDownloadExtension.entry[0].resource.extension,
      {
        url: DOWNLOADED_EXTENSION_URL
      }
    ]
    const res = await server.server.inject({
      method: 'PUT',
      url: '/fhir',
      payload: bundleWithDownloadExtension,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
})

describe('assigned action handler', () => {
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
      [officeMock, { status: 200 }],
      [userResponseMock, { status: 200 }],
      [hearthResponseMock, { status: 200 }],
      [mockFormDraft, { status: 200 }]
    )
  })

  it('returns OK with full fhir bundle as payload', async () => {
    const token = jwt.sign(
      { scope: ['validate'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )
    const bundleWithAssignedExtension: any = cloneDeep(testFhirTaskBundle)
    bundleWithAssignedExtension.entry[0].resource.extension = [
      ...bundleWithAssignedExtension.entry[0].resource.extension,
      {
        url: ASSIGNED_EXTENSION_URL
      }
    ]
    const res = await server.server.inject({
      method: 'PUT',
      url: '/fhir',
      payload: bundleWithAssignedExtension,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
})

describe('unassigned action handler', () => {
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
      [officeMock, { status: 200 }],
      [userResponseMock, { status: 200 }],
      [hearthResponseMock, { status: 200 }],
      [mockFormDraft, { status: 200 }]
    )
  })

  it('returns OK with full fhir bundle as payload', async () => {
    const token = jwt.sign(
      { scope: ['validate'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )
    const bundleWithUnassignedExtension: any = cloneDeep(testFhirTaskBundle)
    bundleWithUnassignedExtension.entry[0].resource.extension = [
      ...bundleWithUnassignedExtension.entry[0].resource.extension,
      {
        url: UNASSIGNED_EXTENSION_URL
      }
    ]
    const res = await server.server.inject({
      method: 'PUT',
      url: '/fhir',
      payload: bundleWithUnassignedExtension,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
})

describe('markEventAsWaitingValidationHandler', () => {
  let server: any

  beforeEach(async () => {
    fetch.resetMocks()
    server = await createServer()
    fetch.mockResponses(
      ...getMarkBundleAndPostToHearthMockResponses,
      // For triggering DECLARATION_UPDATED event
      [JSON.stringify({}), { status: 200 }],
      // This is needed only for the bundle with input output
      ...getMarkBundleAndPostToHearthMockResponses,
      [hearthResponseMock, { status: 200 }]
    )
  })

  it('returns OK with full fhir bundle as payload', async () => {
    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )
    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir',
      payload: bundleWithInputOutput,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('returns OK with full fhir bundle as payload for death', async () => {
    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir',
      payload: bundleWithInputOutputDeath,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
})

describe('fhirWorkflowEventHandler', () => {
  let server: any

  beforeEach(async () => {
    fetch.resetMocks()
    server = await createServer()
  })
  it('returns un-authorized response when scope does not match event', async () => {
    const token = jwt.sign(
      { scope: ['???'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir',
      payload: testFhirBundle,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(401)
  })

  it('forwards unknown events to Hearth', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({ resourceType: 'OperationOutcome' }),
      {
        headers: { Location: '/fhir/Patient/123' }
      }
    )

    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir/Patient',
      payload: { id: 123, resourceType: 'Patient' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })

  it('forwards get calls with query params to Hearth', async () => {
    const mock = fetch.mockResponseOnce(
      JSON.stringify({ resourceType: 'OperationOutcome' })
    )

    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'GET',
      url: '/fhir/Task?focus=Composition/123',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
    expect(mock).toBeCalledWith(
      'http://localhost:3447/fhir/Task?focus=Composition/123',
      {
        body: undefined,
        headers: { 'Content-Type': 'application/fhir+json' },
        method: 'get'
      }
    )
  })
})

describe('markBirthAsCertifiedHandler handler', () => {
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
      [officeMock, { status: 200 }],
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
  it('returns OK with full fhir bundle as payload for birth', async () => {
    const token = jwt.sign(
      { scope: ['certify'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    fetch.mockResponseOnce(
      JSON.stringify({
        resourceType: 'Bundle',
        entry: [
          {
            response: { location: 'Composition/12423/_history/1' }
          }
        ]
      })
    )
    const testCertificateFhirBundle = cloneDeep(testFhirBundleWithIds)
    if (
      testCertificateFhirBundle &&
      testCertificateFhirBundle.entry &&
      testCertificateFhirBundle.entry[1] &&
      testCertificateFhirBundle.entry[1].resource &&
      testCertificateFhirBundle.entry[1].resource.identifier
    ) {
      const identifiers = testCertificateFhirBundle.entry[1].resource
        .identifier as fhir3.Identifier[]
      identifiers.push({
        system: 'http://opencrvs.org/specs/id/birth-registration-number',
        value: '12345678'
      })
      const res = await server.server.inject({
        method: 'POST',
        url: '/fhir',
        payload: testCertificateFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(200)
    }
  })
  it('returns OK with full fhir bundle as payload for death', async () => {
    const token = jwt.sign(
      { scope: ['certify'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    fetch.mockResponseOnce(
      JSON.stringify({
        resourceType: 'Bundle',
        entry: [
          {
            response: { location: 'Composition/12423/_history/1' }
          }
        ]
      })
    )
    const testCertificateFhirBundle = cloneDeep(testFhirBundleWithIdsForDeath)
    if (
      testCertificateFhirBundle &&
      testCertificateFhirBundle.entry &&
      testCertificateFhirBundle.entry[1] &&
      testCertificateFhirBundle.entry[1].resource &&
      (testCertificateFhirBundle.entry[1].resource as Task).identifier
    ) {
      const identifiers = (testCertificateFhirBundle.entry[1].resource as Task)
        .identifier as fhir3.Identifier[]
      identifiers.push({
        system: 'http://opencrvs.org/specs/id/death-registration-number',
        value: '12345678'
      })
      const res = await server.server.inject({
        method: 'POST',
        url: '/fhir',
        payload: testCertificateFhirBundle,
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(res.statusCode).toBe(200)
    }
  })
})

describe('Register handler', () => {
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

  it('throws error if fhir returns an error', async () => {
    fetch.mockImplementationOnce(() => new Error('boom'))

    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/fhir',
      payload: testFhirBundleWithIds,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(500)
  })
})

describe('populateCompositionWithID', () => {
  it('Populates payload with response ID and response encounter ID for DECLARED status', () => {
    const payload: Bundle<
      | Composition
      | Task
      | Patient
      | RelatedPerson
      | Location
      | Encounter
      | Observation
    > = {
      resourceType: 'Bundle',
      type: 'document',
      entry: [
        {
          fullUrl:
            'urn:uuid:cdf941b2-8d83-44a5-b1a2-6f6135fc1234' as URNReference,
          resource: {
            resourceType: 'Composition',
            identifier: { system: 'urn:ietf:rfc:3986', value: 'BVORKPB' },
            status: 'preliminary',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-types',
                  code: 'birth-declaration'
                }
              ],
              text: 'Birth Declaration'
            },
            class: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-classes',
                  code: 'crvs-document'
                }
              ],
              text: 'CRVS Document'
            },
            title: 'Birth Declaration',
            section: [
              {
                title: 'Child details',
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'child-details'
                    }
                  ],
                  text: 'Child details'
                },
                entry: [
                  {
                    reference:
                      'urn:uuid:b293edd6-1b93-40af-a3f0-419011034fdd' as URNReference
                  }
                ]
              },
              {
                title: "Mother's details",
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'mother-details'
                    }
                  ],
                  text: "Mother's details"
                },
                entry: [
                  {
                    reference:
                      'urn:uuid:4dd311c2-657e-4ca0-9469-34e680c2cc4e' as URNReference
                  }
                ]
              },
              {
                title: "Informant's details",
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'informant-details'
                    }
                  ],
                  text: "Informant's details"
                },
                entry: [
                  {
                    reference:
                      'urn:uuid:cd435236-3a55-449b-a929-fb930d1c274f' as URNReference
                  }
                ]
              },
              {
                title: 'Birth encounter',
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/specs/sections',
                      code: 'birth-encounter'
                    }
                  ],
                  text: 'Birth encounter'
                },
                entry: [
                  {
                    reference:
                      'urn:uuid:16f054d9-1a3c-4fd1-b151-9c3222f84cfd' as URNReference
                  }
                ]
              }
            ],
            subject: {},
            date: '2020-03-09T10:20:49.664Z',
            author: []
          }
        },
        {
          fullUrl:
            'urn:uuid:c88a38e2-5e99-419a-8942-5ae7d7cda21a' as URNReference,
          resource: {
            resourceType: 'Task',
            status: 'ready',
            code: {
              coding: [
                { system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }
              ]
            },
            focus: {
              reference:
                'urn:uuid:cdf941b2-8d83-44a5-b1a2-6f6135fc1234' as URNReference
            },
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/draft-id',
                value: 'fa88a6fc-8251-46e8-939f-1df3a840b01c'
              },
              {
                system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                value: 'BVORKPB' as TrackingID
              }
            ],
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/contact-person',
                valueString: 'MOTHER'
              },
              {
                url: 'http://opencrvs.org/specs/extension/contact-relationship',
                valueString: ''
              },
              {
                url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
                valueString: '+260730208366'
              },
              {
                url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
                valueInteger: 6490
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastUser',
                valueReference: {
                  reference: 'Practitioner/e388ce7b-72bb-4d70-885c-895ed08789da'
                }
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastLocation',
                valueReference: {
                  reference: 'Location/24559f93-6326-4ba6-a983-76be2702f0c0'
                }
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastOffice',
                valueReference: {
                  reference: 'Location/67e1c701-3087-4905-8fd3-b54096c9ffd1'
                }
              }
            ],
            lastModified: '2020-03-09T10:20:21.547Z',
            businessStatus: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/reg-status',
                  code: 'DECLARED'
                }
              ]
            }
          }
        },
        {
          fullUrl:
            'urn:uuid:b293edd6-1b93-40af-a3f0-419011034fdd' as URNReference,
          resource: {
            resourceType: 'Patient',
            active: true,
            name: [{ use: 'en', given: ['Tahmid'], family: ['Rahman'] }],
            gender: 'female',
            birthDate: '2018-05-18',
            multipleBirthInteger: 1
          }
        },
        {
          fullUrl:
            'urn:uuid:4dd311c2-657e-4ca0-9469-34e680c2cc4e' as URNReference,
          resource: {
            resourceType: 'Patient',
            active: true,
            identifier: [
              {
                value: '123456789',
                type: { coding: [{ code: 'NATIONAL_ID' }] }
              }
            ],
            name: [{ use: 'en', family: ['Rahman'] }],
            maritalStatus: {
              coding: [
                {
                  system:
                    'http://hl7.org/fhir/StructureDefinition/marital-status',
                  code: 'M'
                }
              ],
              text: 'MARRIED'
            },
            address: [
              {
                type: 'SECONDARY_ADDRESS',
                line: ['', '', '', '', '', ''],
                district: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
                state: '88e8ef3f-2649-49f2-9d84-6ae7101af84e',
                country: 'ZMB'
              },
              {
                type: 'PRIMARY_ADDRESS',
                line: ['', '', '', '', '', '', 'URBAN'],
                district: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
                state: '88e8ef3f-2649-49f2-9d84-6ae7101af84e',
                country: 'ZMB'
              },
              {
                type: 'SECONDARY_ADDRESS',
                line: ['', '', '', '', '', '', 'URBAN'],
                district: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
                state: '88e8ef3f-2649-49f2-9d84-6ae7101af84e',
                country: 'ZMB'
              }
            ],
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
                extension: [
                  {
                    url: 'code',
                    valueCodeableConcept: {
                      coding: [{ system: 'urn:iso:std:iso:3166', code: 'ZMB' }]
                    }
                  },
                  { url: 'period', valuePeriod: { start: '', end: '' } }
                ]
              }
            ]
          }
        },
        {
          fullUrl:
            'urn:uuid:cd435236-3a55-449b-a929-fb930d1c274f' as URNReference,
          resource: {
            resourceType: 'RelatedPerson',
            relationship: {
              coding: [
                {
                  system:
                    'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
                  code: 'MOTHER'
                }
              ]
            },
            patient: {
              reference:
                'urn:uuid:4dd311c2-657e-4ca0-9469-34e680c2cc4e' as URNReference
            }
          }
        },
        {
          fullUrl:
            'urn:uuid:16f054d9-1a3c-4fd1-b151-9c3222f84cfd' as URNReference,
          resource: {
            resourceType: 'Encounter',
            status: 'finished',
            location: [
              {
                location: {
                  reference:
                    'urn:uuid:9a452153-45fb-4cde-aeec-c82b7e7382b8' as URNReference
                }
              }
            ]
          }
        },
        {
          fullUrl:
            'urn:uuid:9a452153-45fb-4cde-aeec-c82b7e7382b8' as URNReference,
          resource: {
            resourceType: 'Location',
            mode: 'instance',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/location-type',
                  code: 'PRIVATE_HOME'
                }
              ]
            },
            address: {
              line: ['', '', '', '', '', '', 'URBAN'],
              city: '',
              district: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
              state: '88e8ef3f-2649-49f2-9d84-6ae7101af84e',
              postalCode: '',
              country: 'ZMB'
            }
          }
        },
        {
          fullUrl:
            'urn:uuid:e29c9d7c-261c-4a9b-8797-b902866bf9ad' as URNReference,
          resource: {
            resourceType: 'Observation',
            status: 'registered',
            context: {
              reference:
                'urn:uuid:16f054d9-1a3c-4fd1-b151-9c3222f84cfd' as URNReference
            },
            category: [
              {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/observation-category',
                    code: 'procedure',
                    display: 'Procedure'
                  }
                ]
              }
            ],
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: 'present-at-birth-reg',
                  display: 'Present at birth registration'
                }
              ]
            },
            valueString: 'BOTH_PARENTS'
          }
        }
      ],
      meta: { lastUpdated: '2020-03-09T10:20:49.664Z' }
    }
    const response = {
      resourceType: 'Bundle',
      entry: [
        {
          response: {
            status: '201',
            location:
              '/fhir/Composition/d10947db-51e1-4f47-a5e1-3f9d1b58eee8/_history/38f489b2-7ebe-41bc-a2d3-27b55f3c20fe'
          }
        },
        {
          response: {
            status: '201',
            location:
              '/fhir/Task/fb4a19b4-8f5f-4660-98a5-0a149d1580b3/_history/8c6a106a-34b3-4712-a54b-baa750ce1050'
          }
        },
        {
          response: {
            status: '201',
            location:
              '/fhir/Patient/f814a8d6-abd4-4ccd-8ed9-235e0908edfc/_history/c3899d1d-4bd9-45af-a010-82ca55b83dfb'
          }
        },
        {
          response: {
            status: '201',
            location:
              '/fhir/Patient/5de966c5-cc82-47a4-9676-4ea66285c3be/_history/808527d8-025b-4602-80a9-6bd0dac25670'
          }
        },
        {
          response: {
            status: '201',
            location:
              '/fhir/RelatedPerson/da0f5fb7-4e63-4dcf-8220-dd13e663bb6a/_history/e38d8be2-7b50-4927-9c37-3a992e792eb0'
          }
        },
        {
          response: {
            status: '201',
            location:
              '/fhir/Encounter/d3b9f408-a16a-42c2-9cfe-53ad2fbfda99/_history/e0bc842e-5a82-4bd7-812f-2977932f494e'
          }
        },
        {
          response: {
            status: '201',
            location:
              '/fhir/Location/26094c60-01b6-4b42-aa1c-d5513b1a610e/_history/69f7fcb4-74d0-4597-a253-faca7307e044'
          }
        },
        {
          response: {
            status: '201',
            location:
              '/fhir/Observation/d617505b-047f-459f-b486-9eb7c3fb0a82/_history/6eb5901a-9b7f-4272-9927-da3732f78cb5'
          }
        }
      ],
      type: 'transaction-response'
    } as Bundle
    populateCompositionWithID(payload, response)
    expect(payload).toEqual({
      resourceType: 'Bundle',
      type: 'document',
      entry: [
        {
          fullUrl: 'urn:uuid:cdf941b2-8d83-44a5-b1a2-6f6135fc1234',
          resource: {
            identifier: { system: 'urn:ietf:rfc:3986', value: 'BVORKPB' },
            resourceType: 'Composition',
            status: 'preliminary',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-types',
                  code: 'birth-declaration'
                }
              ],
              text: 'Birth Declaration'
            },
            class: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-classes',
                  code: 'crvs-document'
                }
              ],
              text: 'CRVS Document'
            },
            title: 'Birth Declaration',
            section: [
              {
                title: 'Child details',
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'child-details'
                    }
                  ],
                  text: 'Child details'
                },
                entry: [
                  { reference: 'urn:uuid:b293edd6-1b93-40af-a3f0-419011034fdd' }
                ]
              },
              {
                title: "Mother's details",
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'mother-details'
                    }
                  ],
                  text: "Mother's details"
                },
                entry: [
                  { reference: 'urn:uuid:4dd311c2-657e-4ca0-9469-34e680c2cc4e' }
                ]
              },
              {
                title: "Informant's details",
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'informant-details'
                    }
                  ],
                  text: "Informant's details"
                },
                entry: [
                  { reference: 'urn:uuid:cd435236-3a55-449b-a929-fb930d1c274f' }
                ]
              },
              {
                title: 'Birth encounter',
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/specs/sections',
                      code: 'birth-encounter'
                    }
                  ],
                  text: 'Birth encounter'
                },
                entry: [{ reference: 'd3b9f408-a16a-42c2-9cfe-53ad2fbfda99' }]
              }
            ],
            subject: {},
            date: '2020-03-09T10:20:49.664Z',
            author: [],
            id: 'd10947db-51e1-4f47-a5e1-3f9d1b58eee8'
          }
        },
        {
          fullUrl: 'urn:uuid:c88a38e2-5e99-419a-8942-5ae7d7cda21a',
          resource: {
            resourceType: 'Task',
            status: 'ready',
            code: {
              coding: [
                { system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }
              ]
            },
            focus: {
              reference: 'urn:uuid:cdf941b2-8d83-44a5-b1a2-6f6135fc1234'
            },
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/draft-id',
                value: 'fa88a6fc-8251-46e8-939f-1df3a840b01c'
              },
              {
                system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                value: 'BVORKPB'
              }
            ],
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/contact-person',
                valueString: 'MOTHER'
              },
              {
                url: 'http://opencrvs.org/specs/extension/contact-relationship',
                valueString: ''
              },
              {
                url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
                valueString: '+260730208366'
              },
              {
                url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
                valueInteger: 6490
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastUser',
                valueReference: {
                  reference: 'Practitioner/e388ce7b-72bb-4d70-885c-895ed08789da'
                }
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastLocation',
                valueReference: {
                  reference: 'Location/24559f93-6326-4ba6-a983-76be2702f0c0'
                }
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastOffice',
                valueReference: {
                  reference: 'Location/67e1c701-3087-4905-8fd3-b54096c9ffd1'
                }
              }
            ],
            lastModified: '2020-03-09T10:20:21.547Z',
            businessStatus: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/reg-status',
                  code: 'DECLARED'
                }
              ]
            }
          }
        },
        {
          fullUrl: 'urn:uuid:b293edd6-1b93-40af-a3f0-419011034fdd',
          resource: {
            resourceType: 'Patient',
            active: true,
            name: [{ use: 'en', given: ['Tahmid'], family: ['Rahman'] }],
            gender: 'female',
            birthDate: '2018-05-18',
            multipleBirthInteger: 1
          }
        },
        {
          fullUrl: 'urn:uuid:4dd311c2-657e-4ca0-9469-34e680c2cc4e',
          resource: {
            resourceType: 'Patient',
            active: true,
            identifier: [
              {
                value: '123456789',
                type: { coding: [{ code: 'NATIONAL_ID' }] }
              }
            ],
            name: [{ use: 'en', family: ['Rahman'] }],
            maritalStatus: {
              coding: [
                {
                  system:
                    'http://hl7.org/fhir/StructureDefinition/marital-status',
                  code: 'M'
                }
              ],
              text: 'MARRIED'
            },
            address: [
              {
                type: 'SECONDARY_ADDRESS',
                line: ['', '', '', '', '', ''],
                district: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
                state: '88e8ef3f-2649-49f2-9d84-6ae7101af84e',
                country: 'ZMB'
              },
              {
                type: 'PRIMARY_ADDRESS',
                line: ['', '', '', '', '', '', 'URBAN'],
                district: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
                state: '88e8ef3f-2649-49f2-9d84-6ae7101af84e',
                country: 'ZMB'
              },
              {
                type: 'SECONDARY_ADDRESS',
                line: ['', '', '', '', '', '', 'URBAN'],
                district: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
                state: '88e8ef3f-2649-49f2-9d84-6ae7101af84e',
                country: 'ZMB'
              }
            ],
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
                extension: [
                  {
                    url: 'code',
                    valueCodeableConcept: {
                      coding: [{ system: 'urn:iso:std:iso:3166', code: 'ZMB' }]
                    }
                  },
                  { url: 'period', valuePeriod: { start: '', end: '' } }
                ]
              }
            ]
          }
        },
        {
          fullUrl: 'urn:uuid:cd435236-3a55-449b-a929-fb930d1c274f',
          resource: {
            resourceType: 'RelatedPerson',
            relationship: {
              coding: [
                {
                  system:
                    'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
                  code: 'MOTHER'
                }
              ]
            },
            patient: {
              reference: 'urn:uuid:4dd311c2-657e-4ca0-9469-34e680c2cc4e'
            }
          }
        },
        {
          fullUrl: 'urn:uuid:16f054d9-1a3c-4fd1-b151-9c3222f84cfd',
          resource: {
            resourceType: 'Encounter',
            status: 'finished',
            location: [
              {
                location: {
                  reference: 'urn:uuid:9a452153-45fb-4cde-aeec-c82b7e7382b8'
                }
              }
            ]
          }
        },
        {
          fullUrl: 'urn:uuid:9a452153-45fb-4cde-aeec-c82b7e7382b8',
          resource: {
            resourceType: 'Location',
            mode: 'instance',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/location-type',
                  code: 'PRIVATE_HOME'
                }
              ]
            },
            address: {
              line: ['', '', '', '', '', '', 'URBAN'],
              city: '',
              district: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
              state: '88e8ef3f-2649-49f2-9d84-6ae7101af84e',
              postalCode: '',
              country: 'ZMB'
            }
          }
        },
        {
          fullUrl: 'urn:uuid:e29c9d7c-261c-4a9b-8797-b902866bf9ad',
          resource: {
            resourceType: 'Observation',
            status: 'registered',
            context: {
              reference: 'urn:uuid:16f054d9-1a3c-4fd1-b151-9c3222f84cfd'
            },
            category: [
              {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/observation-category',
                    code: 'procedure',
                    display: 'Procedure'
                  }
                ]
              }
            ],
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: 'present-at-birth-reg',
                  display: 'Present at birth registration'
                }
              ]
            },
            valueString: 'BOTH_PARENTS'
          }
        }
      ],
      meta: { lastUpdated: '2020-03-09T10:20:49.664Z' }
    })
  })
  it('Populates payload with response ID and response encounter ID for WAITING VALIDATION status', () => {
    const payload = {
      resourceType: 'Bundle',
      type: 'document',
      entry: [
        {
          fullUrl: 'urn:uuid:102aa17b-2d38-430f-b64b-61d47c2f8efb',
          resource: {
            identifier: {
              system: 'urn:ietf:rfc:3986',
              value: '102aa17b-2d38-430f-b64b-61d47c2f8efb'
            },
            resourceType: 'Composition',
            status: 'preliminary',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-types',
                  code: 'birth-declaration'
                }
              ],
              text: 'Birth Declaration'
            },
            class: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-classes',
                  code: 'crvs-document'
                }
              ],
              text: 'CRVS Document'
            },
            title: 'Birth Declaration',
            section: [
              {
                title: 'Birth encounter',
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/specs/sections',
                      code: 'birth-encounter'
                    }
                  ],
                  text: 'Birth encounter'
                },
                entry: [
                  { reference: 'urn:uuid:64561c3b-c954-4860-933d-d6b1a387f75b' }
                ]
              },
              {
                title: 'Child details',
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'child-details'
                    }
                  ],
                  text: 'Child details'
                },
                entry: [
                  { reference: 'urn:uuid:83240dc5-59ff-4253-8bd4-eb8843ba11ca' }
                ]
              },
              {
                title: "Mother's details",
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'mother-details'
                    }
                  ],
                  text: "Mother's details"
                },
                entry: [
                  { reference: 'urn:uuid:605dc85e-31c8-4bf9-986a-0799e3ab79ba' }
                ]
              },
              {
                title: "Informant's details",
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'informant-details'
                    }
                  ],
                  text: "Informant's details"
                },
                entry: [
                  { reference: 'urn:uuid:dd70f387-21e9-4f1f-8e2e-5939828d8cd1' }
                ]
              }
            ],
            subject: {},
            date: '2020-03-09T10:20:43.664Z',
            author: [],
            id: 'd10947db-51e1-4f47-a5e1-3f9d1b58eee8'
          }
        },
        {
          fullUrl: 'urn:uuid:64561c3b-c954-4860-933d-d6b1a387f75b',
          resource: {
            resourceType: 'Encounter',
            status: 'finished',
            id: 'd3b9f408-a16a-42c2-9cfe-53ad2fbfda99',
            location: [
              {
                location: {
                  reference: 'urn:uuid:1f3d3ddb-eaac-4a5e-9221-054633321bad'
                }
              }
            ]
          }
        },
        {
          fullUrl: 'urn:uuid:2613b03b-98d4-4652-8a2e-4e1daaf8f7c4',
          resource: {
            resourceType: 'Observation',
            status: 'final',
            context: {
              reference: 'urn:uuid:64561c3b-c954-4860-933d-d6b1a387f75b'
            },
            category: [
              {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/observation-category',
                    code: 'procedure',
                    display: 'Procedure'
                  }
                ]
              }
            ],
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: 'present-at-birth-reg',
                  display: 'Present at birth registration'
                }
              ]
            },
            id: 'd617505b-047f-459f-b486-9eb7c3fb0a82',
            valueString: 'BOTH_PARENTS'
          }
        },
        {
          fullUrl: 'urn:uuid:c85509d2-004c-435b-b710-64a688e241e1',
          resource: {
            resourceType: 'Task',
            status: 'ready',
            code: {
              coding: [
                { system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }
              ]
            },
            focus: {
              reference: 'urn:uuid:102aa17b-2d38-430f-b64b-61d47c2f8efb'
            },
            id: 'fb4a19b4-8f5f-4660-98a5-0a149d1580b3',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/draft-id',
                value: 'd10947db-51e1-4f47-a5e1-3f9d1b58eee8'
              },
              {
                system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                value: 'BVORKPB'
              }
            ],
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/contact-person',
                valueString: 'MOTHER'
              },
              {
                url: 'http://opencrvs.org/specs/extension/contact-relationship',
                valueString: ''
              },
              {
                url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
                valueString: '+260730208366'
              },
              {
                url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
                valueInteger: 490
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastLocation',
                valueReference: {
                  reference: 'Location/24559f93-6326-4ba6-a983-76be2702f0c0'
                }
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastOffice',
                valueReference: {
                  reference: 'Location/67e1c701-3087-4905-8fd3-b54096c9ffd1'
                }
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastUser',
                valueReference: {
                  reference: 'Practitioner/c9224259-f13b-4a33-b3c6-9570579e1a3d'
                }
              }
            ],
            lastModified: '2020-03-09T10:20:36.472Z',
            businessStatus: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/reg-status',
                  code: 'WAITING_VALIDATION'
                }
              ]
            }
          }
        },
        {
          fullUrl: 'urn:uuid:83240dc5-59ff-4253-8bd4-eb8843ba11ca',
          resource: {
            resourceType: 'Patient',
            active: true,
            id: 'f814a8d6-abd4-4ccd-8ed9-235e0908edfc',
            name: [{ use: 'en', given: ['Tahmid'], family: ['Rahman'] }],
            gender: 'female',
            birthDate: '2018-05-18',
            multipleBirthInteger: 1
          }
        },
        {
          fullUrl: 'urn:uuid:605dc85e-31c8-4bf9-986a-0799e3ab79ba',
          resource: {
            resourceType: 'Patient',
            active: true,
            id: '5de966c5-cc82-47a4-9676-4ea66285c3be',
            identifier: [
              {
                value: '123456789',
                type: { coding: [{ code: 'NATIONAL_ID' }] }
              }
            ],
            name: [{ use: 'en', family: ['Rahman'] }],
            maritalStatus: {
              coding: [
                {
                  system:
                    'http://hl7.org/fhir/StructureDefinition/marital-status',
                  code: 'M'
                }
              ],
              text: 'MARRIED'
            },
            address: [
              {
                type: 'SECONDARY_ADDRESS',
                line: ['', '', '', '', '', ''],
                district: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
                state: '88e8ef3f-2649-49f2-9d84-6ae7101af84e',
                country: 'ZMB'
              },
              {
                type: 'PRIMARY_ADDRESS',
                line: ['', '', '', '', '', '', 'URBAN'],
                district: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
                state: '88e8ef3f-2649-49f2-9d84-6ae7101af84e',
                country: 'ZMB'
              },
              {
                type: 'SECONDARY_ADDRESS',
                line: ['', '', '', '', '', '', 'URBAN'],
                district: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
                state: '88e8ef3f-2649-49f2-9d84-6ae7101af84e',
                country: 'ZMB'
              }
            ],
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
                extension: [
                  {
                    url: 'code',
                    valueCodeableConcept: {
                      coding: [{ system: 'urn:iso:std:iso:3166', code: 'ZMB' }]
                    }
                  },
                  { url: 'period', valuePeriod: { start: '', end: '' } }
                ]
              }
            ]
          }
        },
        {
          fullUrl: 'urn:uuid:dd70f387-21e9-4f1f-8e2e-5939828d8cd1',
          resource: {
            resourceType: 'RelatedPerson',
            relationship: {
              coding: [
                {
                  system:
                    'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
                  code: 'MOTHER'
                }
              ]
            },
            patient: {
              reference: 'urn:uuid:605dc85e-31c8-4bf9-986a-0799e3ab79ba'
            }
          }
        },
        {
          fullUrl: 'urn:uuid:1f3d3ddb-eaac-4a5e-9221-054633321bad',
          resource: {
            resourceType: 'Location',
            mode: 'instance',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/location-type',
                  code: 'PRIVATE_HOME'
                }
              ]
            },
            address: {
              line: ['', '', '', '', '', '', 'URBAN'],
              city: '',
              district: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
              state: '88e8ef3f-2649-49f2-9d84-6ae7101af84e',
              postalCode: '',
              country: 'ZMB'
            }
          }
        }
      ],
      meta: { lastUpdated: '2020-03-09T10:20:43.664Z' }
    }
    const response = {
      resourceType: 'Bundle',
      entry: [
        {
          response: {
            status: '200',
            location:
              '/fhir/Composition/d10947db-51e1-4f47-a5e1-3f9d1b58eee8/_history/2a70a1cd-fd08-4eab-a134-39769e34d41e'
          }
        },
        {
          response: {
            status: '200',
            location:
              '/fhir/Encounter/d3b9f408-a16a-42c2-9cfe-53ad2fbfda99/_history/e927451f-e19f-40dd-be7b-5b6c50c26d9d'
          }
        },
        {
          response: {
            status: '200',
            location:
              '/fhir/Observation/d617505b-047f-459f-b486-9eb7c3fb0a82/_history/e3264e1a-4a74-45e1-891d-7d27c7eb45a4'
          }
        },
        {
          response: {
            status: '200',
            location:
              '/fhir/Task/fb4a19b4-8f5f-4660-98a5-0a149d1580b3/_history/2482bf54-673a-4d80-a1ce-07c921820efb'
          }
        },
        {
          response: {
            status: '200',
            location:
              '/fhir/Patient/f814a8d6-abd4-4ccd-8ed9-235e0908edfc/_history/e26f454e-f55f-43fb-92c4-25c9d88d5b2a'
          }
        },
        {
          response: {
            status: '200',
            location:
              '/fhir/Patient/5de966c5-cc82-47a4-9676-4ea66285c3be/_history/fb4947b8-f541-4afb-a797-7c859d5a7c33'
          }
        },
        {
          response: {
            status: '201',
            location:
              '/fhir/RelatedPerson/8ca66791-362d-479d-8eb9-13d1929139dc/_history/4a1a9be8-fca4-4b6c-b097-5277c3d15ff3'
          }
        },
        {
          response: {
            status: '201',
            location:
              '/fhir/Location/43f49a50-d8f4-4f30-ba84-6bc7bc181b67/_history/139f61a3-7a3a-4532-8392-7094de3f1d80'
          }
        }
      ],
      type: 'transaction-response'
    } as Bundle
    populateCompositionWithID(payload as any, response)
    expect(payload).toEqual({
      resourceType: 'Bundle',
      type: 'document',
      entry: [
        {
          fullUrl: 'urn:uuid:102aa17b-2d38-430f-b64b-61d47c2f8efb',
          resource: {
            identifier: {
              system: 'urn:ietf:rfc:3986',
              value: '102aa17b-2d38-430f-b64b-61d47c2f8efb'
            },
            resourceType: 'Composition',
            status: 'preliminary',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-types',
                  code: 'birth-declaration'
                }
              ],
              text: 'Birth Declaration'
            },
            class: {
              coding: [
                {
                  system: 'http://opencrvs.org/doc-classes',
                  code: 'crvs-document'
                }
              ],
              text: 'CRVS Document'
            },
            title: 'Birth Declaration',
            section: [
              {
                title: 'Birth encounter',
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/specs/sections',
                      code: 'birth-encounter'
                    }
                  ],
                  text: 'Birth encounter'
                },
                entry: [{ reference: 'd3b9f408-a16a-42c2-9cfe-53ad2fbfda99' }]
              },
              {
                title: 'Child details',
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'child-details'
                    }
                  ],
                  text: 'Child details'
                },
                entry: [
                  { reference: 'urn:uuid:83240dc5-59ff-4253-8bd4-eb8843ba11ca' }
                ]
              },
              {
                title: "Mother's details",
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'mother-details'
                    }
                  ],
                  text: "Mother's details"
                },
                entry: [
                  { reference: 'urn:uuid:605dc85e-31c8-4bf9-986a-0799e3ab79ba' }
                ]
              },
              {
                title: "Informant's details",
                code: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/doc-sections',
                      code: 'informant-details'
                    }
                  ],
                  text: "Informant's details"
                },
                entry: [
                  { reference: 'urn:uuid:dd70f387-21e9-4f1f-8e2e-5939828d8cd1' }
                ]
              }
            ],
            subject: {},
            date: '2020-03-09T10:20:43.664Z',
            author: [],
            id: 'd10947db-51e1-4f47-a5e1-3f9d1b58eee8'
          }
        },
        {
          fullUrl: 'urn:uuid:64561c3b-c954-4860-933d-d6b1a387f75b',
          resource: {
            resourceType: 'Encounter',
            status: 'finished',
            id: 'd3b9f408-a16a-42c2-9cfe-53ad2fbfda99',
            location: [
              {
                location: {
                  reference: 'urn:uuid:1f3d3ddb-eaac-4a5e-9221-054633321bad'
                }
              }
            ]
          }
        },
        {
          fullUrl: 'urn:uuid:2613b03b-98d4-4652-8a2e-4e1daaf8f7c4',
          resource: {
            resourceType: 'Observation',
            status: 'final',
            context: {
              reference: 'urn:uuid:64561c3b-c954-4860-933d-d6b1a387f75b'
            },
            category: [
              {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/observation-category',
                    code: 'procedure',
                    display: 'Procedure'
                  }
                ]
              }
            ],
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: 'present-at-birth-reg',
                  display: 'Present at birth registration'
                }
              ]
            },
            id: 'd617505b-047f-459f-b486-9eb7c3fb0a82',
            valueString: 'BOTH_PARENTS'
          }
        },
        {
          fullUrl: 'urn:uuid:c85509d2-004c-435b-b710-64a688e241e1',
          resource: {
            resourceType: 'Task',
            status: 'ready',
            code: {
              coding: [
                { system: 'http://opencrvs.org/specs/types', code: 'BIRTH' }
              ]
            },
            focus: {
              reference: 'urn:uuid:102aa17b-2d38-430f-b64b-61d47c2f8efb'
            },
            id: 'fb4a19b4-8f5f-4660-98a5-0a149d1580b3',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/draft-id',
                value: 'd10947db-51e1-4f47-a5e1-3f9d1b58eee8'
              },
              {
                system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                value: 'BVORKPB'
              }
            ],
            extension: [
              {
                url: 'http://opencrvs.org/specs/extension/contact-person',
                valueString: 'MOTHER'
              },
              {
                url: 'http://opencrvs.org/specs/extension/contact-relationship',
                valueString: ''
              },
              {
                url: 'http://opencrvs.org/specs/extension/contact-person-phone-number',
                valueString: '+260730208366'
              },
              {
                url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
                valueInteger: 490
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastLocation',
                valueReference: {
                  reference: 'Location/24559f93-6326-4ba6-a983-76be2702f0c0'
                }
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastOffice',
                valueReference: {
                  reference: 'Location/67e1c701-3087-4905-8fd3-b54096c9ffd1'
                }
              },
              {
                url: 'http://opencrvs.org/specs/extension/regLastUser',
                valueReference: {
                  reference: 'Practitioner/c9224259-f13b-4a33-b3c6-9570579e1a3d'
                }
              }
            ],
            lastModified: '2020-03-09T10:20:36.472Z',
            businessStatus: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/reg-status',
                  code: 'WAITING_VALIDATION'
                }
              ]
            }
          }
        },
        {
          fullUrl: 'urn:uuid:83240dc5-59ff-4253-8bd4-eb8843ba11ca',
          resource: {
            resourceType: 'Patient',
            active: true,
            id: 'f814a8d6-abd4-4ccd-8ed9-235e0908edfc',
            name: [{ use: 'en', given: ['Tahmid'], family: ['Rahman'] }],
            gender: 'female',
            birthDate: '2018-05-18',
            multipleBirthInteger: 1
          }
        },
        {
          fullUrl: 'urn:uuid:605dc85e-31c8-4bf9-986a-0799e3ab79ba',
          resource: {
            resourceType: 'Patient',
            active: true,
            id: '5de966c5-cc82-47a4-9676-4ea66285c3be',
            identifier: [
              {
                value: '123456789',
                type: { coding: [{ code: 'NATIONAL_ID' }] }
              }
            ],
            name: [{ use: 'en', family: ['Rahman'] }],
            maritalStatus: {
              coding: [
                {
                  system:
                    'http://hl7.org/fhir/StructureDefinition/marital-status',
                  code: 'M'
                }
              ],
              text: 'MARRIED'
            },
            address: [
              {
                type: 'SECONDARY_ADDRESS',
                line: ['', '', '', '', '', ''],
                district: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
                state: '88e8ef3f-2649-49f2-9d84-6ae7101af84e',
                country: 'ZMB'
              },
              {
                type: 'PRIMARY_ADDRESS',
                line: ['', '', '', '', '', '', 'URBAN'],
                district: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
                state: '88e8ef3f-2649-49f2-9d84-6ae7101af84e',
                country: 'ZMB'
              },
              {
                type: 'SECONDARY_ADDRESS',
                line: ['', '', '', '', '', '', 'URBAN'],
                district: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
                state: '88e8ef3f-2649-49f2-9d84-6ae7101af84e',
                country: 'ZMB'
              }
            ],
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
                extension: [
                  {
                    url: 'code',
                    valueCodeableConcept: {
                      coding: [{ system: 'urn:iso:std:iso:3166', code: 'ZMB' }]
                    }
                  },
                  { url: 'period', valuePeriod: { start: '', end: '' } }
                ]
              }
            ]
          }
        },
        {
          fullUrl: 'urn:uuid:dd70f387-21e9-4f1f-8e2e-5939828d8cd1',
          resource: {
            resourceType: 'RelatedPerson',
            relationship: {
              coding: [
                {
                  system:
                    'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
                  code: 'MOTHER'
                }
              ]
            },
            patient: {
              reference: 'urn:uuid:605dc85e-31c8-4bf9-986a-0799e3ab79ba'
            }
          }
        },
        {
          fullUrl: 'urn:uuid:1f3d3ddb-eaac-4a5e-9221-054633321bad',
          resource: {
            resourceType: 'Location',
            mode: 'instance',
            type: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/location-type',
                  code: 'PRIVATE_HOME'
                }
              ]
            },
            address: {
              line: ['', '', '', '', '', '', 'URBAN'],
              city: '',
              district: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
              state: '88e8ef3f-2649-49f2-9d84-6ae7101af84e',
              postalCode: '',
              country: 'ZMB'
            }
          }
        }
      ],
      meta: { lastUpdated: '2020-03-09T10:20:43.664Z' }
    })
  })
})
