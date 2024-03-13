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

export async function defaultMinioBucketExists() {
  return minioClient.bucketExists(MINIO_BUCKET)
}

export async function createDefaultMinioBucket() {
  const policy = `
    {
        "Version": "2012-10-17",
        "Statement": [
            {
            "Action": [
                "s3:GetObject"
            ],
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                "*"
                ]
            },
            "Resource": [
                "arn:aws:s3:::${MINIO_BUCKET}/*"
            ],
            "Sid": ""
            }
        ]
    }
    `

  await minioClient.makeBucket(MINIO_BUCKET, MINIO_BUCKET_REGION)
  return minioClient.setBucketPolicy(MINIO_BUCKET, policy)
}
