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
  title: 'ActionMenu/LocalRegistrar/DuplicateReviewUnavailable'
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

/** Already downloaded and flagged as a potential duplicate, within jurisdiction. */
const eventUnderReview: EventDocument = {
  type: TENNIS_CLUB_MEMBERSHIP,
  id: eventId,
  trackingId,
  createdAt: new Date(Date.now() - 1000).toISOString(),
  updatedAt: new Date(Date.now() - 1000).toISOString(),
  actions: [createAction, declareAction, duplicateDetectedAction, assignAction]
}

/** The matched record — within jurisdiction, but slow to resolve via `getDuplicates`. */
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

/*
 * Regression test: the main record is already downloaded (cached), but the
 * server takes a while to answer `getDuplicates` for the matched record — the
 * user has access to it, it's just slow. The "you cannot review" jurisdiction
 * banner must never render during that wait; only the ordinary duplicate
 * warning should ever be shown, once the match resolves.
 */
export const NotShownWhileDuplicateStillLoading: StoryObj = {
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.buildPath({ eventId })
    },
    // Only the main record is already in cache — the matched record is not,
    // it only becomes available once the slow `getDuplicates` call resolves.
    offline: { events: [eventUnderReview] },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.search.query(() => ({
            total: 1,
            results: [
              getCurrentEventState(eventUnderReview, tennisClubMembershipEvent)
            ]
          })),
          tRPCMsw.event.get.query(() => eventUnderReview),
          tRPCMsw.event.getDuplicates.query(async () => {
            await new Promise((resolve) => setTimeout(resolve, 1500))
            return [matchedEvent]
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'While duplicates are still loading, the jurisdiction banner never appears',
      async () => {
        for (let i = 0; i < 10; i++) {
          await expect(
            canvas.queryByText('You cannot review this record for duplicates')
          ).toBeNull()
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }
    )

    await step(
      'Once duplicates resolve, the ordinary duplicate warning is shown',
      async () => {
        await expect(
          await canvas.findByText(
            `Potential duplicate of record ${duplicateTrackingId}`
          )
        ).toBeVisible()
        await expect(
          canvas.queryByText('You cannot review this record for duplicates')
        ).toBeNull()
      }
    )
  }
}
