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
import {
  getTaskFromSavedBundle,
  REGISTERED_RECORD,
  Task
} from '@opencrvs/commons/types'

function checkForVerifiedExtension(task: Task) {
  return task.extension.find(
    (e) => e.url === 'http://opencrvs.org/specs/extension/regVerified'
  )
}

function findVerificationIp(task: Task) {
  return task.extension.find(
    (e) => e.url === 'http://opencrvs.org/specs/extension/regVerified'
    //@ts-ignore
  )!.valueString
}

describe('verify record endpoint', () => {
  let server: Awaited<ReturnType<typeof createServer>>

  beforeAll(async () => {
    server = await createServer()
    await server.start()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('returns OK after verifying a birth declaration', async () => {
    const token = jwt.sign(
      { scope: ['verify'] },
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
          return res(ctx.json(REGISTERED_RECORD))
        }
      )
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/records/3bd79ffd-5bd7-489f-b0d2-3c6133d36e1e/verify',
      payload: {
        'x-real-ip': '119.148.49.98'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const verifiedRecord = JSON.parse(res.payload)
    const task = getTaskFromSavedBundle(verifiedRecord)
    const isVerified = checkForVerifiedExtension(task)

    expect(findVerificationIp(task)).toBe('119.148.49.98')
    expect(!!isVerified).toBe(true)
    expect(res.statusCode).toBe(200)
  })
})
