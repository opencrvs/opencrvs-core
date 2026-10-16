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
import { S3_BUCKET, S3_BUCKET_REGION } from '@documents/s3/constants'
import type { S3ProviderProfile } from '@documents/s3/providers'

const send = jest.fn()
const Upload = jest.fn()
const uploadDone = jest.fn()

/*
 * test/setupJest.ts replaces the client module with a mock in all other test
 * files. Get the real one, because these tests must use it. It is loaded in an
 * isolated registry so that a test can swap the provider profile, which is read
 * when the module loads.
 */
function loadClient(profile: Partial<S3ProviderProfile> = {}) {
  let client!: typeof import('@documents/s3/client')

  jest.isolateModules(() => {
    jest.doMock('@documents/s3/sdk-client', () => ({
      /*
       * The paginator refuses anything that is not an S3Client, and the
       * isolated registry has its own copy of that class. So this builds one
       * there, and replaces what it sends over the network.
       */
      createS3Client: () => {
        const { S3Client } = jest.requireActual('@aws-sdk/client-s3')

        return Object.assign(new S3Client({ region: 'local' }), { send })
      }
    }))
    jest.doMock('@aws-sdk/lib-storage', () => ({ Upload }))
    jest.doMock('@documents/s3/constants', () => {
      const actual = jest.requireActual('@documents/s3/constants')

      return {
        ...actual,
        S3_PROVIDER_PROFILE: { ...actual.S3_PROVIDER_PROFILE, ...profile }
      }
    })

    client = jest.requireActual('@documents/s3/client')
  })

  return client
}

/** The shape the AWS SDK gives to every error that the store answered with. */
const storeError = (name: string, httpStatusCode: number) =>
  Object.assign(new Error(name), { name, $metadata: { httpStatusCode } })

const sentCommand = (call: number) => send.mock.calls[call][0]

/*
 * The client loads in an isolated registry, so its command classes are not the
 * ones this file imports and `instanceof` cannot tell them apart. The name can.
 */
const expectCommand = (call: number, name: string) =>
  expect(sentCommand(call).constructor.name).toBe(name)

beforeEach(() => {
  send.mockReset()
  uploadDone.mockReset().mockResolvedValue({})
  Upload.mockReset().mockImplementation(() => ({ done: uploadDone }))
})

