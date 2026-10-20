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
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  S3_BUCKET,
  S3_PRESIGNED_URL_EXPIRY_IN_SECOND,
  S3_PROTOCOL,
  S3_PUBLIC_URL
} from '@documents/s3/constants'
import { createS3Client } from '@documents/s3/sdk-client'

/*
 * The signature covers the host. A URL is only valid for the host it was signed
 * for, so this client points at the public address that browsers use and not at
 * the internal address that the documents service connects to.
 */
const presignClient = createS3Client(`${S3_PROTOCOL}//${S3_PUBLIC_URL}`)

/**
 * @param key the object's key within the bucket, never starting with `/`
 */
export function signFileUrl(key: string): Promise<string> {
  return getSignedUrl(
    presignClient,
    new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
    { expiresIn: S3_PRESIGNED_URL_EXPIRY_IN_SECOND }
  )
}
