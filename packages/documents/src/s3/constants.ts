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
import { S3_PROVIDER_PROFILES, parseS3Provider } from '@documents/s3/providers'

/**
 * Reads `S3_<name>` and falls back to `MINIO_<name>`, which every existing
 * deployment sets. The legacy name differs from the new one only for the public
 * URL, hence the second argument. An empty value counts as unset.
 */
function fromEnv(name: string, legacyName = name): string | undefined {
  return (
    process.env[`S3_${name}`] || process.env[`MINIO_${legacyName}`] || undefined
  )
}

export const S3_PROVIDER = parseS3Provider(process.env.S3_PROVIDER)
export const S3_PROVIDER_PROFILE = S3_PROVIDER_PROFILES[S3_PROVIDER]

/** Host where the object store runs and the documents service connects into */
export const S3_HOST = fromEnv('HOST') ?? 'localhost'
export const S3_PORT = Number(fromEnv('PORT') ?? 3535)
/** Whether the documents service reaches the store over TLS */
export const S3_USE_SSL = process.env.S3_USE_SSL === 'true'
/** Public facing store URL, host[:port], that presigned URLs are signed for */
export const S3_PUBLIC_URL = fromEnv('PUBLIC_URL', 'URL') ?? 'localhost:3535'
export const S3_PROTOCOL =
  fromEnv('PROTOCOL') ?? (PRODUCTION ? 'https:' : 'http:')

/**
 * Not aliased to an `S3_` name. The events migration that strips the bucket
 * from stored paths, the Helm chart and CI all read `MINIO_BUCKET`, and a
 * second name could make them disagree with this service.
 */
export const S3_BUCKET = process.env.MINIO_BUCKET || 'ocrvs'
export const S3_BUCKET_REGION =
  fromEnv('BUCKET_REGION') ?? S3_PROVIDER_PROFILE.defaultRegion
export const S3_ACCESS_KEY = fromEnv('ACCESS_KEY') ?? 'minioadmin'
export const S3_SECRET_KEY = fromEnv('SECRET_KEY') ?? 'minioadmin'

export const S3_PRESIGNED_URL_EXPIRY_IN_SECOND = PRODUCTION ? 3600 : 259200
