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
import { createServer } from '@workflow/server'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import { createBirthRegistrationPayload } from '@test/mocks/createBirthRecord'
import { server as mswServer } from '@test/setupServer'
import { rest } from 'msw'
import { SavedBundle, SavedTask, URLReference } from '@opencrvs/commons/types'
import { TransactionResponse } from '@workflow/records/fhir'

const existingTaskBundle: SavedBundle<SavedTask> = {
  resourceType: 'Bundle',
  type: 'document',
  entry: []
}

describe('Create record endpoint', () => {
  let server: Awaited<ReturnType<typeof createServer>>

  beforeAll(async () => {
    server = await createServer()
    await server.start()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('returns OK for a correctly authenticated user with birth declaration', async () => {
    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    // used for checking already created composition with
    // the same draftId
    mswServer.use(
      rest.get('http://localhost:3447/fhir/Task', (_, res, ctx) => {
        return res(ctx.json(existingTaskBundle))
      })
    )

    // response after sending bundle to hearth
    mswServer.use(
      rest.post('http://localhost:3447/fhir', (_, res, ctx) => {
        const responseBundle: TransactionResponse = {
          resourceType: 'Bundle',
          type: 'batch-response',
          entry: [
            {
              response: {
                status: '201',
                location:
                  '/fhir/Composition/3bd79ffd-5bd7-489f-b0d2-3c6133d36e1e/_history/94d9feab-78f9-4de7-9b4b-a4bcbef04a57' as URLReference
              }
            },
            {
              response: {
                status: '201',
                location:
                  '/fhir/Task/d8aa3c7d-ae34-4cf5-a8bc-e287f1c0ce11/_history/0ab3b213-3dec-4ae2-8a01-73200bd1f321' as URLReference
              }
            },
            {
              response: {
                status: '201',
                location:
                  '/fhir/RelatedPerson/b894f4df-1668-49f9-b654-0feab70bd465/_history/38c62416-9f53-4cdf-9c95-8a95f034aa0e' as URLReference
              }
            },
            {
              response: {
                status: '201',
                location:
                  '/fhir/Patient/d8fe5b4e-fce5-4636-bd35-12c01ae86977/_history/955f3421-a6d0-44dc-ace1-dceb934253e9' as URLReference
              }
            },
            {
              response: {
                status: '201',
                location:
                  '/fhir/Patient/89556e20-bc14-4cf8-8c57-5ab432f15125/_history/9511adab-4f88-4ac1-b5f0-8fc491dc46f1' as URLReference
              }
            },
            {
              response: {
                status: '201',
                location:
                  '/fhir/Encounter/79b67c72-6a10-43df-b766-441565109beb/_history/96fc2ce9-3798-436e-a127-1843096eeca9' as URLReference
              }
            },
            {
              response: {
                status: '201',
                location:
                  '/fhir/Patient/452c6036-332c-4e97-8e53-892ad417eae4/_history/d1b4800a-fefc-4c6c-88e5-8b94ad3668e3' as URLReference
              }
            }
          ]
        }
        return res(ctx.json(responseBundle))
      })
    )

    // mock tracking-id generation from country confgi
    mswServer.use(
      rest.post('http://localhost:3040/tracking-id', (_, res, ctx) => {
        return res(ctx.text('BYW6MFW'))
      })
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/create-record',
      payload: {
        event: 'BIRTH',
        record: createBirthRegistrationPayload
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.payload)).toMatchObject({
      trackingId: 'BYW6MFW',
      compositionId: '3bd79ffd-5bd7-489f-b0d2-3c6133d36e1e',
      isPotentiallyDuplicate: false
    })
  })
})
