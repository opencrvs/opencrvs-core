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
import { READY_FOR_REVIEW_BIRTH_RECORD } from '@test/mocks/records/readyForReview'

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
    // only the composition location is used in the handler
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
            }
          ]
        }
        return res(ctx.json(responseBundle))
      })
    )

    mswServer.use(
      rest.get(
        'http://localhost:9090/records/3bd79ffd-5bd7-489f-b0d2-3c6133d36e1e',
        (_, res, ctx) => {
          return res(ctx.json(READY_FOR_REVIEW_BIRTH_RECORD))
        }
      )
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
    // trackingId is randomly generated each time
    expect(JSON.parse(res.payload)).toMatchObject({
      compositionId: '3bd79ffd-5bd7-489f-b0d2-3c6133d36e1e',
      isPotentiallyDuplicate: false
    })
  })
})
