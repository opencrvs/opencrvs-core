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
  Extension,
  getTaskFromSavedBundle,
  SavedTask,
  URLReference,
  ValidRecord
} from '@opencrvs/commons/types'
import { READY_FOR_REVIEW_BIRTH_RECORD } from '@test/mocks/records/readyForReview'
import { TransactionResponse } from '@workflow/records/fhir'

function hasDuplicateExtension(task: SavedTask) {
  return task.extension.find(
    (e) => e.url === 'http://opencrvs.org/specs/extension/markedAsDuplicate'
  )
}

function findReasonForDuplicate(task: SavedTask) {
  return task.reason?.text
}

function findCommentForDuplicate(task: SavedTask) {
  return task.statusReason?.text
}

function findDuplicateTrackingId(task: SavedTask) {
  type DuplicateExtenstion = Extract<
    Extension,
    { url: 'http://opencrvs.org/specs/extension/markedAsDuplicate' }
  >

  return task.extension.find(
    (e): e is DuplicateExtenstion =>
      e.url === 'http://opencrvs.org/specs/extension/markedAsDuplicate'
  )!.valueString
}

describe('duplicate record endpoint', () => {
  let server: Awaited<ReturnType<typeof createServer>>

  beforeAll(async () => {
    server = await createServer()
    await server.start()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('returns OK after duplicating a birth declaration', async () => {
    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
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
        'http://localhost:1050/events/birth/marked-as-duplicate',
        (_, res, ctx) => {
          return res(ctx.json({}))
        }
      )
    )

    mswServer.use(
      rest.post('http://localhost:3447/fhir', (_, res, ctx) => {
        const responseBundle: TransactionResponse = {
          resourceType: 'Bundle',
          type: 'transaction-response',
          entry: [
            {
              response: {
                status: '201',
                location:
                  '/fhir/Task/f00e742a-0900-488b-b7c1-9625d7b7e456/_history/919495a1-56ed-4fa1-b045-2670b2c6ed63' as URLReference
              }
            }
          ]
        }

        return res(ctx.json(responseBundle))
      })
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/records/c8b8e843-c5e0-49b5-96d9-a702ddb46454/duplicate',
      payload: {
        reason: 'duplicate',
        comment: 'invalid data',
        duplicateTrackingId: 'B4678E2'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const task = getTaskFromSavedBundle(JSON.parse(res.payload) as ValidRecord)
    const isDuplicateRecord = hasDuplicateExtension(task)

    expect(findDuplicateTrackingId(task)).toBe('B4678E2')
    expect(findReasonForDuplicate(task)).toBe('duplicate')
    expect(findCommentForDuplicate(task)).toBe('invalid data')
    expect(!!isDuplicateRecord).toBe(true)
    expect(res.statusCode).toBe(200)
  })
})
