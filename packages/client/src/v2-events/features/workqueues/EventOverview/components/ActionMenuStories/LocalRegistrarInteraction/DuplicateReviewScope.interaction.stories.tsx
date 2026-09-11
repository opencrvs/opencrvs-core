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
  title: 'ActionMenu/LocalRegistrar/DuplicateReviewScope'
} as Meta

const generator = testDataGenerator()
const registrationAgent = generator.user.registrationAgent()

const prng = createPrng(42)
const trackingId = generateTrackingId(prng)
const duplicateTrackingId = generateTrackingId(prng)

const eventId = getUUID()
const duplicateId = getUUID()

const createAction = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.CREATE,
  defaults: { createdBy: registrationAgent.v2.id }
})

const declareAction = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.DECLARE,
  defaults: { createdBy: registrationAgent.v2.id }
})

const duplicateDetectedAction = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.DUPLICATE_DETECTED,
  defaults: {
    createdBy: registrationAgent.v2.id,
    content: {
      duplicates: [{ id: duplicateId, trackingId: duplicateTrackingId }]
    }
  }
})

const assignAction = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.ASSIGN,
  defaults: {
    createdBy: registrationAgent.v2.id,
    assignedTo: registrationAgent.v2.id
  }
})

/** Downloaded, flagged as a potential duplicate, assigned to a user without `record.review-duplicates`. */
const eventUnderReview: EventDocument = {
  type: TENNIS_CLUB_MEMBERSHIP,
  id: eventId,
  trackingId,
  createdAt: new Date(Date.now() - 1000).toISOString(),
  updatedAt: new Date(Date.now() - 1000).toISOString(),
  actions: [createAction, declareAction, duplicateDetectedAction, assignAction]
}

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

let getDuplicatesCallCount = 0

/*
 * `REGISTRATION_AGENT` lacks `record.review-duplicates` (see
 * MarkAsDuplicate.interaction.stories.tsx). Such a user should see the
 * ordinary duplicate warning, not the jurisdiction "cannot review" banner —
 * and the client shouldn't call `getDuplicates` at all for them.
 */
export const NoBannerAndNoFetchWithoutReviewScope: StoryObj = {
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.REGISTRATION_AGENT,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.buildPath({ eventId })
    },
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
          tRPCMsw.event.getDuplicates.query(() => {
            getDuplicatesCallCount++
            return []
          })
        ]
      }
    }
  },
  beforeEach: () => {
    getDuplicatesCallCount = 0
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'The ordinary duplicate warning is shown, not the "cannot review" banner',
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

    await step('getDuplicates is never called for this user', async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await expect(getDuplicatesCallCount).toBe(0)
    })
  }
}
