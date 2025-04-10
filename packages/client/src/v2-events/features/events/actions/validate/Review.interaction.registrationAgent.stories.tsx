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
import { userEvent, within, expect, waitFor, fireEvent } from '@storybook/test'
import {
  ActionType,
  tennisClubMembershipEvent,
  generateEventDocument,
  generateEventDraftDocument,
  getCurrentEventState
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { AppRouter } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { createDeclarationTrpcMsw } from '../../../../../tests/v2-events/declaration.utils'
import { Review } from './index'

const generator = testDataGenerator()

const declareEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.DECLARE]
})

const meta: Meta<typeof Review> = {
  title: 'Validate/Review/Interaction/Registration Agent',
  beforeEach: () => {
    useEventFormData.setState({
      formValues: getCurrentEventState(declareEventDocument).declaration
    })
  }
}

export default meta

type Story = StoryObj<typeof Review>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const eventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE]
})

const eventId = eventDocument.id

const mockUser = {
  id: '67bda93bfc07dee78ae558cf',
  name: [
    {
      use: 'en',
      given: ['Kalusha'],
      family: 'Bwalya'
    }
  ],
  role: 'SOCIAL_WORKER'
}

const declarationTrpcMsw = createDeclarationTrpcMsw(tRPCMsw)

export const ReviewForRegistrationAgentCompleteInteraction: Story = {
  beforeEach: () => {
    window.localStorage.setItem(
      'opencrvs',
      generator.user.token.registrationAgent
    )
    declarationTrpcMsw.events.reset()
    declarationTrpcMsw.drafts.reset()
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId: declareEventDocument.id
      })
    },
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        drafts: declarationTrpcMsw.drafts.handlers,
        events: declarationTrpcMsw.events.handlers,
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.registrationAgent()
              }
            })
          }),
          tRPCMsw.user.list.query(([id]) => {
            return [mockUser]
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    await step('Modal has scope based content', async () => {
      const canvas = within(canvasElement)
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Send for approval' })
      )

      const modal = within(await canvas.findByRole('dialog'))

      await modal.findByText('Send for approval?')
      await modal.findByRole('button', { name: 'Cancel' })
      await userEvent.click(
        await modal.findByRole('button', { name: 'Confirm' })
      )
    })

    await step('Confirm action triggers scope based actions', async () => {
      await within(canvasElement).findByText('All events')

      await waitFor(async () => {
        await expect(declarationTrpcMsw.events.getSpyCalls()).toMatchObject({
          'event.create': false,
          'event.actions.notify.request': false,
          'event.actions.declare.request': false,
          'event.actions.validate.request': true,
          'event.actions.register.request': false,
          'event.actions.archive.request': false,
          'event.actions.reject.request': false
        })
      })
    })
  }
}

export const ReviewForRegistrationAgentArchiveInteraction: Story = {
  beforeEach: () => {
    window.localStorage.setItem(
      'opencrvs',
      generator.user.token.registrationAgent
    )
    declarationTrpcMsw.events.reset()
    declarationTrpcMsw.drafts.reset()
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId: declareEventDocument.id
      })
    },
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        drafts: declarationTrpcMsw.drafts.handlers,
        events: declarationTrpcMsw.events.handlers,
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.registrationAgent()
              }
            })
          }),
          tRPCMsw.user.list.query(([id]) => {
            return [mockUser]
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Open reject modal', async () => {
      const rejectButton = await canvas.findByRole('button', {
        name: 'Reject'
      })
      await userEvent.click(rejectButton)
    })

    const modal = within(await canvas.findByRole('dialog'))

    await step('Archive is disabled', async () => {
      const archiveButton = await modal.findByRole('button', {
        name: 'Archive'
      })

      await expect(archiveButton).toBeDisabled()
    })

    await step('Add description', async () => {
      const descriptionInput = await modal.findByRole('textbox')

      await fireEvent.change(descriptionInput, {
        target: { value: 'Wrong data' }
      })
    })

    await step('Archive is not disabled', async () => {
      const archiveButton = await modal.findByRole('button', {
        name: 'Archive'
      })

      await expect(archiveButton).not.toBeDisabled()
    })

    await step('Mark as a duplicate', async () => {
      const markAsDuplicateCheckbox = await modal.findByRole('checkbox', {
        name: 'Mark as a duplicate'
      })

      await userEvent.click(markAsDuplicateCheckbox)
    })

    await step('Archive is not disabled', async () => {
      const archiveButton = await modal.findByRole('button', {
        name: 'Archive'
      })

      await expect(archiveButton).not.toBeDisabled()

      await userEvent.click(archiveButton)
      await within(canvasElement).findByText('All events')

      await waitFor(async () => {
        await expect(declarationTrpcMsw.events.getSpyCalls()).toMatchObject({
          'event.create': false,
          'event.actions.notify.request': false,
          'event.actions.declare.request': false,
          'event.actions.validate.request': false,
          'event.actions.register.request': false,
          'event.actions.archive.request': true,
          'event.actions.reject.request': false
        })
      })
    })
  }
}
