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
 * Documents are only ever served through presigned URLs, so the bucket must not
 * grant anonymous access. An empty policy removes any existing one, which is
 * what we want: Minio denies unauthenticated requests when no policy grants
 * them, while presigned requests keep working.
 *
 * This runs on every startup rather than only when the bucket is created. The
 * bucket used to be created with a public-read policy and a separate migration
 * flipped it to private afterwards. When migrations were flattened for 2.0 that
 * migration disappeared, leaving fresh installs permanently world-readable.
 * Reconciling on boot keeps the guarantee in one place that cannot be dropped,
 * and repairs environments that were created without it.
 *
 * @see https://github.com/opencrvs/opencrvs-core/issues/13436
 */
export async function ensureDefaultMinioBucketIsPrivate() {
  return minioClient.setBucketPolicy(MINIO_BUCKET, '')
}
