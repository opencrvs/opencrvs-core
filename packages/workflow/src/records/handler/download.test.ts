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
import * as jwt from 'jsonwebtoken'
import { rest } from 'msw'
import { server as mswServer } from '@test/setupServer'
import { READY_FOR_REVIEW_BIRTH_RECORD } from '@test/mocks/records/readyForReview'
import { getTaskFromSavedBundle, Task } from '@opencrvs/commons/types'

function checkForDownloadExtenstion(task: Task) {
  return task.extension.find(
    (e) => e.url === 'http://opencrvs.org/specs/extension/regDownloaded'
  )
}

describe('download record endpoint', () => {
  let server: Awaited<ReturnType<typeof createServer>>

  beforeAll(async () => {
    server = await createServer()
    await server.start()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('returns OK after downloading a birth declaration', async () => {
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
          return res(ctx.json(READY_FOR_REVIEW_BIRTH_RECORD))
        }
      )
    )

    // Sends bundle to save in elastic search
    mswServer.use(
      rest.post('http://localhost:9090/events/assigned', (_, res, ctx) => {
        return res(ctx.json({}))
      })
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/download-record',
      payload: {
        id: '3bd79ffd-5bd7-489f-b0d2-3c6133d36e1e'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // The download process schedules the callback of hearth and search
    // for later, before that the server is stopped and when two callbacks
    // are later brought in for execution, the mock handlers are not found
    // as they were already removed
    // wait for the two http requests(search and hearth) to finish
    await new Promise((resolve) => setImmediate(resolve))
    const isDownloaded = checkForDownloadExtenstion(
      getTaskFromSavedBundle(JSON.parse(res.payload))
    )

    expect(!!isDownloaded).toBe(true)
    expect(res.statusCode).toBe(200)
  })
})
