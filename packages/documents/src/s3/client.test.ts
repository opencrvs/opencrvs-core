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
import { randomUUID } from 'crypto'
import {
  CreateBucketCommand,
  CreateMultipartUploadCommand,
  DeleteBucketCommand,
  DeleteBucketPolicyCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutBucketPolicyCommand,
  S3Client,
  S3ServiceException
} from '@aws-sdk/client-s3'
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
import { Readable } from 'stream'
import { getObject, s3 } from '../../test/s3'

/*
 * These tests run against the RustFS that test/global-setup.ts starts. The
 * spy passes every request through to it, except where a test makes the store
 * fail in a way that a real store cannot be made to.
 */
const send = jest.spyOn(S3Client.prototype, 'send') as unknown as jest.Mock

/** The shape the AWS SDK gives to an error that it has no class for. */
const storeError = (name: string, httpStatusCode: number) =>
  new S3ServiceException({
    name,
    message: name,
    $fault: httpStatusCode < 500 ? 'client' : 'server',
    $metadata: { httpStatusCode }
  })

const sentCommands = (type: new (...args: never[]) => unknown) =>
  send.mock.calls.map(([command]) => command).filter((c) => c instanceof type)

/** A prefix no other test writes to, so the tests do not see each other's objects. */
const newPrefix = () => `events/${randomUUID()}/`

const anonymousGet = (key: string) =>
  fetch(`${env.S3_ENDPOINT}/${env.S3_BUCKET}/${key}`)

beforeAll(async () => {
  await ensureDefaultBucket()
})

beforeEach(() => {
  send.mockClear()
})

afterAll(() => {
  send.mockRestore()
})

describe('ensureDefaultBucket', () => {
  it('creates the bucket in the configured region when it does not exist', async () => {
    // Nothing is stored yet, as this is the first test of the file
    await s3.send(new DeleteBucketCommand({ Bucket: env.S3_BUCKET }))

    await ensureDefaultBucket()

    await expect(
      s3.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }))
    ).resolves.toBeDefined()
    // RustFS answers us-east-1 for any bucket, so the region is checked on the request
    expect(sentCommands(CreateBucketCommand)[0]).toMatchObject({
      input: {
        Bucket: env.S3_BUCKET,
        CreateBucketConfiguration: { LocationConstraint: env.S3_BUCKET_REGION }
      }
    })
  })

  it('leaves an existing bucket alone', async () => {
    await ensureDefaultBucket()

    expect(sentCommands(HeadBucketCommand)).toHaveLength(1)
    expect(sentCommands(CreateBucketCommand)).toHaveLength(0)
  })

  it('accepts a bucket that another replica created first', async () => {
    // The check runs before the other replica creates the bucket
    send.mockRejectedValueOnce(storeError('NotFound', 404))

    await expect(ensureDefaultBucket()).resolves.toBeUndefined()
    expect(sentCommands(CreateBucketCommand)).toHaveLength(1)
  })

  it('fails when the store refuses to say whether the bucket exists', async () => {
    send.mockRejectedValueOnce(storeError('Forbidden', 403))

    await expect(ensureDefaultBucket()).rejects.toThrow('Forbidden')
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('fails when the bucket could not be created', async () => {
    send.mockRejectedValueOnce(storeError('NotFound', 404))
    send.mockRejectedValueOnce(new Error('store is unreachable'))

    await expect(ensureDefaultBucket()).rejects.toThrow('store is unreachable')
  })
})