describe('ensureDefaultBucket', () => {
  it('creates the bucket in the configured region when it does not exist', async () => {
    send.mockRejectedValueOnce(storeError('NotFound', 404))
    send.mockResolvedValueOnce({})

    await loadClient().ensureDefaultBucket()

    expectCommand(0, 'HeadBucketCommand')
    expectCommand(1, 'CreateBucketCommand')
    expect(sentCommand(1).input).toEqual({
      Bucket: S3_BUCKET,
      CreateBucketConfiguration: { LocationConstraint: S3_BUCKET_REGION }
    })
  })

  it('sends no location constraint to a store that does not take one', async () => {
    send.mockRejectedValueOnce(storeError('NotFound', 404))
    send.mockResolvedValueOnce({})

    await loadClient({ sendLocationConstraint: false }).ensureDefaultBucket()

    expect(sentCommand(1).input).toEqual({ Bucket: S3_BUCKET })
  })

  it('leaves an existing bucket alone', async () => {
    send.mockResolvedValueOnce({})

    await loadClient().ensureDefaultBucket()

    expect(send).toHaveBeenCalledTimes(1)
  })

  it('fails when the store refuses to say whether the bucket exists', async () => {
    send.mockRejectedValueOnce(storeError('Forbidden', 403))

    await expect(loadClient().ensureDefaultBucket()).rejects.toThrow(
      'Forbidden'
    )
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('fails when the bucket could not be created', async () => {
    send.mockRejectedValueOnce(storeError('NotFound', 404))
    send.mockRejectedValueOnce(new Error('store is unreachable'))

    await expect(loadClient().ensureDefaultBucket()).rejects.toThrow(
      'store is unreachable'
    )
  })

  it('accepts a bucket that another replica created first', async () => {
    send.mockRejectedValueOnce(storeError('NotFound', 404))
    send.mockRejectedValueOnce(storeError('BucketAlreadyOwnedByYou', 409))

    await expect(loadClient().ensureDefaultBucket()).resolves.toBeUndefined()
  })
})

describe('ensureDefaultBucketIsPrivate', () => {
  it('removes any bucket policy so nothing is served anonymously', async () => {
    send.mockResolvedValueOnce({})

    await loadClient().ensureDefaultBucketIsPrivate()

    expectCommand(0, 'DeleteBucketPolicyCommand')
    expect(sentCommand(0).input).toEqual({ Bucket: S3_BUCKET })
  })

  it('accepts a bucket that has no policy to remove', async () => {
    send.mockRejectedValueOnce(storeError('NoSuchBucketPolicy', 404))

    await expect(
      loadClient().ensureDefaultBucketIsPrivate()
    ).resolves.toBeUndefined()
  })

  it('fails when the policy could not be removed', async () => {
    send.mockRejectedValueOnce(storeError('AccessDenied', 403))

    await expect(loadClient().ensureDefaultBucketIsPrivate()).rejects.toThrow(
      'AccessDenied'
    )
  })

  it('leaves the bucket to the store when the store governs access itself', async () => {
    await loadClient({
      privateBucketStrategy: 'skip'
    }).ensureDefaultBucketIsPrivate()

    expect(send).not.toHaveBeenCalled()
  })
})

describe('statObjectIfExists', () => {
  it('returns the user metadata of an existing object', async () => {
    send.mockResolvedValueOnce({ Metadata: { 'created-by': 'user-1' } })

    const stat = await loadClient().statObjectIfExists('events/e1/a.png')

    expect(stat).toEqual({ metaData: { 'created-by': 'user-1' } })
    expectCommand(0, 'HeadObjectCommand')
    expect(sentCommand(0).input).toEqual({
      Bucket: S3_BUCKET,
      Key: 'events/e1/a.png'
    })
  })

  it('returns empty metadata for an object that has none', async () => {
    send.mockResolvedValueOnce({})

    expect(await loadClient().statObjectIfExists('a.png')).toEqual({
      metaData: {}
    })
  })

  it.each([
    ['NotFound', 404],
    ['NoSuchKey', 404],
    ['UnknownError', 404]
  ])('returns null when the store answers %s', async (name, status) => {
    send.mockRejectedValueOnce(storeError(name, status))

    expect(await loadClient().statObjectIfExists('a.png')).toBeNull()
  })

  it('does not mistake a store failure for a missing object', async () => {
    send.mockRejectedValueOnce(storeError('InternalError', 500))

    await expect(loadClient().statObjectIfExists('a.png')).rejects.toThrow(
      'InternalError'
    )
  })
})

describe('putObject', () => {
  it('streams the body with its content type and user metadata', async () => {
    const body = Buffer.from('content')

    await loadClient().putObject('events/e1/a.png', body, {
      'content-type': 'image/png',
      'created-by': 'user-1'
    })

    expect(Upload).toHaveBeenCalledWith({
      client: expect.objectContaining({ send }),
      params: {
        Bucket: S3_BUCKET,
        Key: 'events/e1/a.png',
        Body: body,
        ContentType: 'image/png',
        Metadata: { 'created-by': 'user-1' }
      }
    })
    expect(uploadDone).toHaveBeenCalledTimes(1)
  })

  it('recognises the content type under any casing and lowercases the rest', async () => {
    await loadClient().putObject('a.png', Buffer.from(''), {
      'Content-Type': 'image/png',
      'Created-By': 'user-1'
    })

    const { params } = Upload.mock.calls[0][0]
    expect(params.ContentType).toBe('image/png')
    expect(params.Metadata).toEqual({ 'created-by': 'user-1' })
  })

  it('leaves the content type to the store when none is given', async () => {
    await loadClient().putObject('a.png', Buffer.from(''))

    const { params } = Upload.mock.calls[0][0]
    expect(params.ContentType).toBeUndefined()
    expect(params.Metadata).toEqual({})
  })

  it('fails when the upload fails', async () => {
    uploadDone.mockRejectedValueOnce(new Error('store is unreachable'))

    await expect(
      loadClient().putObject('a.png', Buffer.from(''))
    ).rejects.toThrow('store is unreachable')
  })
})

describe('removeObject', () => {
  it('deletes the key from the bucket', async () => {
    send.mockResolvedValueOnce({})

    await loadClient().removeObject('events/e1/a.png')

    expectCommand(0, 'DeleteObjectCommand')
    expect(sentCommand(0).input).toEqual({
      Bucket: S3_BUCKET,
      Key: 'events/e1/a.png'
    })
  })
})

describe('removeObjects', () => {
  const keys = (count: number) =>
    Array.from({ length: count }, (_, index) => `events/e1/${index}.png`)

  it('sends nothing for an empty list', async () => {
    await loadClient().removeObjects([])

    expect(send).not.toHaveBeenCalled()
  })

  it('deletes at most 1000 keys per request', async () => {
    send.mockResolvedValue({})

    await loadClient().removeObjects(keys(2500))

    expect(send).toHaveBeenCalledTimes(3)
    const sizes = [0, 1, 2].map(
      (call) => sentCommand(call).input.Delete.Objects.length
    )
    expect(sizes).toEqual([1000, 1000, 500])
    expectCommand(0, 'DeleteObjectsCommand')
    expect(sentCommand(0).input.Delete.Objects[0]).toEqual({
      Key: 'events/e1/0.png'
    })
  })

  it('fails when the store could not delete a key', async () => {
    send.mockResolvedValueOnce({
      Errors: [{ Key: 'events/e1/0.png', Code: 'AccessDenied' }]
    })

    await expect(loadClient().removeObjects(keys(2))).rejects.toThrow(
      'events/e1/0.png (AccessDenied)'
    )
  })

  it('deletes one key at a time for a store without the batch call', async () => {
    send.mockResolvedValue({})

    await loadClient({ batchDelete: 'per-key' }).removeObjects(keys(3))

    expect(send).toHaveBeenCalledTimes(3)
    expectCommand(0, 'DeleteObjectCommand')
    expect(sentCommand(2).input).toEqual({
      Bucket: S3_BUCKET,
      Key: 'events/e1/2.png'
    })
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

    const found = await loadClient().listObjectKeys('events/e1/')

    expect(found).toEqual(['events/e1/a.png', 'events/e1/b.png'])
    expectCommand(0, 'ListObjectsV2Command')
    expect(sentCommand(0).input).toMatchObject({
      Bucket: S3_BUCKET,
      Prefix: 'events/e1/'
    })
    expect(sentCommand(1).input.ContinuationToken).toBe('next-page')
  })

  it('returns nothing for a prefix that holds no object', async () => {
    send.mockResolvedValueOnce({})

    expect(await loadClient().listObjectKeys('events/none/')).toEqual([])
  })

  it('lists the whole bucket when no prefix is given', async () => {
    send.mockResolvedValueOnce({})

    await loadClient().listObjectKeys()

    expect(sentCommand(0).input.Prefix).toBe('')
  })
})
