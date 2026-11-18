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
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { setupServer } from 'msw/node'
import superjson from 'superjson'
import {
  ClientLocation,
  Location,
  V2_DEFAULT_MOCK_LOCATIONS
} from '@opencrvs/commons/client'
import { SyncedCache } from '@client/v2-events/hooks/incremental-sync'
import {
  AppRouter,
  queryClient,
  trpcOptionsProxy
} from '@client/v2-events/trpc'
// `setupTests` mocks this module for all tests. These tests need the real
// query defaults, so they unmock it.
vi.unmock('@client/v2-events/hooks/useLocations')

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const [first, second] = V2_DEFAULT_MOCK_LOCATIONS
const older = { ...first, updatedAt: '2026-01-01T10:00:00.000Z' }
const newer = { ...second, updatedAt: '2026-01-02T10:00:00.000Z' }

const SYNCED_AT = '2026-01-04T10:00:00.000Z'

const listRequests: unknown[] = []
const syncRequests: unknown[] = []
let listResponse: Location[] = []
let syncResponse: Location[] = []

const server = setupServer(
  tRPCMsw.locations.list.query((input) => {
    listRequests.push(input)
    return listResponse
  }),
  tRPCMsw.locations.sync.query((input) => {
    syncRequests.push(input)
    return { syncedAt: SYNCED_AT, locations: syncResponse }
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
  listRequests.length = 0
  syncRequests.length = 0
})

async function fetchLocations() {
  const data = await queryClient.fetchQuery({
    queryKey: trpcOptionsProxy.locations.list.queryKey(),
    staleTime: 0
  })
  return data as unknown as SyncedCache<ClientLocation>
}

test('Does a full fetch without a cache, then syncs from the latest updatedAt', async () => {
  listResponse = [older, newer]
  const full = await fetchLocations()

  expect(listRequests).toEqual([undefined])
  expect(full.syncedAt).toBe(newer.updatedAt)
  expect([...full.rows.keys()]).toEqual([older.id, newer.id])
  // The flattened server fields are stripped from the cache.
  expect(full.rows.get(older.id)).not.toHaveProperty('name')

  const renamed = {
    ...older,
    versions: [{ ...older.versions[0], name: 'Renamed' }],
    updatedAt: '2026-01-03T10:00:00.000Z'
  }
  syncResponse = [renamed]
  const synced = await fetchLocations()

  expect(listRequests).toHaveLength(1)
  expect(syncRequests).toEqual([{ since: newer.updatedAt }])
  expect(synced.syncedAt).toBe(SYNCED_AT)
  expect(synced.rows.get(older.id)?.versions[0].name).toBe('Renamed')
  expect(synced.rows.get(newer.id)).toBe(full.rows.get(newer.id))

  syncResponse = []
  await fetchLocations()

  expect(syncRequests).toEqual([
    { since: newer.updatedAt },
    { since: SYNCED_AT }
  ])
})

test('Keeps the cached value when the sync returns nothing', async () => {
  listResponse = [older, newer]
  const full = await fetchLocations()

  syncResponse = []
  const synced = await fetchLocations()

  expect(synced).toBe(full)
})

test('Does a full fetch when the cache has the shape of an earlier client version', async () => {
  queryClient.setQueryData(
    trpcOptionsProxy.locations.list.queryKey(),
    new Map() as never
  )
  listResponse = [older]

  const full = await fetchLocations()

  expect(listRequests).toHaveLength(1)
  expect(syncRequests).toHaveLength(0)
  expect([...full.rows.keys()]).toEqual([older.id])
})
