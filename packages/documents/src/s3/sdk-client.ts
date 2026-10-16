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
import { S3Client } from '@aws-sdk/client-s3'
import {
  S3_ACCESS_KEY,
  S3_BUCKET_REGION,
  S3_SECRET_KEY
} from '@documents/s3/constants'

/**
 * One place for the SDK options that every supported store needs, so the client
 * that talks to the store and the client that signs URLs for browsers cannot
 * drift apart.
 *
 * - Path-style addressing, because the public URL is `<host>/<bucket>/<key>`.
 * - Checksums only when the API requires them. Recent SDK versions add them to
 *   every request, and stores other than AWS S3 reject those headers.
 */
export function createS3Client(endpoint: string) {
  return new S3Client({
    endpoint,
    region: S3_BUCKET_REGION,
    credentials: {
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: S3_SECRET_KEY
    },
    forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED'
  })
}
