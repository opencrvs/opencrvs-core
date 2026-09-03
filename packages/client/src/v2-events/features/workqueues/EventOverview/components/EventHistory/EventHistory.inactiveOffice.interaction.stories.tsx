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
import { expect, waitFor, within } from 'storybook/test'
import {
  ActionType,
  generateEventDocument,
  getCurrentEventState,
  tennisClubMembershipEvent,
  TestUserRole,
  V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS,
  V2_DEFAULT_MOCK_LOCATIONS
} from '@opencrvs/commons/client'
import {
  AppRouter,
  queryClient,
  trpcOptionsProxy,
  TRPCProvider
} from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { buildInactiveLocation } from '@client/tests/v2-events/location.utils'
import { EventOverviewIndex } from '../../EventOverview'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const generator = testDataGenerator()
const localRegistrar = generator.user.localRegistrar().v2

const office = V2_DEFAULT_MOCK_LOCATIONS.find(
  (location) => location.id === localRegistrar.primaryOfficeId
)

if (!office?.locationType || !office.administrativeAreaId) {
  throw new Error(
    `Mock location ${localRegistrar.primaryOfficeId} is missing from V2_DEFAULT_MOCK_LOCATIONS`
  )
}

const inactiveOffice = buildInactiveLocation({
  id: office.id,
  name: office.name,
  locationType: office.locationType,
  administrativeAreaId: office.administrativeAreaId
})

const actingUser = {
  id: localRegistrar.id,
  primaryOfficeId: office.id,
  role: TestUserRole.enum.LOCAL_REGISTRAR
}

/*
 * The overview only renders its history once the record is assigned to the
 * signed-in user, so the trail ends on an ASSIGN to that same user.
 */
const event = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    { type: ActionType.CREATE, user: actingUser },
    { type: ActionType.DECLARE, user: actingUser },
    { type: ActionType.REGISTER, user: actingUser },
    {
      type: ActionType.ASSIGN,
      user: { ...actingUser, assignedTo: actingUser.id }
    }
  ]
})

/**
 * `EventHistory` reads the event, the user list and the location list from its
 * host page's contexts, so it is exercised through `EventOverviewIndex` on the
 * audit route rather than mounted on its own.
 */
const meta: Meta<typeof EventOverviewIndex> = {
  title: 'EventOverview/EventHistory/InactiveOffice',
  component: EventOverviewIndex,
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    chromatic: { disableSnapshot: true },
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
  },
  /*
   * The history resolves action creators from the cached `user.list` response,
   * which nothing populates in Storybook, so it is seeded here to make the
   * location cell render instead of "Missing user".
   */
  beforeEach: () => {
    queryClient.setQueryData(
      trpcOptionsProxy.user.list.queryKey([localRegistrar.id]),
      [localRegistrar]
    )
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

async function waitForHistoryTable(canvasElement: HTMLElement) {
  await waitFor(
    async () =>
      expect(
        canvasElement.querySelectorAll('#listTable-task-history button').length
      ).toBeGreaterThan(0),
    { timeout: 10000 }
  )
}

/** Baseline: an office still in service keeps its link to the Team page. */
export const ActiveOfficeIsLinked: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Wait for the event history table to load', async () => {
      await waitForHistoryTable(canvasElement)
    })

    await step('Every office name is a link', async () => {
      // One row per action, all performed at the same office.
      await expect(
        await canvas.findAllByRole('button', { name: office.name })
      ).not.toHaveLength(0)
    })
  }
}

/**
 * Regression test for: an office that has since been inactivated has no team
 * left to show, so its name in the audit trail must stay plain text rather
 * than open its Team page.
 */
export const InactiveOfficeIsNotLinked: Story = {
  parameters: {
    msw: {
      handlers: {
        eventLocations: [
          tRPCMsw.locations.list.query(() => [
            ...V2_DEFAULT_MOCK_LOCATIONS.filter(
              (location) => location.id !== office.id
            ),
            inactiveOffice
          ]),
          tRPCMsw.administrativeAreas.list.query(
            () => V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS
          )
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Wait for the event history table to load', async () => {
      await waitForHistoryTable(canvasElement)
    })

    await step('The office name still shows, as plain text', async () => {
      await expect(await canvas.findAllByText(office.name)).not.toHaveLength(0)
      await expect(
        canvas.queryAllByRole('button', { name: office.name })
      ).toHaveLength(0)
    })
  }
}
