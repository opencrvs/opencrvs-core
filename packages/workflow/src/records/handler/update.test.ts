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
import { updateBirthRegistrationPayload } from '@test/mocks/updateBirthRecord'
import { createServer } from '@workflow/server'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { rest } from 'msw'
import { server as mswServer } from '@test/setupServer'
import { READY_FOR_REVIEW_BIRTH_RECORD } from '@test/mocks/records/readyForReview'
import {
  EVENT_TYPE,
  findCompositionSection,
  getComposition,
  getStatusFromTask,
  getTaskFromSavedBundle,
  TransactionResponse,
  updateFHIRBundle,
  URLReference,
  ValidRecord
} from '@opencrvs/commons/types'
import { SCOPES } from '@opencrvs/commons/authentication'

describe('Update record endpoint', () => {
  let server: Awaited<ReturnType<typeof createServer>>

  beforeAll(async () => {
    server = await createServer()
    await server.start()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('returns OK for a correctly authenticated updating a birth declaration', async () => {
    const token = jwt.sign(
      { scope: [SCOPES.RECORD_DECLARATION_EDIT] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    // Gets record by id via getRecordById endpoint
    mswServer.use(
      rest.get(
        'http://localhost:9090/records/7c3af302-08c9-41af-8701-92de9a71a3e4',
        (_, res, ctx) => {
          return res(ctx.json(READY_FOR_REVIEW_BIRTH_RECORD))
        }
      )
    )

    mswServer.use(
      rest.post('http://localhost:3447/fhir', (_, res, ctx) => {
        const responseBundle: TransactionResponse = {
          resourceType: 'Bundle',
          entry: [
            {
              response: {
                status: '201',
                location:
                  '/fhir/Composition/c8b8e843-c5e0-49b5-96d9-a702ddb46454/_history/ed8853ba-bdb3-41d3-9791-fe720267cc98' as URLReference
              }
            },
            {
              response: {
                status: '201',
                location:
                  '/fhir/Encounter/2e5b37ef-c3c2-4071-af56-d20a16e87891/_history/cf4454c2-5754-4bc9-b173-1622e61eda16' as URLReference
              }
            },
            {
              response: {
                status: '201',
                location:
                  '/fhir/RelatedPerson/fdd5e232-9a8c-4e0f-bd0c-ec5fb80f7501/_history/bb21e740-3e52-4c92-8b10-68e2a4ab6b17' as URLReference
              }
            },
            {
              response: {
                status: '201',
                location:
                  '/fhir/Patient/8cb74e54-1c02-41a7-86a3-415c4031c9ba/_history/0bff4de7-e595-4e47-8134-96e84f71b54f' as URLReference
              }
            },
            {
              response: {
                status: '201',
                location:
                  '/fhir/Patient/c42efef3-56c1-4d77-8a2f-b0df78f31a56/_history/bb634261-6c1f-4b89-a0e8-28b340b5eef2' as URLReference
              }
            },
            {
              response: {
                status: '201',
                location:
                  '/fhir/Patient/cf60f3c7-9ab9-491e-83cd-b6aadc772aa4/_history/97906f2f-0cf0-43cc-ae03-45b3cf6b6503' as URLReference
              }
            },
            {
              response: {
                status: '201',
                location:
                  '/fhir/Task/f00e742a-0900-488b-b7c1-9625d7b7e456/_history/919495a1-56ed-4fa1-b045-2670b2c6ed63' as URLReference
              }
            },
            {
              response: {
                status: '201',
                location:
                  '/fhir/Practitioner/4651d1cc-6072-4e34-bf20-b583f421a9f1/_history/7d23bdbd-d987-4c03-8cad-1d4e4b7b986c' as URLReference
              }
            },
            {
              response: {
                status: '201',
                location:
                  '/fhir/Location/0f7684aa-8c65-4901-8318-bf1e22c247cb/_history/7d23bdbd-d987-4c03-8cad-1d4e4b7b986c' as URLReference
              }
            },
            {
              response: {
                status: '201',
                location:
                  '/fhir/Location/ce73938d-a188-4a78-9d19-35dfd4ca6957/_history/7d23bdbd-d987-4c03-8cad-1d4e4b7b986c' as URLReference
              }
            },
            {
              response: {
                status: '201',
                location:
                  '/fhir/Location/146251e9-df90-4068-82b0-27d8f979e8e2/_history/7d23bdbd-d987-4c03-8cad-1d4e4b7b986c' as URLReference
              }
            },
            {
              response: {
                status: '201',
                location:
                  '/fhir/PractitionerRole/f845d4fa-71fe-4d99-9f92-e5ed60838d1d/_history/7d23bdbd-d987-4c03-8cad-1d4e4b7b986c' as URLReference
              }
            },
            {
              response: {
                status: '201',
                location:
                  '/fhir/Location/ed6195ff-0f83-4852-832e-dc9db07151ff/_history/7d23bdbd-d987-4c03-8cad-1d4e4b7b986c' as URLReference
              }
            }
          ],
          type: 'transaction-response'
        }

        return res(ctx.json(responseBundle))
      })
    )

    const response = await server.server.inject({
      method: 'POST',
      url: '/records/7c3af302-08c9-41af-8701-92de9a71a3e4/update',
      payload: {
        event: 'BIRTH',
        details: updateBirthRegistrationPayload
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const task = getTaskFromSavedBundle(
      JSON.parse(response.payload) as ValidRecord
    )
    const businessStatus = getStatusFromTask(task)

    expect(response.statusCode).toBe(200)
    expect(businessStatus).toBe('DECLARATION_UPDATED')
  })

  it('should handle removing supporting documents from the record', async () => {
    const updatedRecord = updateFHIRBundle(
      {
        resourceType: 'Bundle',
        type: 'document',
        entry: [
          {
            fullUrl:
              '/fhir/Composition/acc7f08b-2024-457d-9860-c97cabad3dd6/_history/0072ef5d-8ba6-4856-9dbf-fa6453312e1d' as URLReference,
            resource: {
              identifier: {
                system: 'urn:ietf:rfc:3986',
                value: 'BT01GIK'
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
                        'RelatedPerson/5a23ebdf-240e-4f39-9203-60afa59c2ac2'
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
                      reference: 'Patient/c9759a39-1cd2-438c-8815-32285d35ec4a'
                    }
                  ]
                },
                {
                  title: 'Supporting Documents',
                  code: {
                    coding: [
                      {
                        system: 'http://opencrvs.org/specs/sections',
                        code: 'supporting-documents'
                      }
                    ],
                    text: 'Supporting Documents'
                  },
                  entry: [
                    {
                      reference:
                        'DocumentReference/afc3e761-282a-4ad5-9885-c5e312697d20'
                    },
                    {
                      reference:
                        'DocumentReference/92c8567c-fbc3-47ee-b361-63412a9fc534'
                    },
                    {
                      reference:
                        'DocumentReference/05ef3e79-dac8-4913-b434-f6f87dae7fd1'
                    }
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
                    {
                      reference: 'Patient/2f89ea29-a841-4c27-bf9e-3eb32fb155de'
                    }
                  ]
                },
                {
                  title: "Father's details",
                  code: {
                    coding: [
                      {
                        system: 'http://opencrvs.org/doc-sections',
                        code: 'father-details'
                      }
                    ],
                    text: "Father's details"
                  },
                  entry: [
                    {
                      reference: 'Patient/41280523-ed6a-4752-98f5-a309d3d4f74a'
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
                        'Encounter/96b50360-8475-44ab-8e06-412892a6a93a'
                    }
                  ]
                }
              ],
              subject: {},
              date: '2025-02-26T08:12:14.291Z',
              author: [],
              meta: {
                lastUpdated: '2025-02-26T08:12:14.551+00:00',
                versionId: '0072ef5d-8ba6-4856-9dbf-fa6453312e1d'
              },
              _transforms: {
                meta: {
                  lastUpdated: '2025-02-26T08:12:14.551Z'
                }
              },
              _request: {
                method: 'POST'
              },
              id: 'acc7f08b-2024-457d-9860-c97cabad3dd6'
            }
          },
          {
            fullUrl:
              '/fhir/DocumentReference/05ef3e79-dac8-4913-b434-f6f87dae7fd1/_history/8c8f1cd2-8a5b-423f-b21f-e18323395f08' as URLReference,
            resource: {
              resourceType: 'DocumentReference',
              masterIdentifier: {
                system: 'urn:ietf:rfc:3986',
                value: 'd3701615-c917-4c3f-95d8-4a94c9c072c9'
              },
              extension: [],
              type: {
                coding: [
                  {
                    system: 'http://opencrvs.org/specs/supporting-doc-type',
                    code: 'BIRTH_CERTIFICATE'
                  }
                ]
              },
              content: [
                {
                  attachment: {
                    contentType: 'image/jpeg',
                    data: '/ocrvs/5f796a34-85ac-4381-bb66-880e6679582c.jpg'
                  }
                }
              ],
              status: 'current',
              subject: {
                display: 'MOTHER'
              },
              _transforms: {
                meta: {
                  lastUpdated: '2025-02-26T08:12:14.563Z'
                }
              },
              meta: {
                lastUpdated: '2025-02-26T08:12:14.563+00:00',
                versionId: '8c8f1cd2-8a5b-423f-b21f-e18323395f08'
              },
              _request: {
                method: 'POST'
              },
              id: '05ef3e79-dac8-4913-b434-f6f87dae7fd1'
            }
          },
          {
            fullUrl:
              '/fhir/DocumentReference/92c8567c-fbc3-47ee-b361-63412a9fc534/_history/a606f48f-b587-4d50-b02d-d38c9a5a8ee9' as URLReference,
            resource: {
              resourceType: 'DocumentReference',
              masterIdentifier: {
                system: 'urn:ietf:rfc:3986',
                value: 'c357204a-b619-4272-a971-b69c35d15a74'
              },
              extension: [],
              type: {
                coding: [
                  {
                    system: 'http://opencrvs.org/specs/supporting-doc-type',
                    code: 'NATIONAL_ID'
                  }
                ]
              },
              content: [
                {
                  attachment: {
                    contentType: 'image/png',
                    data: '/ocrvs/89354b7d-5d9f-4131-9291-4c3742055150.png'
                  }
                }
              ],
              status: 'current',
              subject: {
                display: 'MOTHER'
              },
              _transforms: {
                meta: {
                  lastUpdated: '2025-02-26T08:12:14.562Z'
                }
              },
              meta: {
                lastUpdated: '2025-02-26T08:12:14.562+00:00',
                versionId: 'a606f48f-b587-4d50-b02d-d38c9a5a8ee9'
              },
              _request: {
                method: 'POST'
              },
              id: '92c8567c-fbc3-47ee-b361-63412a9fc534'
            }
          },
          {
            fullUrl:
              '/fhir/DocumentReference/afc3e761-282a-4ad5-9885-c5e312697d20/_history/9ea290f3-981c-40e4-8c5f-3e3e3e9525b8' as URLReference,
            resource: {
              resourceType: 'DocumentReference',
              masterIdentifier: {
                system: 'urn:ietf:rfc:3986',
                value: '927f9fbf-eb05-4d7f-be4b-803332c36f16'
              },
              extension: [],
              type: {
                coding: [
                  {
                    system: 'http://opencrvs.org/specs/supporting-doc-type',
                    code: 'NOTIFICATION_OF_BIRTH'
                  }
                ]
              },
              content: [
                {
                  attachment: {
                    contentType: 'image/jpeg',
                    data: '/ocrvs/cb9bb5f0-7431-4824-9862-5897fcc20836.jpg'
                  }
                }
              ],
              status: 'current',
              subject: {
                display: 'CHILD'
              },
              _transforms: {
                meta: {
                  lastUpdated: '2025-02-26T08:12:14.561Z'
                }
              },
              meta: {
                lastUpdated: '2025-02-26T08:12:14.561+00:00',
                versionId: '9ea290f3-981c-40e4-8c5f-3e3e3e9525b8'
              },
              _request: {
                method: 'POST'
              },
              id: 'afc3e761-282a-4ad5-9885-c5e312697d20'
            }
          }
        ]
      },
      {
        registration: {
          attachments: [
            {
              contentType: 'image/jpeg',
              uri: '/ocrvs/mock-245',
              subject: 'CHILD',
              type: 'NOTIFICATION_OF_BIRTH'
            },
            {
              contentType: 'image/png',
              uri: '/ocrvs/mock-123',
              subject: 'MOTHER',
              type: 'NATIONAL_ID'
            }
          ]
        }
      },
      EVENT_TYPE.BIRTH
    )
    const composition = getComposition(updatedRecord)
    const documentsSection = findCompositionSection(
      'supporting-documents',
      composition
    )
    expect(documentsSection?.entry.length).toBe(2)
  })
})
