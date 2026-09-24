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
import { encodeScope } from '@opencrvs/commons'
import { MINIO_BUCKET } from '../../minio/constants'

const minioStatMock = jest.fn()
const minioRemoveObjectMock = jest.fn()
const minioRemoveObjectsMock = jest.fn()
let objectsInBucket: Array<{ name: string }> = []

jest.mock('../../minio/client', () => {
  return {
    __esModule: true,
    minioClient: {
      statObject: (...args: unknown[]) => minioStatMock(...args),
      removeObject: (...args: unknown[]) => minioRemoveObjectMock(...args),
      removeObjects: (...args: unknown[]) => minioRemoveObjectsMock(...args),
      listObjectsV2: () => objectsInBucket
    }
  }
})

function signToken(scope: string[], subject: string) {
  return jwt.sign({ scope }, readFileSync('./test/cert.key'), {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:documents-user',
    subject
  })
}

const eventId = '105b69b3-415f-4e53-b912-ef71484cb6c0'
const writer = signToken(
  [encodeScope({ type: 'record.declare', options: { event: ['v2.birth'] } })],
  'writer-1'
)
const reader = signToken(
  [encodeScope({ type: 'record.read', options: { event: ['v2.birth'] } })],
  'reader-1'
)

describe('deleteDocument', () => {
  let server: any

  beforeEach(async () => {
    minioStatMock.mockReset().mockReturnValue({ metaData: {} })
    minioRemoveObjectMock.mockReset()
    server = await createServer()
  })

  it('deletes a document uploaded by someone else', async () => {
    minioStatMock.mockReturnValue({ metaData: { 'created-by': 'someone-else' } })

    const res = await server.server.inject({
      method: 'DELETE',
      url: `/files/events/${eventId}/proof.png`,
      headers: { authorization: `Bearer ${writer}` }
    })

    expect(res.statusCode).toBe(204)
    expect(minioRemoveObjectMock).toHaveBeenCalledWith(
      MINIO_BUCKET,
      `events/${eventId}/proof.png`
    )
  })

  it('refuses a caller who can only read records', async () => {
    const res = await server.server.inject({
      method: 'DELETE',
      url: `/files/events/${eventId}/proof.png`,
      headers: { authorization: `Bearer ${reader}` }
    })

    expect(res.statusCode).toBe(403)
    expect(minioRemoveObjectMock).not.toHaveBeenCalled()
  })
})

describe('deletePrefix', () => {
  let server: any

  beforeEach(async () => {
    minioRemoveObjectsMock.mockReset()
    objectsInBucket = []
    server = await createServer()
  })

  it('deletes every object under a record prefix', async () => {
    objectsInBucket = [
      { name: `events/${eventId}/proof.png` },
      { name: `events/${eventId}/signature.png` }
    ]

    const res = await server.server.inject({
      method: 'DELETE',
      url: `/prefix/events/${eventId}/`,
      headers: { authorization: `Bearer ${writer}` }
    })

    expect(res.statusCode).toBe(200)
    expect(minioRemoveObjectsMock).toHaveBeenCalledWith(MINIO_BUCKET, [
      `events/${eventId}/proof.png`,
      `events/${eventId}/signature.png`
    ])
  })

  it('accepts a prefix written without its trailing slash', async () => {
    objectsInBucket = [{ name: `events/${eventId}/proof.png` }]

    const res = await server.server.inject({
      method: 'DELETE',
      url: `/prefix/events/${eventId}`,
      headers: { authorization: `Bearer ${writer}` }
    })

    expect(res.statusCode).toBe(200)
    expect(minioRemoveObjectsMock).toHaveBeenCalledWith(MINIO_BUCKET, [
      `events/${eventId}/proof.png`
    ])
  })

  it('refuses a prefix that is not a single record or user', async () => {
    objectsInBucket = [{ name: `events/${eventId}/proof.png` }]

    const res = await server.server.inject({
      method: 'DELETE',
      url: `/prefix/events/`,
      headers: { authorization: `Bearer ${writer}` }
    })

    expect(res.statusCode).toBe(400)
    expect(minioRemoveObjectsMock).not.toHaveBeenCalled()
  })

  it('refuses a caller who can only read records', async () => {
    objectsInBucket = [{ name: `events/${eventId}/proof.png` }]

    const res = await server.server.inject({
      method: 'DELETE',
      url: `/prefix/events/${eventId}/`,
      headers: { authorization: `Bearer ${reader}` }
    })

    expect(res.statusCode).toBe(403)
    expect(minioRemoveObjectsMock).not.toHaveBeenCalled()
  })
})
