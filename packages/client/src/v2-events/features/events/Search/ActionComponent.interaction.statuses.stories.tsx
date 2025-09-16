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

function createEventByStatus(status: EventStatus) {
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

export const DirectsDeclaredToValidate: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(declaredEvent.event.id, declaredEvent.event)
  },

  args: {
    event: declaredEvent.eventQueryData
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
                    event={declaredEvent.eventQueryData}
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
                    eventId: declaredEvent.event.id
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
            eventId: declaredEvent.event.id
          })
        )
      ).toBeInTheDocument()
    })
  }
}

const validatedEvent = createEventByStatus(EventStatus.enum.VALIDATED)

export const directsValidatedToRegister: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(validatedEvent.event.id, validatedEvent.event)
  },

  args: {
    event: validatedEvent.eventQueryData
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
                    event={validatedEvent.eventQueryData}
                  />
                </div>
              )
            }
          },
          {
            path: ROUTES.V2.EVENTS.REGISTER.REVIEW.path,
            Component: () => {
              return (
                <div>
                  {ROUTES.V2.EVENTS.REGISTER.REVIEW.buildPath({
                    eventId: validatedEvent.event.id
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
          ROUTES.V2.EVENTS.REGISTER.REVIEW.buildPath({
            eventId: validatedEvent.event.id
          })
        )
      ).toBeInTheDocument()
    })
  }
}

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
