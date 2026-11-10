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
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { serialize } from 'superjson'
import {
  EventDocument,
  EventIndex,
  EventStatus,
  versionedTennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import {
  addLocalEventConfig,
  deleteLocalEvent,
  findLocalEventConfig,
  findLocalEventIndex,
  seedLocalEventIndex,
  updateLocalEventIndex
} from './api'
import {
  byIdSearchKey,
  byIdSearchOptions,
  taggedKey
} from './procedures/search'

describe('deleteLocalEvent', () => {
  const eventDocument = tennisClubMembershipEventDocument
  const { id } = eventDocument
  const server = setupServer()

  /** Answers every event.search request with the given row of the record. */
  function serveSearchResult(row: EventIndex) {
    server.use(
      http.get('/api/events/event.search', () =>
        HttpResponse.json({
          result: {
            data: serialize({ results: [row], total: 1 }),
            type: 'data'
          }
        })
      )
    )
  }

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

  beforeEach(() => {
    global.caches = {
      keys: vi.fn().mockResolvedValue([])
    } as unknown as CacheStorage
    queryClient.clear()
    addLocalEventConfig(versionedTennisClubMembershipEvent)
  })

  afterEach(() => server.resetHandlers())

  afterAll(() => {
    server.close()
    queryClient.clear()
  })

  it('clears the event document', async () => {
    serveSearchResult({ id } as EventIndex)
    queryClient.setQueryData(
      trpcOptionsProxy.event.get.queryKey({ eventId: id }),
      eventDocument
    )

    await deleteLocalEvent(eventDocument)

    expect(
      queryClient.getQueryData(
        trpcOptionsProxy.event.get.queryKey({ eventId: id })
      )
    ).toBeUndefined()
  })

  it('replaces the by-id search entry with the state of the record on the server', async () => {
    const declared = { id, status: EventStatus.enum.DECLARED } as EventIndex
    serveSearchResult(declared)

    // searchEventById creates the by-id entry with initialData, which is the
    // row that the cache has when the user opens the record.
    const observer = new QueryObserver(queryClient, {
      ...byIdSearchOptions(id, () => ({ results: [], total: 0 })),
      initialData: { results: [declared], total: 1 }
    })
    // The user opens the record. The overview fetches the record, and then the
    // user leaves the overview.
    const unsubscribe = observer.subscribe(() => undefined)
    await vi.waitFor(() =>
      expect(
        queryClient.getQueryState(byIdSearchKey(id))?.dataUpdateCount
      ).toBe(1)
    )
    unsubscribe()

    // The user registers the record.
    serveSearchResult({ id, status: EventStatus.enum.REGISTERED } as EventIndex)
    await deleteLocalEvent(eventDocument)

    // A reset would put back the initialData, and the overview would show
    // the previous status (#13729).
    expect(
      queryClient.getQueryData(byIdSearchKey(id))?.results[0]?.status
    ).toBe(EventStatus.enum.REGISTERED)
  })
})

describe('updateLocalEventIndex', () => {
  beforeEach(() => {
    queryClient.clear()
    addLocalEventConfig(versionedTennisClubMembershipEvent)
  })

  afterAll(() => {
    queryClient.clear()
  })

  it('updates the row in a tagged workqueue entry and preserves its total', () => {
    const eventDocument = tennisClubMembershipEventDocument

    // Prepare a cached query simulating a workqueue result
    const queryKey = taggedKey(
      { query: { type: 'and', clauses: [{ status: 'PENDING' }] } },
      ['workqueue', 'recent']
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

describe('findLocalEventConfig', () => {
  const eventDocument = tennisClubMembershipEventDocument

  beforeEach(() => {
    queryClient.clear()
    addLocalEventConfig(versionedTennisClubMembershipEvent)
  })

  afterAll(() => {
    queryClient.clear()
  })

  it("finds the cached configuration of the record's version", () => {
    expect(findLocalEventConfig(eventDocument)).toMatchObject({
      id: eventDocument.type
    })
  })

  it("is undefined when the record's version is not cached", () => {
    expect(
      findLocalEventConfig({ ...eventDocument, configVersionId: 'v9' })
    ).toBeUndefined()
  })

  it('leaves the record unseeded when its version is not cached', () => {
    seedLocalEventIndex(eventDocument.id, {
      ...eventDocument,
      configVersionId: 'v9'
    })

    expect(findLocalEventIndex(eventDocument.id)).toBeUndefined()
  })
})
