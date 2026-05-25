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
import { expect, userEvent, waitFor, screen, within } from '@storybook/test'
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
  title: 'ActionMenu/LocalRegistrar/CustomActionDisabledByDuplicateFlag'
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

const markNotDuplicateAction = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.MARK_AS_NOT_DUPLICATE,
  defaults: { createdBy: localRegistrar.v2.id }
})

const baseDoc = {
  type: TENNIS_CLUB_MEMBERSHIP,
  id: eventId,
  trackingId,
  createdAt: new Date(Date.now() - 1000).toISOString(),
  updatedAt: new Date(Date.now() - 1000).toISOString()
}

/*
 * State 1: unassigned, has potential-duplicate flag
 * Expected: 'Confirm' disabled (not assigned to self)
 */
const eventUnassigned: EventDocument = {
  ...baseDoc,
  actions: [createAction, declareAction, duplicateDetectedAction]
}

/*
 * State 2: assigned to local registrar, still has potential-duplicate flag
 * Expected: 'Confirm' still disabled (assigned + downloaded, but ENABLE conditional fails)
 */
const eventAssignedWithFlag: EventDocument = {
  ...baseDoc,
  actions: [createAction, declareAction, duplicateDetectedAction, assignAction]
}

/*
 * State 3: assigned, potential-duplicate flag cleared by MARK_AS_NOT_DUPLICATE
 * Expected: 'Confirm' enabled
 */
const eventAssignedNoFlag: EventDocument = {
  ...baseDoc,
  actions: [
    createAction,
    declareAction,
    duplicateDetectedAction,
    assignAction,
    markNotDuplicateAction
  ]
}

const mockDuplicateEvent: EventDocument = {
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

/*
 * Mutable reference so MSW handlers always return current state.
 * Without this, background refetches (staleTime: 0) would reset the component
 * to the initial state after mutations update the cache.
 */
let currentDoc: EventDocument = eventUnassigned

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

/*
 * Regression test for inverted custom action ENABLE conditional.
 *
 * Flow:
 * 1. Load EventOverview with unassigned event + DUPLICATE_DETECTED flag → 'Confirm' disabled
 * 2. Assign record → still disabled (flag present, conditional fails)
 * 3. Click 'Review potential duplicates' → navigate to ReviewDuplicate page
 * 4. Click 'Not a duplicate' → confirm → navigate back to EventOverview
 * 5. 'Confirm' is now enabled (flag cleared, conditional passes)
 */
export const ApproveActionStateTransitions: StoryObj = {
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.buildPath({ eventId })
    },
    offline: {
      events: [eventUnassigned, mockDuplicateEvent]
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
          tRPCMsw.event.getDuplicates.query(() => []),
          tRPCMsw.event.actions.assignment.assign.mutation(() => {
            currentDoc = eventAssignedWithFlag
            return eventAssignedWithFlag
          }),
          tRPCMsw.event.actions.duplicate.markNotDuplicate.mutation(() => {
            currentDoc = eventAssignedNoFlag
            return eventAssignedNoFlag
          })
        ]
      }
    }
  },
  beforeEach: () => {
    currentDoc = eventUnassigned
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Unassigned + potential-duplicate flag: Confirm is disabled',
      async () => {
        await userEvent.click(
          await canvas.findByRole('button', { name: 'Action' })
        )
        const confirmItem = await canvas.findByText('Confirm')
        await waitFor(async () => {
          await expect(confirmItem.closest('li')).toHaveAttribute('disabled')
        })
        await userEvent.keyboard('{Escape}')
      }
    )

    await step(
      'Assign record: Confirm is still disabled (flag still present)',
      async () => {
        await userEvent.click(
          await canvas.findByRole('button', { name: 'Action' })
        )
        await userEvent.click(await canvas.findByText('Assign'))

        // AssignModal opens — confirm assignment
        await userEvent.click(
          await screen.findByRole('button', { name: 'Assign' })
        )

        // Open menu and wait for Unassign to appear (mutation completed, state updated)
        await userEvent.click(
          await canvas.findByRole('button', { name: 'Action' })
        )
        await canvas.findByText('Unassign')

        const confirmItem = canvas.getByText('Confirm')
        await waitFor(async () => {
          await expect(confirmItem.closest('li')).toHaveAttribute('disabled')
        })
        await userEvent.keyboard('{Escape}')
      }
    )

    await step(
      'Navigate to duplicate review page and mark as not duplicate',
      async () => {
        await userEvent.click(
          await canvas.findByRole('button', { name: 'Action' })
        )
        await userEvent.click(
          await canvas.findByText('Review potential duplicates')
        )

        // On ReviewDuplicate page — click Not a duplicate
        await userEvent.click(
          await canvas.findByRole('button', { name: /Not a duplicate/i })
        )
        // Confirm in modal
        await userEvent.click(
          await canvas.findByRole('button', { name: /Confirm/i })
        )
      }
    )

    await step(
      'Flag cleared by mark-as-not-duplicate: Confirm is now enabled',
      async () => {
        // Wait for navigation back to EventOverview
        await canvas.findByRole('button', { name: 'Action' })

        await userEvent.click(
          await canvas.findByRole('button', { name: 'Action' })
        )
        await waitFor(async () => {
          const confirmItem = canvas.queryByText('Confirm')
          await expect(confirmItem).toBeInTheDocument()
          await expect(confirmItem?.closest('li')).not.toHaveAttribute(
            'disabled'
          )
        })
      }
    )
  }
}
