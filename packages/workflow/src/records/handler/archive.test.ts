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
import { READY_FOR_REVIEW_RECORD } from '@test/mocks/createBirthRecord'
import {
  getStatusFromTask,
  getTaskFromSavedBundle,
  ValidRecord
} from '@opencrvs/commons/types'

describe('archive record endpoint', () => {
  let server: Awaited<ReturnType<typeof createServer>>

  beforeAll(async () => {
    server = await createServer()
    await server.start()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('returns OK after archiving a birth declaration', async () => {
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
          return res(ctx.json(READY_FOR_REVIEW_RECORD))
        }
      )
    )

    // Sends bundle to hearth and gets a response
    mswServer.use(
      rest.post('http://localhost:3447/fhir', (_, res, ctx) => {
        return res(ctx.json({}))
      })
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/records/3bd79ffd-5bd7-489f-b0d2-3c6133d36e1e/archive',
      payload: {
        id: '3bd79ffd-5bd7-489f-b0d2-3c6133d36e1e'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const task = getTaskFromSavedBundle(JSON.parse(res.payload) as ValidRecord)
    const businessStatus = getStatusFromTask(task)

    expect(res.statusCode).toBe(200)
    expect(businessStatus).toBe('ARCHIVED')
  })
})
