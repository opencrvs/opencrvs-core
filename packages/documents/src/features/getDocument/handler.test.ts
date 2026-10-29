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
import { randomUUID } from 'crypto'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { env } from '../../s3/constants'

const token = jwt.sign({ scope: [] }, readFileSync('./test/cert.key'), {
  algorithm: 'RS256',
  issuer: 'opencrvs:auth-service',
  audience: 'opencrvs:documents-user',
  subject: '123123'
})

/** Opening the URL proves the presigned URL path is good AND we can use this function to assert the content */
const open = async (url: string) => (await fetch(url)).text()

let server: Awaited<ReturnType<typeof createServer>>

beforeAll(async () => {
  await ensureDefaultBucket()
})

beforeEach(async () => {
  server = await createServer()
})

describe('createPreSignedUrl', () => {
  it('signs a URL that opens the document', async () => {
    await putObject('eventId/imageId.png', Buffer.from('content'))

    const res = await server.server.inject({
      method: 'GET',
      url: `/presigned-url/eventId/imageId.png`,
      headers: { authorization: `Bearer ${token}` }
    })

    expect(res.statusCode).toBe(200)
    expect(await open(JSON.parse(res.payload).presignedURL)).toBe('content')
  })

  it('strips the bucket prefix from a FullDocumentPath', async () => {
    await putObject('eventId/imageId.png', Buffer.from('content'))

    const res = await server.server.inject({
      method: 'GET',
      url: `/presigned-url/${env.S3_BUCKET}/eventId/imageId.png`,
      headers: { authorization: `Bearer ${token}` }
    })

    expect(res.statusCode).toBe(200)
    expect(await open(JSON.parse(res.payload).presignedURL)).toBe('content')
  })
})

describe('createPresignedUrlsInBulk', () => {
  it('signs every filename and keeps their order', async () => {
    await putObject('eventId/first.png', Buffer.from('first'))
    await putObject('eventId/second.png', Buffer.from('second'))

    const res = await server.server.inject({
      method: 'POST',
      url: '/presigned-urls',
      payload: { filenames: ['eventId/first.png', 'eventId/second.png'] },
      headers: { authorization: `Bearer ${token}` }
    })

    expect(res.statusCode).toBe(200)
    expect(await Promise.all(JSON.parse(res.payload).map(open))).toEqual([
      'first',
      'second'
    ])
  })

  it('refuses a payload without filenames', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/presigned-urls',
      payload: {},
      headers: { authorization: `Bearer ${token}` }
    })

    expect(res.statusCode).toBeGreaterThanOrEqual(400)
  })
})

describe('listFiles', () => {
  it('lists the keys under the prefix, and none outside it', async () => {
    const eventId = randomUUID()
    await putObject(`events/${eventId}/a.png`, Buffer.from(''))
    await putObject(`events/${randomUUID()}/b.png`, Buffer.from(''))

    const res = await server.server.inject({
      method: 'GET',
      url: `/list-files/events/${eventId}/`,
      headers: { authorization: `Bearer ${token}` }
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.payload)).toEqual([`events/${eventId}/a.png`])
  })

  it.each([
    '/list-files',
    '/list-files/',
    '/list-files/events/',
    '/list-files/events/eventId/a.png',
    '/list-files/events/eventId',
    '/list-files/other/eventId/'
  ])('refuses %s, which is not a record or user prefix', async (url) => {
    const res = await server.server.inject({
      method: 'GET',
      url,
      headers: { authorization: `Bearer ${token}` }
    })

    expect(res.statusCode).toBe(400)
  })
})
