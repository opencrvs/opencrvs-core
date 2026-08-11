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
import { expect, test } from '@playwright/test'
import { CLIENT_URL, CREDENTIALS } from '../../constants'
import { getToken } from '../../helpers'

/*
 * Documents are only ever served through presigned URLs, so the storage bucket
 * must not grant anonymous reads. The bucket used to be created world-readable
 * with a separate migration making it private afterwards; when migrations were
 * flattened for 2.0 that migration disappeared, and fresh installs were left
 * permanently public. Feature environments are created fresh, so this is the
 * scenario that regressed.
 *
 * @see https://github.com/opencrvs/opencrvs-core/issues/13436
 */
test.describe('Document storage', () => {
  /*
   * Presigning does not check that the object exists, so an arbitrary key is
   * enough to probe the bucket policy without uploading anything first.
   */
  const objectPath = 'events/00000000-0000-4000-8000-000000000000/probe.png'

  test('refuses anonymous reads but honours presigned ones', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)

    const response = await fetch(
      `${CLIENT_URL}/api/presigned-url/${objectPath}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    expect(response.status).toBe(200)

    const { presignedURL } = await response.json()
    const unsignedURL = new URL(presignedURL)
    unsignedURL.search = ''

    /*
     * A signed request is allowed past the bucket policy, so the missing key
     * answers 404 rather than being refused outright. This is the positive
     * control: it proves the request reached Minio and that signing works, so
     * the assertion below cannot pass merely because the host is unreachable.
     */
    const signed = await fetch(presignedURL)
    expect(signed.status).toBe(404)

    /*
     * The same object without its signature must be refused. A 404 here would
     * mean anonymous s3:GetObject is granted, making every document URL
     * readable by anyone who ever sees it, for as long as the object exists.
     */
    const unsigned = await fetch(unsignedURL)
    expect(unsigned.status).toBe(403)
  })
})
