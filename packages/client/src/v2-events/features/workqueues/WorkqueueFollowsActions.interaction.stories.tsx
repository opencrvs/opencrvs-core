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
import superjson from 'superjson'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { getWorker } from 'msw-storybook-addon'
import { userEvent, within, expect, waitFor } from 'storybook/test'
import { onlineManager } from '@tanstack/react-query'
import {
  ActionType,
  EventDocumentOnlyLastAction,
  eventQueryDataGenerator,
  generateActionDocument,
  generateEventDocument,
  generateWorkqueues,
  getCurrentEventState,
  tennisClubMembershipEvent,
  TestUserRole
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { WorkqueueIndex } from './index'

const meta: Meta<typeof WorkqueueIndex> = {
  title: 'Workqueue/FollowsActions',
  component: WorkqueueIndex,
  beforeEach: () => {
    onlineManager.setOnline(true)
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
type Story = StoryObj<typeof WorkqueueIndex>

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const declared = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    { type: ActionType.CREATE },
    {
      type: ActionType.DECLARE,
      declarationOverrides: {
        'applicant.name': { firstname: 'Riku', surname: 'Rouvila' }
      }
    }
  ]
})
const declaredRow = getCurrentEventState(declared, tennisClubMembershipEvent)
const otherRows = [
  eventQueryDataGenerator(undefined, 52),
  eventQueryDataGenerator(undefined, 104)
]
const queueBefore = [declaredRow, ...otherRows]

/** Serves `rows` as the `recent` queue and its size as the queue's count. */
function recentQueueHandlers(rows: () => typeof queueBefore) {
  return [
    tRPCMsw.workqueue.count.query((input) =>
      input.reduce(
        (acc, { slug }) => ({ ...acc, [slug]: rows().length }),
        {} as Record<string, number>
      )
    ),
    tRPCMsw.event.search.query(() => ({
      results: rows(),
      total: rows().length
    }))
  ]
}

/**
 * Assigning a record from the queue takes it out of the queue on screen, and
 * the sidebar count follows, without waiting for either poll.
 */
export const AssignTakesTheRecordOutOfTheQueue: Story = {
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
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
          )
        ],
        event: [
          tRPCMsw.event.getDuplicates.query(() => []),
          tRPCMsw.event.get.query(() => declared),
          ...recentQueueHandlers(() => queueBefore)
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const rows = () => canvasElement.querySelectorAll('div[id^="row_"]')

    await step('The queue shows the record among 3 rows', async () => {
      await canvas.findByText('Riku Rouvila', {}, { timeout: 5000 })
      await expect(rows()).toHaveLength(3)
      await expect(
        await canvas.findByTestId('navigation_workqueue_recent')
      ).toHaveTextContent('3')
    })

    await step('Assign the record', async () => {
      // Once the server takes the ASSIGN, the record is no longer in the queue.
      let assigned = false
      getWorker().use(
        tRPCMsw.event.actions.assignment.assign.mutation(() => {
          assigned = true
          return EventDocumentOnlyLastAction.parse({
            ...declared,
            actions: [
              generateActionDocument({
                configuration: tennisClubMembershipEvent,
                action: ActionType.ASSIGN
              })
            ]
          })
        }),
        ...recentQueueHandlers(() => (assigned ? otherRows : queueBefore))
      )

      await userEvent.click(await canvas.findByTestId('ListItemAction-0-icon'))
      await userEvent.click(await canvas.findByTestId('assign'))
    })

    await step('The record leaves the queue and the count drops', async () => {
      await waitFor(
        async () => {
          await expect(canvas.queryByText('Riku Rouvila')).toBeNull()
          await expect(rows()).toHaveLength(2)
          await expect(
            canvas.getByTestId('navigation_workqueue_recent')
          ).toHaveTextContent('2')
        },
        { timeout: 5000 }
      )
    })
  }
}
