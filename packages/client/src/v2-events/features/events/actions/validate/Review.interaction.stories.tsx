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
import { tennisClubMembershipEventIndex } from '@client/v2-events/features/events/fixtures'
import { Review } from './index'

const generator = testDataGenerator()

const declareEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.DECLARE]
})

const meta: Meta<typeof Review> = {
  title: 'Validate/Interaction',
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

const callTracker = {
  localRegistrar: {
    'event.create': 0,
    'event.actions.declare': 0,
    'event.actions.validate': 0,
    'event.actions.register': 0
  },
  registrationAgent: {
    'event.create': 0,
    'event.actions.declare': 0,
    'event.actions.validate': 0,
    'event.actions.register': 0
  },
  fieldAgent: {
    'event.create': 0,
    'event.actions.declare': 0,
    'event.actions.validate': 0,
    'event.actions.register': 0
  }
}

const eventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE]
})

const eventId = eventDocument.id

const draft = generateEventDraftDocument(eventId, ActionType.REGISTER)

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

export const ReviewForLocalRegistrarCompleteInteraction: Story = {
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
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return [draft]
          })
        ],
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return eventDocument
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          }),
          tRPCMsw.event.create.mutation(() => {
            callTracker.localRegistrar['event.create']++

            return eventDocument
          }),
          tRPCMsw.event.actions.declare.request.mutation(() => {
            callTracker.localRegistrar['event.actions.declare']++

            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [ActionType.CREATE, ActionType.DECLARE]
            })
          }),
          tRPCMsw.event.actions.validate.request.mutation(() => {
            callTracker.localRegistrar['event.actions.validate']++

            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [
                ActionType.CREATE,
                ActionType.DECLARE,
                ActionType.VALIDATE
              ]
            })
          }),
          tRPCMsw.event.actions.register.request.mutation(() => {
            callTracker.localRegistrar['event.actions.register']++

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

      await modal.findByText('Register?')
      await modal.findByRole('button', { name: 'Cancel' })
      await userEvent.click(
        await modal.findByRole('button', { name: 'Register' })
      )
    })

    await step('Confirm action triggers scope based actions', async () => {
      await within(canvasElement).findByText('All events')
      await waitFor(async () => {
        await expect(callTracker.localRegistrar['event.create']).toBe(0)
        await expect(callTracker.localRegistrar['event.actions.declare']).toBe(
          0
        )
        await expect(callTracker.localRegistrar['event.actions.validate']).toBe(
          1
        )
        await expect(callTracker.localRegistrar['event.actions.register']).toBe(
          1
        )
      })
    })
  }
}

export const ReviewForRegistrationAgentCompleteInteraction: Story = {
  beforeEach: () => {
    useEventFormData.setState({
      formValues: getCurrentEventState(declareEventDocument).declaration
    })

    window.localStorage.setItem(
      'opencrvs',
      generator.user.token.registrationAgent
    )
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
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return [draft]
          })
        ],
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return eventDocument
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          }),
          tRPCMsw.event.create.mutation(() => {
            callTracker.registrationAgent['event.create']++

            return eventDocument
          }),
          tRPCMsw.event.actions.declare.request.mutation(() => {
            callTracker.registrationAgent['event.actions.declare']++

            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [ActionType.CREATE, ActionType.DECLARE]
            })
          }),
          tRPCMsw.event.actions.validate.request.mutation(() => {
            callTracker.registrationAgent['event.actions.validate']++

            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [
                ActionType.CREATE,
                ActionType.DECLARE,
                ActionType.VALIDATE
              ]
            })
          }),
          tRPCMsw.event.actions.register.request.mutation(() => {
            callTracker.registrationAgent['event.actions.register']++

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
        await expect(callTracker.registrationAgent['event.create']).toBe(0)
        await expect(
          callTracker.registrationAgent['event.actions.declare']
        ).toBe(0)
        await expect(
          callTracker.registrationAgent['event.actions.validate']
        ).toBe(1)
        await expect(
          callTracker.registrationAgent['event.actions.register']
        ).toBe(0)
      })
    })
  }
}
