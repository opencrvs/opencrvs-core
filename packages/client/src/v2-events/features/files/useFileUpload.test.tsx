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
import { renderHook } from '@testing-library/react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React, { PropsWithChildren } from 'react'
import superjson from 'superjson'
import { vi } from 'vitest'
import {
  ActionType,
  DocumentPath,
  generateEventDocument,
  getUUID,
  tennisClubMembershipEvent,
  userAttachmentPath,
  versionedTennisClubMembershipEvent
} from '@opencrvs/commons/client'
import {
  addLocalEventConfig,
  setEventData
} from '@client/v2-events/features/events/useEvents/api'
import { AppRouter, queryClient, TRPCProvider } from '@client/v2-events/trpc'
import { createTemporaryId } from '@client/v2-events/utils'
import { useFileUpload } from './useFileUpload'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const PRESIGNED_URL = 'http://localhost/presigned-upload'

const uploadedPaths: string[] = []
const storedFiles: { headers: Record<string, string>; body: string }[] = []

function presignedUpload(path: string, contentType: string) {
  return {
    url: `${PRESIGNED_URL}/${path}`,
    headers: { 'Content-Type': contentType, 'x-amz-meta-created-by': 'test' },
    path: DocumentPath.parse(path)
  }
}

const server = setupServer(
  tRPCMsw.attachments.presignEventUpload.mutation(
    ({ eventId, transactionId, extension, contentType }) => {
      const path = `events/${eventId}/${transactionId}.${extension}`
      uploadedPaths.push(path)
      return presignedUpload(path, contentType)
    }
  ),
  tRPCMsw.attachments.presignUserUpload.mutation(
    ({ userId, transactionId, extension, contentType }) => {
      const path = `users/${userId}/${transactionId}.${extension}`
      uploadedPaths.push(path)
      return presignedUpload(path, contentType)
    }
  ),
  http.put(`${PRESIGNED_URL}/*`, async ({ request }) => {
    storedFiles.push({
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text()
    })
    return new HttpResponse(null, { status: 200 })
  })
)

beforeAll(() => {
  /*
   * `cacheFile` writes to the service worker cache, which does not exist in jsdom.
   * An empty cache listing makes it a no-op.
   */
  vi.stubGlobal('caches', { keys: () => [] })
  server.listen()
})
afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
  uploadedPaths.length = 0
  storedFiles.length = 0
})
afterAll(() => server.close())

function wrapper({ children }: PropsWithChildren) {
  return <TRPCProvider waitForClientRestored={false}>{children}</TRPCProvider>
}

const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' })

describe('uploading a file for an event that only has a temporary id', () => {
  test('uploads to the canonical event path once the event has been created', async () => {
    const event = generateEventDocument({
      configuration: tennisClubMembershipEvent,
      actions: [{ type: ActionType.CREATE }]
    })
    const temporaryId = createTemporaryId()

    addLocalEventConfig(versionedTennisClubMembershipEvent)

    /*
     * Mimics what the event creation mutation does when the backend responds:
     * the event is stored under its temporary id, pointing to the canonical document.
     */
    setEventData(temporaryId, event)

    const { result } = renderHook(
      () => useFileUpload(`events/${temporaryId}/`, 'my-field'),
      { wrapper }
    )

    const { url } = await result.current.uploadFileAsync(file)

    expect(url).toMatch(new RegExp(`^events/${event.id}/[0-9a-f-]{36}\\.jpg$`))
    expect(uploadedPaths).toEqual([url])
  })

  test('does not upload to the temporary event path while the event is unsynced', async () => {
    const temporaryId = createTemporaryId()

    const { result } = renderHook(
      () => useFileUpload(`events/${temporaryId}/`, 'my-field'),
      { wrapper }
    )

    result.current.uploadFile(file)

    /*
     * The mutation is expected to keep retrying instead of storing the file under a
     * path the backend will never be able to resolve.
     */
    await new Promise((resolve) => setTimeout(resolve, 1000))

    expect(uploadedPaths).toEqual([])
  })
})

describe('uploading a file for a user', () => {
  test('sends the file to the presigned URL with the signed headers', async () => {
    const userId = getUUID()

    const { result } = renderHook(
      () => useFileUpload(userAttachmentPath(userId), 'signature'),
      { wrapper }
    )

    const { url } = await result.current.uploadFileAsync(file)

    expect(url).toMatch(new RegExp(`^users/${userId}/[0-9a-f-]{36}\\.jpg$`))
    expect(storedFiles).toEqual([
      {
        headers: expect.objectContaining({
          'content-type': 'image/jpeg',
          'x-amz-meta-created-by': 'test'
        }),
        body: 'test'
      }
    ])
  })
})
