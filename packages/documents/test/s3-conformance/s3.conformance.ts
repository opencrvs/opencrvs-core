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
import { createHash, randomBytes, randomUUID } from 'crypto'
import { Readable } from 'stream'
import { PutBucketPolicyCommand } from '@aws-sdk/client-s3'
import fetch from 'node-fetch'
import {
  ensureDefaultBucket,
  ensureDefaultBucketIsPrivate,
  listObjectKeys,
  putObject,
  removeObject,
  removeObjects,
  statObjectIfExists
} from '@documents/s3/client'
import {
  S3_BUCKET,
  S3_HOST,
  S3_PORT,
  S3_PUBLIC_URL,
  S3_USE_SSL
} from '@documents/s3/constants'
import { createS3Client } from '@documents/s3/sdk-client'
import { signFileUrl } from '@documents/s3/sign'

/**
 * What a store must do to be a supported one. Each test is one point of
 * the capability contract in docs/adr/0004-documents-speaks-plain-s3.md, and
 * runs the same functions that the documents service runs.
 *
 * Run it against a store with `pnpm test:s3-conformance`, which reads the same
 * `S3_*` variables as the service. It writes only under a prefix of its own and removes it afterwards.
 */

/** More than one page of `ListObjectsV2` and more than one `DeleteObjects`. */
const MANY_OBJECTS = Number(process.env.S3_CONFORMANCE_OBJECTS ?? 1100)
const PREFIX = `conformance/${randomUUID()}/`
const key = (name: string) => `${PREFIX}${name}`

/*
 * Used only to put a policy on the bucket, which the service itself never
 * does, so that the repair in `ensureDefaultBucketIsPrivate` can be tested.
 */
const admin = createS3Client(
  `${S3_USE_SSL ? 'https' : 'http'}://${S3_HOST}:${S3_PORT}`
)

const sha256 = (data: Buffer) => createHash('sha256').update(data).digest('hex')

async function download(path: string) {
  const response = await fetch(await signFileUrl(path))

  return {
    status: response.status,
    headers: response.headers,
    body: Buffer.from(await response.arrayBuffer())
  }
}

/** A stream of unknown length, which is what an upload to the service is. */
function streamOf(data: Buffer, chunkSize = 1024 * 1024) {
  return Readable.from(
    (function* () {
      for (let offset = 0; offset < data.length; offset += chunkSize) {
        yield data.subarray(offset, offset + chunkSize)
      }
    })()
  )
}

/** Runs the work in small batches, so that a large store is not flooded. */
async function inBatches<T>(
  items: T[],
  size: number,
  work: (item: T) => Promise<unknown>
) {
  for (let start = 0; start < items.length; start += size) {
    await Promise.all(items.slice(start, start + size).map(work))
  }
}

beforeAll(async () => {
  // A run's report must say which store it ran against
  // eslint-disable-next-line no-console
  console.log(
    `S3 conformance: endpoint=${S3_HOST}:${S3_PORT} public=${S3_PUBLIC_URL} bucket=${S3_BUCKET} prefix=${PREFIX}`
  )
  await ensureDefaultBucket()
  await ensureDefaultBucketIsPrivate()
})

afterAll(async () => {
  await removeObjects(await listObjectKeys(PREFIX))
})

