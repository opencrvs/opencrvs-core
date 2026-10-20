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
import { cleanEnv, makeValidator, str } from 'envalid'
import { PRODUCTION } from '@documents/constants'

// An empty variable counts as unset, which is what a templated Helm chart or
// Compose file leaves behind
const set = Object.fromEntries(
  Object.entries(process.env).filter(([, value]) => value !== '')
)

/**
 * `url()` accepts `minio:3535`, as a URL with the protocol `minio:`, which is
 * what a host and a port from before this setting look like.
 */
const endpoint = makeValidator((input: string) => {
  let protocol = ''
  try {
    protocol = new URL(input).protocol
  } catch {
    // Not a URL at all, rejected below with the same message
  }

  if (protocol !== 'http:' && protocol !== 'https:') {
    throw new Error(
      `Invalid endpoint input: "${input}", expected http(s)://...`
    )
  }

  return input
})

/**
 * Define URLs without trailing slashes, include the protocol.
 */
const env = cleanEnv(set, {
  /** Where the documents service connects to the object store */
  S3_ENDPOINT: endpoint({ default: 'http://localhost:3535' }),
  /**
   * Where browsers connect to the object store, and what presigned URLs are
   * signed for. Defaults to S3_ENDPOINT, for a store that has the same address
   * inside and outside.
   */
  S3_PUBLIC_ENDPOINT: endpoint({ default: undefined }),
  /**
   * Also read by the events migration that strips the bucket from stored paths,
   * so the two must be given the same value.
   */
  S3_BUCKET: str({ default: 'ocrvs' }),
  S3_BUCKET_REGION: str({ default: 'local' }),
  S3_ACCESS_KEY: str({ default: 'minioadmin' }),
  S3_SECRET_KEY: str({ default: 'minioadmin' })
})

export const S3_ENDPOINT = env.S3_ENDPOINT
export const S3_PUBLIC_ENDPOINT = env.S3_PUBLIC_ENDPOINT ?? env.S3_ENDPOINT
export const S3_BUCKET = env.S3_BUCKET
export const S3_BUCKET_REGION = env.S3_BUCKET_REGION
export const S3_ACCESS_KEY = env.S3_ACCESS_KEY
export const S3_SECRET_KEY = env.S3_SECRET_KEY

export const S3_PRESIGNED_URL_EXPIRY_IN_SECOND = PRODUCTION ? 3600 : 259200
