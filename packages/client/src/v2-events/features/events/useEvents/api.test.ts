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
  tennisClubMembershipEvent,
  EventDocument,
  EventIndex
} from '@opencrvs/commons/client'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import {
  addLocalEventConfig,
  deleteLocalEvent,
  hasInvalidatedWorkqueueSearchQuery,
  onAssign,
  refetchAffectedSearchQueries,
  updateLocalEventIndex
} from './api'
import { searchKeys } from './procedures/search'

const EMPTY_RESULT = { results: [], total: 0 }
const workqueueInput = {
  query: { type: 'and' as const, clauses: [{ status: 'DECLARED' }] }
}

describe('deleteLocalEvent', () => {
  const eventDocument = tennisClubMembershipEventDocument
  const { id } = eventDocument

  beforeEach(() => {
    global.caches = {
      keys: vi.fn().mockResolvedValue([])
    } as unknown as CacheStorage
    queryClient.clear()
    addLocalEventConfig(tennisClubMembershipEvent)
  })

  afterAll(() => {
    queryClient.clear()
  })

  it('clears both event.get and view-event cache entries', async () => {
    queryClient.setQueryData(
      trpcOptionsProxy.event.get.queryKey({ eventId: id, waitFor: false }),
      eventDocument
    )
    queryClient.setQueryData([['view-event', id]], eventDocument)

    await deleteLocalEvent(eventDocument)

    expect(
      queryClient.getQueryData(
        trpcOptionsProxy.event.get.queryKey({ eventId: id, waitFor: false })
      )
    ).toBeUndefined()
    expect(queryClient.getQueryData([['view-event', id]])).toBeUndefined()
  })
})

describe('updateLocalEventIndex', () => {
  beforeEach(() => {
    queryClient.clear()
    addLocalEventConfig(tennisClubMembershipEvent)
  })

  afterAll(() => {
    queryClient.clear()
  })

  it('preserves total count in cached queries after update', () => {
    const eventDocument = tennisClubMembershipEventDocument

    // Prepare a cached query simulating a workqueue result, keyed with the
    // scoped shape. Proves the [['event','search']] prefix scan in
    // updateLocalEventIndex still matches merged (scoped) keys.
    const queryKey = searchKeys.workqueue(
      { query: { type: 'and', clauses: [{ status: 'PENDING' }] } },
      'recent'
    )

    queryClient.setQueryData(queryKey, {
      total: 13,
      results: [
        { id: 'abc', status: 'PENDING' },
        { id: eventDocument.id, status: 'PENDING' },
        { id: 'def', status: 'REGISTERED' }
      ] as EventIndex[]
    })

    // Call the update
    updateLocalEventIndex(eventDocument.id, {
      ...eventDocument,
      status: 'REGISTERED'
    } as EventDocument)

    // Re-fetch cache
    const updated = queryClient.getQueryData(queryKey)

    // total must NOT be overwritten by results.length (which is 3)
    expect(updated?.total).toBe(13)

    // the event status should update correctly
    const updatedEvent = updated?.results.find((r) => r.id === eventDocument.id)
    expect(updatedEvent?.status).toBe('REGISTERED')

    // unrelated events untouched
    expect(updated?.results.find((r) => r.id === 'def')?.status).toBe(
      'REGISTERED'
    )
    expect(updated?.results.find((r) => r.id === 'abc')?.status).toBe('PENDING')
  })
})

/*
 * The standard refresh path shared by every workqueue-affecting write
 * (REGISTER/ARCHIVE/DECLARE/… via deleteLocalEvent, and MARK_AS_NOT_DUPLICATE):
 * by-id refetch + workqueue staleness + workqueue.count refetch + a single
 * mounted-workqueue refetch, ordered to dedup against the count-diff.
 */
