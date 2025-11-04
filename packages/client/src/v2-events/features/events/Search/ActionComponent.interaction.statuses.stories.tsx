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
  generateEventDocument,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { ROUTES } from '@client/v2-events/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { addLocalEventConfig, setEventData } from '../useEvents/api'
import { ActionCta } from './ActionCta'

const meta: Meta<typeof ActionCta> = {
  title: 'Components/ActionComponent/Interaction/Statuses',
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

function createEventByStatus(status: EventStatus) {
  const user = testDataGenerator().user

  const event = generateEventDocument({
    configuration: tennisClubMembershipEvent,
    actions: [{ type: ActionType.CREATE }]
  })

  const eventQueryData = eventQueryDataGenerator(
    {
      id: event.id,
      status,
      // local registrar is the default
      assignedTo: user.id.localRegistrar
    },
    123
  )

  return {
    event,
    eventQueryData
  }
}

const createdEvent = createEventByStatus(EventStatus.enum.CREATED)
export const DirectsCreatedToDeclare: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(createdEvent.event.id, createdEvent.event)
  },

  args: {
    event: createdEvent.eventQueryData
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
                    event={createdEvent.eventQueryData}
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
                    eventId: createdEvent.event.id
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
      name: 'Declare'
    })

    await userEvent.click(actionButton)

    // Ensure the user is redirected to the declaration review page
    await waitFor(async () => {
      await expect(
        canvas.getByText(
          ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
            eventId: createdEvent.event.id
          })
        )
      ).toBeInTheDocument()
    })
  }
}

const notifiedEvent = createEventByStatus(EventStatus.enum.NOTIFIED)
export const DirectsNotifiedToDeclare: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(notifiedEvent.event.id, notifiedEvent.event)
  },

  args: {
    event: notifiedEvent.eventQueryData
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
                    event={notifiedEvent.eventQueryData}
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
                    eventId: notifiedEvent.event.id
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
            eventId: notifiedEvent.event.id
          })
        )
      ).toBeInTheDocument()
    })
  }
}

const declaredEvent = createEventByStatus(EventStatus.enum.DECLARED)

const registeredEvent = createEventByStatus(EventStatus.enum.REGISTERED)

export const directsRegisteredToPrint: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(registeredEvent.event.id, registeredEvent.event)
  },

  args: {
    event: registeredEvent.eventQueryData
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
                    event={registeredEvent.eventQueryData}
                  />
                </div>
              )
            }
          },
          {
            path: ROUTES.V2.EVENTS.PRINT_CERTIFICATE.path,
            Component: () => {
              return (
                <div>
                  {ROUTES.V2.EVENTS.PRINT_CERTIFICATE.buildPath({
                    eventId: registeredEvent.event.id
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
      name: 'Print'
    })

    await userEvent.click(actionButton)

    // Ensure the user is redirected to the declaration review page
    await waitFor(async () => {
      await expect(
        canvas.getByText(
          ROUTES.V2.EVENTS.PRINT_CERTIFICATE.buildPath({
            eventId: registeredEvent.event.id
          })
        )
      ).toBeInTheDocument()
    })
  }
}
