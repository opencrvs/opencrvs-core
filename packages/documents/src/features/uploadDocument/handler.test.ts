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
import { S3_BUCKET } from '../../s3/constants'

const putObjectMock = jest.fn()
const statObjectIfExistsMock = jest.fn()
jest.mock('../../s3/client', () => {
  return {
    __esModule: true,
    putObject: (...args: unknown[]) => putObjectMock(...args),
    statObjectIfExists: (...args: unknown[]) => statObjectIfExistsMock(...args)
  }
})

describe('fileExistsHandler', () => {
  let server: any
  const token = jwt.sign({ scope: [] }, readFileSync('./test/cert.key'), {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:documents-user',
    subject: '123123'
  })

  beforeEach(async () => {
    putObjectMock.mockClear()
    statObjectIfExistsMock.mockReset().mockResolvedValue({ metaData: {} })
    server = await createServer()
  })

  it('Separates bucket from file paths with multiple directories', async () => {
    const path = 'event-12345'
    const transactionId = 'transaction-12345'

    const res = await server.server.inject({
      method: 'GET',
      url: `/files/${S3_BUCKET}/${path}/${transactionId}.txt`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    const [filename] = statObjectIfExistsMock.mock.calls[0]
    expect(filename).toBe(`${path}/${transactionId}.txt`)

    expect(res.statusCode).toBe(200)
  })

  it('Separates bucket from file', async () => {
    const path = 'event-12345'
    const transactionId = 'transaction-12345'

    const res = await server.server.inject({
      method: 'GET',
      url: `/files/${S3_BUCKET}/${path}/${transactionId}.txt`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    const [filename] = statObjectIfExistsMock.mock.calls[0]
    expect(filename).toBe(`${path}/${transactionId}.txt`)

    expect(res.statusCode).toBe(200)
  })

  it('handles explicit "/" as start of of file path', async () => {
    const path = 'event-12345'
    const transactionId = 'transaction-12345'

    const res = await server.server.inject({
      method: 'GET',
      // double slash is handled
      url: `/files//${S3_BUCKET}/${path}/${transactionId}.txt`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    const [filename] = statObjectIfExistsMock.mock.calls[0]
    expect(filename).toBe(`${path}/${transactionId}.txt`)

    expect(res.statusCode).toBe(200)
  })

  it('Handles missing bucket from file paths with multiple directories', async () => {
    const path = 'event-12345'
    const transactionId = 'transaction-12345'

    const res = await server.server.inject({
      method: 'GET',
      url: `/files/${path}/${transactionId}.txt`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    const [filename] = statObjectIfExistsMock.mock.calls[0]
    expect(filename).toBe(`${path}/${transactionId}.txt`)

    expect(res.statusCode).toBe(200)
  })

  it('Handles missing bucket from file', async () => {
    const path = 'event-12345'
    const transactionId = 'transaction-12345'

    const res = await server.server.inject({
      method: 'GET',
      url: `/files/${path}/${transactionId}.txt`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    const [filename] = statObjectIfExistsMock.mock.calls[0]
    expect(filename).toBe(`${path}/${transactionId}.txt`)

    expect(res.statusCode).toBe(200)
  })

  it('handles explicit "/" without bucket as start of of file path', async () => {
    const path = 'event-12345'
    const transactionId = 'transaction-12345'

    const res = await server.server.inject({
      method: 'GET',
      // double slash is handled
      url: `/files//${path}/${transactionId}.txt`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    const [filename] = statObjectIfExistsMock.mock.calls[0]
    expect(filename).toBe(`${path}/${transactionId}.txt`)

    expect(res.statusCode).toBe(200)
  })

  it('answers 404 when the object does not exist', async () => {
    statObjectIfExistsMock.mockResolvedValue(null)

    const res = await server.server.inject({
      method: 'GET',
      url: `/files/event-12345/transaction-12345.txt`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(404)
  })
})

describe('fileUploadHandler', () => {
  let server: any
  const token = jwt.sign({ scope: [] }, readFileSync('./test/cert.key'), {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:documents-user',
    subject: '123123'
  })

  beforeEach(async () => {
    putObjectMock.mockClear()
    // By default the key is free, which is the ordinary case for a new upload.
    statObjectIfExistsMock.mockReset().mockResolvedValue(null)
    server = await createServer()
  })

  const boundary = '--hapi-boundary'
  const CRLF = '\r\n'

  const createFormProperty = (name: string, value: string, type?: 'file') => {
    if (type === 'file') {
      // For file type, we need to specify the filename and content type
      return (
        `Content-Disposition: form-data; name="${name}"; filename="hello.txt"${CRLF}` +
        `Content-Type: text/plain${CRLF}${CRLF}` +
        `${value}${CRLF}`
      )
    }
    return (
      `Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}` +
      `${value}${CRLF}`
    )
  }

  it('adds path to file path when it is given', async () => {
    const path = 'event-12345'
    const transactionId = 'transaction-1'
    const body =
      `--${boundary}${CRLF}` +
      createFormProperty('transactionId', transactionId) +
      `--${boundary}${CRLF}` +
      createFormProperty('path', path) +
      `--${boundary}${CRLF}` +
      createFormProperty('file', 'test upload', 'file') +
      `--${boundary}--${CRLF}`

    const res = await server.server.inject({
      method: 'POST',
      url: '/files',
      payload: Buffer.from(body, 'utf8'),
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        authorization: `Bearer ${token}`
      }
    })

    expect(res.payload).toEqual(`${path}/${transactionId}.txt`)

    const [filename] = putObjectMock.mock.calls[0]
    expect(filename).toBe(`${path}/${transactionId}.txt`)

    expect(res.statusCode).toBe(200)
  })

  it('returns file path without bucket prefix', async () => {
    const transactionId = 'transaction-2'
    const body =
      `--${boundary}${CRLF}` +
      createFormProperty('transactionId', transactionId) +
      `--${boundary}${CRLF}` +
      createFormProperty('file', 'test upload', 'file') +
      `--${boundary}--${CRLF}`

    const res = await server.server.inject({
      method: 'POST',
      url: '/files',
      payload: Buffer.from(body, 'utf8'),
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        authorization: `Bearer ${token}`
      }
    })

    expect(res.payload).toEqual(`${transactionId}.txt`)

    const [filename] = putObjectMock.mock.calls[0]
    expect(filename).toBe(`${transactionId}.txt`)

    expect(res.statusCode).toBe(200)
  })

  const uploadTo = (transactionId: string) => {
    const body =
      `--${boundary}${CRLF}` +
      createFormProperty('transactionId', transactionId) +
      `--${boundary}${CRLF}` +
      createFormProperty('file', 'test upload', 'file') +
      `--${boundary}--${CRLF}`

    return server.server.inject({
      method: 'POST',
      url: '/files',
      payload: Buffer.from(body, 'utf8'),
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        authorization: `Bearer ${token}`
      }
    })
  }

  it('refuses to replace a file uploaded by someone else', async () => {
    statObjectIfExistsMock.mockResolvedValue({
      metaData: { 'created-by': 'another-user' }
    })

    const res = await uploadTo('transaction-3')

    expect(res.statusCode).toBe(403)
    expect(putObjectMock).not.toHaveBeenCalled()
  })

  it('lets the original uploader replace their own file', async () => {
    statObjectIfExistsMock.mockResolvedValue({
      metaData: { 'created-by': '123123' }
    })

    const res = await uploadTo('transaction-4')

    expect(res.statusCode).toBe(200)
    expect(putObjectMock).toHaveBeenCalled()
  })

  it('persists the client-reported content type so extensions the object store cannot infer (e.g. .jfif) stay renderable', async () => {
    const transactionId = 'transaction-jfif'
    const body =
      `--${boundary}${CRLF}` +
      createFormProperty('transactionId', transactionId) +
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="file"; filename="photo.jfif"${CRLF}` +
      `Content-Type: image/jpeg${CRLF}${CRLF}` +
      `jpeg-bytes${CRLF}` +
      `--${boundary}--${CRLF}`

    const res = await server.server.inject({
      method: 'POST',
      url: '/files',
      payload: Buffer.from(body, 'utf8'),
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
    expect(res.payload).toEqual(`${transactionId}.jfif`)

    const metaData = putObjectMock.mock.calls[0][2]
    expect(metaData['content-type']).toBe('image/jpeg')
  })
})

describe('verify document uploader handler', () => {
  let server: any
  const token = jwt.sign({ scope: [] }, readFileSync('./test/cert.key'), {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:documents-user',
    subject: '123123'
  })

  beforeEach(async () => {
    server = await createServer()
  })

  it('returns ok for valid request', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/upload',
      payload: {
        fileData:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlwAAAK8CAYAAAA6WGEyAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2h'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })
})
