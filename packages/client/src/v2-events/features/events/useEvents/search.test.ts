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
import { vi } from 'vitest'
import {
  queryClient,
  trpcOptionsProxy,
  purgeLegacySearchQueries
} from '@client/v2-events/trpc'
import { invalidateWorkqueueSearchQueries } from './api'
import { searchKeys } from './procedures/search'

const EMPTY_RESULT = { results: [], total: 0 }

/**
 * Captures the tRPC procedure path segment of every intercepted request. If the
 * setQueryDefaults shim in procedures/search.ts works, this is always `event.search`;
 * if the scoped key leaked through it would be `event.search.workqueue.<slug>`.
 */
const procSpy = vi.fn()

function searchResolver({ params }: { params: Record<string, string> }) {
  procSpy(params.proc)
  return HttpResponse.json({
    result: { data: serialize(EMPTY_RESULT), type: 'data' }
  })
}

// tRPC httpLink puts the procedure in the path; queries are GET, but accept POST
// too for safety. A single-segment param captures the full dotted path.
const server = setupServer(
  http.get('/api/events/:proc', searchResolver),
  http.post('/api/events/:proc', searchResolver)
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  procSpy.mockClear()
  queryClient.clear()
})
afterAll(() => server.close())

const workqueueInput = {
  query: { type: 'and' as const, clauses: [{ status: 'DECLARED' }] }
}

describe('setQueryDefaults shim (procedure path derivation)', () => {
  it('refetches a scoped workqueue key via the real event.search procedure, NOT event.search.workqueue.<slug>', async () => {
    // Seed a query under a scoped key with no queryFn of its own.
    queryClient.setQueryData(
      searchKeys.workqueue(workqueueInput, 'my-slug'),
      EMPTY_RESULT
    )

    await queryClient.refetchQueries({
      queryKey: searchKeys.filters.workqueue('my-slug')
    })

    expect(procSpy).toHaveBeenCalledTimes(1)
    expect(procSpy).toHaveBeenCalledWith('event.search')
    expect(procSpy).not.toHaveBeenCalledWith('event.search.workqueue.my-slug')
  })

  it('makes seeded by-id entries refetchable (regression guard: previously a silent no-op)', async () => {
    const eventId = '11111111-1111-1111-1111-111111111111'
    // Seeded by-id entries historically had no queryFn → refetch silently
    // no-opped. The default queryFn now makes them refetch.
    queryClient.setQueryData(searchKeys.byId(eventId), EMPTY_RESULT)

    await queryClient.refetchQueries({
      queryKey: searchKeys.filters.byId(eventId)
    })

    expect(procSpy).toHaveBeenCalledTimes(1)
    expect(procSpy).toHaveBeenCalledWith('event.search')
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

  it('invalidating filters.allWorkqueues() marks both workqueues stale but leaves adhoc + byId untouched', async () => {
    seedAll()
    await queryClient.invalidateQueries({
      queryKey: searchKeys.filters.allWorkqueues(),
      // inactive queries here; still mark them invalidated
      refetchType: 'none'
    })

    expect(isStale(searchKeys.workqueue(workqueueInput, 'A'))).toBe(true)
    expect(isStale(searchKeys.workqueue(workqueueInput, 'B'))).toBe(true)
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

    // A pending offline mutation (the outbox) must not be affected.
    const mutationCache = queryClient.getMutationCache()
    mutationCache.build(queryClient, { mutationKey: [['event', 'create']] })
    const mutationsBefore = mutationCache.getAll().length

    purgeLegacySearchQueries(queryClient)

    expect(queryClient.getQueryData(legacyKey)).toBeUndefined()
    expect(queryClient.getQueryData(scopedKey)).toEqual(EMPTY_RESULT)
    expect(mutationCache.getAll().length).toBe(mutationsBefore)
  })
})
