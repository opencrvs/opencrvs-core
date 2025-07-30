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
import { http, HttpResponse } from 'msw'
import { server as mswServer } from '@test/setupServer'
import { getTaskFromSavedBundle, Task } from '@opencrvs/commons/types'
import { READY_FOR_REVIEW_BIRTH_RECORD } from '@test/mocks/records/readyForReview'

function checkForViewedExtenstion(task: Task) {
  return task.extension.find(
    (e) => e.url === 'http://opencrvs.org/specs/extension/regViewed'
  )
}

describe('View record endpoint', () => {
  let server: Awaited<ReturnType<typeof createServer>>

  beforeAll(async () => {
    server = await createServer()
    await server.start()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('returns OK after viewing a birth declaration', async () => {
    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('./test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    // Fetches a record from search
    mswServer.use(
      http.get(
        'http://localhost:9090/records/3bd79ffd-5bd7-489f-b0d2-3c6133d36e1e',
        () => {
          return HttpResponse.json(READY_FOR_REVIEW_BIRTH_RECORD)
        }
      )
    )

    // Sends bundle to save in elastic search
    mswServer.use(
      http.post('http://localhost:9090/events/unassigned', () => {
        return HttpResponse.json({})
      })
    )

    // Sends bundle to metrics
    mswServer.use(
      http.post('http://localhost:1050/events/birth/viewed', () => {
        return HttpResponse.json({})
      })
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/records/3bd79ffd-5bd7-489f-b0d2-3c6133d36e1e/view',
      payload: {},
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const viewedRecord = JSON.parse(res.payload)
    const isViewed = checkForViewedExtenstion(
      getTaskFromSavedBundle(viewedRecord)
    )

    expect(!!isViewed).toBe(true)
    expect(res.statusCode).toBe(200)
  })
})
