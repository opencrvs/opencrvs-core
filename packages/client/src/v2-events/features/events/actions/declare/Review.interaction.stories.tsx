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
import { createDeclarationTrpcMsw } from '@client/tests/v2-events/declaration.utils'
import { ReviewIndex } from './Review'

const generator = testDataGenerator()

const declareEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.DECLARE]
})

const meta: Meta<typeof ReviewIndex> = {
  title: 'Declare/Interaction',
  beforeEach: () => {
    useEventFormData.setState({
      formValues: getCurrentEventState(declareEventDocument).declaration
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

const declarationTrpcMsw = createDeclarationTrpcMsw(tRPCMsw)

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
  beforeEach: () => {
    window.localStorage.setItem('opencrvs', generator.user.token.localRegistrar)
    declarationTrpcMsw.events.reset()
    declarationTrpcMsw.drafts.reset()
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
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
          tRPCMsw.user.list.query(([id]) => {
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
        await expect(declarationTrpcMsw.events.getSpyCalls()).toMatchObject({
          'event.create': false,
          'event.actions.notify.request': false,
          'event.actions.declare.request': true,
          'event.actions.validate.request': true,
          'event.actions.register.request': true
        })
      })
    })
  }
}

export const ReviewForRegistrationAgentCompleteInteraction: Story = {
  beforeEach: () => {
    declarationTrpcMsw.events.reset()
    declarationTrpcMsw.drafts.reset()

    window.localStorage.setItem(
      'opencrvs',
      generator.user.token.registrationAgent
    )
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
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
          'event.actions.declare.request': true,
          'event.actions.validate.request': true,
          'event.actions.register.request': false
        })
      })
    })
  }
}

export const ReviewForFieldAgentCompleteInteraction: Story = {
  beforeEach: () => {
    declarationTrpcMsw.events.reset()
    declarationTrpcMsw.drafts.reset()

    window.localStorage.setItem('opencrvs', generator.user.token.fieldAgent)
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
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
        await canvas.findByRole('button', { name: 'Send for review' })
      )

      const modal = within(await canvas.findByRole('dialog'))

      await modal.findByText('Send for review?')
      await modal.findByText('This declaration will be sent for review')
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
          'event.actions.declare.request': true,
          'event.actions.validate.request': false,
          'event.actions.register.request': false
        })
      })
    })
  }
}

export const ReviewForFieldAgentIncompleteInteraction: Story = {
  beforeEach: () => {
    declarationTrpcMsw.events.reset()
    declarationTrpcMsw.drafts.reset()

    window.localStorage.setItem('opencrvs', generator.user.token.fieldAgent)
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: declareEventDocument.id
      })
    },
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return []
          })
        ],
        events: declarationTrpcMsw.events.handlers,
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.fieldAgent()
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
        await canvas.findByRole('button', { name: 'Send for review' })
      )

      const modal = within(await canvas.findByRole('dialog'))

      await modal.findByText('Send for review?')
      await modal.findByRole('button', { name: 'Cancel' })
      await modal.findByText(
        'This incomplete declaration will be sent for review.'
      )
      await userEvent.click(
        await modal.findByRole('button', { name: 'Confirm' })
      )
    })

    await step('Confirm action triggers scope based actions', async () => {
      await within(canvasElement).findByText('All events')

      await waitFor(async () => {
        await expect(declarationTrpcMsw.events).toMatchObject({
          'event.create': false,
          'event.actions.notify.request': true,
          'event.actions.declare.request': false,
          'event.actions.validate.request': false,
          'event.actions.register.request': false
        })
      })
    })
  }
}

export const ChangeFieldInReview: Story = {
  beforeEach: () => {
    useEventFormData.setState({
      formValues: getCurrentEventState(declareEventDocument).declaration
    })
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
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
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Start changing the surname', async () => {
      const surnameChangeButton = await canvas.findByTestId(
        'change-button-applicant.surname'
      )

      await userEvent.click(surnameChangeButton)

      const continueButton = await canvas.findByText('Continue')
      await userEvent.click(continueButton)
    })

    await step('Change input field value', async () => {
      const surnameInput = await canvas.findByTestId(
        'text__applicant____surname'
      )
      await userEvent.clear(surnameInput)
      await userEvent.type(surnameInput, 'Nileem-Rowa')
    })

    await step('Navigate back to review', async () => {
      const backToReviewButton = await canvas.findByText('Back to review')
      await userEvent.click(backToReviewButton)

      const surnameValue = await canvas.findByTestId(
        'row-value-applicant.surname'
      )
      await expect(surnameValue).toHaveTextContent('Nileem-Rowa')
    })
  }
}
