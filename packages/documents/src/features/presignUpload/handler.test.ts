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
import { ensureDefaultBucket, putObject } from '@documents/s3/client'
import { MAX_UPLOAD_SIZE_BYTES } from '@opencrvs/commons'
import { randomUUID } from 'crypto'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { getObject } from '../../../test/s3'

const USER_ID = '123123'

const signToken = (subject: string) =>
  jwt.sign({ scope: [] }, readFileSync('./test/cert.key'), {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:documents-user',
    subject
  })

const token = signToken(USER_ID)

let server: Awaited<ReturnType<typeof createServer>>

beforeEach(async () => {
  await ensureDefaultBucket()
  server = await createServer()
})

const presign = (payload: object, bearer = token) =>
  server.server.inject({
    method: 'POST',
    url: '/presigned-upload-url',
    payload,
    headers: { authorization: `Bearer ${bearer}` }
  })

const content = 'file content'

const eventKey = () => `events/${randomUUID()}/${randomUUID()}.png`

describe('presignUploadHandler', () => {
  it('signs a URL that stores the file with its content type and creator', async () => {
    const filePath = eventKey()

    const res = await presign({
      filePath,
      contentType: 'image/png',
      contentLength: content.length
    })

    expect(res.statusCode).toBe(200)

    const { url, headers } = JSON.parse(res.payload)

    expect(headers).toEqual({
      'Content-Type': 'image/png',
      'x-amz-meta-created-by': USER_ID
    })

    const upload = await fetch(url, { method: 'PUT', body: content, headers })

    expect(upload.status).toBe(200)
    expect(await getObject(filePath)).toEqual({
      contentType: 'image/png',
      metadata: { 'created-by': USER_ID },
      body: content
    })
  })

  it('signs a URL for a key under a user prefix', async () => {
    const filePath = `users/${randomUUID()}/${randomUUID()}.png`

    const res = await presign({
      filePath,
      contentType: 'image/png',
      contentLength: content.length
    })

    expect(res.statusCode).toBe(200)
  })

  describe('the store refuses an upload that differs from what was signed', () => {
    let url: string
    let headers: Record<string, string>

    beforeEach(async () => {
      const res = await presign({
        filePath: eventKey(),
        contentType: 'image/png',
        contentLength: content.length
      })
      ;({ url, headers } = JSON.parse(res.payload))
    })

    it('a larger file', async () => {
      const upload = await fetch(url, {
        method: 'PUT',
        body: `${content} and more`,
        headers
      })

      expect(upload.status).toBe(403)
    })

    it('a different content type', async () => {
      const upload = await fetch(url, {
        method: 'PUT',
        body: content,
        headers: { ...headers, 'Content-Type': 'text/html' }
      })

      expect(upload.status).toBe(403)
    })

    it('a different creator', async () => {
      const upload = await fetch(url, {
        method: 'PUT',
        body: content,
        headers: { ...headers, 'x-amz-meta-created-by': 'someone-else' }
      })

      expect(upload.status).toBe(403)
    })

    it('no creator', async () => {
      const upload = await fetch(url, {
        method: 'PUT',
        body: content,
        headers: { 'Content-Type': 'image/png' }
      })

      expect(upload.status).toBe(403)
    })
  })

  it.each([
    ['a key without a prefix', `${randomUUID()}.png`],
    ['a key under an unknown prefix', `other/${randomUUID()}/a.png`],
    ['a key with an owner id that is not a UUID', 'events/abc/a.png'],
    ['a key that leaves its prefix', `events/${randomUUID()}/../a.png`],
    ['a prefix without a file', `events/${randomUUID()}/`]
  ])('refuses %s', async (_, filePath) => {
    const res = await presign({
      filePath,
      contentType: 'image/png',
      contentLength: content.length
    })

    expect(res.statusCode).toBe(400)
  })

  it.each([0, MAX_UPLOAD_SIZE_BYTES + 1, 1.5])(
    'refuses the content length %s',
    async (contentLength) => {
      const res = await presign({
        filePath: eventKey(),
        contentType: 'image/png',
        contentLength
      })

      expect(res.statusCode).toBe(400)
    }
  )

  it('refuses an empty content type', async () => {
    const res = await presign({
      filePath: eventKey(),
      contentType: '',
      contentLength: content.length
    })

    expect(res.statusCode).toBe(400)
  })

  it('refuses to replace a file that a different user uploaded', async () => {
    const filePath = eventKey()
    await putObject(filePath, Buffer.from('original'), {
      metadata: { 'created-by': 'another-user' }
    })

    const res = await presign({
      filePath,
      contentType: 'image/png',
      contentLength: content.length
    })

    expect(res.statusCode).toBe(403)
  })

  it('lets a user replace their own file', async () => {
    const filePath = eventKey()
    await putObject(filePath, Buffer.from('original'), {
      metadata: { 'created-by': USER_ID }
    })

    const res = await presign({
      filePath,
      contentType: 'image/png',
      contentLength: content.length
    })

    expect(res.statusCode).toBe(200)
  })

  it('refuses a request without a token', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/presigned-upload-url',
      payload: {
        filePath: eventKey(),
        contentType: 'image/png',
        contentLength: content.length
      }
    })

    expect(res.statusCode).toBe(401)
  })
})
