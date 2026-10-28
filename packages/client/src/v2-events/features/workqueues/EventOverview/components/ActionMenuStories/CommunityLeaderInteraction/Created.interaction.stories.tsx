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
import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, expect, waitFor, screen } from 'storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import {
  ActionType,
  generateEventDocument,
  generateEventDraftDocument,
  getCurrentEventState,
  tennisClubMembershipEvent,
  TestUserRole
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import {
  setEventData,
  addLocalEventConfig
} from '@client/v2-events/features/events/useEvents/api'
import { ActionMenu } from '../../ActionMenu'

const generator = testDataGenerator()

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

/*
 * A CREATED draft assigned to the community leader, as would happen when they
 * create a new event (the server auto-assigns it to the creator).
 */
const createdEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    {
      type: ActionType.CREATE
    },
    {
      type: ActionType.ASSIGN,
      user: { assignedTo: generator.user.id.communityLeader }
    }
  ]
})

const eventState = getCurrentEventState(
  createdEventDocument,
  tennisClubMembershipEvent
)

export default {
  title: 'ActionMenu/CommunityLeader/Created',
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
} as Meta<typeof ActionMenu>

/**
 * Regression: Community leaders have record.notify (not record.declare).
 * Before the fix, Delete was hidden for CREATED drafts owned by the community leader.
 *
 * Declare is never in the menu. With a notify draft open, Update continues it,
 * see AssignedToSelfWithNotifyDraft.
 *
 * NOTE: This story requires the communityLeader token in test-data-generators.ts
 * to be regenerated after the scopes were corrected from record.declare to
 * record.notify. Run:
 *   yarn vitest run src/tests/token-generator.test.ts -u
 * and copy the updated token back into test-data-generators.ts.
 */
export const AssignedToSelf: StoryObj<typeof ActionMenu> = {
  loaders: [
    () => {
      window.localStorage.setItem(
        'opencrvs',
        generator.user.token.communityLeader
      )
      return {}
    }
  ],
  parameters: {
    layout: 'centered',
    userRole: TestUserRole.enum.COMMUNITY_LEADER,
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.search.query(() => ({
            total: 1,
            results: [eventState]
          })),
          tRPCMsw.event.get.query(() => createdEventDocument)
        ]
      }
    }
  },
  render: () => (
    <React.Suspense fallback={<span>{'Loading…'}</span>}>
      <ActionMenu eventId={createdEventDocument.id} />
    </React.Suspense>
  ),
  beforeEach: () => {
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(createdEventDocument.id, createdEventDocument)
  },
  play: async () => {
    const actionButton = await screen.findByRole('button', { name: 'Action' })
    await expect(actionButton).toBeVisible()
    await userEvent.click(actionButton)

    // Delete must be visible and enabled — record.notify satisfies the delete scope.
    const deleteItem = await screen.findByText('Delete')
    await waitFor(async () => {
      await expect(deleteItem.hasAttribute('disabled')).toBe(false)
    })

    // Declare is not in the menu. tennisClubMembershipEvent configures DECLARE's label as "Send an application".
    await expect(screen.queryByText('Send an application')).toBeNull()
  }
}

const notifyDraft = generateEventDraftDocument({
  eventId: createdEventDocument.id,
  actionType: ActionType.NOTIFY
})

/**
 * A community leader with a notify draft open gets Update (CONTINUE_DRAFT), which
 * continues the draft in the notify flow. It's checked against NOTIFY, which they hold.
 */
export const AssignedToSelfWithNotifyDraft: StoryObj<typeof ActionMenu> = {
  ...AssignedToSelf,
  parameters: {
    ...AssignedToSelf.parameters,
    offline: {
      drafts: [notifyDraft]
    }
  },
  play: async () => {
    const actionButton = await screen.findByRole('button', { name: 'Action' })
    await userEvent.click(actionButton)

    const updateItem = await screen.findByText('Update')
    await waitFor(async () => {
      await expect(updateItem.hasAttribute('disabled')).toBe(false)
    })

    // Declare is not offered alongside it
    await expect(screen.queryByText('Send an application')).toBeNull()
  }
}
