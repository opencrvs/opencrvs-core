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
import { DocumentPath, UUID } from '@opencrvs/commons'
import { presignFiles } from '@events/service/files'

const eventId = '105b69b3-415f-4e53-b912-ef71484cb6c0' as UUID

describe('presignFiles', () => {
  const token = 'Bearer test-token'

  test('keys each URL by the path it signs', async () => {
    const paths = [
      `events/${eventId}/proof.png`,
      `users/${eventId}/signature.png`,
      `${eventId}.png`
    ] as DocumentPath[]

    const urls = await presignFiles(paths, token)

    expect(Object.keys(urls)).toEqual(paths)
    // The documents mock (tests/msw.ts) signs each path under the `ocrvs` bucket
    for (const path of paths) {
      expect(urls[path]).toContain(`/ocrvs/${path}?`)
    }
  })

  test('returns nothing without asking documents-service for no paths', async () => {
    await expect(presignFiles([], token)).resolves.toEqual({})
  })
})
