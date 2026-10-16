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
import {
  DEFAULT_S3_PROVIDER,
  S3_PROVIDERS,
  S3_PROVIDER_PROFILES,
  VERIFIED_S3_PROVIDERS,
  parseS3Provider
} from '@documents/s3/providers'

describe('parseS3Provider', () => {
  it('runs MinIO when no provider is set, as every existing deployment does', () => {
    expect(parseS3Provider(undefined)).toBe('minio')
    expect(parseS3Provider('')).toBe('minio')
    expect(DEFAULT_S3_PROVIDER).toBe('minio')
  })

  it.each(S3_PROVIDERS)('accepts the supported provider %s', (provider) => {
    expect(parseS3Provider(provider)).toBe(provider)
  })

  it('refuses a store that is not on the list and names the ones that are', () => {
    expect(() => parseS3Provider('ceph')).toThrow(
      'Unsupported S3_PROVIDER "ceph". Supported providers: minio, seaweedfs, rustfs, aws, gcs'
    )
  })

  it('is case sensitive, so a typo does not silently select a store', () => {
    expect(() => parseS3Provider('MinIO')).toThrow('Unsupported S3_PROVIDER')
  })
})

describe('S3_PROVIDER_PROFILES', () => {
  it('has a profile for every supported provider and for no other', () => {
    expect(Object.keys(S3_PROVIDER_PROFILES).sort()).toEqual(
      [...S3_PROVIDERS].sort()
    )
  })

  it('lists only supported providers as verified, and the default is one of them', () => {
    for (const provider of VERIFIED_S3_PROVIDERS) {
      expect(S3_PROVIDERS).toContain(provider)
    }
    expect(VERIFIED_S3_PROVIDERS).toContain(DEFAULT_S3_PROVIDER)
  })

  it('keeps at least one open source, self-hostable store verified', () => {
    // AWS S3 and Google Cloud Storage are closed services, see ADR 0004
    const selfHosted = ['minio', 'seaweedfs', 'rustfs']

    expect(
      VERIFIED_S3_PROVIDERS.filter((provider) => selfHosted.includes(provider))
    ).not.toEqual([])
  })

  it('keeps the settings that MinIO deployments run with today', () => {
    expect(S3_PROVIDER_PROFILES.minio).toEqual({
      defaultRegion: 'local',
      sendLocationConstraint: true,
      privateBucketStrategy: 'delete-policy',
      batchDelete: 'native'
    })
  })
})
