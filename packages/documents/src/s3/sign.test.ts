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
  S3_BUCKET,
  S3_BUCKET_REGION,
  S3_PRESIGNED_URL_EXPIRY_IN_SECOND,
  S3_PUBLIC_URL
} from '@documents/s3/constants'
import { signFileUrl } from '@documents/s3/sign'

/*
 * Signing is local: it needs no store, only the credentials and the address
 * that browsers will use. So these tests run the real SDK.
 */
describe('signFileUrl', () => {
  it('signs a path-style URL for the public address', async () => {
    const url = new URL(await signFileUrl('events/e1/a.png'))

    expect(url.host).toBe(S3_PUBLIC_URL)
    expect(url.pathname).toBe(`/${S3_BUCKET}/events/e1/a.png`)
  })

  it('signs with SigV4, for the configured region, for the configured time', async () => {
    const { searchParams } = new URL(await signFileUrl('a.png'))

    expect(searchParams.get('X-Amz-Algorithm')).toBe('AWS4-HMAC-SHA256')
    expect(searchParams.get('X-Amz-Credential')).toContain(
      `/${S3_BUCKET_REGION}/s3/aws4_request`
    )
    expect(searchParams.get('X-Amz-Expires')).toBe(
      String(S3_PRESIGNED_URL_EXPIRY_IN_SECOND)
    )
    expect(searchParams.get('X-Amz-Signature')).toMatch(/^[0-9a-f]{64}$/)
  })

  it('adds no checksum parameter, which stores other than AWS S3 reject', async () => {
    const { searchParams } = new URL(await signFileUrl('a.png'))

    const names = [...searchParams.keys()].map((name) => name.toLowerCase())
    expect(names.filter((name) => name.includes('checksum'))).toEqual([])
  })

  it('encodes a key that needs it', async () => {
    const url = new URL(await signFileUrl('events/e1/my photo+1.png'))

    expect(url.pathname).toBe(`/${S3_BUCKET}/events/e1/my%20photo%2B1.png`)
  })

  it('signs a different URL for a different key', async () => {
    const first = new URL(await signFileUrl('a.png'))
    const second = new URL(await signFileUrl('b.png'))

    expect(first.searchParams.get('X-Amz-Signature')).not.toBe(
      second.searchParams.get('X-Amz-Signature')
    )
  })
})
