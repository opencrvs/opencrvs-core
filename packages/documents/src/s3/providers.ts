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

/**
 * The object stores the documents service supports. The list is closed on
 * purpose: stores differ in which parts of the S3 API they implement, and a
 * store is only listed once it passes the conformance suite in
 * `test/s3-conformance`. See `docs/adr/0004-documents-speaks-plain-s3.md`.
 */
export const S3_PROVIDERS = [
  'minio',
  'seaweedfs',
  'rustfs',
  'aws',
  'gcs'
] as const

export type S3Provider = (typeof S3_PROVIDERS)[number]

/**
 * What differs between the supported stores. Everything else is plain S3 and
 * is identical for all of them, so handlers never branch on the provider.
 */
export type S3ProviderProfile = {
  /** Region used when `S3_BUCKET_REGION` is not set. */
  defaultRegion: string
  /**
   * Whether `CreateBucket` carries the region as its `LocationConstraint`.
   * It is never sent for `us-east-1`, which S3 rejects.
   */
  sendLocationConstraint: boolean
  /**
   * How the bucket is kept free of anonymous access. `delete-policy` removes
   * the bucket policy at each start. `skip` leaves it to the store, where
   * access is governed by Block Public Access or IAM and `DeleteBucketPolicy`
   * may be refused.
   */
  privateBucketStrategy: 'delete-policy' | 'skip'
  /**
   * `native` uses `DeleteObjects`. `per-key` deletes one object at a time, for
   * a store that does not implement the batch call.
   */
  batchDelete: 'native' | 'per-key'
}

/*
 * The conformance suite is what decides these values, so a failing check there
 * changes a profile, or drops the provider. Those of `minio`, `seaweedfs` and
 * `rustfs` are results: the suite passed against each as written. Those of
 * `aws` and `gcs` are still expectations, see VERIFIED_S3_PROVIDERS.
 */
export const S3_PROVIDER_PROFILES: Record<S3Provider, S3ProviderProfile> = {
  minio: {
    defaultRegion: 'local',
    sendLocationConstraint: true,
    privateBucketStrategy: 'delete-policy',
    batchDelete: 'native'
  },
  seaweedfs: {
    defaultRegion: 'us-east-1',
    sendLocationConstraint: true,
    privateBucketStrategy: 'delete-policy',
    batchDelete: 'native'
  },
  rustfs: {
    defaultRegion: 'us-east-1',
    sendLocationConstraint: true,
    privateBucketStrategy: 'delete-policy',
    batchDelete: 'native'
  },
  aws: {
    defaultRegion: 'us-east-1',
    sendLocationConstraint: true,
    privateBucketStrategy: 'skip',
    batchDelete: 'native'
  },
  gcs: {
    defaultRegion: 'auto',
    sendLocationConstraint: false,
    privateBucketStrategy: 'skip',
    batchDelete: 'native'
  }
}

/**
 * The providers whose profile has been checked by running the conformance suite
 * against the real store. Add a provider here only after the suite passed, and
 * record the date in `packages/documents/README.md`. The service starts with
 * any other provider but says so, because its profile is still an expectation.
 */
export const VERIFIED_S3_PROVIDERS: readonly S3Provider[] = [
  'minio',
  'seaweedfs',
  'rustfs'
]

/** Existing deployments set no provider and have always run MinIO. */
export const DEFAULT_S3_PROVIDER: S3Provider = 'minio'

function isS3Provider(value: string): value is S3Provider {
  return (S3_PROVIDERS as readonly string[]).includes(value)
}

/**
 * @throws when the value names a store the service does not support, so a
 * misconfigured deployment fails at start instead of at the first upload.
 */
export function parseS3Provider(value: string | undefined): S3Provider {
  if (!value) {
    return DEFAULT_S3_PROVIDER
  }

  if (!isS3Provider(value)) {
    throw new Error(
      `Unsupported S3_PROVIDER "${value}". Supported providers: ${S3_PROVIDERS.join(', ')}`
    )
  }

  return value
}
