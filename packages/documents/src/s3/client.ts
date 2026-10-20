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
  BucketLocationConstraint,
  CreateBucketCommand,
  DeleteBucketPolicyCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  paginateListObjectsV2
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import {
  S3_BUCKET,
  S3_BUCKET_REGION,
  S3_ENDPOINT
} from '@documents/s3/constants'
import { createS3Client } from '@documents/s3/sdk-client'
import { Readable } from 'stream'

/*
 * Everything the documents service asks of the object store goes through the
 * functions below, so handlers know nothing about the SDK or the store behind
 * it. What each store must support is listed in
 * docs/adr/0004-documents-speaks-plain-s3.md.
 */
const s3Client = createS3Client(S3_ENDPOINT)

/** The most keys a single `DeleteObjects` request may carry. */
const MAX_KEYS_PER_DELETE = 1000

function errorName(error: unknown) {
  return (error as { name?: string }).name
}

function isNotFound(error: unknown) {
  const status = (error as { $metadata?: { httpStatusCode?: number } })
    .$metadata?.httpStatusCode

  return (
    errorName(error) === 'NotFound' ||
    errorName(error) === 'NoSuchKey' ||
    status === 404
  )
}

export async function ensureDefaultBucket() {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: S3_BUCKET }))
    return
  } catch (error) {
    if (!isNotFound(error)) {
      throw error
    }
  }

  try {
    await s3Client.send(
      new CreateBucketCommand({
        Bucket: S3_BUCKET,
        // S3 rejects a location constraint for us-east-1
        ...(S3_BUCKET_REGION !== 'us-east-1' && {
          CreateBucketConfiguration: {
            LocationConstraint: S3_BUCKET_REGION as BucketLocationConstraint
          }
        })
      })
    )
  } catch (error) {
    // Another replica of this service created it between our check and now
    if (errorName(error) !== 'BucketAlreadyOwnedByYou') {
      throw error
    }
  }
}

/**
 * The bucket must not give anonymous access. Users get documents only through
 * presigned URLs. An empty policy removes the policy from the bucket. The store
 * then refuses requests that have no signature, but presigned requests
 * continue to work.
 *
 * This function runs at each start, and not only when the bucket is new.
 * Before, the code created the bucket with a public-read policy, and a
 * migration made the bucket private. That migration was lost when the
 * migrations were made flat for 2.0. New installations stayed readable by all
 * persons. A check at each start keeps the rule in one place. It also repairs
 * the installations that have no private policy.
 *
 * @see https://github.com/opencrvs/opencrvs-core/issues/13436
 */
export async function ensureDefaultBucketIsPrivate() {
  try {
    await s3Client.send(new DeleteBucketPolicyCommand({ Bucket: S3_BUCKET }))
  } catch (error) {
    // Nothing to remove, which is the state that we want
    if (errorName(error) !== 'NoSuchBucketPolicy') {
      throw error
    }
  }
}

/**
 * @returns the object's user metadata, or null when it does not exist.
 */
export async function statObjectIfExists(key: string) {
  try {
    const head = await s3Client.send(
      new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key })
    )

    return { metaData: head.Metadata ?? {} }
  } catch (error) {
    if (isNotFound(error)) {
      return null
    }

    throw error
  }
}

/**
 * @param metaData `content-type` becomes the object's content type. Every other
 * entry is stored as user metadata, which the store lowercases.
 */
export async function putObject(
  key: string,
  body: Readable | Buffer,
  metaData: Record<string, string> = {}
) {
  let contentType: string | undefined
  const userMetadata: Record<string, string> = {}

  for (const [name, value] of Object.entries(metaData)) {
    if (name.toLowerCase() === 'content-type') {
      contentType = value
    } else {
      userMetadata[name.toLowerCase()] = value
    }
  }

  /*
   * An upload is a stream of unknown length, and a plain `PutObject` needs the
   * length up front. `Upload` streams it, as a multipart upload when it is large.
   */
  await new Upload({
    client: s3Client,
    params: {
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: userMetadata
    }
  }).done()
}

export async function removeObject(key: string) {
  await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }))
}

/**
 * @throws when the store reports any key it could not delete, so that a failed
 * sweep is not mistaken for a successful one.
 */
export async function removeObjects(keys: string[]) {
  for (let start = 0; start < keys.length; start += MAX_KEYS_PER_DELETE) {
    const { Errors } = await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: S3_BUCKET,
        Delete: {
          Objects: keys
            .slice(start, start + MAX_KEYS_PER_DELETE)
            .map((Key) => ({ Key })),
          Quiet: true
        }
      })
    )

    if (Errors?.length) {
      throw new Error(
        `Failed to delete ${Errors.length} object(s): ${Errors.map(
          ({ Key, Code }) => `${Key} (${Code})`
        ).join(', ')}`
      )
    }
  }
}

/**
 * @returns the key of every object under the prefix, at any depth.
 */
export async function listObjectKeys(prefix = '') {
  const keys: string[] = []

  for await (const page of paginateListObjectsV2(
    { client: s3Client },
    { Bucket: S3_BUCKET, Prefix: prefix }
  )) {
    for (const object of page.Contents ?? []) {
      if (object.Key) {
        keys.push(object.Key)
      }
    }
  }

  return keys
}
