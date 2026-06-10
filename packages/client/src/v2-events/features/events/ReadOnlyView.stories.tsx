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
import { expect } from '@storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'

import superjson from 'superjson'
import { within } from '@testing-library/dom'
import {
  ActionType,
  createPrng,
  generateEventDocument,
  generateEventDraftDocument,
  generateWorkqueues,
  getCurrentEventState,
  tennisClubMembershipEvent,
  TestUserRole
} from '@opencrvs/commons/client'
import {
  AppRouter,
  queryClient,
  trpcOptionsProxy
} from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { setNavigatorOnline } from '@client/tests/storybook-utils'
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
    { type: ActionType.CREATE },
    { type: ActionType.DECLARE },
    { type: ActionType.REGISTER }
  ],
  rng
})

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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await canvas.findByText("Applicant's name")

    await expect(
      await canvas.findByTestId('row-value-applicant.name')
    ).toHaveTextContent('Riku This value is from a draft')

    await canvas.findByText(
      'Member declaration for Riku This value is from a draft'
    )
  },
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.RECORD.buildPath({
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
          tRPCMsw.user.list.query(() => {
            return [generator.user.localRegistrar().summary]
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
      initialPath: ROUTES.V2.EVENTS.EVENT.RECORD.buildPath({
        eventId: eventDocument.id
      })
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
          tRPCMsw.user.list.query(() => {
            return [generator.user.localRegistrar().summary]
          }),
          tRPCMsw.user.get.query((id) => generator.user.localRegistrar().v2)
        ]
      }
    }
  }
}

/**
 * Regression test for opencrvs/opencrvs-core#12922:
 *
 * When the user opens the Record page for an event they have not previously
 * downloaded while offline, React Query pauses the fetch indefinitely and the
 * page used to show a spinner that never disappears. The fix renders an
 * explicit offline message instead.
 *
 * To reproduce the user flow in storybook we pre-populate the local event
 * index (so EventOverviewLayout can render) but remove the full event
 * document from React Query's cache to simulate "never downloaded". Going
 * offline then triggers the new message.
 */
export const ShowsOfflineMessageWhenRecordNotCached: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.RECORD.buildPath({
        eventId: eventDocument.id
      })
    },
    offline: {
      events: [eventDocument]
    },
    msw: {
      handlers: {
        workqueues: [
          tRPCMsw.workqueue.config.list.query(() => generateWorkqueues()),
          tRPCMsw.workqueue.count.query((input) =>
            input.reduce((acc, { slug }) => ({ ...acc, [slug]: 0 }), {})
          )
        ],
        event: [
          tRPCMsw.event.get.query(() => eventDocument),
          tRPCMsw.event.search.query(() => ({
            total: 1,
            results: [
              getCurrentEventState(eventDocument, tennisClubMembershipEvent)
            ]
          }))
        ],
        drafts: [tRPCMsw.event.draft.list.query(() => [])],
        user: [
          tRPCMsw.user.list.query(() => [
            generator.user.localRegistrar().summary
          ]),
          tRPCMsw.user.get.query(() => generator.user.localRegistrar().v2)
        ]
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // The `offline.events` setup pre-caches the full event document for the
    // Storybook user. Clear it to simulate a record that the user has never
    // downloaded — the EventOverviewLayout still works because the local
    // event index used by `searchEventById` is unaffected.
    queryClient.removeQueries({
      queryKey: trpcOptionsProxy.event.get.queryKey({
        eventId: eventDocument.id,
        waitFor: false
      })
    })
    queryClient.removeQueries({ queryKey: [['view-event', eventDocument.id]] })

    setNavigatorOnline(false)

    // Without the fix this assertion times out — the page shows a spinner
    // that never resolves because React Query pauses the fetch when offline.
    await canvas.findByTestId('record-offline-message')
    await expect(await canvas.findByText('No connection')).toBeVisible()

    // Restore so the stubbed offline state does not leak into other stories
    // rendered in the same preview iframe.
    setNavigatorOnline(true)
  }
}
