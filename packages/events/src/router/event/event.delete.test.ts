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

import { mswServer } from '@events/tests/msw'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { SCOPES } from '@opencrvs/commons'
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

describe('it should check unreferenced draft attachments are deleted while final action submission', () => {
  const deleteUnreferencedDraftAttachmentsMock = vi.fn()
  const fileExistMock = vi.fn()

  function mockListener({
    request
  }: {
    response: Response
    request: Request
    requestId: string
  }) {
    if (!request.url.startsWith('http://localhost:9050/files')) {
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

  const file = {
    filename:
      '4f095fc4-4312-4de2-aa38-86dcc0f71044.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20250304%2Flocal%2Fs3%2Faws4_request&X-Amz-Date=20250304T113416Z&X-Amz-Expires=259200&X-Amz-SignedHeaders=host&X-Amz-Signature=6e65c690882b7b6912167c251fdfcef3c5067ee7d30cf95283dd109185ca4fec',
    originalFilename: 'abcd.png',
    type: 'image/png'
  }
  test.only('should delete previous draft attachments', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())
    const getDraft = (
      fileName: string,
      transactionId: string,
      draft: boolean
    ) => ({
      data: {
        ...generator.event.actions.declare(event.id).data,
        'applicant.image': {
          type: 'png',
          originalFilename: fileName,
          filename: fileName
        }
      },
      draft,
      transactionId,
      eventId: event.id
    })

    // declaring 5 drafts with different file attachments
    await client.event.actions.declare(getDraft(`0${file.filename}`, '0', true))
    await client.event.actions.declare(getDraft(`1${file.filename}`, '1', true))
    await client.event.actions.declare(getDraft(`2${file.filename}`, '2', true))
    await client.event.actions.declare(getDraft(`3${file.filename}`, '3', true))
    await client.event.actions.declare(getDraft(`4${file.filename}`, '4', true))

    // declaring final action submission
    await client.event.actions.declare(
      getDraft(`final${file.filename}`, 'final', false)
    )

    // total 6 file attachment exist api should be called
    expect(fileExistMock.mock.calls).toHaveLength(6)

    // total 5 unreferenced draft attachments should be deleted
    expect(deleteUnreferencedDraftAttachmentsMock.mock.calls).toHaveLength(5)
  })

  afterEach(() => {
    mswServer.events.removeListener('response:mocked', mockListener)
  })
})
