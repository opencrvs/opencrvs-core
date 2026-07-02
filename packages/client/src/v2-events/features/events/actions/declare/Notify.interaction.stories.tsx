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
import {
  ActionType,
  tennisClubMembershipEvent,
  generateEventDocument,
  getCurrentEventState
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { AppRouter } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { createDeclarationTrpcMsw } from '@client/tests/v2-events/declaration.utils'
import { ReviewIndex } from './Review'

const generator = testDataGenerator()
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

/*
 * A variation of the tennis club membership event that has a dedicated NOTIFY
 * action config with its own supportingCopy and label — separate from DECLARE.
 * Used to verify that NotifyActionConfig is picked up independently.
 */
const eventConfigWithNotifyConfig = {
  ...tennisClubMembershipEvent,
  actions: tennisClubMembershipEvent.actions.map((action) => {
    if (action.type === ActionType.NOTIFY) {
      return {
        ...action,
        label: {
          id: 'event.tennis-club-membership.action.notify.label',
          defaultMessage: 'Notify health worker',
          description: 'Label for the notify action'
        },
        supportingCopy: {
          id: 'event.tennis-club-membership.action.notify.supportingCopy',
          defaultMessage:
            'This will notify the health worker responsible for this record.',
          description: 'Supporting copy shown in the notify confirmation dialog'
        },
        flags: [{ id: 'health-worker-notified', operation: 'add' as const }]
      }
    }
    return action
  })
}

const createdEventDocument = generateEventDocument({
  configuration: eventConfigWithNotifyConfig,
  actions: [{ type: ActionType.CREATE }]
})

const declarationTrpcMsw = createDeclarationTrpcMsw(
  tRPCMsw,
  createdEventDocument
)

const mockUser = generator.user.fieldAgent().summary
const mockUserFull = generator.user.fieldAgent().v2

const meta: Meta<typeof ReviewIndex> = {
  title: 'Declare/Notify config',
  parameters: {
    offline: {
      events: [createdEventDocument],
      configs: [eventConfigWithNotifyConfig]
    }
  },
  beforeEach: () => {
    useEventFormData.setState({ formValues: {} })
  }
}

export default meta
type Story = StoryObj<typeof ReviewIndex>

const msw = {
  handlers: {
    drafts: declarationTrpcMsw.drafts.handlers,
    events: [
      tRPCMsw.event.search.query(() => ({
        results: [
          getCurrentEventState(
            createdEventDocument,
            eventConfigWithNotifyConfig
          )
        ],
        total: 1
      })),
      ...declarationTrpcMsw.events.handlers
    ],
    user: [
      tRPCMsw.user.list.query(() => [mockUser]),
      tRPCMsw.user.get.query(() => mockUserFull)
    ]
  }
}

/*
 * Verifies that when a NOTIFY action config is present:
 * - The NOTIFY-specific supportingCopy appears in the confirmation dialog
 * - The notify mutation is called (not declare)
 */
export const NotifyConfigSupportingCopyIsShownInDialog: Story = {
  loaders: [
    () => {
      declarationTrpcMsw.events.reset()
      declarationTrpcMsw.drafts.reset()
    },
    async () => {
      window.localStorage.setItem('opencrvs', generator.user.token.fieldAgent)
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ],
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: createdEventDocument.id
      })
    },
    chromatic: { disableSnapshot: true },
    msw
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Field agent opens action menu and clicks Notify', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Action' })
      )
      await userEvent.click(await canvas.findByText('Notify'))
    })

    await step(
      'Confirmation dialog shows NOTIFY-specific supporting copy',
      async () => {
        await expect(
          await canvas.findByText(
            'This will notify the health worker responsible for this record.'
          )
        ).toBeInTheDocument()
      }
    )

    await step('Confirm notify action', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Notify' })
      )
    })

    await step('Notify mutation was called, not declare', async () => {
      await waitFor(async () => {
        await expect(declarationTrpcMsw.events.getSpyCalls()).toMatchObject({
          'event.actions.notify.request': true,
          'event.actions.declare.request': false
        })
      })
    })
  }
}
