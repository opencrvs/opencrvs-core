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
  getStatusFromTask,
  getTaskFromSavedBundle,
  URLReference,
  ValidRecord
} from '@opencrvs/commons/types'
import { TransactionResponse } from '@workflow/records/fhir'

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
      { scope: ['declare'] },
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
})
