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
import React, { PropsWithChildren } from 'react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import superjson from 'superjson'
import { vi } from 'vitest'
import {
  ActionStatus,
  ActionType,
  EventDocument,
  getUUID,
  TENNIS_CLUB_MEMBERSHIP,
  TokenUserType,
  UUID
} from '@opencrvs/commons/client'
import { AppRouter, queryClient, TRPCProvider } from '@client/v2-events/trpc'
import { createTestStore } from '@client/tests/util'
import { checkAuth } from '@client/profile/profileActions'
// Importing useUsers registers the smart queryFn for user.list via setQueryDefaults
// as a module-level side effect. Without this import cacheUsersFromEventDocument
// would have no queryFn to call when it invokes queryClient.fetchQuery.
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { cacheUsersFromEventDocument } from '@client/v2-events/features/users/cache'

// ── Stable test data (created once for the entire suite) ─────────────────────

/**
 * Five distinct user IDs that will be embedded in the event document actions.
 * Using getUUID() for each ensures there are no accidental duplicates.
 */
const USER_IDS = Array.from({ length: 5 }, () => getUUID() as UUID)

/**
 * Minimal UserSummary objects – no avatar or signature so precacheFile is
 * never triggered as a side-effect inside the smart queryFn.
 */
const USER_SUMMARIES = USER_IDS.map((id, i) => ({
  id,
  type: TokenUserType.enum.user,
  name: { firstname: `User${i + 1}`, surname: `Test${i + 1}` },
  role: 'FIELD_AGENT',
  primaryOfficeId: getUUID() as UUID
}))

/**
 * An EventDocument whose five actions each reference a different user via the
 * createdBy field – exactly the field that findUserIdsFromDocument inspects.
 */
const EVENT_DOCUMENT: EventDocument = {
  type: TENNIS_CLUB_MEMBERSHIP,
  id: getUUID() as UUID,
  trackingId: 'CACHE01',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  actions: USER_IDS.map((userId) => ({
    id: getUUID() as UUID,
    type: ActionType.DECLARE,
    status: ActionStatus.Accepted,
    createdBy: userId,
    createdByUserType: 'user' as const,
    createdByRole: 'FIELD_AGENT',
    createdAt: new Date().toISOString(),
    createdAtLocation: getUUID() as UUID,
    declaration: {},
    transactionId: getUUID()
  }))
}

// ── MSW / tRPC server ─────────────────────────────────────────────────────────

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

/** Tracks every HTTP call made to the user.list endpoint. */
const userListSpy = vi.fn()

const server = setupServer(
  tRPCMsw.user.list.query((ids) => {
    userListSpy(ids)
    return USER_SUMMARIES.filter((u) => (ids as string[]).includes(u.id))
  })
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  userListSpy.mockClear()
  queryClient.clear()
})
afterAll(() => server.close())

// ── React wrapper ─────────────────────────────────────────────────────────────

async function makeWrapper() {
  const { store } = await createTestStore()
  store.dispatch(checkAuth())
  return function Wrapper({ children }: PropsWithChildren) {
    return React.createElement(
      Provider,
      { store },
      React.createElement(TRPCProvider, {
        waitForClientRestored: false,
        children
      })
    )
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('user summary caching after event download', () => {
  /**
   * When a record is downloaded (event.get's queryFn calls
   * cacheUsersFromEventDocument), all users referenced in the document's
   * actions must be fetched from the server and stored in the React Query
   * cache so they are available for offline rendering.
   */
  test('caches all users referenced in a downloaded event document', async () => {
    const wrapper = await makeWrapper()

    // Simulate what event.get's queryFn does after receiving the event document.
    await cacheUsersFromEventDocument(EVENT_DOCUMENT)

    // The server should have been hit exactly once, with all 5 user IDs.
    expect(userListSpy).toHaveBeenCalledTimes(1)
    expect(userListSpy).toHaveBeenCalledWith(expect.arrayContaining(USER_IDS))

    // All 5 users must now be readable from the React Query cache via the
    // same hook that components use when rendering a record.
    const { result } = renderHook(() => useUsers(), { wrapper })
    const cached = result.current.getUsers.getAllCached()

    expect(cached).toHaveLength(5)
    expect(cached.map((u) => u.id)).toEqual(expect.arrayContaining(USER_IDS))
  })

  /**
   * After the record is downloaded and the cache is warm, components must be
   * able to retrieve the full set of referenced users without any network
   * request — this is what makes record rendering work while offline.
   */
  test('resolves the full set of cached users without a network request (simulating offline)', async () => {
    const wrapper = await makeWrapper()

    // Warm the cache exactly as downloading a record would.
    await cacheUsersFromEventDocument(EVENT_DOCUMENT)
    userListSpy.mockClear()

    // Ask for all 5 users through the hook that record-rendering components use.
    const { result } = renderHook(
      () => useUsers().getUsers.useQuery(USER_IDS),
      { wrapper }
    )

    // The hook must resolve successfully.
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(5)
    expect(result.current.data?.map((u) => u.id)).toEqual(
      expect.arrayContaining(USER_IDS)
    )

    // Critically: the smart queryFn found all IDs in the cache and returned
    // them without ever touching the network.
    expect(userListSpy).not.toHaveBeenCalled()
  })

  /**
   * The smart queryFn registered by setQueryDefaults scans *all* user.list
   * cache entries when resolving a query. This means that even a query with a
   * different key (a subset of IDs) is satisfied from the existing cache entry
   * without a network round-trip — a critical property for offline resilience.
   */
  test('resolves a subset of cached users without a network request', async () => {
    const wrapper = await makeWrapper()

    // Cache all 5 users via the event-download path.
    await cacheUsersFromEventDocument(EVENT_DOCUMENT)
    userListSpy.mockClear()

    // Request 3 of the 5 users. This produces a query key the cache has never
    // seen before ([id0, id2, id4] vs the original [id0..id4]).
    const subset = [USER_IDS[0], USER_IDS[2], USER_IDS[4]]
    const { result } = renderHook(() => useUsers().getUsers.useQuery(subset), {
      wrapper
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(3)
    expect(result.current.data?.map((u) => u.id)).toEqual(
      expect.arrayContaining(subset)
    )

    // The cross-cache scan in the smart queryFn found the 3 users inside the
    // existing 5-user cache entry — no new HTTP request was needed.
    expect(userListSpy).not.toHaveBeenCalled()
  })
})
