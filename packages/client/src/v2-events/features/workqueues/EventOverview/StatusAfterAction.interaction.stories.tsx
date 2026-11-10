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
import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { delay } from 'msw'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import {
  ActionType,
  EventDocument,
  generateActionDocuments,
  generateEventDocument,
  generateWorkqueues,
  getCurrentEventState,
  tennisClubMembershipEvent,
  TestUserRole
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter, queryClient, TRPCProvider } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { setEventData } from '@client/v2-events/features/events/useEvents/api'
import { EventOverviewIndex } from './EventOverview'

const meta: Meta<typeof EventOverviewIndex> = {
  title: 'EventOverview/StatusAfterAction',
  component: EventOverviewIndex,
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

const localRegistrarId = testDataGenerator().user.id.localRegistrar

// A declared record that the local registrar has assigned to themself, so the
// "Register" quick action is available on the event overview.
const declared = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    { type: ActionType.CREATE },
    {
      type: ActionType.DECLARE,
      declarationOverrides: {
        'applicant.name': { firstname: 'Riku', surname: 'Rouvila' }
      }
    },
    { type: ActionType.ASSIGN, user: { assignedTo: localRegistrarId } }
  ]
})

const registered: EventDocument = {
  ...declared,
  actions: [
    ...declared.actions,
    // The quick action registers the record without changes to the declaration.
    ...generateActionDocuments({
      configuration: tennisClubMembershipEvent,
      action: ActionType.REGISTER,
      defaults: { declaration: {} }
    })
  ]
}

/*
 * The search is slow after the register action. The overview must not show a
 * status from the local cache while it waits for the server.
 */
const SLOW_SEARCH_MS = 2000

let isRegistered = false

function currentDocument() {
  return isRegistered ? registered : declared
}

/**
 * Issue #13729: after an action changes the status of a record, the overview
 * showed the previous status for a moment when the user opened the record
 * again.
 */
export const DoesNotShowPreviousStatusAfterRegister: Story = {
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    // The by-id search entry must not be seeded with setQueryData. The app
    // creates it from the workqueue row when the user opens the record.
    offline: { events: [] },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: 'recent' })
    },
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        workqueues: [
          tRPCMsw.workqueue.config.list.query(() =>
            generateWorkqueues('recent')
          ),
          tRPCMsw.workqueue.count.query((input) =>
            input.reduce(
              (acc, { slug }) => ({ ...acc, [slug]: 1 }),
              {} as Record<string, number>
            )
          )
        ],
        event: [
          tRPCMsw.event.getDuplicates.query(() => []),
          tRPCMsw.event.get.query(() => currentDocument()),
          tRPCMsw.event.search.query(async () => {
            if (isRegistered) {
              await delay(SLOW_SEARCH_MS)
            }
            return {
              results: [
                getCurrentEventState(
                  currentDocument(),
                  tennisClubMembershipEvent
                )
              ],
              total: 1
            }
          }),
          tRPCMsw.event.actions.register.request.mutation(() => {
            isRegistered = true
            return registered
          })
        ]
      }
    }
  },
  beforeEach: () => {
    isRegistered = false
    // The registrar has downloaded the record when they assigned it.
    setEventData(declared.id, declared)
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Open the declared record from the workqueue', async () => {
      await userEvent.click(
        await canvas.findByText('Riku Rouvila', {}, { timeout: 5000 })
      )
      await waitFor(
        async () =>
          expect(await canvas.findByTestId('status-value')).toHaveTextContent(
            'Declared'
          ),
        { timeout: 5000 }
      )
    })

    await step('Register the record with the quick action', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Action' })
      )
      await userEvent.click(await screen.findByText('Register'))
      await userEvent.click(
        await screen.findByRole('button', { name: 'Confirm' })
      )

      // Wait until the client has processed the register action and the
      // requests that follow it. The user opens the record later, so the
      // cache must be in its final state.
      await waitFor(
        async () => {
          await expect(isRegistered).toBe(true)
          await expect(queryClient.isMutating()).toBe(0)
          await expect(queryClient.isFetching()).toBe(0)
        },
        { timeout: SLOW_SEARCH_MS * 3 }
      )
    })

    await step('Open the record again', async () => {
      await userEvent.click(
        await canvas.findByText('Riku Rouvila', {}, { timeout: 5000 })
      )

      // The search for the record is still in progress. The first status that
      // the overview shows must be the current status.
      const status = await canvas.findByTestId(
        'status-value',
        {},
        { timeout: SLOW_SEARCH_MS * 2 }
      )
      await expect(status).not.toHaveTextContent('Declared')
      await expect(status).toHaveTextContent('Registered')
    })
  }
}
