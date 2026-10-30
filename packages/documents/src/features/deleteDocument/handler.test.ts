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
import { createServer } from '@documents/server'
import {
  ensureDefaultBucket,
  listObjectKeys,
  putObject,
  statObjectIfExists
} from '@documents/s3/client'
import { randomUUID } from 'crypto'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { encodeScope } from '@opencrvs/commons'

function signToken(scope: string[], subject: string) {
  return jwt.sign({ scope }, readFileSync('./test/cert.key'), {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:documents-user',
    subject
  })
}

const writer = signToken(
  [encodeScope({ type: 'record.declare', options: { event: ['v2.birth'] } })],
  'writer-1'
)
const reader = signToken(
  [encodeScope({ type: 'record.read', options: { event: ['v2.birth'] } })],
  'reader-1'
)

const store = (key: string, createdBy = 'someone') =>
  putObject(key, Buffer.from('content'), {
    metadata: { 'created-by': createdBy }
  })

let server: Awaited<ReturnType<typeof createServer>>
let eventId: string

beforeAll(async () => {
  await ensureDefaultBucket()
})

beforeEach(async () => {
  // A record of its own for each test, so no test sees another's objects
  eventId = randomUUID()
  server = await createServer()
})

describe('deleteDocument', () => {
  it('deletes a document uploaded by someone else', async () => {
    await store(`events/${eventId}/proof.png`, 'someone-else')

    const res = await server.server.inject({
      method: 'DELETE',
      url: `/files/events/${eventId}/proof.png`,
      headers: { authorization: `Bearer ${writer}` }
    })

    expect(res.statusCode).toBe(204)
    expect(await statObjectIfExists(`events/${eventId}/proof.png`)).toBeNull()
  })

  it('answers 404 when the document does not exist', async () => {
    const res = await server.server.inject({
      method: 'DELETE',
      url: `/files/events/${eventId}/proof.png`,
      headers: { authorization: `Bearer ${writer}` }
    })

    expect(res.statusCode).toBe(404)
  })

  it('refuses a caller who can only read records', async () => {
    await store(`events/${eventId}/proof.png`)

    const res = await server.server.inject({
      method: 'DELETE',
      url: `/files/events/${eventId}/proof.png`,
      headers: { authorization: `Bearer ${reader}` }
    })

    expect(res.statusCode).toBe(403)
    expect(
      await statObjectIfExists(`events/${eventId}/proof.png`)
    ).not.toBeNull()
  })
})

describe('deletePrefix', () => {
  it('deletes every object under a record prefix, and nothing else', async () => {
    const otherEventId = randomUUID()
    await store(`events/${eventId}/proof.png`)
    await store(`events/${eventId}/signature.png`)
    await store(`events/${otherEventId}/proof.png`)

    const res = await server.server.inject({
      method: 'DELETE',
      url: `/prefix/events/${eventId}/`,
      headers: { authorization: `Bearer ${writer}` }
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.payload)).toEqual({ deleted: 2 })
    expect(await listObjectKeys(`events/${eventId}/`)).toEqual([])
    expect(await listObjectKeys(`events/${otherEventId}/`)).toEqual([
      `events/${otherEventId}/proof.png`
    ])
  })

  it('accepts a prefix written without its trailing slash', async () => {
    await store(`events/${eventId}/proof.png`)

    const res = await server.server.inject({
      method: 'DELETE',
      url: `/prefix/events/${eventId}`,
      headers: { authorization: `Bearer ${writer}` }
    })

    expect(res.statusCode).toBe(200)
    expect(await listObjectKeys(`events/${eventId}/`)).toEqual([])
  })

  it('refuses a prefix that is not a single record or user', async () => {
    await store(`events/${eventId}/proof.png`)

    const res = await server.server.inject({
      method: 'DELETE',
      url: `/prefix/events/`,
      headers: { authorization: `Bearer ${writer}` }
    })

    expect(res.statusCode).toBe(400)
    expect(await listObjectKeys(`events/${eventId}/`)).toHaveLength(1)
  })

  it('refuses a caller who can only read records', async () => {
    await store(`events/${eventId}/proof.png`)

    const res = await server.server.inject({
      method: 'DELETE',
      url: `/prefix/events/${eventId}/`,
      headers: { authorization: `Bearer ${reader}` }
    })

    expect(res.statusCode).toBe(403)
    expect(await listObjectKeys(`events/${eventId}/`)).toHaveLength(1)
  })
})
