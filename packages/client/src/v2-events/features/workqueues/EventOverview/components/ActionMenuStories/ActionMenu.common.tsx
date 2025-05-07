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
import { userEvent, expect, waitFor } from '@storybook/test'
import React from 'react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { screen } from '@testing-library/dom'
import {
  Action,
  ActionStatus,
  ActionType,
  ActionTypes,
  EventDocument,
  getUUID,
  IndexMap,
  TranslationConfig
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { AssignmentStatus } from '@client/v2-events/utils'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { ActionMenu } from '../ActionMenu'
import { actionLabels } from '../useActionMenuItems'

const generator = testDataGenerator()

const actionProps = {
  createdAt: '2025-04-18T08:34:20.711Z',
  createdBy: '67f6607c3866c994bcc0335a',
  createdByRole: 'some-user-role',
  createdAtLocation: '03c4aab4-cd46-4fb1-b30d-2e3b7ba0bfe8',
  id: '827bf7e8-0e1e-4cef-aee7-66e71287a2c8',
  declaration: {},
  status: ActionStatus.Accepted,
  transactionId: getUUID()
}

export const mockActions: Record<
  ActionType | 'ASSIGNED_TO_SELF' | 'ASSIGNED_TO_OTHERS',
  Action
> = {
  [ActionType.CREATE]: { ...actionProps, type: ActionType.CREATE },
  [ActionType.DECLARE]: { ...actionProps, type: ActionType.DECLARE },
  [ActionType.VALIDATE]: { ...actionProps, type: ActionType.VALIDATE },
  [ActionType.REGISTER]: { ...actionProps, type: ActionType.REGISTER },
  [AssignmentStatus.ASSIGNED_TO_OTHERS]: {
    ...actionProps,
    type: ActionType.ASSIGN,
    assignedTo: 'some-other-user-id'
  },
  [AssignmentStatus.ASSIGNED_TO_SELF]: {
    ...actionProps,
    type: ActionType.ASSIGN,
    assignedTo: generator.user.id.localRegistrar
  },
  [ActionType.UNASSIGN]: {
    ...actionProps,
    type: ActionType.UNASSIGN,
    assignedTo: null
  },
  [ActionType.READ]: { ...actionProps, type: ActionType.READ },
  [ActionType.NOTIFY]: { ...actionProps, type: ActionType.NOTIFY },
  [ActionType.REQUEST_CORRECTION]: {
    ...actionProps,
    type: ActionType.REQUEST_CORRECTION
  },
  [ActionType.APPROVE_CORRECTION]: {
    ...actionProps,
    type: ActionType.APPROVE_CORRECTION,
    requestId: '827bf7e8-0e1e-4cef-66e71287a2c8-aee7'
  },
  [ActionType.REJECT_CORRECTION]: {
    ...actionProps,
    type: ActionType.REJECT_CORRECTION,
    requestId: '827bf7e8-0e1e-66e71287a2c8-aee7-4cef'
  },
  [ActionType.DELETE]: {
    ...actionProps,
    type: ActionType.READ
  },
  [ActionType.PRINT_CERTIFICATE]: {
    ...actionProps,
    type: ActionType.PRINT_CERTIFICATE
  },
  [ActionType.MARKED_AS_DUPLICATE]: {
    ...actionProps,
    type: ActionType.MARKED_AS_DUPLICATE
  },
  [ActionType.ARCHIVE]: {
    ...actionProps,
    type: ActionType.ARCHIVE
  },
  [ActionType.REJECT]: {
    ...actionProps,
    type: ActionType.REJECT
  },
  [ActionType.ASSIGN]: {
    ...actionProps,
    type: ActionType.ASSIGN,
    assignedTo: generator.user.id.localRegistrar
  },
  [ActionType.DETECT_DUPLICATE]: {
    ...actionProps,
    type: ActionType.MARKED_AS_DUPLICATE
  }
}

export const enum UserRoles {
  LOCAL_REGISTRAR = 'LocalRegistrar',
  FIELD_AGENT = 'FieldAgent',
  REGISTRATION_AGENT = 'RegistrationAgent'
}

function getMockEvent(
  actions: (keyof typeof mockActions)[],
  role: UserRoles
): EventDocument {
  const userId =
    // eslint-disable-next-line no-nested-ternary
    role === UserRoles.LOCAL_REGISTRAR
      ? generator.user.id.localRegistrar
      : role === UserRoles.FIELD_AGENT
        ? generator.user.id.fieldAgent
        : generator.user.id.registrationAgent
  return {
    type: 'tennis-club-membership',
    id: 'b4c52c54-f6eb-45ee-be70-142838f8c8d4',
    createdAt: '2025-04-18T08:34:20.711Z',
    updatedAt: '2025-04-18T10:40:59.442Z',
    trackingId: '75HT9J',
    updatedAtLocation: '03c4aab4-cd46-4fb1-b30d-2e3b7ba0bfe8',
    actions: actions
      .filter((action) => Object.keys(mockActions).includes(action))
      .map((action) => {
        const mockAction = mockActions[action]
        if (
          mockAction.type === ActionType.ASSIGN &&
          action === AssignmentStatus.ASSIGNED_TO_SELF
        ) {
          mockAction.assignedTo = userId
        }

        return mockAction
      })
  }
}

export const baseMeta: Meta<typeof ActionMenu> = {
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

export const enum AssertType {
  HIDDEN = 'HIDDEN',
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED'
}

export const getHiddenActions = () =>
  Object.values(ActionTypes.Values).reduce(
    (acc, action) => {
      acc[action] = AssertType.HIDDEN
      return acc
    },
    {} as Record<ActionType, AssertType>
  )

export interface Scenario {
  name: string
  actions: (keyof typeof mockActions)[]
  expected: Record<ActionType, AssertType>
}

export function createStoriesFromScenarios(
  scenarios: Scenario[],
  role: UserRoles
): Record<string, StoryObj<typeof ActionMenu>> {
  return scenarios.reduce(
    (acc, { name, actions, expected }) => {
      acc[name] = {
        loaders: [
          async () => {
            window.localStorage.setItem(
              'opencrvs',
              // eslint-disable-next-line no-nested-ternary
              role === UserRoles.LOCAL_REGISTRAR
                ? generator.user.token.localRegistrar
                : role === UserRoles.FIELD_AGENT
                  ? generator.user.token.fieldAgent
                  : generator.user.token.registrationAgent
            )

            // Tests are generated dynamically, and it causes intermittent failures when global state
            // gets out of whack. This is a workaround to ensure that the state is reset
            await new Promise((resolve) => setTimeout(resolve, 50))

            return {}
          }
        ],
        name,
        parameters: {
          layout: 'centered',
          chromatic: { disableSnapshot: true },
          msw: {
            handlers: {
              event: [
                tRPCMsw.event.get.query(() => getMockEvent(actions, role))
              ]
            }
          }
        },
        render: () => (
          <React.Suspense fallback={<span>{'Loading…'}</span>}>
            <ActionMenu eventId="some-event" />
          </React.Suspense>
        ),
        play: async () => {
          const actionButton = await screen.findByRole('button', {
            name: 'Action'
          })

          await expect(actionButton).toBeVisible()
          await userEvent.click(actionButton)

          // We want to ensure compiler knows that action labels is a subset of action types.
          const actionLabelsAsPartial: IndexMap<TranslationConfig> =
            actionLabels

          for (const [action, expectedState] of Object.entries(expected)) {
            const label = actionLabelsAsPartial[action]?.defaultMessage
            if (!label) {
              continue
            } else if (expectedState === AssertType.HIDDEN) {
              await expect(screen.queryByText(label)).not.toBeInTheDocument()
            } else {
              const item = await screen.findByText(label)

              await waitFor(async () => {
                const isDisabled = item.hasAttribute('disabled')
                await expect(isDisabled).toBe(
                  expectedState === AssertType.DISABLED
                )
              })
            }
          }
        }
      } satisfies StoryObj<typeof ActionMenu>
      return acc
    },
    {} as Record<string, StoryObj<typeof ActionMenu>>
  )
}
