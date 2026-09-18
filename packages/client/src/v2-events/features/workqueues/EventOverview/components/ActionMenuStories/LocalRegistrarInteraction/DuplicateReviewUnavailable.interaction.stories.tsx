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
import { TRPCError } from '@trpc/server'
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
import { AppRouter, queryClient } from '@client/v2-events/trpc'
import { potentialDuplicatesQueryKey } from '@client/v2-events/features/events/actions/dedup/getDuplicates'
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
 * `getDuplicates` answers only when a story releases it, so the pending window
 * belongs to the test rather than to a timer.
 */
let getDuplicatesCallCount = 0
let releaseDuplicates!: () => void
let duplicatesReleased!: Promise<void>

/** Makes the next `getDuplicates` call wait. */
function holdDuplicates() {
  duplicatesReleased = new Promise((resolve) => {
    releaseDuplicates = resolve
  })
}

async function refuseWhenReleased(): Promise<EventDocument[]> {
  getDuplicatesCallCount++
  await duplicatesReleased
  throw new TRPCError({ code: 'FORBIDDEN' })
}

/*
 * The user has access to the matched record, the server is just slow to say
 * so. While the answer is outstanding no banner may be shown, and once it
 * arrives it must be the ordinary warning — never the jurisdiction one.
 */
export const NotShownWhileDuplicateStillLoading: StoryObj = {
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.buildPath({ eventId })
    },
    // Only the main record is already in cache — the matched record arrives
    // with the `getDuplicates` answer.
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
            getDuplicatesCallCount++
            await duplicatesReleased
            return [matchedEvent]
          })
        ]
      }
    }
  },
  beforeEach: () => {
    getDuplicatesCallCount = 0
    holdDuplicates()
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('The check is asked, and left unanswered', async () => {
      await waitFor(() => expect(getDuplicatesCallCount).toBe(1))
    })

    await step(
      'Neither banner is shown while the answer is outstanding',
      async () => {
        // Nothing can answer until we release, so one look is enough.
        await expect(
          canvas.queryByText('You cannot review this record for duplicates')
        ).toBeNull()
        await expect(
          canvas.queryByText(
            `Potential duplicate of record ${duplicateTrackingId}`
          )
        ).toBeNull()
      }
    )

    await step(
      'Once the matches arrive, the ordinary warning is shown',
      async () => {
        releaseDuplicates()
        await expect(
          await canvas.findByText(
            `Potential duplicate of record ${duplicateTrackingId}`,
            undefined,
            { timeout: 10000 }
          )
        ).toBeVisible()
        await expect(
          canvas.queryByText('You cannot review this record for duplicates')
        ).toBeNull()
      }
    )
  }
}

/*
 * A refused check that is asked again — as happens whenever a second view of
 * the same record mounts. Re-asking a question already answered "no" must not
 * make the record look reviewable in the meantime.
 */
export const StaysUnavailableWhileRechecking: StoryObj = {
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
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
          tRPCMsw.event.getDuplicates.query(refuseWhenReleased)
        ]
      }
    }
  },
  beforeEach: () => {
    getDuplicatesCallCount = 0
    holdDuplicates()
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('The refusal is established', async () => {
      await waitFor(() => expect(getDuplicatesCallCount).toBe(1))
      releaseDuplicates()

      await expect(
        await canvas.findByText(
          'You cannot review this record for duplicates',
          undefined,
          { timeout: 10000 }
        )
      ).toBeVisible()
    })

    await step('The same question is asked again, and held open', async () => {
      holdDuplicates()
      // Not awaited: it only settles once we let the call answer.
      void queryClient.invalidateQueries({
        queryKey: potentialDuplicatesQueryKey(eventId)
      })

      await waitFor(() => expect(getDuplicatesCallCount).toBe(2))
    })

    await step(
      'While it is being re-asked the record never looks reviewable',
      async () => {
        // Mid-check neither banner is honest, so neither is shown.
        await expect(
          canvas.queryByText(
            `Potential duplicate of record ${duplicateTrackingId}`
          )
        ).toBeNull()
        await expect(
          canvas.queryByText('You cannot review this record for duplicates')
        ).toBeNull()
      }
    )

    await step('The refusal still stands', async () => {
      releaseDuplicates()
      await expect(
        await canvas.findByText(
          'You cannot review this record for duplicates',
          undefined,
          { timeout: 10000 }
        )
      ).toBeVisible()
    })
  }
}

/*
 * Returning to a record whose refusal is already known must not ask again:
 * the answer cannot have changed, and re-asking blanks the banner for as long
 * as the server takes to repeat itself.
 */
export const StaysVisibleWhenReturningToTheRecord: StoryObj = {
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
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
          tRPCMsw.event.getDuplicates.query(refuseWhenReleased)
        ]
      }
    }
  },
  beforeEach: () => {
    getDuplicatesCallCount = 0
    holdDuplicates()
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('The refusal is established', async () => {
      await waitFor(() => expect(getDuplicatesCallCount).toBe(1))
      releaseDuplicates()

      await expect(
        await canvas.findByText(
          'You cannot review this record for duplicates',
          undefined,
          { timeout: 10000 }
        )
      ).toBeVisible()
    })

    await step('Leave the summary and come back', async () => {
      // Held open, so asking again would blank the banner and be caught below.
      holdDuplicates()

      await userEvent.click(
        await canvas.findByRole('button', { name: 'Audit' })
      )
      await canvas.findByRole('button', { name: 'Summary' })
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Summary' })
      )
    })

    await step('The banner is there, and nothing was asked again', async () => {
      await canvas.findByText('Tracking ID', undefined, { timeout: 10000 })

      await expect(
        canvas.queryByText('You cannot review this record for duplicates')
      ).not.toBeNull()
      await expect(getDuplicatesCallCount).toBe(1)
    })
  }
}
