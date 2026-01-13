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

import { z } from 'zod'
import { extendZodWithOpenApi } from 'zod-openapi'
extendZodWithOpenApi(z)

export const MINIO_REGEX =
  /^https?:\/\/[^\/]+(.*)?\/[^\/?]+\.(jpg|png|jpeg|pdf|svg)(\?.*)?$/i

export function isBase64FileString(str: string) {
  if (str === '' || str.trim() === '') {
    return false
  }
  const strSplit = str.split(':')
  return strSplit.length > 0 && strSplit[0] === 'data'
}

export const isMinioUrl = (url: string): url is FullDocumentUrl =>
  MINIO_REGEX.test(url)

export const FullDocumentUrl = z
  .string()
  .brand('FullDocumentUrl')
  .describe(
    'A full url with protocol, host, bucket name, starting from the root of the S3 server, https://minio.opencrvs.com/bucket-name/document-id.jpg'
  )

export type FullDocumentUrl = z.infer<typeof FullDocumentUrl>

export const FullDocumentPath = z
  .string()
  .transform((val) => (val.startsWith('/') ? val : `/${val}`))
  .openapi({ effectType: 'input', type: 'string' })
  .describe(
    'A full absolute path with bucket name, starting from the root of the S3 server, /bucket-name/document-id.jpg'
  )

export type FullDocumentPath = z.infer<typeof FullDocumentPath>

export const DocumentPath = z
  .string()
  .brand('DocumentPath')
  .describe(
    'A full identifier starting from the root of the S3 bucket, e.g. /document-id.jpg or /directory/document-id.jpg but never /bucket-name/document-id.jpg'
  )

export type DocumentPath = z.infer<typeof DocumentPath>

export const toDocumentPath = (path: FullDocumentPath): DocumentPath => {
  return path.split('/').slice(2).join('/') as DocumentPath
}