describe('ensureDefaultBucketIsPrivate', () => {
  it('removes any bucket policy so nothing is served anonymously', async () => {
    const key = `${newPrefix()}a.png`
    await putObject(key, Buffer.from('content'))
    await s3.send(
      new PutBucketPolicyCommand({
        Bucket: env.S3_BUCKET,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${env.S3_BUCKET}/*`]
            }
          ]
        })
      })
    )
    expect((await anonymousGet(key)).status).toBe(200)

    await ensureDefaultBucketIsPrivate()

    expect((await anonymousGet(key)).status).toBe(403)
  })

  it('can run again on a bucket that is already private', async () => {
    await ensureDefaultBucketIsPrivate()

    await expect(ensureDefaultBucketIsPrivate()).resolves.toBeUndefined()
  })

  it('accepts a store that answers that there is no policy to remove', async () => {
    // What SeaweedFS answers. RustFS and MinIO answer 204.
    send.mockRejectedValueOnce(storeError('NoSuchBucketPolicy', 404))

    await expect(ensureDefaultBucketIsPrivate()).resolves.toBeUndefined()
  })

  it('fails when the policy could not be removed', async () => {
    send.mockRejectedValueOnce(storeError('AccessDenied', 403))

    await expect(ensureDefaultBucketIsPrivate()).rejects.toThrow('AccessDenied')
    expect(sentCommands(DeleteBucketPolicyCommand)).toHaveLength(1)
  })
})

describe('statObjectIfExists', () => {
  it('returns the user metadata of an existing object', async () => {
    const key = `${newPrefix()}a.png`
    await putObject(key, Buffer.from('content'), {
      metadata: { 'created-by': 'user-1' }
    })

    expect(await statObjectIfExists(key)).toEqual({
      metadata: { 'created-by': 'user-1' }
    })
  })

  it('returns empty metadata for an object that has none', async () => {
    const key = `${newPrefix()}a.png`
    await putObject(key, Buffer.from('content'))

    expect(await statObjectIfExists(key)).toEqual({ metadata: {} })
  })

  it('returns null for a key that does not exist', async () => {
    expect(await statObjectIfExists(`${newPrefix()}a.png`)).toBeNull()
  })

  it('returns null when a store answers a bare 404', async () => {
    // What some stores other than AWS S3 and RustFS answer
    send.mockRejectedValueOnce(storeError('UnknownError', 404))

    expect(await statObjectIfExists('a.png')).toBeNull()
  })

  it('does not mistake a store failure for a missing object', async () => {
    send.mockRejectedValueOnce(storeError('InternalError', 500))

    await expect(statObjectIfExists('a.png')).rejects.toThrow('InternalError')
  })
})

describe('putObject', () => {
  it('stores the body with its content type and user metadata', async () => {
    const key = `${newPrefix()}a.png`

    await putObject(key, Buffer.from('content'), {
      contentType: 'image/png',
      metadata: { 'created-by': 'user-1' }
    })

    expect(await getObject(key)).toEqual({
      contentType: 'image/png',
      metadata: { 'created-by': 'user-1' },
      body: 'content'
    })
  })

  it('streams a large body of unknown length as a multipart upload', async () => {
    const key = `${newPrefix()}large.pdf`
    // Larger than one 5 MB part
    const part = Buffer.alloc(1024 * 1024, 'a')
    const body = Readable.from(Array.from({ length: 6 }, () => part))

    await putObject(key, body, { contentType: 'application/pdf' })

    expect(sentCommands(CreateMultipartUploadCommand)).toHaveLength(1)
    const stored = await getObject(key)
    expect(stored.body).toHaveLength(6 * part.length)
    expect(stored.contentType).toBe('application/pdf')
  })
})

describe('removeObject', () => {
  it('deletes the key from the bucket', async () => {
    const key = `${newPrefix()}a.png`
    await putObject(key, Buffer.from('content'))

    await removeObject(key)

    expect(await statObjectIfExists(key)).toBeNull()
  })
})

describe('removeObjects', () => {
  const keys = (prefix: string, count: number) =>
    Array.from({ length: count }, (_, index) => `${prefix}${index}.png`)

  const deleteErrors = (failedKeys: string[]) => ({
    Errors: failedKeys.map((Key) => ({ Key, Code: 'AccessDenied' }))
  })

  it('sends nothing for an empty list', async () => {
    await removeObjects([])

    expect(send).not.toHaveBeenCalled()
  })

  it('deletes at most 1000 keys per request', async () => {
    const prefix = newPrefix()
    const toDelete = keys(prefix, 2500)
    // Deleting a key that does not exist succeeds, so only a few are stored
    await putObject(toDelete[0], Buffer.from(''))
    await putObject(toDelete[2499], Buffer.from(''))
    send.mockClear()

    await removeObjects(toDelete)

    const sizes = sentCommands(DeleteObjectsCommand).map(
      (command) =>
        (command as DeleteObjectsCommand).input.Delete!.Objects!.length
    )
    expect(sizes).toEqual([1000, 1000, 500])
    expect(await listObjectKeys(prefix)).toEqual([])
  })

  it('fails when the store could not delete a key', async () => {
    send.mockResolvedValueOnce(deleteErrors(['events/e1/0.png']))

    await expect(removeObjects(keys('events/e1/', 2))).rejects.toThrow(
      'Failed to delete 1 object(s), the first of them: events/e1/0.png (AccessDenied)'
    )
  })

  it('sends the remaining batches after one fails, then fails with the total', async () => {
    const toDelete = keys('events/e1/', 2500)
    send.mockResolvedValueOnce(deleteErrors(toDelete.slice(0, 15)))
    send.mockResolvedValueOnce({})
    send.mockResolvedValueOnce(deleteErrors(['events/e1/2400.png']))

    const error = await removeObjects(toDelete).catch((e: Error) => e)

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
  it('lists every key under the prefix, at any depth', async () => {
    const prefix = newPrefix()
    await putObject(`${prefix}a.png`, Buffer.from(''))
    await putObject(`${prefix}nested/b.png`, Buffer.from(''))
    await putObject(`${newPrefix()}elsewhere.png`, Buffer.from(''))

    const found = await listObjectKeys(prefix)

    expect(found.sort()).toEqual([`${prefix}a.png`, `${prefix}nested/b.png`])
  })

  it('follows the continuation token across pages', async () => {
    // A real page holds 1000 keys, too many to store for one test
    send.mockResolvedValueOnce({
      Contents: [{ Key: 'events/e1/a.png' }],
      IsTruncated: true,
      NextContinuationToken: 'next-page'
    })
    send.mockResolvedValueOnce({ Contents: [{ Key: 'events/e1/b.png' }] })

    const found = await listObjectKeys('events/e1/')

    expect(found).toEqual(['events/e1/a.png', 'events/e1/b.png'])
    const [, second] = sentCommands(ListObjectsV2Command)
    expect((second as ListObjectsV2Command).input.ContinuationToken).toBe(
      'next-page'
    )
  })

  it('returns nothing for a prefix that holds no object', async () => {
    expect(await listObjectKeys(newPrefix())).toEqual([])
  })
})
