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
import { renderHook, RenderHookResult, waitFor } from '@testing-library/react'
import React, { act, PropsWithChildren } from 'react'

import { http, HttpResponse, HttpResponseResolver } from 'msw'
import { setupServer } from 'msw/node'
import { serialize } from 'superjson'
import { vi } from 'vitest'
import { TRPCError } from '@trpc/server'
import { EventDocument, EventInput } from '@opencrvs/commons/client'
import { storage } from '@client/storage'
import { queryClient, TRPCProvider } from '@client/v2-events/trpc'
import { useEvents } from './useEvents'

const serverSpy = vi.fn()

function trpcHandler(
  fn: HttpResponseResolver<never, EventInput, EventDocument>
): HttpResponseResolver<never, EventInput, EventDocument> {
  async function wrapHttpResponseJson<T extends HttpResponse>(response: T) {
    const jsonBody = await response.json()
    return HttpResponse.json({
      result: { data: serialize(jsonBody), type: 'data' }
    })
  }

  return (async (options) => {
    const body = (await options.request.json()) as unknown as {
      json: EventInput
    }
    options.request.json = async () => Promise.resolve(body.json)
    const response = (await fn(options)) as HttpResponse
    return wrapHttpResponseJson(response)
  }) as HttpResponseResolver<never, EventInput, EventDocument>
}

const createHandler = trpcHandler(async ({ request }) => {
  serverSpy({ url: request.url, method: request.method })
  const body = await request.json()
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return HttpResponse.json({
    transactionId: body.transactionId,
    type: 'TENNIS_CLUB_MEMBERSHIP',
    id: '_REAL_UUID_',
    createdAt: new Date('2024-12-05T18:37:31.295Z').toISOString(),
    updatedAt: new Date('2024-12-05T18:37:31.295Z').toISOString(),
    actions: [
      {
        type: 'CREATE',
        createdAt: new Date('2024-12-05T18:37:31.295Z').toISOString(),
        createdBy: '6733309827b97e6483877188',
        createdAtLocation: 'ae5be1bb-6c50-4389-a72d-4c78d19ec176',
        data: {}
      }
    ]
  })
})

function errorHandler() {
  return new HttpResponse(
    JSON.stringify({
      error: {
        json: new TRPCError({
          code: 'INTERNAL_SERVER_ERROR'
        })
      }
    }),
    {
      status: 500
    }
  )
}
const server = setupServer(
  http.post<never, EventInput, EventDocument>(
    '/api/events/event.create',
    createHandler
  )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

interface TestContext {
  eventsHook: RenderHookResult<ReturnType<typeof useEvents>, {}>
  createEventHook: RenderHookResult<
    ReturnType<ReturnType<typeof useEvents>['createEvent']>,
    {}
  >
  declareHook: RenderHookResult<
    ReturnType<ReturnType<typeof useEvents>['actions']['declare']>,
    {}
  >
}

beforeEach<TestContext>(async (testContext) => {
  queryClient.clear()
  serverSpy.mockClear()
  await storage.removeItem('events')
  await storage.removeItem('reactQuery')

  function wrapper({ children }: PropsWithChildren) {
    return <TRPCProvider>{children}</TRPCProvider>
  }
  const eventsHook = renderHook(() => useEvents(), { wrapper })
  await waitFor(() => expect(eventsHook.result.current).not.toBeNull(), {
    timeout: 3000
  })

  const createHook = renderHook(() => eventsHook.result.current.createEvent(), {
    wrapper
  })

  const declareHookHook = renderHook(
    () => eventsHook.result.current.actions.declare(),
    {
      wrapper
    }
  )

  testContext.eventsHook = eventsHook
  testContext.declareHook = declareHookHook
  testContext.createEventHook = createHook
})

describe('events that have unsynced actions', () => {
  test<TestContext>('creating a record first stores it locally with a temporary id', async ({
    eventsHook,
    createEventHook
  }) => {
    server.use(http.post('/api/events/event.create', errorHandler))
    createEventHook.result.current.mutate({
      type: 'birth',
      transactionId: '_TEST_TRANSACTION_'
    })

    // Expect data store now to contain one event
    await waitFor(() => {
      expect(eventsHook.result.current.events.data).toHaveLength(1)
    })

    // It should have the transactionId as id
    expect(eventsHook.result.current.events.data[0].id).toBe(
      eventsHook.result.current.events.data[0].transactionId
    )
  })

  test<TestContext>('temporary id is replaced with the real id when the event is synced to the backend', async ({
    eventsHook,
    createEventHook
  }) => {
    await createEventHook.result.current.mutateAsync({
      type: 'birth',
      transactionId: '_TEST_TRANSACTION_'
    })
    // Wait for backend to sync
    await waitFor(() =>
      expect(serverSpy).toHaveBeenCalledWith({
        url: 'http://localhost:3000/api/events/event.create',
        method: 'POST'
      })
    )

    // Store still has one event
    await waitFor(() => {
      expect(eventsHook.result.current.events.data).toHaveLength(1)
    })

    // But now it's real id is different from the transactionId
    await waitFor(() =>
      expect(eventsHook.result.current.events.data[0].id).not.toBe(
        eventsHook.result.current.events.data[0].transactionId
      )
    )
  })

  test<TestContext>('event that has not been declared yet is interpreted as a draft', async ({
    eventsHook,
    createEventHook
  }) => {
    await createEventHook.result.current.mutateAsync({
      type: 'birth',
      transactionId: '_TEST_TRANSACTION_'
    })
    // Wait for backend to sync
    await waitFor(() =>
      expect(serverSpy).toHaveBeenCalledWith({
        url: 'http://localhost:3000/api/events/event.create',
        method: 'POST'
      })
    )

    // Store still has one draft
    await waitFor(() => {
      expect(eventsHook.result.current.getDrafts()).toHaveLength(1)
    })
  })
})

test<TestContext>('events that have unsynced actions are treated as "outbox" ', async ({
  eventsHook,
  declareHook,
  createEventHook: createHook
}) => {
  server.use(http.post('/api/events/event.create', errorHandler))

  createHook.result.current.mutate({
    type: 'birth',
    transactionId: '_TEST_FAILING_TRANSACTION_'
  })

  await waitFor(() => {
    expect(eventsHook.result.current.events.data).toHaveLength(1)
  })

  await waitFor(() => {
    expect(eventsHook.result.current.getOutbox()).toHaveLength(1)
    expect(eventsHook.result.current.getOutbox()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '_TEST_FAILING_TRANSACTION_' })
      ])
    )
  })

  // Start server again, clear outbox
  server.resetHandlers()

  const mutationCache = queryClient.getMutationCache().getAll()

  await Promise.all(
    mutationCache.map(async (mutation) =>
      mutation.execute(mutation.state.variables)
    )
  )

  await waitFor(() => expect(serverSpy.mock.calls).toHaveLength(1))

  await waitFor(() => {
    expect(eventsHook.result.current.getOutbox()).toHaveLength(0)
  })

  // Create a declaration action as well
  server.use(http.post('/api/events/actions.declare', errorHandler))
  act(() => {
    declareHook.result.current.mutate({
      eventId: '_REAL_UUID_',
      data: {},
      transactionId: '_TEST_FAILING_ACTION_TRANSACTION_'
    })
  })
  await waitFor(() => {
    expect(eventsHook.result.current.getOutbox()).toHaveLength(1)
    expect(eventsHook.result.current.getOutbox()).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: '_REAL_UUID_' })])
    )
  })
})
