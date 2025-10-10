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
import { graphql, HttpResponse } from 'msw'
import { userEvent, within, expect, waitFor } from '@storybook/test'
import { TRPCError } from '@trpc/server'
import {
  ActionType,
  tennisClubMembershipEvent,
  generateEventDocument,
  getCurrentEventState,
  footballClubMembershipEvent,
  TestUserRole
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { AppRouter } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { wrapHandlersWithSpies } from '@client/tests/v2-events/declaration.utils'
import { ReviewIndex } from '../events/actions/declare/Review'

const generator = testDataGenerator()

const declareEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.DECLARE]
})

const meta: Meta<typeof ReviewIndex> = {
  title: 'Outbox/Interaction',
  beforeEach: () => {
    useEventFormData.setState({
      formValues: getCurrentEventState(
        declareEventDocument,
        tennisClubMembershipEvent
      ).declaration
    })
  }
}

export default meta

const OUTBOX_FREEZE_TIME = 5 * 1000 // 5 seconds

const createdEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE]
})

type Story = StoryObj<typeof ReviewIndex>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const declarationTrpcMsw = {
  events: wrapHandlersWithSpies([
    {
      name: 'event.create',
      procedure: tRPCMsw.event.create.mutation,
      handler: () => createdEventDocument
    },
    {
      name: 'event.actions.declare.request',
      procedure: tRPCMsw.event.actions.declare.request.mutation,
      handler: async () => {
        await new Promise((resolve) => setTimeout(resolve, OUTBOX_FREEZE_TIME))
        return declareEventDocument
      }
    }
  ])
}

const mockUser = generator.user.fieldAgent().v2

export const SuccessfulMutation: Story = {
  parameters: {
    userRole: TestUserRole.Enum.FIELD_AGENT,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: createdEventDocument.id
      })
    },
    chromatic: { disableSnapshot: true },
    offline: {
      events: [createdEventDocument],
      configs: [tennisClubMembershipEvent, footballClubMembershipEvent]
    },
    msw: {
      handlers: {
        events: [...declarationTrpcMsw.events.handlers]
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
        declareEventDocument,
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

const declarationTrpcMswFail = {
  events: wrapHandlersWithSpies([
    {
      name: 'event.create',
      procedure: tRPCMsw.event.create.mutation,
      handler: () => createdEventDocument
    },
    {
      name: 'event.actions.declare.request',
      procedure: tRPCMsw.event.actions.declare.request.mutation,
      handler: async () => {
        await new Promise((resolve) => setTimeout(resolve, OUTBOX_FREEZE_TIME))
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR'
        })
      }
    }
  ])
}

export const FailedMutation: Story = {
  parameters: {
    userRole: TestUserRole.Enum.FIELD_AGENT,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: createdEventDocument.id
      })
    },
    chromatic: { disableSnapshot: true },
    offline: {
      events: [createdEventDocument],
      configs: [tennisClubMembershipEvent, footballClubMembershipEvent]
    },
    msw: {
      handlers: {
        events: [...declarationTrpcMswFail.events.handlers]
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
        declareEventDocument,
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

const declarationTrpcMswConflict = {
  events: wrapHandlersWithSpies([
    {
      name: 'event.create',
      procedure: tRPCMsw.event.create.mutation,
      handler: () => createdEventDocument
    },
    {
      name: 'event.actions.declare.request',
      procedure: tRPCMsw.event.actions.declare.request.mutation,
      handler: async () => {
        await new Promise((resolve) => setTimeout(resolve, OUTBOX_FREEZE_TIME))
        throw new TRPCError({
          code: 'CONFLICT'
        })
      }
    }
  ])
}

export const FailedMutationConflict: Story = {
  parameters: {
    userRole: TestUserRole.Enum.FIELD_AGENT,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: createdEventDocument.id
      })
    },
    chromatic: { disableSnapshot: true },
    offline: {
      events: [createdEventDocument],
      configs: [tennisClubMembershipEvent, footballClubMembershipEvent]
    },
    msw: {
      handlers: {
        events: [...declarationTrpcMswConflict.events.handlers]
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
        declareEventDocument,
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
