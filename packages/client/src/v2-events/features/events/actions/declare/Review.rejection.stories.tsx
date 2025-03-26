/* eslint-disable max-lines */
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
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { AppRouter } from '@client/v2-events/trpc'
// eslint-disable-next-line
import { testDataGenerator } from '@client/tests/test-data-generators'
import { tennisClubMembershipEventIndex } from '@client/v2-events/features/events/fixtures'
import { ReviewIndex } from './Review'

const generator = testDataGenerator()

const declareEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.DECLARE]
})

const eventId = declareEventDocument.id

const meta: Meta<typeof ReviewIndex> = {
  title: 'Declare/Rejection',
  beforeEach: () => {
    useEventFormData.setState({
      formValues: getCurrentEventState(declareEventDocument).data
    })
  }
}

export default meta

type Story = StoryObj<typeof ReviewIndex>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const callTracker = {
  'event.create': 0,
  'event.actions.declare': 0,
  'event.actions.validate': 0,
  'event.actions.register': 0,
  'event.actions.archive': 0,
  'event.actions.reject': 0
}

export const Archive: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.REGISTER.REVIEW.buildPath({
        eventId
      })
    },
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [ActionType.CREATE]
            })
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          }),
          tRPCMsw.event.create.mutation(() => {
            callTracker['event.create']++

            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [ActionType.CREATE]
            })
          }),
          tRPCMsw.event.actions.declare.mutation(() => {
            callTracker['event.actions.declare']++

            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [ActionType.CREATE, ActionType.DECLARE]
            })
          }),
          tRPCMsw.event.actions.archive.mutation(() => {
            callTracker['event.actions.archive']++

            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [
                ActionType.CREATE,
                ActionType.DECLARE,
                ActionType.VALIDATE,
                ActionType.ARCHIVE
              ]
            })
          }),

          tRPCMsw.event.actions.validate.mutation(() => {
            callTracker['event.actions.validate']++

            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [
                ActionType.CREATE,
                ActionType.DECLARE,
                ActionType.VALIDATE
              ]
            })
          }),
          tRPCMsw.event.actions.register.mutation(() => {
            callTracker['event.actions.register']++

            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [
                ActionType.CREATE,
                ActionType.DECLARE,
                ActionType.VALIDATE,
                ActionType.REGISTER
              ]
            })
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.localRegistrar()
              }
            })
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Reset callTracker', () => {
      Object.keys(callTracker).forEach((key) => {
        callTracker[key as keyof typeof callTracker] = 0
      })
    })

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
        await expect(callTracker['event.create']).toBe(0)
        await expect(callTracker['event.actions.declare']).toBe(0)
        await expect(callTracker['event.actions.reject']).toBe(0)
        await expect(callTracker['event.actions.archive']).toBe(1)
        await expect(callTracker['event.actions.validate']).toBe(0)
        await expect(callTracker['event.actions.register']).toBe(0)
      })
    })
  }
}

export const SendForUpdate: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.REGISTER.REVIEW.buildPath({
        eventId
      })
    },
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [ActionType.CREATE]
            })
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          }),
          tRPCMsw.event.create.mutation(() => {
            callTracker['event.create']++

            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [ActionType.CREATE]
            })
          }),
          tRPCMsw.event.actions.declare.mutation(() => {
            callTracker['event.actions.declare']++

            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [ActionType.CREATE, ActionType.DECLARE]
            })
          }),
          tRPCMsw.event.actions.reject.mutation(() => {
            callTracker['event.actions.reject']++

            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [
                ActionType.CREATE,
                ActionType.DECLARE,
                ActionType.VALIDATE,
                ActionType.REJECT
              ]
            })
          }),
          tRPCMsw.event.actions.validate.mutation(() => {
            callTracker['event.actions.validate']++

            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [
                ActionType.CREATE,
                ActionType.DECLARE,
                ActionType.VALIDATE
              ]
            })
          }),
          tRPCMsw.event.actions.register.mutation(() => {
            callTracker['event.actions.register']++

            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [
                ActionType.CREATE,
                ActionType.DECLARE,
                ActionType.VALIDATE,
                ActionType.REGISTER
              ]
            })
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.localRegistrar()
              }
            })
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Reset callTracker', () => {
      Object.keys(callTracker).forEach((key) => {
        callTracker[key as keyof typeof callTracker] = 0
      })
    })

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
        await expect(callTracker['event.create']).toBe(0)
        await expect(callTracker['event.actions.declare']).toBe(0)
        await expect(callTracker['event.actions.reject']).toBe(1)
        await expect(callTracker['event.actions.archive']).toBe(0)
        await expect(callTracker['event.actions.validate']).toBe(0)
        await expect(callTracker['event.actions.register']).toBe(0)
      })
    })
  }
}
