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
import { getUploadPath, presignFiles } from '@events/service/files'

const eventId = '105b69b3-415f-4e53-b912-ef71484cb6c0' as UUID

describe('getUploadPath', () => {
  test('derives the key from the event id', () => {
    expect(
      getUploadPath({
        file: new File([''], 'proof.png'),
        transactionId: 'transaction-1',
        eventId
      })
    ).toBe(`events/${eventId}/`)
  })

  test('prefers the event id over a path the caller chose', () => {
    expect(
      getUploadPath({
        file: new File([''], 'proof.png'),
        transactionId: 'transaction-1',
        eventId,
        path: 'somewhere/else/'
      })
    ).toBe(`events/${eventId}/`)
  })

  test('still accepts a deprecated caller-chosen path', () => {
    expect(
      getUploadPath({
        file: new File([''], 'avatar.png'),
        transactionId: 'transaction-1',
        path: 'users/abc/'
      })
    ).toBe('users/abc/')
  })

  test('refuses an upload that names neither an event nor a path', () => {
    expect(() =>
      getUploadPath({
        file: new File([''], 'loose.png'),
        transactionId: 'transaction-1'
      })
    ).toThrow(/eventId or path/)
  })
})

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
    for (const path of paths) {
      expect(urls[path]).toContain(`/ocrvs/${path}?`)
    }
  })

  test('returns nothing without asking documents-service for no paths', async () => {
    await expect(presignFiles([], token)).resolves.toEqual({})
  })
})
