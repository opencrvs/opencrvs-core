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
import { userEvent, within, expect } from '@storybook/test'
import React from 'react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import {
  ActionStatus,
  ActionType,
  EventDocument
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { AssignmentStatus } from '@client/v2-events/utils'
import { ActionMenu } from './ActionMenu'
import { actionLabels } from './useActionMenuItems'

const actionProps = {
  createdAt: '2025-04-18T08:34:20.711Z',
  createdBy: '67f6607c3866c994bcc0335a',
  createdAtLocation: '03c4aab4-cd46-4fb1-b30d-2e3b7ba0bfe8',
  id: '827bf7e8-0e1e-4cef-aee7-66e71287a2c8',
  declaration: {},
  status: ActionStatus.Accepted
}

const mockActions = {
  [ActionType.CREATE]: { ...actionProps, type: ActionType.CREATE },
  [AssignmentStatus.ASSIGNED_TO_OTHERS]: {
    ...actionProps,
    type: ActionType.ASSIGN,
    assignedTo: '67f6607c3866c994bcc0335a'
  },
  [AssignmentStatus.ASSIGNED_TO_SELF]: {
    ...actionProps,
    type: ActionType.ASSIGN,
    assignedTo: '67ef7f83d6a9cb92e9edaaa9'
  },
  [ActionType.UNASSIGN]: {
    ...actionProps,
    type: ActionType.UNASSIGN,
    assignedTo: null
  },
  [ActionType.READ]: { ...actionProps, type: ActionType.READ },
  [ActionType.NOTIFY]: { ...actionProps, type: ActionType.NOTIFY }
}

function getMockEvent(actions: (keyof typeof mockActions)[]): EventDocument {
  return {
    type: 'tennis-club-membership',
    id: 'b4c52c54-f6eb-45ee-be70-142838f8c8d4',
    createdAt: '2025-04-18T08:34:20.711Z',
    updatedAt: '2025-04-18T10:40:59.442Z',
    trackingId: '75HT9J',
    actions: actions
      .filter((action) => Object.keys(mockActions).includes(action))
      .map((action) => mockActions[action])
  }
}
const meta: Meta<typeof ActionMenu> = {
  title: 'ActionMenu',
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export default meta

enum AssertType {
  HIDDEN = 'HIDDEN',
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED'
}

const hiddenActions = Object.values(ActionType).reduce(
  (acc, action) => {
    acc[action] = AssertType.HIDDEN
    return acc
  },
  {} as Record<ActionType, AssertType>
)

const scenarios: {
  name: string
  actions: (keyof typeof mockActions)[]
  expected: Record<ActionType, AssertType>
}[] = [
  {
    name: 'Created-LocalRegistrar-AssignedToSelf',
    actions: [ActionType.CREATE, AssignmentStatus.ASSIGNED_TO_SELF],
    expected: {
      ...hiddenActions,
      [ActionType.UNASSIGN]: AssertType.ENABLED,
      [ActionType.READ]: AssertType.ENABLED,
      [ActionType.DECLARE]: AssertType.ENABLED,
      [ActionType.DELETE]: AssertType.ENABLED
    }
  },
  {
    name: 'Notified-LocalRegistrar-Unassigned',
    actions: [
      ActionType.CREATE,
      AssignmentStatus.ASSIGNED_TO_SELF,
      ActionType.NOTIFY,
      ActionType.UNASSIGN
    ],
    expected: {
      ...hiddenActions,
      [ActionType.ASSIGN]: AssertType.ENABLED,
      [ActionType.READ]: AssertType.ENABLED,
      [ActionType.VALIDATE]: AssertType.DISABLED
    }
  },
  {
    name: 'Notified-LocalRegistrar-AssignedToSelf',
    actions: [
      ActionType.CREATE,
      AssignmentStatus.ASSIGNED_TO_SELF,
      ActionType.NOTIFY
    ],
    expected: {
      ...hiddenActions,
      [ActionType.UNASSIGN]: AssertType.ENABLED,
      [ActionType.READ]: AssertType.ENABLED,
      [ActionType.VALIDATE]: AssertType.ENABLED
    }
  },
  {
    name: 'Notified-LocalRegistrar-AssignedToOther',
    actions: [
      ActionType.CREATE,
      AssignmentStatus.ASSIGNED_TO_SELF,
      ActionType.NOTIFY,
      ActionType.UNASSIGN,
      AssignmentStatus.ASSIGNED_TO_OTHERS
    ],
    expected: {
      ...hiddenActions,
      [ActionType.UNASSIGN]: AssertType.ENABLED,
      [ActionType.READ]: AssertType.ENABLED,
      [ActionType.VALIDATE]: AssertType.DISABLED
    }
  }
]

function getActionByLabel(label: string): ActionType {
  const actionEntry = Object.entries(actionLabels).filter(
    ([key, value]) => value.defaultMessage === label
  )
  if (actionEntry.length === 0) {
    throw new Error(`Action with label ${label} not found`)
  }
  return actionEntry[0][0] as ActionType
}

const stories = scenarios.reduce(
  (acc, { name, actions, expected }) => {
    acc[name] = {
      name: name,
      parameters: {
        layout: 'centered',
        msw: {
          handlers: {
            event: [
              tRPCMsw.event.get.query(() => {
                return getMockEvent(actions)
              })
            ]
          }
        }
      },
      render: function Component() {
        return <ActionMenu eventId="some-event" />
      },
      play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        await userEvent.click(await canvas.findByText('Action'))

        const actionVisibility = { ...hiddenActions }

        const actionItems = canvasElement.querySelectorAll('li')
        actionItems.forEach(
          (li) =>
            (actionVisibility[getActionByLabel(li.innerText)] = li.hasAttribute(
              'disabled'
            )
              ? AssertType.DISABLED
              : AssertType.ENABLED)
        )

        await expect(actionVisibility).toEqual(expected)
      }
    } satisfies StoryObj<typeof ActionMenu>
    return acc
  },
  {} as Record<string, StoryObj<typeof ActionMenu>>
)

export const Created_LocalRegistrar_AssigendToSelf =
  stories['Created-LocalRegistrar-AssignedToSelf']

export const Notified_LocalRegistrar_Unassigned =
  stories['Notified-LocalRegistrar-Unassigned']
export const Notified_LocalRegistrar_AssigendToSelf =
  stories['Notified-LocalRegistrar-AssignedToSelf']
export const Notified_LocalRegistrar_AssigendToOther =
  stories['Notified-LocalRegistrar-AssignedToOther']
