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
import { rest } from 'msw'
import { server as mswServer } from '@test/setupServer'
import {
  getStatusFromTask,
  getTaskFromSavedBundle,
  ValidRecord
} from '@opencrvs/commons/types'
import { updateBirthRegistrationPayload } from '@test/mocks/updateBirthRecord'
import { READY_FOR_REVIEW_BIRTH_RECORD } from '@test/mocks/records/readyForReview'

describe('Register record endpoint', () => {
  let server: Awaited<ReturnType<typeof createServer>>

  beforeAll(async () => {
    server = await createServer()
    await server.start()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('returns OK for a correctly authenticated user rejecting a birth declaration', async () => {
    const token = jwt.sign(
      { scope: ['register'] },
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

    // Mock response from country-config
    mswServer.use(
      rest.post('http://localhost:3040/event-registration', (_, res, ctx) => {
        return res(ctx.json({}))
      })
    )

    const response = await server.server.inject({
      method: 'POST',
      url: '/records/7c3af302-08c9-41af-8701-92de9a71a3e4/register',
      payload: {
        id: '7c3af302-08c9-41af-8701-92de9a71a3e4',
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
    expect(businessStatus).toBe('REJECTED')
  })

  it('returns OK for a correctly authenticated user registering a birth declaration', async () => {
    const token = jwt.sign(
      { scope: ['register'] },
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

    // Mock response from hearth
    mswServer.use(
      rest.post('http://localhost:3447/fhir', (_, res, ctx) => {
        return res(ctx.json({}))
      })
    )

    const response = await server.server.inject({
      method: 'POST',
      url: '/confirm/registration',
      payload: {
        registrationNumber: '1234',
        compositionId: '7c3af302-08c9-41af-8701-92de9a71a3e4'
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
    expect(businessStatus).toBe('REGISTERED')
  })
})
