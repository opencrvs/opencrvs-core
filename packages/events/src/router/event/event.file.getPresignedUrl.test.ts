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
  getUUID,
  encodeScope,
  generateUuid,
  TENNIS_CLUB_MEMBERSHIP,
  UUID
} from '@opencrvs/commons'
import {
  createEvent,
  createSystemTestClient,
  createTestClient,
  setupTestCase,
  TEST_SYSTEM_ID
} from '@events/tests/utils'
import { updateUserById } from '@events/storage/postgres/events/users'

const readTennisClub = encodeScope({
  type: 'record.read',
  options: { event: [TENNIS_CLUB_MEMBERSHIP] }
})

const presigned = { presignedURL: expect.any(String) }

// The file path generated for every FILE field in test declarations
const DECLARED_FILE = '4f095fc4-4312-4de2-aa38-86dcc0f71044.png' as DocumentPath

describe('event.file.getPresignedUrl', () => {
  test('presigns an events/ file the record declares, with record.read', async () => {
    const {
      user,
      users: [, otherUser],
      generator
    } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())
    const filePath = `events/${event.id}/${generateUuid()}.png` as DocumentPath

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, {
        declaration: {
          ...generator.event.actions.declare(event.id).declaration,
          'applicant.image': {
            path: filePath,
            originalFilename: 'image.png',
            type: 'image/png'
          }
        },
        keepAssignment: true
      })
    )

    await expect(
      createTestClient(otherUser, [readTennisClub]).event.file.getPresignedUrl({
        filePath
      })
    ).resolves.toMatchObject(presigned)
  })

  test('rejects an events/ file the record does not reference', async () => {
    const { user, generator } = await setupTestCase()
    const event = await createTestClient(user).event.create(
      generator.event.create()
    )

    await expect(
      createTestClient(user, [readTennisClub]).event.file.getPresignedUrl({
        filePath: `events/${event.id}/${generateUuid()}.png` as DocumentPath
      })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  describe('events/ files in drafts', () => {
    async function createDraftWithFile() {
      const {
        user,
        users: [, otherUser],
        generator
      } = await setupTestCase()
      const client = createTestClient(user)
      const event = await client.event.create(generator.event.create())
      const filePath =
        `events/${event.id}/${generateUuid()}.png` as DocumentPath

      await client.event.draft.create({
        type: ActionType.DECLARE,
        declaration: {
          ...generator.event.actions.declare(event.id).declaration,
          'applicant.image': {
            path: filePath,
            originalFilename: 'image.png',
            type: 'image/png'
          }
        },
        transactionId: getUUID(),
        eventId: event.id,
        status: ActionStatus.Requested
      })

      return { user, otherUser, filePath }
    }

    test("presigns a file in the caller's own draft", async () => {
      const { user, filePath } = await createDraftWithFile()

      await expect(
        createTestClient(user, [readTennisClub]).event.file.getPresignedUrl({
          filePath
        })
      ).resolves.toMatchObject(presigned)
    })

    test("rejects a file in another user's draft", async () => {
      const { otherUser, filePath } = await createDraftWithFile()

      await expect(
        createTestClient(otherUser, [
          readTennisClub
        ]).event.file.getPresignedUrl({ filePath })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })
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

    const otherUserClient = createTestClient(user, [
      encodeScope({ type: 'record.read', options: { event: ['birth'] } })
    ])

    await expect(
      otherUserClient.event.file.getPresignedUrl({
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

  test('rejects an unrecognized file path shape', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [])

    await expect(
      client.event.file.getPresignedUrl({
        filePath: 'some-other-folder/file.png' as DocumentPath
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  test.each([
    (id: string) => `users/../events/${id}/${generateUuid()}.png`,
    (id: string) => `events/${generateUuid()}/../${id}/${generateUuid()}.png`,
    (id: string) => `users/%2e%2e/events/${id}/${generateUuid()}.png`
  ])('rejects a path that resolves to another key (%#)', async (toPath) => {
    const { user } = await setupTestCase()
    const client = createTestClient(user, [])

    await expect(
      client.event.file.getPresignedUrl({
        filePath: toPath(generateUuid()) as DocumentPath
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  describe('user files', () => {
    test("presigns the caller's own signature", async () => {
      const { user } = await setupTestCase()
      const signature = `users/${user.id}/${generateUuid()}.png`
      await updateUserById(user.id as UUID, { signaturePath: signature })

      await expect(
        createTestClient(user, []).event.file.getPresignedUrl({
          filePath: signature as DocumentPath
        })
      ).resolves.toMatchObject(presigned)
    })

    test("presigns another user's avatar without any scope", async () => {
      const {
        user,
        users: [, otherUser]
      } = await setupTestCase()
      const avatar = `users/${otherUser.id}/${generateUuid()}.jpg`
      await updateUserById(otherUser.id as UUID, { profileImagePath: avatar })

      await expect(
        createTestClient(user, []).event.file.getPresignedUrl({
          filePath: avatar as DocumentPath
        })
      ).resolves.toMatchObject(presigned)
    })

    test("presigns a migrated user's bare avatar without any scope", async () => {
      const {
        user,
        users: [, otherUser]
      } = await setupTestCase()
      const avatar = `${generateUuid()}.jpg`
      await updateUserById(otherUser.id as UUID, { profileImagePath: avatar })

      await expect(
        createTestClient(user, []).event.file.getPresignedUrl({
          filePath: avatar as DocumentPath
        })
      ).resolves.toMatchObject(presigned)
    })

    test("rejects another user's signature without user.read", async () => {
      const {
        user,
        users: [, otherUser]
      } = await setupTestCase()
      const signature = `users/${otherUser.id}/${generateUuid()}.png`
      await updateUserById(otherUser.id as UUID, { signaturePath: signature })

      await expect(
        createTestClient(user, []).event.file.getPresignedUrl({
          filePath: signature as DocumentPath
        })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    test("presigns another user's signature with user.read", async () => {
      const {
        user,
        users: [, otherUser]
      } = await setupTestCase()
      const signature = `users/${otherUser.id}/${generateUuid()}.png`
      await updateUserById(otherUser.id as UUID, { signaturePath: signature })

      await expect(
        createTestClient(user, [
          encodeScope({ type: 'user.read' })
        ]).event.file.getPresignedUrl({ filePath: signature as DocumentPath })
      ).resolves.toMatchObject(presigned)
    })

    test("rejects a user's avatar for a system client", async () => {
      const {
        users: [, otherUser]
      } = await setupTestCase()
      const avatar = `users/${otherUser.id}/${generateUuid()}.jpg`
      await updateUserById(otherUser.id as UUID, { profileImagePath: avatar })

      await expect(
        createSystemTestClient(TEST_SYSTEM_ID, [
          readTennisClub
        ]).event.file.getPresignedUrl({ filePath: avatar as DocumentPath })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    test('rejects a users/ path no user owns', async () => {
      const { user } = await setupTestCase()

      await expect(
        createTestClient(user, []).event.file.getPresignedUrl({
          filePath: `users/${user.id}/${generateUuid()}.png` as DocumentPath
        })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })
  })

  describe('files referenced by a record (eventId)', () => {
    test("presigns the creator's signature via eventId, without user.read", async () => {
      const {
        user,
        users: [, otherUser],
        generator
      } = await setupTestCase()
      const event = await createTestClient(user).event.create(
        generator.event.create()
      )
      const otherUserClient = createTestClient(otherUser, [readTennisClub])

      await expect(
        otherUserClient.event.file.getPresignedUrl({
          filePath: user.signature,
          eventId: event.id
        })
      ).resolves.toMatchObject(presigned)
    })

    test("rejects the creator's signature without eventId or user.read", async () => {
      const {
        user,
        users: [, otherUser],
        generator
      } = await setupTestCase()
      await createTestClient(user).event.create(generator.event.create())
      const otherUserClient = createTestClient(otherUser, [readTennisClub])

      await expect(
        otherUserClient.event.file.getPresignedUrl({ filePath: user.signature })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    test("rejects the creator's signature when record.read is for another event type", async () => {
      const {
        user,
        users: [, otherUser],
        generator
      } = await setupTestCase()
      const event = await createTestClient(user).event.create(
        generator.event.create()
      )
      const otherUserClient = createTestClient(otherUser, [
        encodeScope({ type: 'record.read', options: { event: ['birth'] } })
      ])

      await expect(
        otherUserClient.event.file.getPresignedUrl({
          filePath: user.signature,
          eventId: event.id
        })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    test('presigns a bare attachment the record declares, via eventId', async () => {
      const {
        user,
        users: [, otherUser],
        generator
      } = await setupTestCase()
      const client = createTestClient(user)
      const event = await createEvent(client, generator, [ActionType.DECLARE])
      const otherUserClient = createTestClient(otherUser, [readTennisClub])

      await expect(
        otherUserClient.event.file.getPresignedUrl({
          filePath: DECLARED_FILE,
          eventId: event.id
        })
      ).resolves.toMatchObject(presigned)
    })

    test('rejects a bare path the record does not reference', async () => {
      const {
        user,
        users: [, otherUser],
        generator
      } = await setupTestCase()
      const client = createTestClient(user)
      const event = await createEvent(client, generator, [ActionType.DECLARE])
      const otherUserClient = createTestClient(otherUser, [readTennisClub])

      await expect(
        otherUserClient.event.file.getPresignedUrl({
          filePath: `${generateUuid()}.png` as DocumentPath,
          eventId: event.id
        })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    test('presigns a referenced bare attachment for a system client', async () => {
      const { user, generator } = await setupTestCase()
      const client = createTestClient(user)
      const event = await createEvent(client, generator, [ActionType.DECLARE])

      await expect(
        createSystemTestClient(TEST_SYSTEM_ID, [
          readTennisClub
        ]).event.file.getPresignedUrl({
          filePath: DECLARED_FILE,
          eventId: event.id
        })
      ).resolves.toMatchObject(presigned)
    })
  })

  test('rejects an unowned bare path without eventId', async () => {
    const { user } = await setupTestCase()

    await expect(
      createTestClient(user, []).event.file.getPresignedUrl({
        filePath: `${generateUuid()}.png` as DocumentPath
      })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})
