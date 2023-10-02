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
  DEFAULT_MINIO_ACCESS_KEY,
  minioClient
  // eslint-disable-next-line import/no-relative-parent-imports
} from '../../utils/minio-helper.js'
import { Db, MongoClient } from 'mongodb'
const updatedPolicy = `
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::minio-user:${
          process.env.MINIO_ACCESS_KEY || DEFAULT_MINIO_ACCESS_KEY
        }"
      },
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::${MINIO_BUCKET}/*"
      ],
      "Sid": ""
    },
    {
      "Effect": "Deny",
      "Principal": {
        "AWS": "*"
      },
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::${MINIO_BUCKET}/*"
      ],
      "Sid": ""
    }
  ]
}`

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      if (await minioClient.bucketExists(MINIO_BUCKET)) {
        minioClient.setBucketPolicy(MINIO_BUCKET, updatedPolicy)
      }
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {}
