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
import { graphql, HttpResponse } from 'msw'
import superjson from 'superjson'
import { within } from '@testing-library/dom'
import { userEvent, waitFor } from '@storybook/test'
import {
  ActionType,
  createPrng,
  generateEventDocument,
  generateEventDraftDocument,
  generateWorkqueues,
  getCurrentEventState,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { ReadonlyViewIndex } from './ReadOnlyView'

const generator = testDataGenerator()

const meta: Meta<typeof ReadonlyViewIndex> = {
  title: 'ReadOnlyView'
}

export default meta

type Story = StoryObj<typeof ReadonlyViewIndex>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const rng = createPrng(122)
const eventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    ActionType.CREATE,
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER
  ],
  rng
})

const eventId = eventDocument.id
const modifiedDraft = generateEventDraftDocument({
  eventId: eventDocument.id,
  actionType: ActionType.REGISTER,
  declaration: {
    'applicant.name': {
      firstname: 'Riku',
      surname: 'This value is from a draft'
    }
  },
  rng
})

export const ViewRecordMenuItemInsideActionMenus: Story = {
  loaders: [
    async () => {
      window.localStorage.setItem(
        'opencrvs',
        generator.user.token.localRegistrar
      )
      //  Intermittent failures starts to happen when global state gets out of whack.
      // // This is a workaround to ensure that the state is reset when similar tests are run in parallel.
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Finds view record menu item in action menu', async () => {
      const actionButton = await canvas.findByRole('button', {
        name: 'Action'
      })

      await userEvent.click(actionButton)
    })

    await step('User is taken to the view record page', async () => {
      const list = await canvas.findByRole('list')
      await userEvent.click(within(list).getByText('View'))

      await waitFor(async () => {
        await canvas.findByText("Applicant's name")
        await canvas.findByText('Riku This value is from a draft')
        await canvas.findByText(
          'Member declaration for Riku This value is from a draft'
        )
        await canvas.findByText('Tennis club membership application')
      })
    })
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.OVERVIEW.buildPath({
        eventId: eventDocument.id
      }),
      chromatic: { disableSnapshot: true }
    },
    offline: {
      events: [eventDocument],
      drafts: [modifiedDraft]
    },
    msw: {
      handlers: {
        workqueues: [
          tRPCMsw.workqueue.config.list.query(() => {
            return generateWorkqueues()
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return { ...acc, [slug]: 7 }
            }, {})
          })
        ],
        event: [
          tRPCMsw.event.get.query(() => {
            return eventDocument
          }),
          tRPCMsw.event.search.query(() => {
            return {
              total: 1,
              results: [
                getCurrentEventState(eventDocument, tennisClubMembershipEvent)
              ]
            }
          })
        ],
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return [modifiedDraft]
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.localRegistrar().v1
              }
            })
          }),
          tRPCMsw.user.list.query(() => {
            return [generator.user.localRegistrar().v2]
          }),
          tRPCMsw.user.get.query((id) => generator.user.localRegistrar().v2)
        ]
      }
    }
  }
}

export const ReadOnlyViewForUserWithReadPermission: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VIEW.buildPath({
        eventId
      })
    },
    msw: {
      handlers: {
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return []
          })
        ],
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return eventDocument
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.localRegistrar().v1
              }
            })
          }),
          tRPCMsw.user.list.query(() => {
            return [generator.user.fieldAgent().v2]
          }),
          tRPCMsw.user.get.query(() => generator.user.localRegistrar().v2)
        ]
      }
    }
  }
}
