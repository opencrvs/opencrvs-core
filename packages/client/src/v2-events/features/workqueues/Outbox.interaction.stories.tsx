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
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { userEvent, within, expect, waitFor } from '@storybook/test'
import { TRPCError } from '@trpc/server'
import {
  ActionType,
  tennisClubMembershipEvent,
  generateEventDocument,
  getCurrentEventState,
  footballClubMembershipEvent,
  TestUserRole,
  UUID,
  generateEventDraftDocument
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import { ReviewIndex } from '../events/actions/declare/Review'

function getDeclareEventDocument(id: UUID) {
  return generateEventDocument({
    configuration: tennisClubMembershipEvent,
    actions: [{ type: ActionType.CREATE }, { type: ActionType.DECLARE }],
    defaults: {
      id
    }
  })
}

const meta: Meta<typeof ReviewIndex> = {
  title: 'Outbox/Interaction'
}

export default meta

const OUTBOX_FREEZE_TIME = 5 * 1000 // 5 seconds

type Story = StoryObj<typeof ReviewIndex>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const successfulMutationEvent = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [{ type: ActionType.CREATE }]
})

export const SuccessfulMutation: Story = {
  parameters: {
    userRole: TestUserRole.enum.FIELD_AGENT,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: successfulMutationEvent.id
      })
    },
    chromatic: { disableSnapshot: true },
    offline: {
      drafts: [
        generateEventDraftDocument({
          eventId: successfulMutationEvent.id,
          actionType: ActionType.DECLARE
        })
      ],
      events: [successfulMutationEvent],
      configs: [tennisClubMembershipEvent, footballClubMembershipEvent]
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.create.mutation(() => {
            return successfulMutationEvent
          }),
          tRPCMsw.event.actions.declare.request.mutation(async () => {
            await new Promise((resolve) =>
              setTimeout(resolve, OUTBOX_FREEZE_TIME)
            )
            return getDeclareEventDocument(successfulMutationEvent.id)
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Send for review', async () => {
      const submitButton = await canvas.findByText('Send for review')
      await userEvent.click(submitButton)
      const confirmButton = await canvas.findByText('Confirm')
      await userEvent.click(confirmButton)
      const outboxButton = await canvas.findByTestId(
        'navigation_workqueue_outbox'
      )
      await expect(outboxButton).toHaveTextContent(/^Outbox1$/)

      await userEvent.click(outboxButton)

      const searchResult = await canvas.findByTestId('search-result')
      const { firstname, surname } = getCurrentEventState(
        getDeclareEventDocument(successfulMutationEvent.id),
        tennisClubMembershipEvent
      ).declaration['applicant.name'] as {
        firstname: string
        surname: string
      }

      await expect(searchResult).toHaveTextContent(`${firstname} ${surname}`)

      await waitFor(
        async () => {
          await expect(searchResult).not.toHaveTextContent(
            `${firstname} ${surname}`
          )
        },
        { timeout: OUTBOX_FREEZE_TIME + 1000 } // Allow some buffer for the freeze time
      )

      const outboxButton2 = await canvas.findByTestId(
        'navigation_workqueue_outbox'
      )
      await expect(outboxButton2).toHaveTextContent(/^Outbox$/)
    })
  }
}

const failedMutationEvent = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [{ type: ActionType.CREATE }]
})

export const FailedMutation: Story = {
  parameters: {
    userRole: TestUserRole.enum.FIELD_AGENT,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: failedMutationEvent.id
      })
    },
    chromatic: { disableSnapshot: true },
    offline: {
      drafts: [
        generateEventDraftDocument({
          eventId: failedMutationEvent.id,
          actionType: ActionType.DECLARE
        })
      ],
      events: [failedMutationEvent],
      configs: [tennisClubMembershipEvent, footballClubMembershipEvent]
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.create.mutation(() => {
            return failedMutationEvent
          }),
          tRPCMsw.event.actions.declare.request.mutation(async () => {
            await new Promise((resolve) =>
              setTimeout(resolve, OUTBOX_FREEZE_TIME)
            )
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR'
            })
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Send for review', async () => {
      const submitButton = await canvas.findByText('Send for review')
      await userEvent.click(submitButton)
      const confirmButton = await canvas.findByText('Confirm')
      await userEvent.click(confirmButton)
      const outboxButton = await canvas.findByTestId(
        'navigation_workqueue_outbox'
      )
      await expect(outboxButton).toHaveTextContent(/^Outbox1$/)

      await userEvent.click(outboxButton)

      const searchResult = await canvas.findByTestId('search-result')
      const { firstname, surname } = getCurrentEventState(
        getDeclareEventDocument(failedMutationEvent.id),
        tennisClubMembershipEvent
      ).declaration['applicant.name'] as {
        firstname: string
        surname: string
      }

      await expect(searchResult).toHaveTextContent(`${firstname} ${surname}`)

      await new Promise((resolve) =>
        setTimeout(resolve, OUTBOX_FREEZE_TIME + 1000)
      ) // Allow some buffer for the freeze time

      const outboxButton2 = await canvas.findByTestId(
        'navigation_workqueue_outbox'
      )
      await expect(outboxButton2).toHaveTextContent(/^Outbox1$/)
    })
  }
}

const failedMutationConflictEvent = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [{ type: ActionType.CREATE }]
})

export const FailedMutationConflict: Story = {
  parameters: {
    userRole: TestUserRole.enum.FIELD_AGENT,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: failedMutationConflictEvent.id
      })
    },
    chromatic: { disableSnapshot: true },
    offline: {
      drafts: [
        generateEventDraftDocument({
          eventId: failedMutationConflictEvent.id,
          actionType: ActionType.DECLARE
        })
      ],
      events: [failedMutationConflictEvent],
      configs: [tennisClubMembershipEvent, footballClubMembershipEvent]
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.create.mutation(() => {
            return failedMutationConflictEvent
          }),
          tRPCMsw.event.actions.declare.request.mutation(async () => {
            await new Promise((resolve) =>
              setTimeout(resolve, OUTBOX_FREEZE_TIME)
            )
            throw new TRPCError({
              code: 'CONFLICT'
            })
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Send for review', async () => {
      const submitButton = await canvas.findByText('Send for review')
      await userEvent.click(submitButton)
      const confirmButton = await canvas.findByText('Confirm')
      await userEvent.click(confirmButton)
      const outboxButton = await canvas.findByTestId(
        'navigation_workqueue_outbox'
      )
      await expect(outboxButton).toHaveTextContent(/^Outbox1$/)

      await userEvent.click(outboxButton)

      const searchResult = await canvas.findByTestId('search-result')
      const { firstname, surname } = getCurrentEventState(
        getDeclareEventDocument(failedMutationConflictEvent.id),
        tennisClubMembershipEvent
      ).declaration['applicant.name'] as {
        firstname: string
        surname: string
      }

      await expect(searchResult).toHaveTextContent(`${firstname} ${surname}`)

      await waitFor(
        async () => {
          await expect(searchResult).not.toHaveTextContent(
            `${firstname} ${surname}`
          )
        },
        { timeout: OUTBOX_FREEZE_TIME + 2000 } // Allow some buffer for the freeze time
      )

      await expect(
        await canvas.findByText("You've been unassigned from the event")
      ).toBeVisible()

      const outboxButton2 = await canvas.findByTestId(
        'navigation_workqueue_outbox'
      )
      await expect(outboxButton2).toHaveTextContent(/^Outbox$/)
    })
  }
}
