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
import {
  BucketAlreadyOwnedByYou,
  CreateBucketCommand,
  DeleteBucketPolicyCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  NoSuchKey,
  NotFound,
  S3Client,
  S3ServiceException
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import {
  ensureDefaultBucket,
  ensureDefaultBucketIsPrivate,
  listObjectKeys,
  putObject,
  removeObject,
  removeObjects,
  statObjectIfExists
} from '@documents/s3/client'
import { env } from '@documents/s3/constants'

jest.mock('@aws-sdk/lib-storage', () => ({ Upload: jest.fn() }))

/* Replaces what the client sends over the network */
const send = jest.spyOn(S3Client.prototype, 'send') as unknown as jest.Mock
const UploadMock = Upload as unknown as jest.Mock
const uploadDone = jest.fn()

const $metadata = (httpStatusCode: number) => ({
  $metadata: { httpStatusCode }
})

/** The shape the AWS SDK gives to an error that it has no class for. */
const storeError = (name: string, httpStatusCode: number) =>
  new S3ServiceException({
    name,
    message: name,
    $fault: httpStatusCode < 500 ? 'client' : 'server',
    ...$metadata(httpStatusCode)
  })

const notFound = () => new NotFound({ message: 'NotFound', ...$metadata(404) })

const sentCommand = (call: number) => send.mock.calls[call][0]

beforeEach(() => {
  send.mockReset()
  uploadDone.mockReset().mockResolvedValue({})
  UploadMock.mockReset().mockImplementation(() => ({ done: uploadDone }))
})

describe('ensureDefaultBucket', () => {
  it('creates the bucket in the configured region when it does not exist', async () => {
    send.mockRejectedValueOnce(notFound())
    send.mockResolvedValueOnce({})

    await ensureDefaultBucket()

    expect(sentCommand(0)).toBeInstanceOf(HeadBucketCommand)
    expect(sentCommand(1)).toBeInstanceOf(CreateBucketCommand)
    expect(sentCommand(1).input).toEqual({
      Bucket: env.S3_BUCKET,
      CreateBucketConfiguration: { LocationConstraint: env.S3_BUCKET_REGION }
    })
  })

  it('leaves an existing bucket alone', async () => {
    send.mockResolvedValueOnce({})

    await ensureDefaultBucket()

    expect(send).toHaveBeenCalledTimes(1)
  })

  it('fails when the store refuses to say whether the bucket exists', async () => {
    send.mockRejectedValueOnce(storeError('Forbidden', 403))

    await expect(ensureDefaultBucket()).rejects.toThrow('Forbidden')
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('fails when the bucket could not be created', async () => {
    send.mockRejectedValueOnce(notFound())
    send.mockRejectedValueOnce(new Error('store is unreachable'))

    await expect(ensureDefaultBucket()).rejects.toThrow('store is unreachable')
  })

  it('accepts a bucket that another replica created first', async () => {
    send.mockRejectedValueOnce(notFound())
    send.mockRejectedValueOnce(
      new BucketAlreadyOwnedByYou({
        message: 'BucketAlreadyOwnedByYou',
        ...$metadata(409)
      })
    )

    await expect(ensureDefaultBucket()).resolves.toBeUndefined()
  })
})

describe('ensureDefaultBucketIsPrivate', () => {
  it('removes any bucket policy so nothing is served anonymously', async () => {
    send.mockResolvedValueOnce({})

    await ensureDefaultBucketIsPrivate()

    expect(sentCommand(0)).toBeInstanceOf(DeleteBucketPolicyCommand)
    expect(sentCommand(0).input).toEqual({ Bucket: env.S3_BUCKET })
  })

  it('accepts a bucket that has no policy to remove', async () => {
    send.mockRejectedValueOnce(storeError('NoSuchBucketPolicy', 404))

    await expect(ensureDefaultBucketIsPrivate()).resolves.toBeUndefined()
  })

  it('fails when the policy could not be removed', async () => {
    send.mockRejectedValueOnce(storeError('AccessDenied', 403))

    await expect(ensureDefaultBucketIsPrivate()).rejects.toThrow('AccessDenied')
  })
})

describe('statObjectIfExists', () => {
  it('returns the user metadata of an existing object', async () => {
    send.mockResolvedValueOnce({ Metadata: { 'created-by': 'user-1' } })

    const stat = await statObjectIfExists('events/e1/a.png')

    expect(stat).toEqual({ metadata: { 'created-by': 'user-1' } })
    expect(sentCommand(0)).toBeInstanceOf(HeadObjectCommand)
    expect(sentCommand(0).input).toEqual({
      Bucket: env.S3_BUCKET,
      Key: 'events/e1/a.png'
    })
  })

  it('returns empty metadata for an object that has none', async () => {
    send.mockResolvedValueOnce({})

    expect(await statObjectIfExists('a.png')).toEqual({ metadata: {} })
  })

  it.each([
    ['NotFound', notFound()],
    ['NoSuchKey', new NoSuchKey({ message: 'NoSuchKey', ...$metadata(404) })],
    // What a store other than AWS S3 may answer
    ['a bare 404', storeError('UnknownError', 404)]
  ])('returns null when the store answers %s', async (_, error) => {
    send.mockRejectedValueOnce(error)

    expect(await statObjectIfExists('a.png')).toBeNull()
  })

  it('does not mistake a store failure for a missing object', async () => {
    send.mockRejectedValueOnce(storeError('InternalError', 500))

    await expect(statObjectIfExists('a.png')).rejects.toThrow('InternalError')
  })
})

describe('putObject', () => {
  it('streams the body with its content type and user metadata', async () => {
    const body = Buffer.from('content')

    await putObject('events/e1/a.png', body, {
      contentType: 'image/png',
      metadata: { 'created-by': 'user-1' }
    })

    expect(Upload).toHaveBeenCalledWith({
      client: expect.any(S3Client),
      params: {
        Bucket: env.S3_BUCKET,
        Key: 'events/e1/a.png',
        Body: body,
        ContentType: 'image/png',
        Metadata: { 'created-by': 'user-1' }
      }
    })
    expect(uploadDone).toHaveBeenCalledTimes(1)
  })

  it('leaves the content type to the store when none is given', async () => {
    await putObject('a.png', Buffer.from(''))

    const { params } = UploadMock.mock.calls[0][0]
    expect(params.ContentType).toBeUndefined()
    expect(params.Metadata).toEqual({})
  })

  it('fails when the upload fails', async () => {
    uploadDone.mockRejectedValueOnce(new Error('store is unreachable'))

    await expect(putObject('a.png', Buffer.from(''))).rejects.toThrow(
      'store is unreachable'
    )
  })
})

describe('removeObject', () => {
  it('deletes the key from the bucket', async () => {
    send.mockResolvedValueOnce({})

    await removeObject('events/e1/a.png')

    expect(sentCommand(0)).toBeInstanceOf(DeleteObjectCommand)
    expect(sentCommand(0).input).toEqual({
      Bucket: env.S3_BUCKET,
      Key: 'events/e1/a.png'
    })
  })
})

describe('removeObjects', () => {
  const keys = (count: number) =>
    Array.from({ length: count }, (_, index) => `events/e1/${index}.png`)

  const deleteErrors = (failedKeys: string[]) => ({
    Errors: failedKeys.map((Key) => ({ Key, Code: 'AccessDenied' }))
  })

  it('sends nothing for an empty list', async () => {
    await removeObjects([])

    expect(send).not.toHaveBeenCalled()
  })

  it('deletes at most 1000 keys per request', async () => {
    send.mockResolvedValue({})

    await removeObjects(keys(2500))

    expect(send).toHaveBeenCalledTimes(3)
    const sizes = [0, 1, 2].map(
      (call) => sentCommand(call).input.Delete.Objects.length
    )
    expect(sizes).toEqual([1000, 1000, 500])
    expect(sentCommand(0)).toBeInstanceOf(DeleteObjectsCommand)
    expect(sentCommand(0).input.Delete.Objects[0]).toEqual({
      Key: 'events/e1/0.png'
    })
  })

  it('fails when the store could not delete a key', async () => {
    send.mockResolvedValueOnce(deleteErrors(['events/e1/0.png']))

    await expect(removeObjects(keys(2))).rejects.toThrow(
      'Failed to delete 1 object(s), the first of them: events/e1/0.png (AccessDenied)'
    )
  })

  it('sends the remaining batches after one fails, then fails with the total', async () => {
    send.mockResolvedValueOnce(deleteErrors(keys(1000).slice(0, 15)))
    send.mockResolvedValueOnce({})
    send.mockResolvedValueOnce(deleteErrors(['events/e1/2400.png']))

    const error = await removeObjects(keys(2500)).catch((e: Error) => e)

    expect(send).toHaveBeenCalledTimes(3)
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toMatch(/^Failed to delete 16 object\(s\)/)
    // Names only the first ten, so a large sweep does not make a huge message
    expect((error as Error).message).toContain('events/e1/9.png')
    expect((error as Error).message).not.toContain('events/e1/10.png')
    expect((error as Error).message).not.toContain('events/e1/2400.png')
  })
})

describe('listObjectKeys', () => {
  it('follows the continuation token across pages', async () => {
    send.mockResolvedValueOnce({
      Contents: [{ Key: 'events/e1/a.png' }],
      IsTruncated: true,
      NextContinuationToken: 'next-page'
    })
    send.mockResolvedValueOnce({ Contents: [{ Key: 'events/e1/b.png' }] })

    const found = await listObjectKeys('events/e1/')

    expect(found).toEqual(['events/e1/a.png', 'events/e1/b.png'])
    expect(sentCommand(0)).toBeInstanceOf(ListObjectsV2Command)
    expect(sentCommand(0).input).toMatchObject({
      Bucket: env.S3_BUCKET,
      Prefix: 'events/e1/'
    })
    expect(sentCommand(1).input.ContinuationToken).toBe('next-page')
  })

  it('returns nothing for a prefix that holds no object', async () => {
    send.mockResolvedValueOnce({})

    expect(await listObjectKeys('events/none/')).toEqual([])
  })
})
