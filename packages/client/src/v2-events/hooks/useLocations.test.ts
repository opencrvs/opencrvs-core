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
import { createElement, PropsWithChildren, Suspense } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { setupServer } from 'msw/node'
import {
  ClientLocation,
  Location,
  toClientLocation,
  V2_DEFAULT_MOCK_LOCATIONS
} from '@opencrvs/commons/client'
import { SyncedCache } from '@client/v2-events/hooks/incremental-sync'
import {
  AppRouter,
  queryClient,
  trpcOptionsProxy,
  TRPCProvider
} from '@client/v2-events/trpc'
// `setupTests` mocks this module for all tests. These tests need the real
// query defaults, so they unmock it.
vi.unmock('@client/v2-events/hooks/useLocations')

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })]
})

const [first, second] = V2_DEFAULT_MOCK_LOCATIONS
const older = { ...first, updatedAt: '2026-01-01T10:00:00.000Z' }
const newer = { ...second, updatedAt: '2026-01-02T10:00:00.000Z' }

const FIRST_SYNCED_AT = '2026-01-03T10:00:00.000Z'
const SYNCED_AT = '2026-01-04T10:00:00.000Z'

const syncRequests: unknown[] = []
let syncResponse: { syncedAt: string; locations: Location[] } = {
  syncedAt: SYNCED_AT,
  locations: []
}

const server = setupServer(
  tRPCMsw.locations.sync.query((input) => {
    syncRequests.push(input)
    return syncResponse
  })
)

beforeAll(async () => {
  // When the module loads, it registers the query defaults of `locations.list`.
  await import('./useLocations')
  server.listen()
})
afterAll(() => server.close())

beforeEach(() => {
  queryClient.clear()
  syncRequests.length = 0
})

function wrapper({ children }: PropsWithChildren) {
  return createElement(TRPCProvider, {
    waitForClientRestored: false,
    children: createElement(Suspense, { fallback: null }, children)
  })
}

async function fetchLocations() {
  const data = await queryClient.fetchQuery({
    queryKey: trpcOptionsProxy.locations.list.queryKey(),
    staleTime: 0
  })
  return data as unknown as SyncedCache<ClientLocation>
}

test('Fetches all rows with `sync` and no `since` without a cache, then syncs from `syncedAt`', async () => {
  syncResponse = { syncedAt: FIRST_SYNCED_AT, locations: [older, newer] }
  const full = await fetchLocations()

  expect(syncRequests).toEqual([{}])
  expect(full.syncedAt).toBe(FIRST_SYNCED_AT)
  expect([...full.rows.keys()]).toEqual([older.id, newer.id])
  // The flattened server fields are stripped from the cache.
  expect(full.rows.get(older.id)).not.toHaveProperty('name')

  const renamed = {
    ...older,
    versions: [{ ...older.versions[0], name: 'Renamed' }],
    updatedAt: '2026-01-03T10:00:00.000Z'
  }
  syncResponse = { syncedAt: SYNCED_AT, locations: [renamed] }
  const synced = await fetchLocations()

  expect(syncRequests).toEqual([{}, { since: FIRST_SYNCED_AT }])
  expect(synced.syncedAt).toBe(SYNCED_AT)
  expect(synced.rows.get(older.id)?.versions[0].name).toBe('Renamed')
  expect(synced.rows.get(newer.id)).toBe(full.rows.get(newer.id))
})

test('Keeps the cached value when the sync returns nothing', async () => {
  syncResponse = { syncedAt: FIRST_SYNCED_AT, locations: [older, newer] }
  const full = await fetchLocations()

  syncResponse = { syncedAt: SYNCED_AT, locations: [] }
  const synced = await fetchLocations()

  expect(synced).toBe(full)
})

test('Fetches all rows when the cache is a map of an earlier client version', async () => {
  queryClient.setQueryData(
    trpcOptionsProxy.locations.list.queryKey(),
    new Map() as never
  )
  syncResponse = { syncedAt: FIRST_SYNCED_AT, locations: [older] }

  const full = await fetchLocations()

  expect(syncRequests).toEqual([{}])
  expect([...full.rows.keys()]).toEqual([older.id])
})

test('Renders the rows of a map that an earlier client version cached', async () => {
  const legacy = new Map([[older.id, toClientLocation(older)]])
  // A fresh entry, so that the hook renders it without a fetch, as it does
  // offline.
  queryClient.setQueryData(
    trpcOptionsProxy.locations.list.queryKey(),
    legacy as never
  )
  const { useLocations } = await import('./useLocations')

  const { result } = renderHook(
    () => useLocations().getLocations.useSuspenseQuery(),
    { wrapper }
  )

  await waitFor(() => expect(result.current).toBe(legacy))
  expect(syncRequests).toEqual([])
})
