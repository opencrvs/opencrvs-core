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

import { userEvent, screen } from '@storybook/test'
import React from 'react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { Meta, StoryObj } from '@storybook/react'
import {
  ActionType,
  getCurrentEventState,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { AssignmentStatus } from '@client/v2-events/utils'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import {
  addLocalEventConfig,
  setEventData
} from '@client/v2-events/features/events/useEvents/api'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { ActionMenu } from '../ActionMenu'
import { getMockEvent, UserRoles } from './ActionMenu.common'

const event = getMockEvent(
  [
    ActionType.CREATE,
    AssignmentStatus.ASSIGNED_TO_SELF,
    ActionType.DECLARE,
    ActionType.UNASSIGN,
    AssignmentStatus.ASSIGNED_TO_OTHERS
  ],
  UserRoles.LOCAL_REGISTRAR
)

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const generator = testDataGenerator()

const meta: Meta<typeof ActionMenu> = {
  title: 'ActionMenu/Assignment',
  component: ActionMenu
}
export default meta

type Story = StoryObj<typeof meta>

export const AssignedTo: Story = {
  loaders: [
    async () => {
      window.localStorage.setItem(
        'opencrvs',
        generator.user.token.localRegistrar
      )

      // Tests are generated dynamically, and it causes intermittent failures when global state
      // gets out of whack. This is a workaround to ensure that the state is reset
      await new Promise((resolve) => setTimeout(resolve, 50))

      return {}
    }
  ],
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.search.query(() => ({
            total: 1,
            results: [getCurrentEventState(event, tennisClubMembershipEvent)]
          })),
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          })
        ]
      }
    }
  },
  render: () => (
    <React.Suspense fallback={<span>{'Loading…'}</span>}>
      <ActionMenu eventId={event.id} />
    </React.Suspense>
  ),
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(event.id, event)
  },
  play: async () => {
    const actionButton = await screen.findByRole('button', {
      name: 'Action'
    })
    await userEvent.click(actionButton)
  }
}
