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
import { PRODUCTION } from '@documents/constants'

/** Host where the object store runs and the documents service connects into */
export const S3_HOST = process.env.S3_HOST || 'localhost'
export const S3_PORT = Number(process.env.S3_PORT || 3535)
/** Whether the documents service reaches the store over TLS */
export const S3_USE_SSL = process.env.S3_USE_SSL === 'true'
/** Public facing store URL, host[:port], that presigned URLs are signed for */
export const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL || 'localhost:3535'
export const S3_PROTOCOL =
  process.env.S3_PROTOCOL || (PRODUCTION ? 'https:' : 'http:')

/**
 * Also read by the events migration that strips the bucket from stored paths,
 * so the two must be given the same value.
 */
export const S3_BUCKET = process.env.S3_BUCKET || 'ocrvs'
export const S3_BUCKET_REGION = process.env.S3_BUCKET_REGION || 'local'
export const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || 'minioadmin'
export const S3_SECRET_KEY = process.env.S3_SECRET_KEY || 'minioadmin'

export const S3_PRESIGNED_URL_EXPIRY_IN_SECOND = PRODUCTION ? 3600 : 259200
