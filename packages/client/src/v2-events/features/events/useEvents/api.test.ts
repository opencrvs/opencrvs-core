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
import { QueryObserver } from '@tanstack/react-query'
import {
  tennisClubMembershipEvent,
  ActionType,
  EventDocument,
  EventDocumentOnlyLastAction,
  EventIndex
} from '@opencrvs/commons/client'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import {
  addLocalEventConfig,
  deleteLocalEvent,
  onAssign,
  refetchAffectedSearchQueries,
  setEventData,
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

  it('clears the event document and its by-id search entry', async () => {
    queryClient.setQueryData(
      trpcOptionsProxy.event.get.queryKey({ eventId: id }),
      eventDocument
    )
    queryClient.setQueryData(searchKeys.byId(id), {
      results: [{ id } as EventIndex],
      total: 1
    })

    await deleteLocalEvent(eventDocument)

    expect(
      queryClient.getQueryData(
        trpcOptionsProxy.event.get.queryKey({ eventId: id })
      )
    ).toBeUndefined()
    expect(queryClient.getQueryData(searchKeys.byId(id))).toBeUndefined()
  })

  it('fetches a mounted by-id entry once, not once per reset and refetch', async () => {
    const queryFn = vi.fn().mockResolvedValue(EMPTY_RESULT)
    const observer = new QueryObserver(queryClient, {
      queryKey: searchKeys.byId(id),
      queryFn
    })
    const unsubscribe = observer.subscribe(() => undefined)
    await vi.waitFor(() => expect(queryFn).toHaveBeenCalledTimes(1))
    queryFn.mockClear()

    await deleteLocalEvent(eventDocument)

    expect(queryFn).toHaveBeenCalledTimes(1)
    unsubscribe()
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
 * The standard refresh path shared by every workqueue-affecting write: the
 * by-id refetch, the counts and every workqueue, all at once.
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

  it('invalidates every workqueue and the counts, and refetches the byId entry', async () => {
    await refetchAffectedSearchQueries(eventId)

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: searchKeys.filters.allWorkqueues()
    })
    expect(refetchSpy).toHaveBeenCalledWith({
      queryKey: searchKeys.filters.byId(eventId)
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: trpcOptionsProxy.workqueue.count.queryKey()
    })
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

  it('invalidates every workqueue and the counts, and resets the byId entry', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const resetSpy = vi.spyOn(queryClient, 'resetQueries')

    await deleteLocalEvent(tennisClubMembershipEventDocument)

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: searchKeys.filters.allWorkqueues()
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: trpcOptionsProxy.workqueue.count.queryKey()
    })
    expect(resetSpy).toHaveBeenCalledWith({
      queryKey: searchKeys.filters.byId(tennisClubMembershipEventDocument.id)
    })
  })
})

/*
 * The assign mutation answers with the event document carrying only its last
 * action, so onAssign takes the branded EventDocumentOnlyLastAction.
 */
const assignedEvent = EventDocumentOnlyLastAction.parse({
  ...tennisClubMembershipEventDocument,
  actions: tennisClubMembershipEventDocument.actions
    .filter((action) => action.type === ActionType.ASSIGN)
    .slice(-1)
})

describe('onAssign — standard write path (ASSIGN)', () => {
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

  it('invalidates every workqueue and the counts, and refetches the byId entry', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const refetchSpy = vi.spyOn(queryClient, 'refetchQueries')

    await onAssign(assignedEvent)

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: searchKeys.filters.allWorkqueues()
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: trpcOptionsProxy.workqueue.count.queryKey()
    })
    expect(refetchSpy).toHaveBeenCalledWith({
      queryKey: searchKeys.filters.byId(assignedEvent.id)
    })
  })
})

describe('onAssign on a sealed record', () => {
  beforeEach(() => {
    queryClient.clear()
    addLocalEventConfig(tennisClubMembershipEvent)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('patches only the assignee, never rebuilding the redacted row from the local document', async () => {
    vi.spyOn(queryClient, 'refetchQueries').mockResolvedValue()
    const redactedRow = {
      id: assignedEvent.id,
      declaration: {},
      assignedTo: null
    } as unknown as EventIndex
    const workqueueKey = searchKeys.workqueue(workqueueInput, 'ready')
    queryClient.setQueryData(workqueueKey, { results: [redactedRow], total: 1 })
    setEventData(assignedEvent.id, tennisClubMembershipEventDocument)

    await onAssign(assignedEvent)

    const assignment = assignedEvent.actions[0] as { assignedTo: string }
    expect(queryClient.getQueryData(workqueueKey)?.results).toEqual([
      { ...redactedRow, assignedTo: assignment.assignedTo }
    ])
  })
})
