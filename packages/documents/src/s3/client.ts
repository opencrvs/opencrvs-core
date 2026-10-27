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
  BucketLocationConstraint,
  CreateBucketCommand,
  DeleteBucketPolicyCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  NoSuchKey,
  NotFound,
  paginateListObjectsV2
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { env } from '@documents/s3/constants'
import { createS3Client } from '@documents/s3/sdk-client'
import { Readable } from 'stream'

/*
 * Everything the documents service asks of the object store goes through the
 * functions below, so handlers know nothing about the SDK or the store behind
 * it. What each store must support is listed in
 * docs/adr/0004-documents-speaks-plain-s3.md.
 */
const s3Client = createS3Client(env.S3_ENDPOINT)

/** The most keys a single `DeleteObjects` request may carry. */
const MAX_KEYS_PER_DELETE = 1000

/** How many of the keys that could not be deleted an error names. */
const MAX_FAILED_KEYS_REPORTED = 10

/** Stores other than AWS S3 may answer a bare 404, which the SDK names `UnknownError`. */
function isNotFound(error: unknown) {
  const status = (error as { $metadata?: { httpStatusCode?: number } })
    .$metadata?.httpStatusCode

  return (
    error instanceof NotFound || error instanceof NoSuchKey || status === 404
  )
}

export async function ensureDefaultBucket() {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }))
    return
  } catch (error) {
    if (!isNotFound(error)) {
      throw error
    }
  }

  try {
    await s3Client.send(
      new CreateBucketCommand({
        Bucket: env.S3_BUCKET,
        // S3 rejects a location constraint for us-east-1
        ...(env.S3_BUCKET_REGION !== 'us-east-1' && {
          CreateBucketConfiguration: {
            LocationConstraint: env.S3_BUCKET_REGION as BucketLocationConstraint
          }
        })
      })
    )
  } catch (error) {
    // Another replica of this service created it between our check and now
    if (!(error instanceof BucketAlreadyOwnedByYou)) {
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
    await s3Client.send(
      new DeleteBucketPolicyCommand({ Bucket: env.S3_BUCKET })
    )
  } catch (error) {
    // Nothing to remove, which is the state that we want. The SDK has no class
    // for this error, so it is known by its name.
    if ((error as { name?: string }).name !== 'NoSuchBucketPolicy') {
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
      new HeadObjectCommand({ Bucket: env.S3_BUCKET, Key: key })
    )

    return { metadata: head.Metadata ?? {} }
  } catch (error) {
    if (isNotFound(error)) {
      return null
    }

    throw error
  }
}

/**
 * @param options.metadata stored as user metadata. The SDK lowercases the names,
 * and of two that differ only in case, the later one wins.
 */
export async function putObject(
  key: string,
  body: Readable | Buffer,
  {
    contentType,
    metadata = {}
  }: { contentType?: string; metadata?: Record<string, string> } = {}
) {
  /*
   * An upload is a stream of unknown length, and a plain `PutObject` needs the
   * length up front. `Upload` streams it, as a multipart upload when it is large.
   */
  await new Upload({
    client: s3Client,
    params: {
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata
    }
  }).done()
}

export async function removeObject(key: string) {
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key })
  )
}

/**
 * Sends every batch even when an earlier one fails. The store cannot delete
 * keys as a single transaction, so a failure leaves the rest deleted.
 *
 * @throws once all batches are sent, when the store reports any key it could
 * not delete, so that a failed sweep is not mistaken for a successful one.
 */
export async function removeObjects(keys: string[]) {
  const failed: string[] = []

  for (let start = 0; start < keys.length; start += MAX_KEYS_PER_DELETE) {
    const { Errors = [] } = await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: env.S3_BUCKET,
        Delete: {
          Objects: keys
            .slice(start, start + MAX_KEYS_PER_DELETE)
            .map((Key) => ({ Key })),
          Quiet: true
        }
      })
    )

    failed.push(...Errors.map(({ Key, Code }) => `${Key} (${Code})`))
  }

  if (failed.length > 0) {
    throw new Error(
      `Failed to delete ${failed.length} object(s), the first of them: ${failed
        .slice(0, MAX_FAILED_KEYS_REPORTED)
        .join(', ')}`
    )
  }
}

/**
 * @returns the key of every object under the prefix, at any depth.
 */
export async function listObjectKeys(prefix: string) {
  const keys: string[] = []

  for await (const page of paginateListObjectsV2(
    { client: s3Client },
    { Bucket: env.S3_BUCKET, Prefix: prefix }
  )) {
    for (const object of page.Contents ?? []) {
      if (object.Key) {
        keys.push(object.Key)
      }
    }
  }

  return keys
}
