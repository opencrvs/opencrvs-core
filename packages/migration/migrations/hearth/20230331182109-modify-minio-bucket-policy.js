/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as Minio from 'minio'
import {
  MINIO_BUCKET,
  MINIO_HOST,
  MINIO_PORT,
  DEFAULT_MINIO_ACCESS_KEY,
  minioClient
  // eslint-disable-next-line import/no-relative-parent-imports
} from '../../utils/minio-helper.js'

const updatedPolicy = `
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::minio-user:${DEFAULT_MINIO_ACCESS_KEY}"
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

export const up = async (db, client) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      if (minioClient.bucketExists(MINIO_BUCKET)) {
        minioClient.setBucketPolicy(MINIO_BUCKET, updatedPolicy)
      }
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db, client) => {}
