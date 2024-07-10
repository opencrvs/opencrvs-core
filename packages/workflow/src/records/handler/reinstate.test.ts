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
import { readFileSync } from 'fs'
import { server as mswServer } from '@test/setupServer'
import { rest } from 'msw'
import * as jwt from 'jsonwebtoken'
import {
  ReadyForReviewRecord,
  RegisteredRecord,
  URLReference
} from '@opencrvs/commons/types'
import { ARCHIVED_BIRTH_RECORD } from '@test/mocks/records/archive'
import { TransactionResponse } from '@workflow/records/fhir'

function getRegStatus(record: ReadyForReviewRecord | RegisteredRecord) {
  const taskEntry = record.entry.find((e) => e.resource.resourceType === 'Task')
  //@ts-ignore
  return taskEntry?.resource.businessStatus.coding[0].code
}

describe('reinstate record endpoint', () => {
  let server: Awaited<ReturnType<typeof createServer>>

  beforeAll(async () => {
    server = await createServer()
    await server.start()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('returns OK after reinstating a birth declaration', async () => {
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
        'http://localhost:9090/records/3bd79ffd-5bd7-489f-b0d2-3c6133d36e1e',
        (_, res, ctx) => {
          return res(ctx.json(ARCHIVED_BIRTH_RECORD))
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
                  '/fhir/Task/529a2252-597f-4651-9c53-fb0b68403247/_history/919495a1-56ed-4fa1-b045-2670b2c6ed63' as URLReference
              }
            }
          ]
        }

        return res(ctx.json(responseBundle))
      })
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/records/3bd79ffd-5bd7-489f-b0d2-3c6133d36e1e/reinstate',
      payload: {},
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const reinstatedEndpointResponse: ReadyForReviewRecord | RegisteredRecord =
      JSON.parse(res.payload)

    expect(res.statusCode).toBe(200)
    expect(getRegStatus(reinstatedEndpointResponse)).toBe('DECLARED')
  })
})
