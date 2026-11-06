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
  TENNIS_CLUB_MEMBERSHIP,
  TokenUserType,
  UUID
} from '@opencrvs/commons'
import {
  createSystemTestClient,
  createTestClient,
  setupTestCase,
  TEST_SYSTEM_ID
} from '@events/tests/utils'
import { buildAction } from '@events/service/events/events'
import * as eventsRepo from '@events/storage/postgres/events/events'

const readTennisClub = encodeScope({
  type: 'record.read',
  options: { event: [TENNIS_CLUB_MEMBERSHIP] }
})

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

/**
 * Stores an action naming `path` directly, the way records written before
 * attachment prefixes existed (or with bad data) look in the database.
 */
async function storeLegacyAction(
  eventId: UUID,
  path: string,
  user: { id: string; role: string; primaryOfficeId: UUID }
) {
  await eventsRepo.createAction(
    buildAction(
      {
        type: ActionType.NOTIFY,
        eventId,
        transactionId: getUUID(),
        declaration: { 'applicant.image': fileValue(path) },
        waitFor: true
      },
      ActionStatus.Accepted,
      {
        ...user,
        type: TokenUserType.enum.user,
        signature: undefined
      } as Parameters<typeof buildAction>[2]
    )
  )
}

describe('event.files.presign', () => {
  test('returns a URL for each file the record names, keyed by path', async () => {
    const { otherUser, event, filePath } = await setupDeclaredRecord()

    const urls = await createTestClient(otherUser, [
      readTennisClub
    ]).event.files.presign({ eventId: event.id })

    expect(urls).toMatchObject({ [filePath]: expect.any(String) })
  })

  test('includes the signature on an action, without user.read on its author', async () => {
    const { user, otherUser, event } = await setupDeclaredRecord()

    const urls = await createTestClient(otherUser, [
      readTennisClub
    ]).event.files.presign({ eventId: event.id })

    expect(urls).toMatchObject({ [user.signature]: expect.any(String) })
  })

  test('includes a pre-2.0 key the record names', async () => {
    const { user, otherUser, event } = await setupDeclaredRecord()
    const legacyPath = `${getUUID()}.png`
    await storeLegacyAction(event.id, legacyPath, user)

    const urls = await createTestClient(otherUser, [
      readTennisClub
    ]).event.files.presign({ eventId: event.id })

    expect(urls).toMatchObject({ [legacyPath]: expect.any(String) })
  })

  test('leaves out a stored path that is not a valid key', async () => {
    const { user, otherUser, event } = await setupDeclaredRecord()
    const traversal = `users/../events/${getUUID()}/${getUUID()}.png`
    await storeLegacyAction(event.id, traversal, user)

    const urls = await createTestClient(otherUser, [
      readTennisClub
    ]).event.files.presign({ eventId: event.id })

    expect(urls).not.toHaveProperty([traversal])
  })

  test("never includes another record's files", async () => {
    const { otherUser, event } = await setupDeclaredRecord()
    const { filePath: otherRecordFile } = await setupDeclaredRecord()

    const urls = await createTestClient(otherUser, [
      readTennisClub
    ]).event.files.presign({ eventId: event.id })

    expect(urls).not.toHaveProperty([otherRecordFile])
  })

  test('works for a system client with record.read', async () => {
    const { event, filePath } = await setupDeclaredRecord()

    const urls = await createSystemTestClient(TEST_SYSTEM_ID, [
      readTennisClub
    ]).event.files.presign({ eventId: event.id })

    expect(urls).toMatchObject({ [filePath]: expect.any(String) })
  })

  describe('drafts', () => {
    async function setupDraftWithFile() {
      const {
        user,
        users: [, otherUser],
        generator
      } = await setupTestCase()
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

      return { user, otherUser, event, filePath }
    }

    test("includes a file in the caller's own draft", async () => {
      const { user, event, filePath } = await setupDraftWithFile()

      const urls = await createTestClient(user, [
        readTennisClub
      ]).event.files.presign({ eventId: event.id })

      expect(urls).toMatchObject({ [filePath]: expect.any(String) })
    })

    test("leaves out a file in another user's draft", async () => {
      const { otherUser, event, filePath } = await setupDraftWithFile()

      const urls = await createTestClient(otherUser, [
        readTennisClub
      ]).event.files.presign({ eventId: event.id })

      expect(urls).not.toHaveProperty([filePath])
    })
  })

  test('refuses a caller whose record.read is for another event type', async () => {
    const { otherUser, event } = await setupDeclaredRecord()

    await expect(
      createTestClient(otherUser, [
        encodeScope({ type: 'record.read', options: { event: ['birth'] } })
      ]).event.files.presign({ eventId: event.id })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  test('refuses a caller with no record.read at all', async () => {
    const { otherUser, event } = await setupDeclaredRecord()

    await expect(
      createTestClient(otherUser, []).event.files.presign({
        eventId: event.id
      })
    ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
  })
})
