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

import {
  ActionStatus,
  ActionType,
  DraftInput,
  FullDocumentPath,
  generateUuid
} from '@opencrvs/commons'
import { mswServer } from '@events/tests/msw'
import {
  createTestClient,
  sanitizeForSnapshot,
  setupTestCase,
  UNSTABLE_EVENT_FIELDS
} from '@events/tests/utils'
import { env } from '@events/environment'

test('Throws error when creating a draft against non-existent id', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)

  const uuid = 'd09ca1db-98b6-4edc-891f-eebb33fea7a6'

  await expect(
    client.event.draft.create({
      eventId: uuid,
      type: ActionType.DECLARE,
      status: 'Accepted',
      transactionId: 'trnx-id'
    })
  ).rejects.toThrow(`Event not found with ID: ${uuid}`)
})

test('Throws error when creating a draft for event without assignment', async () => {
  const { users, generator } = await setupTestCase()
  const [defaultUser, anotherUser] = users
  const defaultClient = createTestClient(defaultUser)
  const anotherClient = createTestClient(anotherUser)

  const eventCreatedByOther = await anotherClient.event.create(
    generator.event.create()
  )

  await expect(
    defaultClient.event.draft.create({
      eventId: eventCreatedByOther.id,
      type: ActionType.DECLARE,
      status: 'Accepted',
      transactionId: 'trnx-id'
    })
  ).rejects.toThrow('You are not assigned to this event')
})

test('Throws error when creating a draft for invalid action', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  await expect(
    client.event.draft.create({
      eventId: event.id,
      type: ActionType.REGISTER,
      status: 'Accepted',
      transactionId: 'trnx-id'
    })
  ).rejects.toThrow(
    "Action 'REGISTER' cannot be performed on an event in 'CREATED' state with [] flags. Available actions: READ, DECLARE, NOTIFY, DELETE"
  )
})

test('Allows creating draft for event without actions', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const draftResponse = await client.event.draft.create({
    eventId: event.id,
    type: ActionType.DECLARE,
    status: 'Accepted',
    transactionId: 'trnx-id'
  })

  expect(
    sanitizeForSnapshot(draftResponse, UNSTABLE_EVENT_FIELDS)
  ).toMatchSnapshot()
})

test('Creating another draft replaces the previous one', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  await client.event.draft.create({
    eventId: event.id,
    type: ActionType.DECLARE,
    status: 'Accepted',
    transactionId: 'trnx-id-1',
    annotation: {
      comment: 'draft 1'
    }
  })

  const secondDraft = await client.event.draft.create({
    eventId: event.id,
    type: ActionType.DECLARE,
    status: 'Accepted',
    transactionId: 'trnx-id-2',
    annotation: {
      comment: 'draft 2'
    }
  })

  const drafts = await client.event.draft.list()

  expect(drafts).toHaveLength(1)
  expect(sanitizeForSnapshot(drafts[0], ['createdAt'])).toStrictEqual(
    sanitizeForSnapshot(secondDraft, ['createdAt'])
  )

  expect(sanitizeForSnapshot(drafts, UNSTABLE_EVENT_FIELDS)).toMatchSnapshot()
})

test('Allows creating draft for event with actions', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id, { keepAssignment: true })
  )

  const draftResponse = await client.event.draft.create({
    eventId: event.id,
    type: ActionType.VALIDATE,
    status: 'Accepted',
    transactionId: 'trnx-id'
  })

  expect(
    sanitizeForSnapshot(draftResponse, UNSTABLE_EVENT_FIELDS)
  ).toMatchSnapshot()
})

test('Creating a draft is idempotent', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id, { keepAssignment: true })
  )

  const firstResponse = await client.event.draft.create({
    eventId: event.id,
    type: ActionType.VALIDATE,
    status: 'Accepted',
    transactionId: 'trnx-id',
    annotation: {
      comment: 'Should be visible'
    }
  })

  await client.event.draft.create({
    eventId: event.id,
    type: ActionType.VALIDATE,
    status: 'Accepted',
    transactionId: 'trnx-id',
    annotation: {
      comment: 'Should not be visible'
    }
  })

  const drafts = await client.event.draft.list()

  expect(drafts).toHaveLength(1)
  expect(drafts[0]).toEqual(firstResponse)
})

describe('Delete document references in drafts as side-effect', () => {
  const deleteUnreferencedDraftAttachmentsMock = vi.fn()
  const fileExistMock = vi.fn()

  function mockListener({
    request
  }: {
    response: Response
    request: Request
    requestId: string
  }) {
    if (!request.url.startsWith(`${env.DOCUMENTS_URL}/files`)) {
      return
    }

    if (request.method === 'DELETE') {
      deleteUnreferencedDraftAttachmentsMock(request.url, request.body)
    }

    if (request.method === 'HEAD') {
      fileExistMock(request.url, request.body)
    }
  }
  beforeEach(() => {
    mswServer.events.on('response:mocked', mockListener)
  })

  test('Delete previous draft attachments', async () => {
    const { user, generator, rng } = await setupTestCase(987)
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    const getDraft = (n: number): DraftInput => {
      return {
        type: ActionType.DECLARE,
        declaration: {
          ...generator.event.actions.declare(event.id).declaration,
          'applicant.image': {
            type: 'image/png',
            originalFilename: `${n}-abcd.png`,
            path: `/ocrvs/${n}-4f095fc4-4312-4de2-aa38-86dcc0f71044.png` as FullDocumentPath
          }
        },
        transactionId: generateUuid(rng),
        eventId: event.id,
        status: ActionStatus.Requested
      }
    }

    // declaring 5 drafts with 4 different file attachments
    await client.event.draft.create(getDraft(1))
    await client.event.draft.create(getDraft(2))
    await client.event.draft.create(getDraft(3))
    await client.event.draft.create(getDraft(4))
    await client.event.draft.create(getDraft(5))

    // total 4 unreferenced draft attachments should be deleted
    expect(deleteUnreferencedDraftAttachmentsMock.mock.calls).toHaveLength(4)
    expect(deleteUnreferencedDraftAttachmentsMock.mock.calls).toMatchSnapshot()

    const drafts = await client.event.draft.list()

    expect(drafts).toHaveLength(1)
  })

  afterEach(() => {
    mswServer.events.removeListener('response:mocked', mockListener)
  })
})
