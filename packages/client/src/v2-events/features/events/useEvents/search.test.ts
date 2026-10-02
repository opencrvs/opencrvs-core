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
import { setupServer } from 'msw/node'
import { serialize } from 'superjson'
import { QueryObserver } from '@tanstack/react-query'
import { EventIndex } from '@opencrvs/commons/client'
import {
  queryClient,
  trpcOptionsProxy,
  purgeLegacySearchQueries
} from '@client/v2-events/trpc'
import { findLocalEventIndex, invalidateWorkqueueSearchQueries } from './api'
import { byIdSearchOptions, searchKeys } from './procedures/search'

const EMPTY_RESULT = { results: [], total: 0 }

const server = setupServer()

/** Answers every query with no results; returns each request's procedure path. */
function recordRequests() {
  const procedures: string[] = []
  server.use(
    http.get('/api/events/:proc', ({ params }) => {
      procedures.push(params.proc as string)
      return HttpResponse.json({
        result: { data: serialize(EMPTY_RESULT), type: 'data' }
      })
    })
  )
  return procedures
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

const workqueueInput = {
  query: { type: 'and' as const, clauses: [{ status: 'DECLARED' }] }
}

describe('setQueryDefaults shim (procedure path derivation)', () => {
  it('refetches a scoped workqueue entry through the event.search procedure', async () => {
    const requests = recordRequests()
    queryClient.setQueryData(
      searchKeys.workqueue(workqueueInput, 'my-slug'),
      EMPTY_RESULT
    )

    await queryClient.refetchQueries({
      queryKey: searchKeys.filters.workqueue('my-slug')
    })

    expect(requests).toEqual(['event.search'])
  })

  it('refetches a by-id entry seeded locally, through the event.search procedure', async () => {
    const requests = recordRequests()
    const eventId = '11111111-1111-1111-1111-111111111111'
    queryClient.setQueryData(searchKeys.byId(eventId), EMPTY_RESULT)

    await queryClient.refetchQueries({
      queryKey: searchKeys.filters.byId(eventId)
    })

    expect(requests).toEqual(['event.search'])
  })
})

describe('invalidation targeting', () => {
  const byIdEvent = '22222222-2222-2222-2222-222222222222'

  function seedAll() {
    queryClient.setQueryData(
      searchKeys.workqueue(workqueueInput, 'A'),
      EMPTY_RESULT
    )
    queryClient.setQueryData(
      searchKeys.workqueue(workqueueInput, 'B'),
      EMPTY_RESULT
    )
    queryClient.setQueryData(searchKeys.adhoc(workqueueInput), EMPTY_RESULT)
    queryClient.setQueryData(searchKeys.byId(byIdEvent), EMPTY_RESULT)
  }

  const isStale = (queryKey: readonly unknown[]) =>
    Boolean(queryClient.getQueryState(queryKey)?.isInvalidated)

  it('invalidateWorkqueueSearchQueries(A) marks only workqueue A stale', async () => {
    seedAll()
    await invalidateWorkqueueSearchQueries('A')

    expect(isStale(searchKeys.workqueue(workqueueInput, 'A'))).toBe(true)
    expect(isStale(searchKeys.workqueue(workqueueInput, 'B'))).toBe(false)
    expect(isStale(searchKeys.adhoc(workqueueInput))).toBe(false)
    expect(isStale(searchKeys.byId(byIdEvent))).toBe(false)
  })
})

describe('purgeLegacySearchQueries', () => {
  it('removes only old-shape 2-element keys; scoped queries and pending mutations survive', () => {
    const legacyKey = trpcOptionsProxy.event.search.queryKey(workqueueInput)
    const scopedKey = searchKeys.workqueue(workqueueInput, 'A')

    queryClient.setQueryData(legacyKey, EMPTY_RESULT)
    queryClient.setQueryData(scopedKey, EMPTY_RESULT)

    const mutationCache = queryClient.getMutationCache()
    mutationCache.build(queryClient, { mutationKey: [['event', 'create']] })
    const mutationsBefore = mutationCache.getAll().length

    purgeLegacySearchQueries(queryClient)

    expect(queryClient.getQueryData(legacyKey)).toBeUndefined()
    expect(queryClient.getQueryData(scopedKey)).toEqual(EMPTY_RESULT)
    expect(mutationCache.getAll().length).toBe(mutationsBefore)
  })
})

describe('by-id lookup of a record the server has not indexed', () => {
  const eventId = '44444444-4444-4444-4444-444444444444'
  const drafted = { results: [{ id: eventId } as EventIndex], total: 1 }

  it('caches the local fallback, so the record resolves from the cache', async () => {
    const requests = recordRequests()
    const observer = new QueryObserver(
      queryClient,
      byIdSearchOptions(eventId, () => drafted)
    )
    const unsubscribe = observer.subscribe(() => undefined)

    await vi.waitFor(() =>
      expect(observer.getCurrentResult().data).toEqual(drafted)
    )
    expect(queryClient.getQueryData(searchKeys.byId(eventId))).toEqual(drafted)
    expect(findLocalEventIndex(eventId)?.id).toBe(eventId)
    expect(requests).toEqual(['event.search'])
    unsubscribe()
  })
})
