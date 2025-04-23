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
  getCurrentEventState
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { createDeclarationTrpcMsw } from '@client/tests/v2-events/declaration.utils'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { Review } from './index'

const generator = testDataGenerator()

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})
const declarationTrpcMsw = createDeclarationTrpcMsw(tRPCMsw)

const meta: Meta<typeof Review> = {
  title: 'Validate/Review/Interaction/Local Registrar',
  beforeEach: () => {
    window.localStorage.setItem('opencrvs', generator.user.token.localRegistrar)
    declarationTrpcMsw.events.reset()
    declarationTrpcMsw.drafts.reset()
  }
}

export default meta

type Story = StoryObj<typeof Review>

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
  role: 'SOCIAL_WORKER',
  signatureFilename: 'signature.png'
}

const declareEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.DECLARE]
})

export const ReviewForLocalRegistrarCompleteInteraction: Story = {
  beforeEach: () => {
    useEventFormData.setState({
      formValues: getCurrentEventState(declareEventDocument).declaration
    })
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId
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
                getUser: generator.user.localRegistrar()
              }
            })
          }),
          tRPCMsw.user.list.query(() => {
            return [mockUser]
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    await step('Modal has scope based on content', async () => {
      const canvas = within(canvasElement)
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Register' })
      )

      const modal = within(await canvas.findByRole('dialog'))

      await modal.findByText('Register the tennis club membership application?')
      await modal.findByRole('button', { name: 'Cancel' })
      await userEvent.click(
        await modal.findByRole('button', { name: 'Register' })
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
          'event.actions.register.request': true,
          'event.actions.archive.request': false,
          'event.actions.reject.request': false
        })
      })
    })
  }
}

export const ReviewForLocalRegistrarArchiveInteraction: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId
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
                getUser: generator.user.localRegistrar()
              }
            })
          }),
          tRPCMsw.user.list.query(() => {
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

export const ReviewForLocalRegistrarRejectInteraction: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId
      })
    },
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        events: declarationTrpcMsw.events.handlers,
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.localRegistrar()
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

    await step('Send For Update is disabled', async () => {
      const sendForUpdateButton = await modal.findByRole('button', {
        name: 'Send For Update'
      })

      await expect(sendForUpdateButton).toBeDisabled()
    })

    await step('Add description', async () => {
      const descriptionInput = await modal.findByRole('textbox')

      await fireEvent.change(descriptionInput, {
        target: { value: 'Wrong data' }
      })
    })

    await step('Send For Update is not disabled', async () => {
      const sendForUpdateButton = await modal.findByRole('button', {
        name: 'Send For Update'
      })

      await expect(sendForUpdateButton).not.toBeDisabled()
    })

    await step('Mark as a duplicate', async () => {
      const markAsDuplicateCheckbox = await modal.findByRole('checkbox', {
        name: 'Mark as a duplicate'
      })

      await userEvent.click(markAsDuplicateCheckbox)
    })

    await step('Send For Update is disabled', async () => {
      const sendForUpdateButton = await modal.findByRole('button', {
        name: 'Send For Update'
      })

      await expect(sendForUpdateButton).toBeDisabled()
    })

    await step('Unmark as a duplicate', async () => {
      const markAsDuplicateCheckbox = await modal.findByRole('checkbox', {
        name: 'Mark as a duplicate'
      })

      await userEvent.click(markAsDuplicateCheckbox)
    })

    await step('Send For Update is not disabled', async () => {
      const sendForUpdateButton = await modal.findByRole('button', {
        name: 'Send For Update'
      })

      await expect(sendForUpdateButton).not.toBeDisabled()

      await userEvent.click(sendForUpdateButton)
      await within(canvasElement).findByText('All events')

      await waitFor(async () => {
        await expect(declarationTrpcMsw.events.getSpyCalls()).toMatchObject({
          'event.create': false,
          'event.actions.notify.request': false,
          'event.actions.declare.request': false,
          'event.actions.validate.request': false,
          'event.actions.register.request': false,
          'event.actions.archive.request': false,
          'event.actions.reject.request': true
        })
      })
    })
  }
}