describe('bucket', () => {
  it('is created once and left alone afterwards', async () => {
    await ensureDefaultBucket()
    await ensureDefaultBucket()
  })

  it('is made private again without failing when it already is', async () => {
    await ensureDefaultBucketIsPrivate()
    await ensureDefaultBucketIsPrivate()
  })

  it('is made private again when it was left readable by anyone', async () => {
    await putObject(key('was-public.txt'), Buffer.from('x'))
    const signed = new URL(await signFileUrl(key('was-public.txt')))
    const unsigned = `${signed.origin}${signed.pathname}`

    await admin.send(
      new PutBucketPolicyCommand({
        Bucket: S3_BUCKET,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${S3_BUCKET}/*`]
            }
          ]
        })
      })
    )

    try {
      // The control: the store did serve the object to anyone
      expect((await fetch(unsigned)).status).toBe(200)

      await ensureDefaultBucketIsPrivate()

      expect([401, 403]).toContain((await fetch(unsigned)).status)
    } finally {
      await ensureDefaultBucketIsPrivate()
    }
  })
})

describe('objects', () => {
  it('stores a stream of unknown length and returns the same bytes', async () => {
    // Larger than one multipart part, so that the upload is split
    const content = randomBytes(12 * 1024 * 1024)

    await putObject(key('large.bin'), streamOf(content), {
      'content-type': 'application/octet-stream',
      'created-by': 'conformance'
    })

    const downloaded = await download(key('large.bin'))
    expect(downloaded.status).toBe(200)
    expect(downloaded.body.length).toBe(content.length)
    expect(sha256(downloaded.body)).toBe(sha256(content))
  })

  it('keeps the content type and the user metadata', async () => {
    await putObject(key('photo.jfif'), Buffer.from('jpeg-bytes'), {
      'content-type': 'image/jpeg',
      'created-by': 'user-1'
    })

    const stat = await statObjectIfExists(key('photo.jfif'))
    expect(stat?.metaData['created-by']).toBe('user-1')

    const downloaded = await download(key('photo.jfif'))
    expect(downloaded.headers.get('content-type')).toBe('image/jpeg')
  })

  it('answers null for an object that does not exist', async () => {
    expect(await statObjectIfExists(key('missing.png'))).toBeNull()
  })

  it('stores and serves a key that needs encoding', async () => {
    const name = key('my photo+1 (é).png')
    await putObject(name, Buffer.from('png-bytes'), {
      'content-type': 'image/png'
    })

    expect(await statObjectIfExists(name)).not.toBeNull()
    const downloaded = await download(name)
    expect(downloaded.status).toBe(200)
    expect(downloaded.body.toString()).toBe('png-bytes')
  })

  it('removes one object', async () => {
    await putObject(key('one.png'), Buffer.from('x'))

    await removeObject(key('one.png'))

    expect(await statObjectIfExists(key('one.png'))).toBeNull()
  })
})

describe('presigned URLs', () => {
  it('can be fetched through the public address', async () => {
    await putObject(key('signed.txt'), Buffer.from('signed'), {
      'content-type': 'text/plain'
    })

    const downloaded = await download(key('signed.txt'))

    expect(downloaded.status).toBe(200)
    expect(downloaded.body.toString()).toBe('signed')
  })

  it('are refused once the signature has been altered', async () => {
    await putObject(key('tampered.txt'), Buffer.from('x'))
    const url = new URL(await signFileUrl(key('tampered.txt')))
    const signature = url.searchParams.get('X-Amz-Signature') as string
    url.searchParams.set(
      'X-Amz-Signature',
      `${signature.slice(0, -1)}${signature.endsWith('0') ? '1' : '0'}`
    )

    const response = await fetch(url.toString())

    expect(response.status).toBe(403)
  })

  it('are required: an unsigned request for an existing object is refused', async () => {
    await putObject(key('private.txt'), Buffer.from('secret'))
    const signed = new URL(await signFileUrl(key('private.txt')))
    const unsigned = `${signed.origin}${signed.pathname}`

    const withSignature = await fetch(signed.toString())
    const withoutSignature = await fetch(unsigned)

    // The first request is the control: the object is there and readable
    expect(withSignature.status).toBe(200)
    expect([401, 403]).toContain(withoutSignature.status)
  })
})

describe('many objects', () => {
  const names = Array.from(
    { length: MANY_OBJECTS },
    (_, index) => `many/${index}.txt`
  )

  it('lists every object under a prefix, across pages', async () => {
    await inBatches(names, 50, (name) =>
      putObject(key(name), Buffer.from(name))
    )

    const listed = await listObjectKeys(key('many/'))

    expect(listed.length).toBe(MANY_OBJECTS)
    expect(new Set(listed).size).toBe(MANY_OBJECTS)
  })

  it('lists nothing under a prefix that holds no object', async () => {
    expect(await listObjectKeys(key('nothing-here/'))).toEqual([])
  })

  it('removes all of them, across more than one request', async () => {
    await removeObjects(names.map(key))

    expect(await listObjectKeys(key('many/'))).toEqual([])
  })
})
