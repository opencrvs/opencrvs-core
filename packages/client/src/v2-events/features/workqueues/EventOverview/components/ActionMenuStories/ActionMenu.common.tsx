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
  ActionBase,
  ActionTypes,
  EventDocument,
  getCurrentEventState,
  getUUID,
  IndexMap,
  TENNIS_CLUB_MEMBERSHIP,
  tennisClubMembershipEvent,
  TranslationConfig,
  UUID,
  DisplayableAction,
  ClientSpecificAction
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { AssignmentStatus } from '@client/v2-events/utils'
import { testDataGenerator } from '@client/tests/test-data-generators'
import {
  setEventData,
  addLocalEventConfig
} from '@client/v2-events/features/events/useEvents/api'
import { ActionMenu } from '../ActionMenu'
import { actionLabels } from '../useAllowedActionConfigurations'

/** There is discrepancy between the actual action, and what we communicate. Even if next action is declare, it should have the text of validate  */
export const REJECTED_DECLARE_AS_REVIEW = ActionType.VALIDATE

const generator = testDataGenerator()

const actionProps: ActionBase = {
  createdAt: '2025-04-18T08:34:20.711Z',
  createdBy: '67f6607c3866c994bcc0335a',
  createdByUserType: 'user',
  createdByRole: 'some-user-role',
  createdAtLocation: '03c4aab4-cd46-4fb1-b30d-2e3b7ba0bfe8' as UUID,
  id: '827bf7e8-0e1e-4cef-aee7-66e71287a2c8' as UUID,
  declaration: {},
  status: ActionStatus.Accepted,
  transactionId: getUUID()
}

const mockActions: Record<
  ActionType | DisplayableAction | 'ASSIGNED_TO_SELF' | 'ASSIGNED_TO_OTHERS',
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
    type: ActionType.UNASSIGN
  },
  [ActionType.READ]: { ...actionProps, type: ActionType.READ },
  [ActionType.NOTIFY]: { ...actionProps, type: ActionType.NOTIFY },
  [ActionType.REQUEST_CORRECTION]: {
    ...actionProps,
    type: ActionType.REQUEST_CORRECTION
  },
  [ClientSpecificAction.REVIEW_CORRECTION_REQUEST]: {
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
    requestId: '827bf7e8-0e1e-66e71287a2c8-aee7-4cef',
    content: { reason: 'No legal proof' }
  },
  [ActionType.DELETE]: {
    ...actionProps,
    type: ActionType.READ
  },
  [ActionType.PRINT_CERTIFICATE]: {
    ...actionProps,
    type: ActionType.PRINT_CERTIFICATE
  },
  [ActionType.MARK_AS_DUPLICATE]: {
    ...actionProps,
    type: ActionType.MARK_AS_DUPLICATE
  },
  [ActionType.ARCHIVE]: {
    ...actionProps,
    type: ActionType.ARCHIVE,
    content: { reason: 'Archived' }
  },
  [ActionType.REJECT]: {
    ...actionProps,
    type: ActionType.REJECT,
    content: { reason: 'Rejected' }
  },
  [ActionType.ASSIGN]: {
    ...actionProps,
    type: ActionType.ASSIGN,
    assignedTo: generator.user.id.localRegistrar
  },
  [ActionType.DUPLICATE_DETECTED]: {
    ...actionProps,
    type: ActionType.MARK_AS_DUPLICATE
  },
  [ActionType.MARK_AS_NOT_DUPLICATE]: {
    ...actionProps,
    type: ActionType.MARK_AS_NOT_DUPLICATE
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
    type: TENNIS_CLUB_MEMBERSHIP,
    id: 'b4c52c54-f6eb-45ee-be70-142838f8c8d4' as UUID,
    createdAt: '2025-04-18T08:34:20.711Z',
    updatedAt: '2025-04-18T10:40:59.442Z',
    trackingId: '75HT9J',
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
  recordDownloaded: boolean
  actions: (keyof typeof mockActions)[]
  expected: Partial<Record<DisplayableAction, AssertType>>
}

export function createStoriesFromScenarios(
  scenarios: Scenario[],
  role: UserRoles
): Record<string, StoryObj<typeof ActionMenu>> {
  return scenarios.reduce(
    (acc, { name, actions, expected, recordDownloaded }) => {
      // Because Validate, Register and Review correction both have same message ('Review'),
      // We need to consider them as one
      const reviewLikeActions: (keyof typeof expected)[] = [
        ActionType.VALIDATE,
        ActionType.REGISTER,
        ClientSpecificAction.REVIEW_CORRECTION_REQUEST,
        ActionType.MARK_AS_DUPLICATE
      ]
      // Normalize all review-like actions to the **first non-hidden value**
      let normalizedValue: AssertType | undefined

      for (const action of reviewLikeActions) {
        const value = expected[action]
        if (value !== AssertType.HIDDEN) {
          normalizedValue = value
          break
        }
      }

      // Apply normalized value to all related actions
      if (normalizedValue !== undefined) {
        for (const action of reviewLikeActions) {
          expected[action] = normalizedValue
        }
      }

      const event = getMockEvent(actions, role)
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
                tRPCMsw.event.search.query(() => ({
                  total: 1,
                  results: [
                    getCurrentEventState(event, tennisClubMembershipEvent)
                  ]
                }))
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
          if (recordDownloaded) {
            addLocalEventConfig(tennisClubMembershipEvent)
            setEventData(event.id, event)
          }
        },
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
