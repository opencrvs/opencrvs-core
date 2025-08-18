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
import { MINIO_BUCKET } from '../../minio/constants'

const minioPutMock = jest.fn()
const minioStatMock = jest.fn()
jest.mock('../../minio/client', () => {
  return {
    __esModule: true,
    minioClient: {
      putObject: (...args: unknown[]) => minioPutMock(...args),
      statObject: (...args: unknown[]) => {
        minioStatMock(...args)
        return true
      }
    }
  }
})

describe('fileExistsHandler', () => {
  let server: any
  const token = jwt.sign(
    { scope: ['declare'] },
    readFileSync('./test/cert.key'),
    {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:documents-user',
      subject: '123123'
    }
  )

  beforeEach(async () => {
    minioPutMock.mockClear()
    minioStatMock.mockClear()
    server = await createServer()
  })

  it('Separates bucket from file paths with multiple directories', async () => {
    const path = 'event-12345'
    const transactionId = 'transaction-12345'

    const res = await server.server.inject({
      method: 'GET',
      url: `/files/${MINIO_BUCKET}/${path}/${transactionId}.txt`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    const [bucket, filename] = minioStatMock.mock.calls[0]
    expect(bucket).toBe(MINIO_BUCKET)
    expect(filename).toBe(`${path}/${transactionId}.txt`)

    expect(res.statusCode).toBe(200)
  })

  it('Separates bucket from file', async () => {
    const path = 'event-12345'
    const transactionId = 'transaction-12345'

    const res = await server.server.inject({
      method: 'GET',
      url: `/files/${MINIO_BUCKET}/${path}/${transactionId}.txt`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    const [bucket, filename] = minioStatMock.mock.calls[0]
    expect(bucket).toBe(MINIO_BUCKET)
    expect(filename).toBe(`${path}/${transactionId}.txt`)

    expect(res.statusCode).toBe(200)
  })

  it('handles explicit "/" as start of of file path', async () => {
    const path = 'event-12345'
    const transactionId = 'transaction-12345'

    const res = await server.server.inject({
      method: 'GET',
      // double slash is handled
      url: `/files//${MINIO_BUCKET}/${path}/${transactionId}.txt`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    const [bucket, filename] = minioStatMock.mock.calls[0]
    expect(bucket).toBe(MINIO_BUCKET)
    expect(filename).toBe(`${path}/${transactionId}.txt`)

    expect(res.statusCode).toBe(200)
  })
})

describe('fileUploadHandler', () => {
  let server: any
  const token = jwt.sign(
    { scope: ['declare'] },
    readFileSync('./test/cert.key'),
    {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:documents-user',
      subject: '123123'
    }
  )

  beforeEach(async () => {
    minioPutMock.mockClear()
    minioStatMock.mockClear()
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

    expect(res.payload).toEqual(`/${MINIO_BUCKET}/${path}/${transactionId}.txt`)

    const [bucket, filename] = minioPutMock.mock.calls[0]
    expect(bucket).toBe(MINIO_BUCKET)
    expect(filename).toBe(`${path}/${transactionId}.txt`)

    expect(res.statusCode).toBe(200)
  })

  it('adds bucket to file path', async () => {
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

    expect(res.payload).toEqual(`/${MINIO_BUCKET}/${transactionId}.txt`)

    const [bucket, filename] = minioPutMock.mock.calls[0]
    expect(bucket).toBe(MINIO_BUCKET)
    expect(filename).toBe(`${transactionId}.txt`)

    expect(res.statusCode).toBe(200)
  })
})

describe('verify document uploader handler', () => {
  let server: any
  const token = jwt.sign(
    { scope: ['declare'] },
    readFileSync('./test/cert.key'),
    {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:documents-user',
      subject: '123123'
    }
  )

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
