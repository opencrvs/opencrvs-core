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
import { expect, userEvent, waitFor, within } from 'storybook/test'
import superjson from 'superjson'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import {
  ActionType,
  createPrng,
  EventDocument,
  generateActionDocument,
  generateTrackingId,
  getCurrentEventState,
  getUUID,
  TENNIS_CLUB_MEMBERSHIP,
  tennisClubMembershipEvent,
  TestUserRole
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'

export default {
  title:
    'ActionMenu/LocalRegistrar/ReviewDuplicatesDisabledWhenMatchUnavailable'
} as Meta

const generator = testDataGenerator()
const localRegistrar = generator.user.localRegistrar()

const prng = createPrng(42)
const trackingId = generateTrackingId(prng)
const duplicateTrackingId = generateTrackingId(prng)

const eventId = getUUID()
const duplicateId = getUUID()

const createAction = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.CREATE,
  defaults: { createdBy: localRegistrar.v2.id }
})

const declareAction = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.DECLARE,
  defaults: { createdBy: localRegistrar.v2.id }
})

const duplicateDetectedAction = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.DUPLICATE_DETECTED,
  defaults: {
    createdBy: localRegistrar.v2.id,
    content: {
      duplicates: [{ id: duplicateId, trackingId: duplicateTrackingId }]
    }
  }
})

const assignAction = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.ASSIGN,
  defaults: {
    createdBy: localRegistrar.v2.id,
    assignedTo: localRegistrar.v2.id
  }
})

/** Assigned to the local registrar and flagged as a potential duplicate. */
const eventUnderReview: EventDocument = {
  type: TENNIS_CLUB_MEMBERSHIP,
  id: eventId,
  trackingId,
  createdAt: new Date(Date.now() - 1000).toISOString(),
  updatedAt: new Date(Date.now() - 1000).toISOString(),
  actions: [createAction, declareAction, duplicateDetectedAction, assignAction]
}

/** The record `eventUnderReview` was matched against. */
const matchedEvent: EventDocument = {
  type: TENNIS_CLUB_MEMBERSHIP,
  id: duplicateId,
  trackingId: duplicateTrackingId,
  createdAt: new Date(Date.now() - 2000).toISOString(),
  updatedAt: new Date(Date.now() - 2000).toISOString(),
  actions: [
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.CREATE
    }),
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.DECLARE
    })
  ]
}

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

function parameters({ offlineEvents }: { offlineEvents: EventDocument[] }) {
  return {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.buildPath({ eventId })
    },
    offline: { events: offlineEvents },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.search.query(() => ({
            total: 1,
            results: [
              getCurrentEventState(eventUnderReview, tennisClubMembershipEvent)
            ]
          })),
          tRPCMsw.event.get.query(() => eventUnderReview)
        ]
      }
    }
  }
}

async function openActionMenu(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  await userEvent.click(await canvas.findByRole('button', { name: 'Action' }))

  return canvas
}

/*
 * The server refuses `getDuplicates` as a whole when the user's duplicate review
 * scopes do not cover every matched record (e.g. one of them is sealed), so
 * nothing is cached for the match. There is then nothing to review, and the entry
 * must not be clickable.
 */
export const ReviewDisabledWhenMatchUnavailable: StoryObj = {
  parameters: parameters({ offlineEvents: [eventUnderReview] }),
  play: async ({ canvasElement, step }) => {
    await step(
      'Matched record missing from cache: Review potential duplicates is disabled',
      async () => {
        const canvas = await openActionMenu(canvasElement)
        const reviewItem = await canvas.findByText(
          'Review potential duplicates'
        )

        await waitFor(async () => {
          await expect(reviewItem.closest('li')).toHaveAttribute('disabled')
        })
      }
    )
  }
}

/** Control: with the match cached, the same entry is clickable. */
export const ReviewEnabledWhenMatchAvailable: StoryObj = {
  parameters: parameters({ offlineEvents: [eventUnderReview, matchedEvent] }),
  play: async ({ canvasElement, step }) => {
    await step(
      'Matched record present in cache: Review potential duplicates is enabled',
      async () => {
        const canvas = await openActionMenu(canvasElement)
        const reviewItem = await canvas.findByText(
          'Review potential duplicates'
        )

        await waitFor(async () => {
          await expect(reviewItem.closest('li')).not.toHaveAttribute('disabled')
        })
      }
    )
  }
}
