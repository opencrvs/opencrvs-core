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
import { presignFile } from '@events/service/files'

const eventId = '105b69b3-415f-4e53-b912-ef71484cb6c0' as UUID

describe('presignFile', () => {
  const token = 'Bearer test-token'

  test.each([
    `events/${eventId}/proof.png`,
    `users/${eventId}/signature.png`,
    `${eventId}.png`
  ])('presigns the canonical path %s', async (path) => {
    await expect(
      presignFile(path as DocumentPath, token)
    ).resolves.toMatchObject({ presignedURL: expect.any(String) })
  })

  test.each([
    `users/../events/${eventId}/proof.png`,
    `users/%2e%2e/events/${eventId}/proof.png`,
    `events/${eventId}/./proof.png`
  ])(
    'refuses %s, which the URL would resolve to a different key',
    async (path) => {
      await expect(presignFile(path as DocumentPath, token)).rejects.toThrow(
        `Refusing to presign a non-canonical path: ${path}`
      )
    }
  )
})
