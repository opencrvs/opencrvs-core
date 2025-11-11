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
import { userEvent, expect, waitFor, screen } from '@storybook/test'
import React from 'react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import {
  Action,
  ActionStatus,
  ActionType,
  ActionBase,
  ActionTypes,
  EventDocument,
  getCurrentEventState,
  getUUID,
  TENNIS_CLUB_MEMBERSHIP,
  tennisClubMembershipEvent,
  UUID,
  ClientSpecificAction,
  generateUuid,
  createPrng
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

const rng = createPrng(72)

function getMockActions(createdBy: string) {
  return {
    [ActionType.CREATE]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.CREATE
    },
    [ActionType.DECLARE]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.DECLARE
    },
    [ActionType.VALIDATE]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.VALIDATE
    },
    [ActionType.REGISTER]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.REGISTER
    },
    [AssignmentStatus.ASSIGNED_TO_OTHERS]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.ASSIGN,
      assignedTo: 'some-other-user-id'
    },
    [AssignmentStatus.ASSIGNED_TO_SELF]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.ASSIGN,
      assignedTo: generator.user.id.localRegistrar
    },
    [ActionType.UNASSIGN]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.UNASSIGN
    },
    [ActionType.READ]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.READ
    },
    [ActionType.NOTIFY]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.NOTIFY
    },
    [ActionType.REQUEST_CORRECTION]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.REQUEST_CORRECTION
    },
    [ClientSpecificAction.REVIEW_CORRECTION_REQUEST]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.REQUEST_CORRECTION
    },
    [ActionType.APPROVE_CORRECTION]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.APPROVE_CORRECTION,
      requestId: '827bf7e8-0e1e-4cef-66e71287a2c8-aee7'
    },
    [ActionType.REJECT_CORRECTION]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.REJECT_CORRECTION,
      requestId: '827bf7e8-0e1e-66e71287a2c8-aee7-4cef',
      content: { reason: 'No legal proof' }
    },
    [ActionType.DELETE]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.READ
    },
    [ActionType.PRINT_CERTIFICATE]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.PRINT_CERTIFICATE
    },
    [ActionType.MARK_AS_DUPLICATE]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.MARK_AS_DUPLICATE
    },
    [ActionType.ARCHIVE]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.ARCHIVE,
      content: { reason: 'Archived' }
    },
    [ActionType.REJECT]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.REJECT,
      content: { reason: 'Rejected' }
    },
    [ActionType.ASSIGN]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.ASSIGN,
      assignedTo: generator.user.id.localRegistrar
    },
    [ActionType.DUPLICATE_DETECTED]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.MARK_AS_DUPLICATE
    },
    [ActionType.MARK_AS_NOT_DUPLICATE]: {
      ...actionProps,
      createdBy,
      id: generateUuid(rng),
      type: ActionType.MARK_AS_NOT_DUPLICATE
    }
  }
}

export const enum UserRoles {
  LOCAL_REGISTRAR = 'LocalRegistrar',
  FIELD_AGENT = 'FieldAgent',
  REGISTRATION_AGENT = 'RegistrationAgent'
}

function getUserIdByRole(role: UserRoles) {
  // eslint-disable-next-line no-nested-ternary
  return role === UserRoles.LOCAL_REGISTRAR
    ? generator.user.id.localRegistrar
    : role === UserRoles.FIELD_AGENT
      ? generator.user.id.fieldAgent
      : generator.user.id.registrationAgent
}

export function getMockEvent(
  actions: (keyof ReturnType<typeof getMockActions>)[],
  role: UserRoles,
  requested?: ActionType
): EventDocument {
  const userId = getUserIdByRole(role)

  return {
    type: TENNIS_CLUB_MEMBERSHIP,
    id: getUUID(),
    createdAt: '2025-04-18T08:34:20.711Z',
    updatedAt: '2025-04-18T10:40:59.442Z',
    trackingId: '75HT9J',
    actions: actions
      .filter((action) => Object.keys(getMockActions(userId)).includes(action))
      .map((action) => {
        const mockAction = getMockActions(userId)[action]
        if (
          mockAction.type === ActionType.ASSIGN &&
          action === AssignmentStatus.ASSIGNED_TO_SELF
        ) {
          mockAction.assignedTo = userId
        }

        if (action === requested) {
          mockAction.status = ActionStatus.Requested
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

type ActionLabel =
  | (typeof actionLabels)[keyof typeof actionLabels]['defaultMessage']
  | 'Review'

export const getHiddenActions = () =>
  Object.values(ActionTypes.enum).reduce(
    (acc, action) => {
      const label = actionLabels[action as keyof typeof actionLabels]

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!label) {
        return acc
      }

      acc[label.defaultMessage] = AssertType.HIDDEN
      return acc
    },
    {} as Record<ActionLabel, AssertType>
  )

export interface Scenario {
  name: string
  recordDownloaded: boolean
  actions: (keyof ReturnType<typeof getMockActions>)[]
  /** Sets the given ActionType as `requested` to mock async flows */
  requested?: ActionType
  expected: Partial<Record<ActionLabel, AssertType>>
}

async function checkMenuItems(
  expected: Partial<Record<ActionLabel, AssertType>>
) {
  for (const [action, expectedState] of Object.entries(expected)) {
    if (expectedState === AssertType.HIDDEN) {
      await expect(screen.queryByText(action)).not.toBeInTheDocument()
    } else {
      const item = await screen.findByText(action)

      await waitFor(async () => {
        const isDisabled = item.hasAttribute('disabled')
        await expect(isDisabled).toBe(expectedState === AssertType.DISABLED)
      })
    }
  }
}

export function createStoriesFromScenarios(
  scenarios: Scenario[],
  role: UserRoles
): Record<string, StoryObj<typeof ActionMenu>> {
  return scenarios.reduce(
    (acc, { name, actions, expected, recordDownloaded, requested }) => {
      const event = getMockEvent(actions, role, requested)
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
                })),
                tRPCMsw.event.get.query(() => {
                  return event
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

          await checkMenuItems(expected)
        }
      } satisfies StoryObj<typeof ActionMenu>
      return acc
    },
    {} as Record<string, StoryObj<typeof ActionMenu>>
  )
}

/**
 * @deprecated - Temporary story until we start working on 1.10 features
 * Users (Field agent or similar) are not allowed to view details of an event they did not create.
 * Once read scopes are implemented, we can remove this story and create it as part of the scenario builder.
 */
export function createdByOtherUserScenario({
  event,
  role,
  expected
}: {
  event: EventDocument
  role: UserRoles
  expected: Partial<Record<ActionLabel, AssertType>>
}) {
  return {
    loaders: [
      () => {
        window.localStorage.setItem(
          'opencrvs',
          // eslint-disable-next-line no-nested-ternary
          role === UserRoles.LOCAL_REGISTRAR
            ? generator.user.token.localRegistrar
            : role === UserRoles.FIELD_AGENT
              ? generator.user.token.fieldAgent
              : generator.user.token.registrationAgent
        )

        return {}
      }
    ],
    name: 'CreatedByOther',
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
              return event
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
      addLocalEventConfig(tennisClubMembershipEvent)
      setEventData(event.id, event)
    },
    play: async () => {
      const actionButton = await screen.findByRole('button', {
        name: 'Action'
      })

      await userEvent.click(actionButton)
      await checkMenuItems(expected)
    }
  }
}
