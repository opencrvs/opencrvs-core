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
import { CLIENT_URL, CREDENTIALS } from '@e2e/support/constants'
import { getToken } from '@e2e/support/helpers'

/*
 * The storage bucket must not give anonymous read access. Users get documents
 * only through presigned URLs. Before, the code created the bucket with public
 * read access, and a migration made the bucket private. That migration was lost
 * when the migrations were made flat for 2.0. New installations stayed public.
 * Feature environments are always new installations. This test finds that
 * fault.
 *
 * @see https://github.com/opencrvs/opencrvs-core/issues/13436
 */
test.describe('Document storage', () => {
  /*
   * Minio does not check that the object exists when it signs a URL. Any key is
   * sufficient to test the bucket policy. An upload is not necessary.
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
     * The bucket policy accepts a signed request. The key does not exist, and
     * Minio thus answers 404. It does not refuse the request. This is the
     * positive control. It shows that the request came to Minio, and that the
     * signature is correct. The check below cannot pass only because the host
     * does not answer.
     */
    const signed = await fetch(presignedURL)
    expect(signed.status).toBe(404)

    /*
     * Minio must refuse the same object when the URL has no signature. A 404
     * here shows that the bucket gives anonymous s3:GetObject. Then all persons
     * who see a document URL can read that document while the object exists.
     */
    const unsigned = await fetch(unsignedURL)
    expect(unsigned.status).toBe(403)
  })
})
