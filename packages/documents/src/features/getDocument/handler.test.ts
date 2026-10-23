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
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { env } from '../../s3/constants'

const signFileUrlMock = jest.fn().mockResolvedValue('https://signed-url')

jest.mock('../../s3/sign', () => ({
  signFileUrl: (...args: unknown[]) => signFileUrlMock(...args)
}))

const listObjectKeysMock = jest.fn()

jest.mock('../../s3/client', () => ({
  __esModule: true,
  listObjectKeys: (...args: unknown[]) => listObjectKeysMock(...args)
}))

describe('createPreSignedUrl', () => {
  let server: any
  const token = jwt.sign({ scope: [] }, readFileSync('./test/cert.key'), {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:documents-user',
    subject: '123123'
  })

  beforeEach(async () => {
    signFileUrlMock.mockClear()
    server = await createServer()
  })

  it('strips the bucket prefix from a FullDocumentPath', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url: `/presigned-url/${env.S3_BUCKET}/eventId/imageId.png`,
      headers: { authorization: `Bearer ${token}` }
    })

    expect(res.statusCode).toBe(200)
    expect(signFileUrlMock).toHaveBeenCalledWith('eventId/imageId.png')
  })

  it('signs a DocumentPath (eventId/imageId) as it is', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url: `/presigned-url/eventId/imageId.png`,
      headers: { authorization: `Bearer ${token}` }
    })

    expect(res.statusCode).toBe(200)
    expect(signFileUrlMock).toHaveBeenCalledWith('eventId/imageId.png')
  })
})

describe('createPresignedUrlsInBulk', () => {
  let server: any
  const token = jwt.sign({ scope: [] }, readFileSync('./test/cert.key'), {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:documents-user',
    subject: '123123'
  })

  beforeEach(async () => {
    signFileUrlMock.mockClear()
    server = await createServer()
  })

  it('signs every filename and keeps their order', async () => {
    signFileUrlMock
      .mockResolvedValueOnce('https://signed-url/first')
      .mockResolvedValueOnce('https://signed-url/second')

    const res = await server.server.inject({
      method: 'POST',
      url: '/presigned-urls',
      payload: { filenames: ['eventId/first.png', 'eventId/second.png'] },
      headers: { authorization: `Bearer ${token}` }
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.payload)).toEqual([
      'https://signed-url/first',
      'https://signed-url/second'
    ])
    expect(signFileUrlMock).toHaveBeenCalledWith('eventId/first.png')
    expect(signFileUrlMock).toHaveBeenCalledWith('eventId/second.png')
  })

  it('signs nothing for a payload without filenames', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/presigned-urls',
      payload: {},
      headers: { authorization: `Bearer ${token}` }
    })

    expect(res.statusCode).toBeGreaterThanOrEqual(400)
    expect(signFileUrlMock).not.toHaveBeenCalled()
  })
})

describe('listFiles', () => {
  let server: any
  const token = jwt.sign({ scope: [] }, readFileSync('./test/cert.key'), {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:documents-user',
    subject: '123123'
  })

  beforeEach(async () => {
    listObjectKeysMock.mockReset()
    server = await createServer()
  })

  it('lists the keys under the prefix', async () => {
    listObjectKeysMock.mockResolvedValue(['events/eventId/a.png'])

    const res = await server.server.inject({
      method: 'GET',
      url: '/list-files/events/eventId/',
      headers: { authorization: `Bearer ${token}` }
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.payload)).toEqual(['events/eventId/a.png'])
    expect(listObjectKeysMock).toHaveBeenCalledWith('events/eventId/')
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
    expect(listObjectKeysMock).not.toHaveBeenCalled()
  })
})
