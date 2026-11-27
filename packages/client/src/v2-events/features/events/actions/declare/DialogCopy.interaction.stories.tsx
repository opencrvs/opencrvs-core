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
import { userEvent, within, expect } from 'storybook/test'
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
  links: [httpLink({ url: '/api/events' })]
})

const declareCopy = 'You are about to declare this membership application.'
const registerCopy = 'Registering creates an official membership record.'

/*
 * The tennis club membership event, where the DECLARE and REGISTER actions
 * give the copy of their confirmation dialogs.
 */
const eventConfigWithDialogCopy = {
  ...tennisClubMembershipEvent,
  actions: tennisClubMembershipEvent.actions.map((action) => {
    if (action.type === ActionType.DECLARE) {
      return {
        ...action,
        dialogCopy: {
          id: 'event.tennis-club-membership.action.declare.dialogCopy',
          defaultMessage: declareCopy,
          description: 'Copy of the declare dialog'
        }
      }
    }
    if (action.type === ActionType.REGISTER) {
      return {
        ...action,
        dialogCopy: {
          id: 'event.tennis-club-membership.action.register.dialogCopy',
          defaultMessage: registerCopy,
          description: 'Copy of the register dialog'
        }
      }
    }
    return action
  })
}

const createdEventDocument = generateEventDocument({
  configuration: eventConfigWithDialogCopy,
  actions: [{ type: ActionType.CREATE }]
})

const declaredEventDocument = generateEventDocument({
  configuration: eventConfigWithDialogCopy,
  actions: [{ type: ActionType.CREATE }, { type: ActionType.DECLARE }]
})

const declarationTrpcMsw = createDeclarationTrpcMsw(
  tRPCMsw,
  createdEventDocument
)

const meta: Meta<typeof ReviewIndex> = {
  title: 'Declare/Dialog copy',
  parameters: {
    offline: {
      events: [createdEventDocument],
      configs: [eventConfigWithDialogCopy]
    }
  },
  beforeEach: () => {
    useEventFormData.setState({
      formValues: getCurrentEventState(
        declaredEventDocument,
        eventConfigWithDialogCopy
      ).declaration
    })
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
          getCurrentEventState(createdEventDocument, eventConfigWithDialogCopy)
        ],
        total: 1
      })),
      ...declarationTrpcMsw.events.handlers
    ],
    user: [
      tRPCMsw.user.list.query(() => [generator.user.localRegistrar().summary]),
      tRPCMsw.user.get.query(() => generator.user.localRegistrar().v2)
    ]
  }
}

const parameters = {
  reactRouter: {
    router: routesConfig,
    initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
      eventId: createdEventDocument.id
    })
  },
  chromatic: { disableSnapshot: true },
  msw
}

function signInAs(token: string) {
  return [
    () => {
      declarationTrpcMsw.events.reset()
      declarationTrpcMsw.drafts.reset()
    },
    async () => {
      window.localStorage.setItem('opencrvs', token)
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ]
}

/*
 * The register dialog on the review page shows the `dialogCopy` of the
 * REGISTER action, the same copy as the register dialog of the action menu.
 */
export const RegisterDialogShowsCopyOfRegisterAction: Story = {
  loaders: signInAs(generator.user.token.localRegistrar),
  parameters,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Local registrar opens the register dialog', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Action' })
      )
      await userEvent.click(await canvas.findByText('Register'))
    })

    await step('The dialog shows the copy of the REGISTER action', async () => {
      await expect(await canvas.findByText(registerCopy)).toBeInTheDocument()
      await expect(canvas.queryByText(declareCopy)).not.toBeInTheDocument()
    })
  }
}

/*
 * The declare dialog on the review page shows the `dialogCopy` of the
 * DECLARE action.
 */
export const DeclareDialogShowsCopyOfDeclareAction: Story = {
  loaders: signInAs(generator.user.token.registrationAgent),
  parameters,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Registration agent opens the declare dialog', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Action' })
      )
      await userEvent.click(await canvas.findByText('Declare'))
    })

    await step('The dialog shows the copy of the DECLARE action', async () => {
      await expect(await canvas.findByText(declareCopy)).toBeInTheDocument()
      await expect(canvas.queryByText(registerCopy)).not.toBeInTheDocument()
    })
  }
}
