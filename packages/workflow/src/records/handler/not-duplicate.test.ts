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

import { server as mswServer } from '@test/setupServer'
import { createServer } from '@workflow/server'
import { readFileSync } from 'fs'
import { rest } from 'msw'
import * as jwt from 'jsonwebtoken'
import {
  getTaskFromSavedBundle,
  SavedTask,
  URLReference,
  ValidRecord
} from '@opencrvs/commons/types'
import { READY_FOR_REVIEW_BIRTH_RECORD } from '@test/mocks/records/readyForReview'
import { TransactionResponse } from '@workflow/records/fhir'

function hasDeduplicateExtension(task: SavedTask) {
  return task.extension.find(
    (e) => e.url === 'http://opencrvs.org/specs/extension/markedAsNotDuplicate'
  )
}

describe('not-duplicate record endpoint', () => {
  let server: Awaited<ReturnType<typeof createServer>>

  beforeAll(async () => {
    server = await createServer()
    await server.start()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('returns OK after deduplicating a birth declaration', async () => {
    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    // Hearth response
    mswServer.use(
      rest.post('http://localhost:3447/fhir', (_, res, ctx) => {
        // we only test response of composition and task
        // in an actual response there should be response entries for all payload entriest
        const responseBundle: TransactionResponse = {
          resourceType: 'Bundle',
          type: 'batch-response',
          entry: [
            {
              response: {
                status: '200',
                location:
                  '/fhir/Composition/c8b8e843-c5e0-49b5-96d9-a702ddb46454/_history/2707745b-5e16-4cc0-bcbc-a4a85c5e64df' as URLReference
              }
            },
            {
              response: {
                status: '200',
                location:
                  '/fhir/Task/f00e742a-0900-488b-b7c1-9625d7b7e456/_history/dc39332f-a5d7-4422-ba7b-bc99a958e8cb' as URLReference
              }
            }
          ]
        }
        return res(ctx.json(responseBundle))
      })
    )

    // Fetches a record from search
    mswServer.use(
      rest.get(
        'http://localhost:9090/records/c8b8e843-c5e0-49b5-96d9-a702ddb46454',
        (_, res, ctx) => {
          return res(ctx.json(READY_FOR_REVIEW_BIRTH_RECORD))
        }
      )
    )

    // Sends bundle to metrics and gets a response
    mswServer.use(
      rest.post(
        'http://localhost:1050/events/birth/not-duplicate',
        (_, res, ctx) => {
          return res(ctx.json({}))
        }
      )
    )
    // Sends bundle to deduplicate handler in search
    mswServer.use(
      rest.post('http://localhost:9090/events/not-duplicate', (_, res, ctx) => {
        return res(ctx.json({}))
      })
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/records/c8b8e843-c5e0-49b5-96d9-a702ddb46454/not-duplicate',
      payload: {},
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const task = getTaskFromSavedBundle(JSON.parse(res.payload) as ValidRecord)
    const isNotDuplicateRecord = hasDeduplicateExtension(task)

    expect(!!isNotDuplicateRecord).toBe(true)
    expect(res.statusCode).toBe(200)
  })
})
