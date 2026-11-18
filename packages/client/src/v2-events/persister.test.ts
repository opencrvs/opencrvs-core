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
import { PersistedClient } from '@tanstack/react-query-persist-client'
import { storage } from '@client/storage'
import { createIDBPersister } from './trpc'

const STORE = 'persister-test'
const LARGE_KEY = `react-query-large-query-storage-${STORE}`

type DehydratedQuery = PersistedClient['clientState']['queries'][number]

function largeQuery(queryHash: string, data: unknown): DehydratedQuery {
  return {
    queryHash,
    queryKey: [queryHash],
    meta: { useLargeQueryStorage: true },
    state: {
      data,
      dataUpdateCount: 1,
      dataUpdatedAt: Date.now(),
      error: null,
      errorUpdateCount: 0,
      errorUpdatedAt: 0,
      fetchFailureCount: 0,
      fetchFailureReason: null,
      fetchMeta: null,
      isInvalidated: false,
      status: 'success',
      fetchStatus: 'idle'
    }
  } as DehydratedQuery
}

function persistedClient(queries: DehydratedQuery[]): PersistedClient {
  return {
    timestamp: Date.now(),
    buster: '',
    clientState: { queries, mutations: [] }
  }
}

function largeWrites() {
  return vi
    .mocked(storage.setItem)
    .mock.calls.filter(([key]) => key === LARGE_KEY)
}

describe('createIDBPersister', () => {
  it('writes large queries only when their data reference changes', async () => {
    const persister = createIDBPersister(STORE)
    const locations = new Map([['a', 1]])

    await persister.persistClient(
      persistedClient([largeQuery('locations', locations)])
    )
    expect(largeWrites()).toHaveLength(1)

    // When a refetch returns the same map, the persister does not write it again.
    await persister.persistClient(
      persistedClient([largeQuery('locations', locations)])
    )
    expect(largeWrites()).toHaveLength(1)

    await persister.persistClient(
      persistedClient([largeQuery('locations', new Map(locations))])
    )
    expect(largeWrites()).toHaveLength(2)
  })

  it('writes when a large query is removed', async () => {
    const persister = createIDBPersister(STORE)
    const locations = new Map([['a', 1]])
    const orphan = new Map([['a', 1]])

    await persister.persistClient(
      persistedClient([
        largeQuery('locations', locations),
        largeQuery('orphan', orphan)
      ])
    )
    await persister.persistClient(
      persistedClient([largeQuery('locations', locations)])
    )

    expect(largeWrites()).toHaveLength(2)
    expect(largeWrites()[1][1]).toHaveLength(1)
  })

  it('does not write restored large queries back unchanged', async () => {
    const persister = createIDBPersister(STORE)
    const restored = largeQuery('locations', new Map([['a', 1]]))

    vi.mocked(storage.getItem).mockImplementation((key: string) =>
      Promise.resolve(key === LARGE_KEY ? [restored] : persistedClient([]))
    )

    const client = await persister.restoreClient()
    const [restoredQuery] = client?.clientState.queries ?? []

    await persister.persistClient(
      persistedClient([largeQuery('locations', restoredQuery.state.data)])
    )

    expect(largeWrites()).toHaveLength(0)
  })
})
