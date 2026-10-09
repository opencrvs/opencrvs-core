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
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { expect, userEvent, within } from 'storybook/test'
import {
  ActionType,
  ConditionalType,
  event,
  EventConfig,
  generateEventDocument,
  getCurrentEventState,
  not,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { AppRouter } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { createDeclarationTrpcMsw } from '@client/tests/v2-events/declaration.utils'
import { ReviewIndex } from './Review'

const generator = testDataGenerator()
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

// Register is disabled once declared, so direct register (declare + register) must never be allowed
const eventConfig = JSON.parse(
  JSON.stringify({
    ...tennisClubMembershipEvent,
    actions: tennisClubMembershipEvent.actions.map((action) =>
      action.type === ActionType.REGISTER
        ? {
            ...action,
            conditionals: [
              {
                type: ConditionalType.ENABLE,
                conditional: not(event.hasAction(ActionType.DECLARE))
              }
            ]
          }
        : action
    )
  })
) as EventConfig

const createdEventDocument = generateEventDocument({
  configuration: eventConfig,
  actions: [{ type: ActionType.CREATE }]
})
const declarationTrpcMsw = createDeclarationTrpcMsw(
  tRPCMsw,
  createdEventDocument
)

const declaredEventDocument = generateEventDocument({
  configuration: eventConfig,
  actions: [{ type: ActionType.CREATE }, { type: ActionType.DECLARE }]
})

const meta: Meta<typeof ReviewIndex> = {
  title: 'Declare/DirectRegister/Interaction',
  parameters: {
    offline: {
      configs: [eventConfig],
      events: [createdEventDocument]
    }
  },
  beforeEach: () => {
    useEventFormData.setState({
      formValues: getCurrentEventState(declaredEventDocument, eventConfig)
        .declaration
    })
  }
}

export default meta

type Story = StoryObj<typeof ReviewIndex>

export const DirectRegisterEvaluatesEventDependentConditional: Story = {
  loaders: [
    () => {
      declarationTrpcMsw.events.reset()
      declarationTrpcMsw.drafts.reset()
    },
    async () => {
      window.localStorage.setItem(
        'opencrvs',
        generator.user.token.localRegistrar
      )
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ],
  parameters: {
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: createdEventDocument.id
      })
    },
    msw: {
      handlers: {
        drafts: declarationTrpcMsw.drafts.handlers,
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [eventConfig]
          }),
          ...declarationTrpcMsw.events.handlers
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('open the action menu', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Action' })
      )
    })

    await step('register is disabled, declare is not', async () => {
      await expect(
        await canvas.findByText('Register', { selector: 'li[disabled]' })
      ).toBeInTheDocument()

      await expect(
        canvas.queryByText('Declare', { selector: 'li[disabled]' })
      ).not.toBeInTheDocument()
    })
  }
}
