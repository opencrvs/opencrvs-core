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

import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { expect, waitFor } from 'storybook/test'
import {
  getCurrentEventState,
  TestUserRole,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import {
  AppRouter,
  queryClient,
  trpcOptionsProxy,
  TRPCProvider
} from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { EventOverviewIndex } from '../../EventOverview'

/**
 * `EventHistory` reads the event, the user list and the location list from its
 * host page's contexts, so it is exercised through `EventOverviewIndex` on the
 * audit route rather than mounted on its own.
 */
const meta: Meta<typeof EventOverviewIndex> = {
  title: 'EventOverview/EventHistory',
  component: EventOverviewIndex,
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR
  },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof EventOverviewIndex>

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const localRegistrar = testDataGenerator().user

const event = tennisClubMembershipEventDocument

const auditRouteParameters = {
  offline: {
    events: [event]
  },
  reactRouter: {
    router: routesConfig,
    initialPath: ROUTES.V2.EVENTS.EVENT.AUDIT.buildPath({
      eventId: event.id
    })
  },
  msw: {
    handlers: {
      events: [
        tRPCMsw.event.search.query(() => ({
          results: [getCurrentEventState(event, tennisClubMembershipEvent)],
          total: 1
        }))
      ]
    }
  }
}

/**
 * Regression test for: history links wrap onto several lines in narrow columns,
 * so their text must stay left aligned instead of inheriting the alignment of
 * the surrounding table cell.
 */
export const HistoryLinksAreLeftAligned: Story = {
  tags: ['link-alignment-regression'],
  parameters: {
    ...auditRouteParameters,
    chromatic: { disableSnapshot: true }
  },
  /*
   * The history resolves action creators from the cached `user.list` response,
   * which nothing populates in Storybook, so it is seeded here to make the
   * action creator link render instead of "Missing user".
   */
  beforeEach: () => {
    queryClient.setQueryData(
      trpcOptionsProxy.user.list.queryKey([localRegistrar.id.localRegistrar]),
      [localRegistrar.localRegistrar().v2]
    )
  },
  play: async ({ canvasElement, step }) => {
    await step('Wait for the event history table to load', async () => {
      await waitFor(
        async () =>
          expect(
            canvasElement.querySelectorAll('#listTable-task-history button')
              .length
          ).toBeGreaterThan(0),
        { timeout: 10000 }
      )
    })

    await step('Every history link renders its text left aligned', async () => {
      const links = Array.from(
        canvasElement.querySelectorAll<HTMLElement>(
          '#listTable-task-history button'
        )
      )

      for (const link of links) {
        await expect(getComputedStyle(link).textAlign).toBe('left')
      }
    })

    await step('The action creator link is left aligned', async () => {
      const profileLink = await waitFor(
        () => {
          const element =
            canvasElement.querySelector<HTMLElement>('#profile-link')
          if (!element) {
            throw new Error('Action creator link not rendered')
          }
          return element
        },
        { timeout: 5000 }
      )

      await expect(getComputedStyle(profileLink).textAlign).toBe('left')
    })
  }
}
