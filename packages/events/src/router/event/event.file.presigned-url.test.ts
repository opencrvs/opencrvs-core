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
import {
  createTestClient,
  setupTestCase,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'

vi.mock('@events/service/indexing/indexing')

const RECORD_SCOPES = [
  ...TEST_USER_DEFAULT_SCOPES,
  encodeScope({
    type: 'record.create',
    options: { event: [TENNIS_CLUB_MEMBERSHIP] }
  }),
  encodeScope({
    type: 'record.read',
    options: { event: [TENNIS_CLUB_MEMBERSHIP] }
  }),
  encodeScope({
    type: 'record.notify',
    options: { event: [TENNIS_CLUB_MEMBERSHIP] }
  })
]

async function eventWithAttachment(
  client: ReturnType<typeof createTestClient>,
  generator: Awaited<ReturnType<typeof setupTestCase>>['generator']
) {
  const event = await client.event.create(generator.event.create())
  const path = `events/${event.id}/attachment.png` as DocumentPath
  const notify = generator.event.actions.notify(event.id)

  await client.event.actions.notify.request({
    ...notify,
    declaration: {
      ...notify.declaration,
      'applicant.image': {
        type: 'image/png',
        originalFilename: 'attachment.png',
        path
      }
    }
  })

  return { event, path }
}

test('presigns a file that is attached to the event', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, RECORD_SCOPES)

  const { event, path } = await eventWithAttachment(client, generator)

  const { presignedURL } = await client.event.file.presignedUrl({
    eventId: event.id,
    path
  })

  expect(presignedURL).toContain(path)
})

test('refuses a path that is not attached to the event', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, RECORD_SCOPES)

  const { event } = await eventWithAttachment(client, generator)

  /*
   * The whole point of the check: holding one readable event id must not
   * presign a document belonging to some other record.
   */
  await expect(
    client.event.file.presignedUrl({
      eventId: event.id,
      path: `events/${event.id}/never-uploaded.png` as DocumentPath
    })
  ).rejects.toMatchObject({ code: 'NOT_FOUND' })
})

test('presigns a file the caller only attached in a draft', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, RECORD_SCOPES)

  const event = await client.event.create(generator.event.create())
  const path = `events/${event.id}/drafted.png` as DocumentPath

  await client.event.draft.create({
    type: ActionType.DECLARE,
    eventId: event.id,
    transactionId: getUUID(),
    status: ActionStatus.Requested,
    declaration: {
      ...generator.event.actions.declare(event.id).declaration,
      'applicant.image': {
        type: 'image/png',
        originalFilename: 'drafted.png',
        path
      }
    }
  })

  const { presignedURL } = await client.event.file.presignedUrl({
    eventId: event.id,
    path
  })

  expect(presignedURL).toContain(path)
})

test('refuses a caller who may not read the event', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, RECORD_SCOPES)

  const { event, path } = await eventWithAttachment(client, generator)

  // TEST_USER_DEFAULT_SCOPES already grants record.read, so start from nothing.
  const clientWithoutRead = createTestClient(user, [])

  await expect(
    clientWithoutRead.event.file.presignedUrl({ eventId: event.id, path })
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})
