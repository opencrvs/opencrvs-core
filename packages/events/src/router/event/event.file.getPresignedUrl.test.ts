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
  ActionStatus,
  ActionType,
  DocumentPath,
  encodeScope,
  getUUID,
  TENNIS_CLUB_MEMBERSHIP
} from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'

const readTennisClub = encodeScope({
  type: 'record.read',
  options: { event: [TENNIS_CLUB_MEMBERSHIP] }
})

const presigned = { presignedURL: expect.any(String) }

function fileValue(path: string) {
  return {
    path: path as DocumentPath,
    originalFilename: 'image.png',
    type: 'image/png'
  }
}

/**
 * A record whose declaration names `events/{id}/{uuid}.png`, declared by
 * `user`, plus a second user who may only read records.
 */
async function setupDeclaredRecord() {
  const {
    user,
    users: [, otherUser],
    generator
  } = await setupTestCase()
  const client = createTestClient(user)
  const event = await client.event.create(generator.event.create())
  const filePath = `events/${event.id}/${getUUID()}.png` as DocumentPath

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id, {
      declaration: {
        ...generator.event.actions.declare(event.id).declaration,
        'applicant.image': fileValue(filePath)
      },
      keepAssignment: true
    })
  )

  return { user, otherUser, generator, event, filePath }
}

describe('event.file.getPresignedUrl (deprecated)', () => {
  test('presigns a file the record names, taking the record from the path', async () => {
    const { otherUser, filePath } = await setupDeclaredRecord()

    await expect(
      createTestClient(otherUser, [readTennisClub]).event.file.getPresignedUrl({
        filePath
      })
    ).resolves.toMatchObject(presigned)
  })

  test('presigns a file outside events/ the record names, given eventId', async () => {
    const { user, otherUser, event } = await setupDeclaredRecord()

    await expect(
      createTestClient(otherUser, [readTennisClub]).event.file.getPresignedUrl({
        filePath: user.signature,
        eventId: event.id
      })
    ).resolves.toMatchObject(presigned)
  })

  test("presigns a file in the caller's own draft", async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())
    const filePath = `events/${event.id}/${getUUID()}.png` as DocumentPath

    await client.event.draft.create({
      type: ActionType.DECLARE,
      declaration: {
        ...generator.event.actions.declare(event.id).declaration,
        'applicant.image': fileValue(filePath)
      },
      transactionId: getUUID(),
      eventId: event.id,
      status: ActionStatus.Requested
    })

    await expect(
      createTestClient(user, [readTennisClub]).event.file.getPresignedUrl({
        filePath
      })
    ).resolves.toMatchObject(presigned)
  })

  test('refuses a file the record does not name', async () => {
    const { otherUser, event } = await setupDeclaredRecord()

    await expect(
      createTestClient(otherUser, [readTennisClub]).event.file.getPresignedUrl({
        filePath: `events/${event.id}/${getUUID()}.png` as DocumentPath
      })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  test('refuses a file outside events/ without eventId', async () => {
    const { user, otherUser } = await setupDeclaredRecord()

    await expect(
      createTestClient(otherUser, [readTennisClub]).event.file.getPresignedUrl({
        filePath: user.signature
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  test('refuses a caller whose record.read is for another event type', async () => {
    const { otherUser, filePath } = await setupDeclaredRecord()

    await expect(
      createTestClient(otherUser, [
        encodeScope({ type: 'record.read', options: { event: ['birth'] } })
      ]).event.file.getPresignedUrl({ filePath })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  test('refuses a caller with no record.read at all', async () => {
    const { otherUser, filePath } = await setupDeclaredRecord()

    await expect(
      createTestClient(otherUser, []).event.file.getPresignedUrl({ filePath })
    ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
  })

  test.each([
    'some-other-folder/file.png',
    'events/not-a-uuid/file.png',
    `users/../events/${getUUID()}/${getUUID()}.png`
  ])('refuses a path that is not a valid key: %s', async (filePath) => {
    const { user } = await setupTestCase()

    await expect(
      createTestClient(user, [readTennisClub]).event.file.getPresignedUrl({
        filePath: filePath as DocumentPath
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })
})
