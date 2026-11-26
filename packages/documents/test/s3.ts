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
import { env } from '@documents/s3/constants'
import { createS3Client } from '@documents/s3/sdk-client'

/** Reads the store directly, so tests can check what the service stored. */
export const s3 = createS3Client(env.S3_ENDPOINT)

export async function getObject(key: string) {
  const object = await s3.send(
    new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key })
  )

  return {
    contentType: object.ContentType,
    metadata: object.Metadata ?? {},
    body: await object.Body!.transformToString()
  }
}