describe('refetchAffectedSearchQueries — standard write path', () => {
  const eventId = '33333333-3333-3333-3333-333333333333'
  let invalidateSpy: ReturnType<typeof vi.spyOn>
  let refetchSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    queryClient.clear()
    invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    refetchSpy = vi.spyOn(queryClient, 'refetchQueries')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('stales workqueues (no refetch), refetches byId + count, then refetches mounted workqueues', async () => {
    await refetchAffectedSearchQueries(eventId)

    // step 1: blanket staleness with no refetch
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: searchKeys.filters.allWorkqueues(),
      refetchType: 'none'
    })
    // step 2: by-id refetch
    expect(refetchSpy).toHaveBeenCalledWith({
      queryKey: searchKeys.filters.byId(eventId)
    })
    // step 2: workqueue.count refetch
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: trpcOptionsProxy.workqueue.count.queryKey()
    })
    // step 3: mounted workqueues refetched once
    expect(refetchSpy).toHaveBeenCalledWith({
      queryKey: searchKeys.filters.allWorkqueues(),
      type: 'active'
    })
  })

  it('marks workqueues stale before refetching the count (so the count-diff dedups)', async () => {
    await refetchAffectedSearchQueries(eventId)

    const key = JSON.stringify(trpcOptionsProxy.workqueue.count.queryKey())
    const staleCallIndex = invalidateSpy.mock.calls.findIndex(
      ([arg]) => (arg as { refetchType?: string })?.refetchType === 'none'
    )
    const countCallIndex = invalidateSpy.mock.calls.findIndex(
      ([arg]) =>
        JSON.stringify((arg as { queryKey?: unknown })?.queryKey) === key
    )

    expect(staleCallIndex).toBeGreaterThanOrEqual(0)
    expect(countCallIndex).toBeGreaterThan(staleCallIndex)
  })
})

describe('deleteLocalEvent — routes writes through the standard path', () => {
  beforeEach(() => {
    global.caches = {
      keys: vi.fn().mockResolvedValue([])
    } as unknown as CacheStorage
    queryClient.clear()
    addLocalEventConfig(tennisClubMembershipEvent)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('stales workqueues + refetches byId + count + mounted workqueues', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const refetchSpy = vi.spyOn(queryClient, 'refetchQueries')

    await deleteLocalEvent(tennisClubMembershipEventDocument)

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: searchKeys.filters.allWorkqueues(),
      refetchType: 'none'
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: trpcOptionsProxy.workqueue.count.queryKey()
    })
    expect(refetchSpy).toHaveBeenCalledWith({
      queryKey: searchKeys.filters.byId(tennisClubMembershipEventDocument.id)
    })
    expect(refetchSpy).toHaveBeenCalledWith({
      queryKey: searchKeys.filters.allWorkqueues(),
      type: 'active'
    })
  })
})

describe('onAssign — scoped invalidation only (ASSIGN)', () => {
  beforeEach(() => {
    global.caches = {
      keys: vi.fn().mockResolvedValue([])
    } as unknown as CacheStorage
    queryClient.clear()
    addLocalEventConfig(tennisClubMembershipEvent)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('refetches workqueue.count but never blanket-stales workqueues or refetches byId', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const refetchSpy = vi.spyOn(queryClient, 'refetchQueries')

    await onAssign(tennisClubMembershipEventDocument)

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: trpcOptionsProxy.workqueue.count.queryKey()
    })
    expect(invalidateSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: searchKeys.filters.allWorkqueues()
      })
    )
    expect(refetchSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: searchKeys.filters.byId(tennisClubMembershipEventDocument.id)
      })
    )
  })
})

describe('hasInvalidatedWorkqueueSearchQuery (count-diff dedup guard)', () => {
  beforeEach(() => {
    queryClient.clear()
  })

  afterAll(() => {
    queryClient.clear()
  })

  it('reports a slug as invalidated only after its workqueue search is staled — so the count-diff skips it but still fires for others', async () => {
    queryClient.setQueryData(
      searchKeys.workqueue(workqueueInput, 'ready'),
      EMPTY_RESULT
    )
    queryClient.setQueryData(
      searchKeys.workqueue(workqueueInput, 'sent'),
      EMPTY_RESULT
    )

    expect(hasInvalidatedWorkqueueSearchQuery('ready')).toBe(false)

    await queryClient.invalidateQueries({
      queryKey: searchKeys.filters.workqueue('ready'),
      refetchType: 'none'
    })

    expect(hasInvalidatedWorkqueueSearchQuery('ready')).toBe(true)
    expect(hasInvalidatedWorkqueueSearchQuery('sent')).toBe(false)
  })
})
