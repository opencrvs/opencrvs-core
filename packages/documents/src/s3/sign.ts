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
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  env,
  S3_PRESIGNED_UPLOAD_URL_EXPIRY_IN_SECOND,
  S3_PRESIGNED_URL_EXPIRY_IN_SECOND
} from '@documents/s3/constants'
import { createS3Client } from '@documents/s3/sdk-client'

/*
 * The signature covers the host. A URL is only valid for the host it was signed
 * for, so this client points at the public address that browsers use and not at
 * the internal address that the documents service connects to.
 */
const presignClient = createS3Client(env.S3_PUBLIC_ENDPOINT)

/**
 * @param key the object's key within the bucket, never starting with `/`
 */
export function signFileUrl(key: string): Promise<string> {
  return getSignedUrl(
    presignClient,
    new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
    { expiresIn: S3_PRESIGNED_URL_EXPIRY_IN_SECOND }
  )
}

const CREATED_BY_HEADER = 'x-amz-meta-created-by'

/**
 * Signs a URL that lets a browser put one file at `key`.
 *
 * The signature covers the content type, the content length and the
 * `created-by` metadata. The store refuses a request that sends other values,
 * so the browser can not upload a larger file, a different type of file or a
 * file in the name of a different user.
 *
 * @returns the URL and the headers that the browser must send with the file.
 * The browser sets `Content-Length` from the body itself.
 */
export async function signUploadUrl({
  key,
  contentType,
  contentLength,
  createdBy
}: {
  key: string
  contentType: string
  contentLength: number
  createdBy: string
}) {
  const url = await getSignedUrl(
    presignClient,
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
      ContentLength: contentLength,
      Metadata: { 'created-by': createdBy }
    }),
    {
      expiresIn: S3_PRESIGNED_UPLOAD_URL_EXPIRY_IN_SECOND,
      // The presigner does not sign the content type unless it is told to
      signableHeaders: new Set(['content-type', 'content-length']),
      // Keep the metadata a signed header, not a query parameter of the URL
      unhoistableHeaders: new Set([CREATED_BY_HEADER])
    }
  )

  return {
    url,
    headers: { 'Content-Type': contentType, [CREATED_BY_HEADER]: createdBy }
  }
}
