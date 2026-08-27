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
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React, { PropsWithChildren } from 'react'
import { vi } from 'vitest'
import {
  ActionType,
  generateEventDocument,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import {
  addLocalEventConfig,
  setEventData
} from '@client/v2-events/features/events/useEvents/api'
import { queryClient, TRPCProvider } from '@client/v2-events/trpc'
import { createTemporaryId } from '@client/v2-events/utils'
import { UPLOAD_MUTATION_KEY, useFileUpload } from './useFileUpload'

const uploadedPaths: string[] = []
const deletedPaths: string[] = []

const server = setupServer(
  http.post('/api/upload', () => HttpResponse.text('uploaded')),
  http.delete('/api/files/*', ({ request }) => {
    deletedPaths.push(new URL(request.url).pathname.replace('/api/files/', ''))
    return new HttpResponse(null, { status: 204 })
  })
)

beforeAll(() => {
  /*
   * `cacheFile` writes to the service worker cache, which does not exist in jsdom.
   * An empty cache listing makes it a no-op.
   */
  vi.stubGlobal('caches', { keys: () => [] })
  server.listen()

  /*
   * Records the path each upload is sent with, reading it off the `FormData` the
   * caller built. Wraps the `fetch` msw installed above, so requests still reach
   * the handlers.
   */
  const interceptedFetch = globalThis.fetch
  vi.stubGlobal(
    'fetch',
    async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.body instanceof FormData) {
        uploadedPaths.push(String(init.body.get('path')))
      }

      return interceptedFetch(input, init)
    }
  )

  /*
   * The upload mutation is registered with `retry: true` and a five second delay,
   * so a failing request would leave the promise pending until the test times out
   * and hide the error that caused it.
   */
  queryClient.setMutationDefaults([UPLOAD_MUTATION_KEY], {
    retry: 1,
    retryDelay: 0
  })
})
afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
  uploadedPaths.length = 0
  deletedPaths.length = 0
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

    addLocalEventConfig(tennisClubMembershipEvent)

    /*
     * Mimics what the event creation mutation does when the backend responds:
     * the event is stored under its temporary id, pointing to the canonical document.
     */
    setEventData(temporaryId, event)

    const { result } = renderHook(
      () => useFileUpload(`events/${temporaryId}/`, 'my-field'),
      { wrapper }
    )

    await result.current.uploadFileAsync(file)

    expect(uploadedPaths).toEqual([`events/${event.id}/`])
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

  test('deletes the file from the canonical event path', async () => {
    const event = generateEventDocument({
      configuration: tennisClubMembershipEvent,
      actions: [{ type: ActionType.CREATE }]
    })
    const temporaryId = createTemporaryId()

    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(temporaryId, event)

    const { result } = renderHook(
      () => useFileUpload(`events/${temporaryId}/`, 'my-field'),
      { wrapper }
    )

    result.current.deleteFile(`events/${temporaryId}/proof.png`)

    await waitFor(() =>
      expect(deletedPaths).toEqual([`events/${event.id}/proof.png`])
    )
  })
})
