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
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { screen, within, userEvent } from '@storybook/test'
import { toast } from 'react-hot-toast'
import {
  ActionType,
  ActionDocument,
  AssignmentStatus,
  TestUserRole,
  tennisClubMembershipEvent,
  generateActionDocument,
  getCurrentEventState,
  getUUID
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import {
  setEventData,
  addLocalEventConfig
} from '@client/v2-events/features/events/useEvents/api'
import { getMockEvent } from './components/ActionMenuStories/ActionMenu.common'
import { EventOverviewIndex } from './EventOverview'

// A declared record, assigned to and downloaded by the local registrar, so the
// "Register" quick action is available on the event overview. Confirming it runs
// the plain register.request mutation (no UI path other than this quick action).
const eventDocument = getMockEvent(
  [
    ActionType.CREATE,
    AssignmentStatus.ASSIGNED_TO_SELF,
    ActionType.DECLARE,
    AssignmentStatus.ASSIGNED_TO_SELF
  ],
  TestUserRole.enum.LOCAL_REGISTRAR
)
const eventId = eventDocument.id

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const meta: Meta<typeof EventOverviewIndex> = {
  title: 'EventOverview/Interaction',
  component: EventOverviewIndex,
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

export const ShowToastOnDuplicateDetectedOnRegisterQuickAction: Story = {
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    offline: {
      events: [eventDocument]
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.buildPath({ eventId })
    },
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return eventDocument
          }),
          tRPCMsw.event.search.query(() => {
            return {
              total: 1,
              results: [
                getCurrentEventState(eventDocument, tennisClubMembershipEvent)
              ]
            }
          }),
          // The backend detects the duplicate during register and returns the
          // DUPLICATE_DETECTED action.
          tRPCMsw.event.actions.register.request.mutation(() => {
            return {
              ...eventDocument,
              actions: [
                ...eventDocument.actions,
                generateActionDocument({
                  configuration: tennisClubMembershipEvent,
                  action: ActionType.REGISTER
                }),
                generateActionDocument({
                  configuration: tennisClubMembershipEvent,
                  action: ActionType.DUPLICATE_DETECTED,
                  defaults: {
                    content: {
                      duplicates: [{ id: getUUID(), trackingId: '0R1G1NAL' }]
                    }
                  }
                })
              ] as ActionDocument[]
            }
          })
        ]
      }
    }
  },
  beforeEach: () => {
    // Clear any toast left over from a previous story so this test only asserts
    // on toasts raised by its own play function.
    toast.remove()
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(eventId, eventDocument)
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Register the record via the quick action', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Action' })
      )
      await userEvent.click(await screen.findByText('Register'))
      await userEvent.click(
        await screen.findByRole('button', { name: 'Confirm' })
      )
    })

    await step('Toast is shown with duplicate detected message', async () => {
      // The toast renders via the global Toaster, which lives outside this view
      // (the quick action navigates away on confirm), so query the whole document.
      await screen.findByText(
        '75HT9J is a potential duplicate. Record is ready for review.',
        undefined,
        { timeout: 10000 }
      )
    })
  }
}
