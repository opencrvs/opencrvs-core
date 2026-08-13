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
import { expect, within } from 'storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'

import superjson from 'superjson'
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

/*
 * A notification, then a declaration that changed the applicant's surname.
 * The notification keeps its own data — editing a notification emits EDIT plus
 * a fresh DECLARE and leaves the NOTIFY untouched — so the two versions differ
 * and the comparison has something to show.
 */
const changedEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    { type: ActionType.CREATE },
    {
      type: ActionType.NOTIFY,
      declarationOverrides: {
        'applicant.name': { firstname: 'Woodrow', surname: 'Mwansa' }
      }
    },
    {
      type: ActionType.DECLARE,
      declarationOverrides: {
        'applicant.name': { firstname: 'Woodrow', surname: 'Banda' }
      }
    }
  ],
  rng: createPrng(305)
})

function offlineHandlers(document: typeof eventDocument) {
  return {
    workqueues: [
      tRPCMsw.workqueue.config.list.query(() => generateWorkqueues()),
      tRPCMsw.workqueue.count.query((input) =>
        input.reduce((acc, { slug }) => ({ ...acc, [slug]: 7 }), {})
      )
    ],
    event: [
      tRPCMsw.event.get.query(() => document),
      tRPCMsw.event.search.query(() => ({
        total: 1,
        results: [getCurrentEventState(document, tennisClubMembershipEvent)]
      }))
    ],
    drafts: [tRPCMsw.event.draft.list.query(() => [])],
    user: [
      tRPCMsw.user.list.query(() => [generator.user.localRegistrar().summary]),
      tRPCMsw.user.get.query(() => generator.user.localRegistrar().v2)
    ]
  }
}

/**
 * A first declaration is the record being completed rather than edited — the
 * notification before it was only ever asked a subset — so nothing is offered.
 */
export const NoComparisonOnAFirstDeclaration: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText("Applicant's name")
    await expect(canvas.queryByText('Show edits')).toBeNull()
  },
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.RECORD.buildPath({
        eventId: changedEventDocument.id
      })
    },
    offline: { events: [changedEventDocument], drafts: [] },
    msw: { handlers: offlineHandlers(changedEventDocument) }
  }
}

/** With the toggle on, the superseded value is shown struck through. */
export const ShowsWhatChanged: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const row = await canvas.findByTestId('row-value-applicant.name')
    // The value it replaced, and the value that replaced it.
    await expect(row).toHaveTextContent('Mwansa')
    await expect(row).toHaveTextContent('Banda')
  },
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    reactRouter: {
      router: routesConfig,
      initialPath: `${ROUTES.V2.EVENTS.EVENT.RECORD.buildPath({
        eventId: changedEventDocument.id
      })}?changes=true`
    },
    offline: { events: [changedEventDocument], drafts: [] },
    msw: { handlers: offlineHandlers(changedEventDocument) }
  }
}

/*
 * REGISTER never alters declaration data — the combined flows send a DECLARE
 * first — so a first registration always matches the declaration before it and
 * the toggle is not offered.
 */
export const NoChangesOnAFirstRegistration: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText("Applicant's name")
    await expect(canvas.queryByText(/Show (edits|correction)/)).toBeNull()
  },
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.RECORD.buildPath({
        eventId: eventDocument.id
      })
    },
    offline: { events: [eventDocument], drafts: [] },
    msw: { handlers: offlineHandlers(eventDocument) }
  }
}

export const ViewRecordMenuItemInsideActionMenus: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await canvas.findByText("Applicant's name")

    await expect(
      await canvas.findByTestId('applicant.name-value')
    ).toHaveTextContent('Riku This value is from a draft')

    /*
     * The tab is headed by its own name, the way Summary, Documents and Audit
     * are, rather than by the review card's "Member declaration for ..."
     * banner. That the draft value reaches the tab is asserted above, on the
     * field itself.
     */
    await canvas.findByText('Record', { selector: '#content-name' })
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
