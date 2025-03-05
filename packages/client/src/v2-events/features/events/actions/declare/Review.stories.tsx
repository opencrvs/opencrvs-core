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
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import {
  Draft,
  EventDocument,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, waitFor, within } from '@storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { graphql, HttpResponse } from 'msw'
import superjson from 'superjson'
// eslint-disable-next-line
import { testDataGenerator } from '@client/tests/test-data-generators'
import { tennisClubMembershipEventIndex } from '@client/v2-events/features/events/fixtures'
import { ReviewIndex } from './Review'

const generator = testDataGenerator()

const eventId = '123-456-789'

const meta: Meta<typeof ReviewIndex> = {
  title: 'Review'
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

const eventDocument = {
  type: 'TENNIS_CLUB_MEMBERSHIP',
  id: eventId,
  trackingId: 'TEST12',
  createdAt: '2025-01-23T05:30:02.615Z',
  updatedAt: '2025-01-23T05:35:27.689Z',
  actions: [
    {
      id: 'ae9618d8-319d-48a7-adfe-7ad6cfbc56b7',
      type: 'CREATE' as const,
      createdAt: '2025-01-23T05:30:02.615Z',
      createdBy: '6780dbf7a263c6515c7b97d2',
      createdAtLocation: '052891bf-916a-4332-a76a-dae0ebb0efbf',
      data: {}
    }
  ]
} satisfies EventDocument

const draft: Draft = {
  id: 'gfdc282f-0b37-48ab-9dc4-48f6d8348808',
  transactionId: 'f80c282f-0b37-48ab-9dc4-48f6d8348808',
  action: {
    ...generator.event.actions.declare(eventId),
    createdAt: '2025-03-03T15:56:10.439Z',
    createdAtLocation: 'test-location-id',
    createdBy: 'test-user-id'
  },
  createdAt: '2025-03-03T15:56:10.439Z',
  eventId: eventId
}

export const ReviewForLocalRegistrarComplete: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId
      })
    },
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
    await step('Modal has scope based content', async () => {
      const canvas = within(canvasElement)
      const button = await canvas.findByRole('button', { name: 'Register' })
      await waitFor(() => expect(button).not.toBeDisabled())
      await userEvent.click(button)

      const modal = within(await canvas.findByRole('dialog'))

      await modal.findByText('Register?')
      await modal.findByRole('button', { name: 'Register' })
      await userEvent.click(
        await modal.findByRole('button', { name: 'Cancel' })
      )
    })
  }
}

export const ReviewForLocalRegistrarIncomplete: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return eventDocument
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
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
  }
}

export const ReviewForRegistrationAgentComplete: Story = {
  beforeEach: () => {
    window.localStorage.setItem(
      'opencrvs',
      generator.user.token.registrationAgent
    )
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId
      })
    },
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
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.registrationAgent()
              }
            })
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    await step('Modal has scope based content', async () => {
      const canvas = within(canvasElement)
      const button = await canvas.findByRole('button', {
        name: 'Send for approval'
      })
      await waitFor(() => expect(button).not.toBeDisabled())

      await userEvent.click(button)

      const modal = within(await canvas.findByRole('dialog'))

      await modal.findByText('Send for approval?')
      await modal.findByRole('button', { name: 'Confirm' })
      await userEvent.click(
        await modal.findByRole('button', { name: 'Cancel' })
      )
    })
  }
}

export const ReviewForRegistrationAgentIncomplete: Story = {
  beforeEach: () => {
    window.localStorage.setItem(
      'opencrvs',
      generator.user.token.registrationAgent
    )
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return eventDocument
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.registrationAgent()
              }
            })
          })
        ]
      }
    }
  }
}
export const ReviewForFieldAgentComplete: Story = {
  beforeEach: () => {
    window.localStorage.setItem('opencrvs', generator.user.token.fieldAgent)
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId
      })
    },
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
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.fieldAgent()
              }
            })
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    await step('Modal has scope based content', async () => {
      const canvas = within(canvasElement)
      const button = await canvas.findByRole('button', {
        name: 'Send for review'
      })
      await waitFor(() => expect(button).not.toBeDisabled())
      await userEvent.click(button)

      const modal = within(await canvas.findByRole('dialog'))

      await modal.findByText('Send for review?')
      await modal.findByRole('button', { name: 'Confirm' })
      await userEvent.click(
        await modal.findByRole('button', { name: 'Cancel' })
      )
    })
  }
}

export const ReviewForFieldAgentIncomplete: Story = {
  beforeEach: () => {
    window.localStorage.setItem('opencrvs', generator.user.token.fieldAgent)
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId
      })
    },
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
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.fieldAgent()
              }
            })
          })
        ]
      }
    }
  }
}
