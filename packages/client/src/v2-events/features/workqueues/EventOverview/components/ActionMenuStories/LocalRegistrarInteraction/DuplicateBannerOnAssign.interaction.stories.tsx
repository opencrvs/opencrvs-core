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
import { expect, screen, userEvent, within } from 'storybook/test'
import superjson from 'superjson'
import { TRPCError } from '@trpc/server'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import {
  ActionType,
  createPrng,
  EventDocument,
  EventDocumentOnlyLastAction,
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
  title: 'ActionMenu/LocalRegistrar/DuplicateBannerOnAssign'
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

const baseDoc = {
  type: TENNIS_CLUB_MEMBERSHIP,
  id: eventId,
  trackingId,
  createdAt: new Date(Date.now() - 1000).toISOString(),
  updatedAt: new Date(Date.now() - 1000).toISOString()
}

/** Unassigned, flagged as a potential duplicate of a record outside jurisdiction. */
const eventUnassigned: EventDocument = {
  ...baseDoc,
  actions: [createAction, declareAction, duplicateDetectedAction]
}

/** Assigned to the local registrar; the match is still outside their jurisdiction. */
const eventAssigned: EventDocument = {
  ...baseDoc,
  actions: [createAction, declareAction, duplicateDetectedAction, assignAction]
}

/*
 * Mutable reference so MSW handlers always return current state.
 */
let currentDoc: EventDocument = eventUnassigned
let getDuplicatesCallCount = 0

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

/*
 * The match sits outside the user's jurisdiction, so `getDuplicates` refuses
 * every call — but only once the record is assigned. Unassigned, the server
 * answers 409, which says nothing about jurisdiction, so the check waits.
 */
export const NoCheckUntilAssigned: StoryObj = {
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.buildPath({ eventId })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.search.query(() => ({
            total: 1,
            results: [
              getCurrentEventState(currentDoc, tennisClubMembershipEvent)
            ]
          })),
          tRPCMsw.event.get.query(() => currentDoc),
          tRPCMsw.event.getDuplicates.query(async () => {
            getDuplicatesCallCount++
            // Genuinely, consistently outside jurisdiction — never available.
            await new Promise((resolve) => setTimeout(resolve, 100))
            throw new TRPCError({ code: 'FORBIDDEN' })
          }),
          tRPCMsw.event.actions.assignment.assign.mutation(() => {
            currentDoc = eventAssigned

            return EventDocumentOnlyLastAction.parse({
              ...currentDoc,
              actions: [assignAction]
            })
          })
        ]
      }
    }
  },
  // The module outlives a run, so reset or a replay would start assigned.
  beforeEach: () => {
    currentDoc = eventUnassigned
    getDuplicatesCallCount = 0
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Unassigned: the ordinary warning shows and the check is never asked',
      async () => {
        await expect(
          await canvas.findByText(
            `Potential duplicate of record ${duplicateTrackingId}`
          )
        ).toBeVisible()
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await expect(getDuplicatesCallCount).toBe(0)
      }
    )

    await step('Assign the record', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Action' })
      )
      await userEvent.click(await canvas.findByText('Assign'))
      await userEvent.click(
        await screen.findByRole('button', { name: 'Assign' })
      )
    })

    await step(
      'Now that the refusal is a real answer, the banner appears',
      async () => {
        await expect(
          await canvas.findByText(
            'You cannot review this record for duplicates',
            undefined,
            { timeout: 10000 }
          )
        ).toBeVisible()
        await expect(
          canvas.queryByText(
            `Potential duplicate of record ${duplicateTrackingId}`
          )
        ).toBeNull()
      }
    )
  }
}
