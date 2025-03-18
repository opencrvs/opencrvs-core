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

import { env } from '@events/environment'
import { mswServer } from '@events/tests/msw'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { ActionType, DraftInput, SCOPES } from '@opencrvs/commons'
import { TRPCError } from '@trpc/server'

test('prevents forbidden access if missing required scope', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.delete({
      eventId: 'event-test-id-12345'
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`allows access with required scope`, async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_DECLARE])

  await expect(
    client.event.delete({ eventId: 'some event' })
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('should return 404 if event does not exist', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)

  await expect(
    client.event.delete({ eventId: 'some event' })
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('stored events can be deleted', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  // at this point event should exist
  expect(client.event.get(event.id)).toBeDefined()

  const removedEvent = await client.event.delete({ eventId: event.id })
  expect(removedEvent.id).toBe(event.id)

  // now event should be removed
  await expect(client.event.get(event.id)).rejects.toThrow(
    `Event not found with ID: ${event.id}`
  )
})

describe('check unreferenced draft attachments are deleted while final action submission', () => {
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

  test('should delete previous draft attachments', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())
    const getDraft = (n: number): DraftInput => {
      return {
        type: ActionType.DECLARE,
        data: {
          ...generator.event.actions.declare(event.id).data,
          'applicant.image': {
            type: 'image/png',
            originalFilename: `${n}-abcd.png`,
            filename: `${n}-4f095fc4-4312-4de2-aa38-86dcc0f71044.png`
          }
        },
        transactionId: `transactionId-${n}`,
        eventId: event.id
      }
    }
    const getDeclaration = (n: number) => {
      return {
        data: {
          ...generator.event.actions.declare(event.id).data,
          'applicant.image': {
            type: 'image/png',
            originalFilename: `${n}-abcd.png`,
            filename: `${n}-4f095fc4-4312-4de2-aa38-86dcc0f71044.png`
          }
        },
        transactionId: `transactionId-${n}`,
        eventId: event.id
      }
    }

    // declaring 5 drafts with  4 different file attachments
    await client.event.draft.create(getDraft(1))
    await client.event.draft.create(getDraft(2))
    await client.event.draft.create(getDraft(3))
    await client.event.draft.create(getDraft(4))
    await client.event.draft.create(getDraft(5))

    // declaring final action submission
    await client.event.actions.declare(getDeclaration(6))

    // file attachment exist api should be called once
    expect(fileExistMock.mock.calls).toHaveLength(1)

    // total 4 unreferenced draft attachments should be deleted
    expect(deleteUnreferencedDraftAttachmentsMock.mock.calls).toHaveLength(5)

    const updatedEvent = await client.event.get(event.id)

    // since declare action has been submitted 5 times
    expect(updatedEvent.actions).toEqual([
      expect.objectContaining({ type: ActionType.CREATE }),
      expect.objectContaining({ type: ActionType.DECLARE })
    ])
  })

  afterEach(() => {
    mswServer.events.removeListener('response:mocked', mockListener)
  })
})
