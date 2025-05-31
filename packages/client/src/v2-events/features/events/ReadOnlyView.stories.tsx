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
  generateEventDocument,
  generateEventDraftDocument,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'
import {
  tennisClubMembershipEventDocument,
  tennisClubMembershipEventIndex
} from '@client/v2-events/features/events/fixtures'
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

const eventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    ActionType.CREATE,
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER
  ]
})

const eventId = eventDocument.id
const draft = generateEventDraftDocument(eventId)

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
      await userEvent.click(await canvas.findByText('View record'))

      await waitFor(async () => {
        await canvas.findByText('Riku This value is from a draft')
        await canvas.findByText('Tennis club membership application')
      })
    })
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.OVERVIEW.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      }),
      chromatic: { disableSnapshot: true }
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          })
        ],
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return [
              generateEventDraftDocument(
                tennisClubMembershipEventDocument.id,
                ActionType.REGISTER,
                {
                  'applicant.firstname': 'Riku',
                  'applicant.surname': 'This value is from a draft'
                }
              )
            ]
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
            return [
              {
                id: generator.user.id.localRegistrar,
                name: [{ use: 'en', given: ['Kennedy'], family: 'Mweene' }],
                role: 'LOCAL_REGISTRAR',
                signatureFilename: undefined
              }
            ]
          })
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
          }),
          tRPCMsw.user.list.query(([id]) => {
            return [
              {
                id: '67bda93bfc07dee78ae558cf',
                name: [
                  {
                    use: 'en',
                    given: ['Kalusha'],
                    family: 'Bwalya'
                  }
                ],
                role: 'SOCIAL_WORKER',
                signatureFilename: undefined
              }
            ]
          })
        ]
      }
    }
  }
}
