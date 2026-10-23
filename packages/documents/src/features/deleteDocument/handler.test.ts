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

const statObjectIfExistsMock = jest.fn()
const removeObjectMock = jest.fn()
const removeObjectsMock = jest.fn()
let keysInBucket: string[] = []

jest.mock('../../s3/client', () => {
  return {
    __esModule: true,
    statObjectIfExists: (...args: unknown[]) => statObjectIfExistsMock(...args),
    removeObject: (...args: unknown[]) => removeObjectMock(...args),
    removeObjects: (...args: unknown[]) => removeObjectsMock(...args),
    listObjectKeys: async () => keysInBucket
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
    statObjectIfExistsMock.mockReset().mockResolvedValue({ metadata: {} })
    removeObjectMock.mockReset()
    server = await createServer()
  })

  it('deletes a document uploaded by someone else', async () => {
    statObjectIfExistsMock.mockResolvedValue({
      metadata: { 'created-by': 'someone-else' }
    })

    const res = await server.server.inject({
      method: 'DELETE',
      url: `/files/events/${eventId}/proof.png`,
      headers: { authorization: `Bearer ${writer}` }
    })

    expect(res.statusCode).toBe(204)
    expect(removeObjectMock).toHaveBeenCalledWith(`events/${eventId}/proof.png`)
  })

  it('answers 404 and removes nothing when the document does not exist', async () => {
    statObjectIfExistsMock.mockResolvedValue(null)

    const res = await server.server.inject({
      method: 'DELETE',
      url: `/files/events/${eventId}/proof.png`,
      headers: { authorization: `Bearer ${writer}` }
    })

    expect(res.statusCode).toBe(404)
    expect(removeObjectMock).not.toHaveBeenCalled()
  })

  it('refuses a caller who can only read records', async () => {
    const res = await server.server.inject({
      method: 'DELETE',
      url: `/files/events/${eventId}/proof.png`,
      headers: { authorization: `Bearer ${reader}` }
    })

    expect(res.statusCode).toBe(403)
    expect(removeObjectMock).not.toHaveBeenCalled()
  })
})

describe('deletePrefix', () => {
  let server: any

  beforeEach(async () => {
    removeObjectsMock.mockReset()
    keysInBucket = []
    server = await createServer()
  })

  it('deletes every object under a record prefix', async () => {
    keysInBucket = [
      `events/${eventId}/proof.png`,
      `events/${eventId}/signature.png`
    ]

    const res = await server.server.inject({
      method: 'DELETE',
      url: `/prefix/events/${eventId}/`,
      headers: { authorization: `Bearer ${writer}` }
    })

    expect(res.statusCode).toBe(200)
    expect(removeObjectsMock).toHaveBeenCalledWith([
      `events/${eventId}/proof.png`,
      `events/${eventId}/signature.png`
    ])
  })

  it('accepts a prefix written without its trailing slash', async () => {
    keysInBucket = [`events/${eventId}/proof.png`]

    const res = await server.server.inject({
      method: 'DELETE',
      url: `/prefix/events/${eventId}`,
      headers: { authorization: `Bearer ${writer}` }
    })

    expect(res.statusCode).toBe(200)
    expect(removeObjectsMock).toHaveBeenCalledWith([
      `events/${eventId}/proof.png`
    ])
  })

  it('refuses a prefix that is not a single record or user', async () => {
    keysInBucket = [`events/${eventId}/proof.png`]

    const res = await server.server.inject({
      method: 'DELETE',
      url: `/prefix/events/`,
      headers: { authorization: `Bearer ${writer}` }
    })

    expect(res.statusCode).toBe(400)
    expect(removeObjectsMock).not.toHaveBeenCalled()
  })

  it('refuses a caller who can only read records', async () => {
    keysInBucket = [`events/${eventId}/proof.png`]

    const res = await server.server.inject({
      method: 'DELETE',
      url: `/prefix/events/${eventId}/`,
      headers: { authorization: `Bearer ${reader}` }
    })

    expect(res.statusCode).toBe(403)
    expect(removeObjectsMock).not.toHaveBeenCalled()
  })
})
