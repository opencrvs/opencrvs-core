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
import { Meta, StoryObj } from '@storybook/react'
import { userEvent, within, expect } from '@storybook/test'
import { waitFor } from '@testing-library/dom'
import {
  ActionType,
  eventQueryDataGenerator,
  EventStatus,
  FullDocumentPath,
  generateEventDocument,
  InherentFlags,
  tennisClubMembershipEvent,
  TokenUserType,
  UUID
} from '@opencrvs/commons/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { ROUTES } from '@client/v2-events/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { addLocalEventConfig, setEventData } from '../useEvents/api'
import { ActionCta } from './ActionCta'

const meta: Meta<typeof ActionCta> = {
  title: 'Components/ActionComponent/Interaction/RejectedStatuses',
  component: ActionCta,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}
export default meta

type Story = StoryObj<typeof ActionCta>

const mockUser = {
  id: '67bda93bfc07dee78ae558cf',
  name: [
    {
      use: 'en',
      given: ['Kalusha'],
      family: 'Bwalya'
    }
  ],
  scope: ['record.register', 'record.registration-correct'],
  role: 'SOCIAL_WORKER',
  exp: '1739881718',
  algorithm: 'RS256',
  userType: TokenUserType.enum.user,
  signature: 'signature.png' as FullDocumentPath,
  sub: '677b33fea7efb08730f3abfa33',
  avatar: undefined,
  primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID
}

function createRejectedEventByStatus(status: EventStatus) {
  const user = testDataGenerator().user

  const event = generateEventDocument({
    configuration: tennisClubMembershipEvent,
    actions: [ActionType.CREATE],
    context: { user: mockUser }
  })

  const eventQueryData = eventQueryDataGenerator(
    {
      id: event.id,
      status,
      // local registrar is the default
      assignedTo: user.id.localRegistrar,
      flags: [InherentFlags.REJECTED]
    },
    123
  )

  return {
    event,
    eventQueryData
  }
}

const rejectedNotifiedEvent = createRejectedEventByStatus(
  EventStatus.enum.NOTIFIED
)
export const DirectsRejectedNotifiedToDeclare: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(rejectedNotifiedEvent.event.id, rejectedNotifiedEvent.event)
  },

  args: {
    event: rejectedNotifiedEvent.eventQueryData
  },
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: {
        path: '/',
        children: [
          {
            path: 'start',
            Component: () => {
              return (
                <div>
                  <ActionCta
                    actionType={'DEFAULT'}
                    event={rejectedNotifiedEvent.eventQueryData}
                  />
                </div>
              )
            }
          },
          {
            path: ROUTES.V2.EVENTS.DECLARE.REVIEW.path,
            Component: () => {
              return (
                <div>
                  {ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
                    eventId: rejectedNotifiedEvent.event.id
                  })}
                </div>
              )
            }
          }
        ]
      },
      initialPath: '/start'
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const actionButton = await canvas.findByRole('button', {
      name: 'Review'
    })

    await userEvent.click(actionButton)

    // Ensure the user is redirected to the declaration review page
    await waitFor(async () => {
      await expect(
        canvas.getByText(
          ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
            eventId: rejectedNotifiedEvent.event.id
          })
        )
      ).toBeInTheDocument()
    })
  }
}

const rejectedDeclaredEvent = createRejectedEventByStatus(
  EventStatus.enum.DECLARED
)

export const DirectsRejectedDeclaredToDeclared: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(rejectedDeclaredEvent.event.id, rejectedDeclaredEvent.event)
  },

  args: {
    event: rejectedDeclaredEvent.eventQueryData
  },
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: {
        path: '/',
        children: [
          {
            path: 'start',
            Component: () => {
              return (
                <div>
                  <ActionCta
                    actionType={'DEFAULT'}
                    event={rejectedDeclaredEvent.eventQueryData}
                  />
                </div>
              )
            }
          },
          {
            path: ROUTES.V2.EVENTS.DECLARE.REVIEW.path,
            Component: () => {
              return (
                <div>
                  {ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
                    eventId: rejectedDeclaredEvent.event.id
                  })}
                </div>
              )
            }
          }
        ]
      },
      initialPath: '/start'
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const actionButton = await canvas.findByRole('button', {
      name: 'Review'
    })

    await userEvent.click(actionButton)

    // Ensure the user is redirected to the declaration review page
    await waitFor(async () => {
      await expect(
        canvas.getByText(
          ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
            eventId: rejectedDeclaredEvent.event.id
          })
        )
      ).toBeInTheDocument()
    })
  }
}

const rejectedValidatedEvent = createRejectedEventByStatus(
  EventStatus.enum.VALIDATED
)

export const directsRejectedValidatedToValidated: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(rejectedValidatedEvent.event.id, rejectedValidatedEvent.event)
  },

  args: {
    event: rejectedValidatedEvent.eventQueryData
  },
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: {
        path: '/',
        children: [
          {
            path: 'start',
            Component: () => {
              return (
                <div>
                  <ActionCta
                    actionType={'DEFAULT'}
                    event={rejectedValidatedEvent.eventQueryData}
                  />
                </div>
              )
            }
          },
          {
            path: ROUTES.V2.EVENTS.VALIDATE.REVIEW.path,
            Component: () => {
              return (
                <div>
                  {ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
                    eventId: rejectedValidatedEvent.event.id
                  })}
                </div>
              )
            }
          }
        ]
      },
      initialPath: '/start'
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const actionButton = await canvas.findByRole('button', {
      name: 'Review'
    })

    await userEvent.click(actionButton)

    // Ensure the user is redirected to the declaration review page
    await waitFor(async () => {
      await expect(
        canvas.getByText(
          ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
            eventId: rejectedValidatedEvent.event.id
          })
        )
      ).toBeInTheDocument()
    })
  }
}
