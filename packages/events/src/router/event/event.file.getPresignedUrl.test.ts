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
import { TRPCError } from '@trpc/server'
import {
  DocumentPath,
  encodeScope,
  generateUuid,
  TENNIS_CLUB_MEMBERSHIP
} from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'

describe('event.file.getPresignedUrl', () => {
  test('presigns a file under events/{eventId}/... when the caller has record.read on that event', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, [
      encodeScope({
        type: 'record.create',
        options: { event: [TENNIS_CLUB_MEMBERSHIP] }
      }),
      encodeScope({
        type: 'record.read',
        options: { event: [TENNIS_CLUB_MEMBERSHIP] }
      })
    ])
    const event = await client.event.create(generator.event.create())

    await expect(
      client.event.file.getPresignedUrl({
        filePath: `events/${event.id}/${generateUuid()}.png` as DocumentPath
      })
    ).resolves.toMatchObject({ presignedURL: expect.any(String) })
  })

  test('rejects a file under events/{eventId}/... when the caller lacks record.read on that event', async () => {
    const { user, generator } = await setupTestCase()
    const creator = createTestClient(user, [
      encodeScope({
        type: 'record.create',
        options: { event: [TENNIS_CLUB_MEMBERSHIP] }
      })
    ])
    const event = await creator.event.create(generator.event.create())

    const reader = createTestClient(user, [
      encodeScope({ type: 'record.read', options: { event: ['birth'] } })
    ])

    await expect(
      reader.event.file.getPresignedUrl({
        filePath: `events/${event.id}/${generateUuid()}.png` as DocumentPath
      })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  test('prevents access if the caller has no record.read scope at all', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [])

    await expect(
      client.event.file.getPresignedUrl({
        filePath:
          `events/${generateUuid()}/${generateUuid()}.png` as DocumentPath
      })
    ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
  })

  test('rejects an events/ path with a malformed event id', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [])

    await expect(
      client.event.file.getPresignedUrl({
        filePath: 'events/not-a-uuid/file.png' as DocumentPath
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  test('presigns a users/{userId}/... path without requiring any record scope', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [])

    await expect(
      client.event.file.getPresignedUrl({
        filePath: `users/${user.id}/avatar.png` as DocumentPath
      })
    ).resolves.toMatchObject({ presignedURL: expect.any(String) })
  })

  test('presigns a bare {uuid}.ext legacy path without requiring any record scope', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [])

    await expect(
      client.event.file.getPresignedUrl({
        filePath: `${generateUuid()}.png` as DocumentPath
      })
    ).resolves.toMatchObject({ presignedURL: expect.any(String) })
  })

  test('rejects an unrecognized file path shape', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [])

    await expect(
      client.event.file.getPresignedUrl({
        filePath: 'some-other-folder/file.png' as DocumentPath
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })
})
