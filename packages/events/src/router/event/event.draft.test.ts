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

import { http, HttpResponse } from 'msw'
import {
  ActionStatus,
  ActionType,
  DraftInput,
  DocumentPath,
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
import { updateUser } from '@events/service/users/api'

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

/*
 * Only the declare view saves drafts, and a declare draft is possible exactly
 * where the record can still be deleted or is on its way to an action that
 * sweeps it. NOTIFY is available on a created event, so refusing it here is the
 * action rule alone, not the availability check behind it.
 */
test('Refuses a draft for any action other than declare', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  await expect(
    client.event.draft.create({
      eventId: event.id,
      // @ts-expect-error - the input type refuses this, the test proves the server does too
      type: ActionType.NOTIFY,
      status: 'Accepted',
      transactionId: 'trnx-id'
    })
  ).rejects.toThrow('Invalid input')
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

test('Refuses a declare draft once the event has been declared', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id, { keepAssignment: true })
  )

  await expect(
    client.event.draft.create({
      eventId: event.id,
      type: ActionType.DECLARE,
      status: 'Accepted',
      transactionId: 'trnx-id'
    })
  ).rejects.toThrow(
    "Action 'DECLARE' cannot be performed on an event in 'DECLARED' state"
  )
})

/*
 * An edit that did not reach its declare or register leaves the record here.
 * Save and exit in the declare view has to keep working, or the user cannot
 * get out of that state without losing what they typed.
 */
test('Allows a draft on a declared event that is part way through an edit', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id, { keepAssignment: true })
  )
  await client.event.actions.edit.request({
    ...generator.event.actions.edit(event.id),
    keepAssignmentIfAccepted: true
  })

  const draft = await client.event.draft.create({
    eventId: event.id,
    type: ActionType.DECLARE,
    status: 'Accepted',
    transactionId: 'trnx-id'
  })

  expect(draft.eventId).toBe(event.id)
})

test('Creating a draft is idempotent', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const firstResponse = await client.event.draft.create({
    eventId: event.id,
    type: ActionType.DECLARE,
    status: 'Accepted',
    transactionId: 'trnx-id',
    annotation: {
      comment: 'Should be visible'
    }
  })

  await client.event.draft.create({
    eventId: event.id,
    type: ActionType.DECLARE,
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
            path: `${n}-4f095fc4-4312-4de2-aa38-86dcc0f71044.png` as DocumentPath
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

    const drafts = await client.event.draft.list()

    expect(drafts).toHaveLength(1)
  })

  afterEach(() => {
    mswServer.events.removeListener('response:mocked', mockListener)
  })
})

test('clears all drafts when user primary office changes', async () => {
  const { user, generator, locations } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())
  await client.event.draft.create({
    eventId: event.id,
    type: ActionType.DECLARE,
    status: 'Accepted',
    transactionId: 'test-transaction-id'
  })

  expect(await client.event.draft.list()).toHaveLength(1)

  await updateUser(
    { id: user.id, primaryOfficeId: locations[1].id },
    'test-token'
  )

  expect(await client.event.draft.list()).toHaveLength(0)
})

test('deletes the events orphaned by a primary office change', async () => {
  const { user, generator, locations } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())
  await client.event.draft.create({
    eventId: event.id,
    type: ActionType.DECLARE,
    status: 'Accepted',
    transactionId: 'test-transaction-id'
  })

  const sweptPrefixes: string[] = []

  mswServer.use(
    http.delete(`${env.DOCUMENTS_URL}/prefix/:prefix*`, ({ request }) => {
      sweptPrefixes.push(
        new URL(request.url).pathname.replace('/prefix/', '')
      )
      return HttpResponse.json({ deleted: 0 })
    })
  )

  await updateUser(
    { id: user.id, primaryOfficeId: locations[1].id },
    'test-token'
  )

  /*
   * The draft was all the event had, so nothing is left of it and its
   * attachments go with it.
   */
  await expect(client.event.get({ eventId: event.id })).rejects.toThrow(
    `Event not found with ID: ${event.id}`
  )
  expect(sweptPrefixes).toEqual([`events/${event.id}/`])
})

test('the sweep looks for files under the record prefix', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const listedPrefixes: string[] = []

  mswServer.use(
    http.get(`${env.DOCUMENTS_URL}/list-files/:prefix*`, ({ request }) => {
      listedPrefixes.push(
        new URL(request.url).pathname.replace('/list-files/', '')
      )
      return HttpResponse.json([])
    })
  )

  await client.event.draft.create({
    eventId: event.id,
    type: ActionType.DECLARE,
    status: 'Accepted',
    transactionId: 'test-transaction-id'
  })

  expect(listedPrefixes).toEqual([`events/${event.id}/`])
})
