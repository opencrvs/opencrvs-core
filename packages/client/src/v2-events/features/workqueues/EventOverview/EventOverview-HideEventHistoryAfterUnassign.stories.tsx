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
import React from 'react'
import superjson from 'superjson'
import { userEvent, within } from '@storybook/test'
import addDays from 'date-fns/addDays'
import {
  ActionType,
  generateEventDraftDocument,
  ActionStatus,
  getUUID,
  createPrng,
  generateRandomDatetime,
  tennisClubMembershipEvent,
  getCurrentEventState,
  UUID,
  SystemRole,
  TestUserRole,
  generateActionDocument,
  ActionDocument,
  generateUuid,
  generateTrackingId,
  generateRandomSignature
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { setEventData } from '../../events/useEvents/api'
import { EventOverviewIndex } from './EventOverview'

const meta: Meta<typeof EventOverviewIndex> = {
  title: 'HideEventHistoryAfterUnassign',
  component: EventOverviewIndex,
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR
  },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof EventOverviewIndex>

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const refData = testDataGenerator()

const actionDefaults = {
  createdAt: generateRandomDatetime(
    createPrng(73),
    new Date('2024-03-01'),
    new Date('2024-04-01')
  ),
  createdBy: refData.user.id.localRegistrar,
  createdByRole: TestUserRole.enum.LOCAL_REGISTRAR,
  createdAtLocation: refData.user.localRegistrar().v2.primaryOfficeId,
  transactionId: getUUID()
} satisfies Partial<ActionDocument>

const duplicateEvent = {
  ...tennisClubMembershipEventDocument,
  actions: [
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.CREATE,
      defaults: actionDefaults
    }),
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.ASSIGN,
      defaults: {
        ...actionDefaults,
        assignedTo: refData.user.id.localRegistrar
      }
    }),
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.DECLARE,
      defaults: actionDefaults
    }),
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.DUPLICATE_DETECTED,
      defaults: {
        ...actionDefaults,
        content: {
          duplicates: [{ id: getUUID(), trackingId: '0R1G1NAL' }]
        }
      }
    }),
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.ASSIGN,
      defaults: {
        ...actionDefaults,
        assignedTo: refData.user.id.localRegistrar
      }
    })
  ]
}

const unassignAction = {
  id: 'a5d1aeb0-3c3b-4924-8612-a3129f11f12b' as UUID,
  transactionId: '74c346dd-0d16-4f3d-b88c-4ce7384fcb57',
  createdByUserType: 'user',
  createdAt: '2025-12-03T08:28:10.960Z',
  createdBy: '692562040e9efc8301944dda',
  createdByRole: 'LOCAL_REGISTRAR',
  createdAtLocation: '5ea30886-72ef-404b-a966-f634aa69d127' as UUID,
  declaration: {},
  annotation: {},
  status: 'Accepted',
  type: 'UNASSIGN'
} satisfies ActionDocument

const unassignedEvent = {
  ...duplicateEvent,
  actions: duplicateEvent.actions.concat(unassignAction)
}

export const HideEventHistoryAfterUnassign: Story = {
  parameters: {
    /**
     * Intentionally disabled snapshot - should hide history after unassign
     */
    chromatic: { disableSnapshot: false },
    offline: {
      events: [duplicateEvent]
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.AUDIT.buildPath({
        eventId: duplicateEvent.id
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.search.query(() => {
            return {
              results: [
                getCurrentEventState(duplicateEvent, tennisClubMembershipEvent)
              ],
              total: 1
            }
          }),
          tRPCMsw.event.actions.assignment.unassign.mutation(() => {
            return unassignedEvent
          })
        ]
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', {
        name: 'Action'
      })
    )

    await userEvent.click(await canvas.findByText('Unassign'))

    await userEvent.click(
      await canvas.findByRole('button', {
        name: 'Unassign'
      })
    )
  }
}
