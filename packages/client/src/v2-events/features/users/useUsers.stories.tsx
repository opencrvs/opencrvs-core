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
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { within, waitFor, expect } from '@storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import {
  ActionType,
  generateEventDocument,
  tennisClubMembershipEvent,
  TestUserRole,
  TokenUserType,
  UserSummary
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { cacheUsersFromEventDocument } from '@client/v2-events/features/users/cache'

// ── Stable test data ──────────────────────────────────────────────────────────

const generator = testDataGenerator()

/**
 * The five user IDs in the same order that findUserIdsFromDocument will
 * extract them from the event document's actions.  Preserving this order
 * matters: it makes the query key produced by getUsers.useQuery an exact
 * match with the cache entry that cacheUsersFromEventDocument wrote, so the
 * full-set hook can resolve immediately from cache.
 */
const REFERENCED_USER_IDS = [
  generator.user.id.fieldAgent,
  generator.user.id.registrationAgent,
  generator.user.id.localRegistrar,
  generator.user.id.communityLeader,
  generator.user.id.provincialRegistrar
]

/**
 * Three of the five IDs. This deliberately creates a cache key that has never
 * been stored, exercising the smart queryFn's cross-entry scan.
 */
const SUBSET_USER_IDS = [
  generator.user.id.fieldAgent,
  generator.user.id.localRegistrar,
  generator.user.id.provincialRegistrar
]

/**
 * A record document whose five actions are each attributed to a different
 * user, exactly as a record downloaded from the server would look.
 */
const eventWithFiveUsers = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    {
      type: ActionType.CREATE,
      user: {
        id: generator.user.id.fieldAgent,
        role: TestUserRole.enum.FIELD_AGENT
      }
    },
    {
      type: ActionType.DECLARE,
      user: {
        id: generator.user.id.registrationAgent,
        role: TestUserRole.enum.REGISTRATION_AGENT
      }
    },
    {
      type: ActionType.REGISTER,
      user: {
        id: generator.user.id.localRegistrar,
        role: TestUserRole.enum.LOCAL_REGISTRAR
      }
    },
    {
      type: ActionType.ASSIGN,
      user: {
        id: generator.user.id.communityLeader,
        role: TestUserRole.enum.COMMUNITY_LEADER,
        assignedTo: generator.user.id.communityLeader
      }
    },
    {
      type: ActionType.UNASSIGN,
      user: {
        id: generator.user.id.provincialRegistrar,
        role: TestUserRole.enum.PROVINCIAL_REGISTRAR
      }
    }
  ]
})

// ── MSW / spy setup ───────────────────────────────────────────────────────────

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

/**
 * Simple mutable counter. Storybook runs in a real browser so vi.fn() is not
 * available. Reset in each story's loaders to keep runs isolated.
 */
const spies = { userList: 0 }

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Uses two independent getUsers.useQuery calls to show that the warm cache
 * (populated by the story loader) is sufficient for both:
 *
 *   full set  – identical query key → resolved directly from the cache entry
 *   subset    – different query key → smart queryFn scans all user.list
 *               entries and finds the three users without touching the network
 */
function UserCachingDemo() {
  const fullSet = useUsers().getUsers.useQuery(REFERENCED_USER_IDS)
  const subset = useUsers().getUsers.useQuery(SUBSET_USER_IDS)

  // UserOrSystemSummary is a discriminated union; narrow to UserSummary so we
  // can safely access the structured { firstname, surname } name object.
  const asUsers = (data: typeof fullSet.data) =>
    (data ?? []).filter(
      (u): u is UserSummary => u.type === TokenUserType.enum.user
    )

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <section>
        <h2>{'Full set – 5 users'}</h2>
        {asUsers(fullSet.data).map((u) => (
          <p key={u.id} data-testid={`full-${u.id}`}>
            {u.name.firstname} {u.name.surname}
          </p>
        ))}
      </section>

      <section style={{ marginTop: '1rem' }}>
        <h2>{'Subset – 3 users (different cache key)'}</h2>
        {asUsers(subset.data).map((u) => (
          <p key={u.id} data-testid={`subset-${u.id}`}>
            {u.name.firstname} {u.name.surname}
          </p>
        ))}
      </section>
    </div>
  )
}

// ── Story ─────────────────────────────────────────────────────────────────────

const meta: Meta<unknown> = {
  title: 'Hooks/useUsers'
}

export default meta

type Story = StoryObj<unknown>

export const CachesUsersOnEventDownload: Story = {
  name: 'Caches referenced users when a record is downloaded; serves them without network when offline',

  loaders: [
    /**
     * Reset the spy so each Storybook test run starts with a clean count.
     * This loader runs after the global preview loader that calls
     * queryClient.clear(), so the cache is empty when the next loader fires.
     */
    () => {
      spies.userList = 0
    },

    /**
     * Simulate the side-effect that event.get's queryFn performs after
     * fetching a record: it calls cacheUsersFromEventDocument so that all
     * users referenced in the record's audit trail are pre-cached for offline
     * use.  By doing this in a loader (before the component mounts) we can
     * assert in the play function that the component hooks never had to reach
     * the network.
     */
    async () => {
      await cacheUsersFromEventDocument(eventWithFiveUsers)
    }
  ],

  parameters: {
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        /**
         * Override only the user.list handler so we can track call counts.
         * All other default handlers (event.config.get, user.get, …) remain
         * active through the global preview.tsx MSW configuration.
         */
        user: [
          tRPCMsw.user.get.query(() => {
            return generator.user.localRegistrar().v2
          }),
          tRPCMsw.user.list.query((ids) => {
            spies.userList++
            const allUsers = [
              generator.user.fieldAgent().v2,
              generator.user.registrationAgent().v2,
              generator.user.localRegistrar().v2,
              generator.user.communityLeader().v2,
              generator.user.provincialRegistrar().v2
            ]
            return allUsers.filter((u) => (ids as string[]).includes(u.id))
          })
        ]
      }
    }
  },

  render: () => <UserCachingDemo />,

  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'All 5 users cached during record download are rendered by the full-set hook',
      async () => {
        for (const id of REFERENCED_USER_IDS) {
          await waitFor(
            () => expect(canvas.getByTestId(`full-${id}`)).toBeInTheDocument(),
            { timeout: 5000 }
          )
        }
      }
    )

    await step(
      'user.list was called exactly once – the loader warmed the entire cache in a single request',
      async () => {
        await waitFor(() => expect(spies.userList).toBe(1))
      }
    )

    await step(
      'The 3-user subset hook (a previously-unseen cache key) resolves from the existing cache entry with no additional network call',
      async () => {
        for (const id of SUBSET_USER_IDS) {
          await waitFor(
            () =>
              expect(canvas.getByTestId(`subset-${id}`)).toBeInTheDocument(),
            { timeout: 5000 }
          )
        }

        // The spy must not have grown: the smart queryFn's cross-entry scan
        // satisfied the subset query purely from the already-cached 5-user entry.
        await waitFor(() => expect(spies.userList).toBe(1))
      }
    )
  }
}
