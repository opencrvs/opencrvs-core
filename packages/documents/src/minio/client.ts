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
  MINIO_BUCKET,
  MINIO_BUCKET_REGION,
  MINIO_HOST,
  MINIO_PORT,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY
} from '@documents/minio/constants'
import * as Minio from 'minio'

export const minioClient = new Minio.Client({
  endPoint: MINIO_HOST,
  port: Number(MINIO_PORT),
  useSSL: false,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY
})

export async function ensureDefaultMinioBucket() {
  if (await minioClient.bucketExists(MINIO_BUCKET)) {
    return
  }

  await minioClient.makeBucket(MINIO_BUCKET, MINIO_BUCKET_REGION)
}

/**
 * The bucket must not give anonymous access. Users get documents only through
 * presigned URLs. An empty policy removes the policy from the bucket. Minio
 * then refuses requests that have no signature, but presigned requests continue
 * to work.
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
export async function ensureDefaultMinioBucketIsPrivate() {
  return minioClient.setBucketPolicy(MINIO_BUCKET, '')
}
