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
import { Meta, StoryObj } from '@storybook/react'
import { userEvent, waitFor, within, expect } from '@storybook/test'
import superjson from 'superjson'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import {
  ActionType,
  generateEventDocument,
  getCurrentEventState,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import {
  addLocalEventConfig,
  setEventData
} from '@client/v2-events/features/events/useEvents/api'
import { ActionMenu } from '../ActionMenu'

export default {
  title: 'ActionMenu/RegistrationAgent/Deleted'
} as Meta<typeof ActionMenu>

const createdEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [{ type: ActionType.CREATE }, { type: ActionType.ASSIGN }],
  user: {
    assignedTo: '6821c175dce4d7886d4e8210'
  }
})

const eventState = getCurrentEventState(
  createdEventDocument,
  tennisClubMembershipEvent
)

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export const deletedScenariosForRegistrationAgent: StoryObj<typeof ActionMenu> =
  {
    parameters: {
      layout: 'centered',
      reactRouter: {
        router: routesConfig,
        initialPath: ROUTES.V2.EVENTS.OVERVIEW.buildPath({
          eventId: createdEventDocument.id
        })
      },
      msw: {
        events: [
          tRPCMsw.event.search.query(() => {
            return {
              results: [eventState],
              total: 1
            }
          })
        ]
      }
    },
    beforeEach: () => {
      /*
       * Ensure record is "downloaded offline" in the user's browser
       */
      addLocalEventConfig(tennisClubMembershipEvent)
      setEventData(createdEventDocument.id, createdEventDocument)
    },
    play: async ({ canvasElement, step }) => {
      const canvas = within(canvasElement)

      await step(
        'Renders modal when delete declaration is clicked',
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 5000))
          void canvas.getByTestId('action-dropdownMenu').click()

          // wait for the list to appear
          const list = await waitFor(() =>
            document.querySelector('#action-Dropdown-Content')
          )

          // click the 3rd <li>
          const items = list?.querySelectorAll('li')
          if (!items || items.length < 3) {
            throw new Error('Menu items not found')
          }

          await userEvent.click(items[2])

          await expect(canvas.getByText('Delete draft?')).toBeInTheDocument()
          await expect(
            canvas.getByText(
              "Are you certain you want to delete this draft declaration form? Please note, this action can't be undone."
            )
          ).toBeInTheDocument()

          const cancelDelete = await waitFor(() =>
            document.querySelector('#cancel_delete')
          )

          if (!cancelDelete) {
            throw new Error('Cancel delete button not found')
          }

          await userEvent.click(cancelDelete)
        }
      )
    }
  }
