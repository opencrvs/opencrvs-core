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
import { waitFor, within, expect } from '@storybook/test'
import superjson from 'superjson'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import {
  ActionType,
  createPrng,
  generateEventDocument,
  generateTrackingId,
  getCurrentEventState,
  tennisClubMembershipEvent,
  TestUserRole
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import { setEventData } from '@client/v2-events/features/events/useEvents/api'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { ActionMenu } from '../ActionMenu'

export default {
  title: 'ActionMenu/CoreActionConfig/Unassign'
} as Meta<typeof ActionMenu>

/**
 * A country config for UNASSIGN, overriding the hardcoded default label/icon
 * (`actionLabels`/`actionIcons` in Actions/utils.ts) to prove the action menu
 * reads from ActionConfig when present.
 */
const configuration = {
  ...tennisClubMembershipEvent,
  actions: [
    ...tennisClubMembershipEvent.actions,
    {
      type: ActionType.UNASSIGN,
      label: {
        id: 'storybook.action.unassign.custom-label',
        defaultMessage: 'Put back',
        description: 'Country-configured label for the unassign action'
      },
      icon: 'SignOut'
    }
  ]
}

// UNASSIGN is only available for NOTIFIED/DECLARED/REGISTERED/ARCHIVED events
// (see STATUSES_THAT_CAN_BE_ASSIGNED in resolveActionConditionals.tsx) and
// only when already assigned, so notify then assign the record.
const registrationAgentId = testDataGenerator().user.registrationAgent().v2.id
const createdEventDocument = generateEventDocument({
  configuration,
  actions: [
    {
      type: ActionType.CREATE,
      user: { id: registrationAgentId }
    },
    {
      type: ActionType.NOTIFY,
      user: { id: registrationAgentId }
    },
    {
      type: ActionType.ASSIGN,
      user: { id: registrationAgentId, assignedTo: registrationAgentId }
    }
  ],
  defaults: {
    trackingId: generateTrackingId(createPrng(1234))
  }
})

const eventState = getCurrentEventState(createdEventDocument, configuration)

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export const unassignLabelAndIconAreConfigurable: StoryObj<typeof ActionMenu> =
  {
    parameters: {
      // Snapshot enabled here to visually verify the configured icon.
      chromatic: { disableSnapshot: false },
      userRole: TestUserRole.enum.REGISTRATION_AGENT,
      layout: 'centered',
      reactRouter: {
        router: routesConfig,
        initialPath: ROUTES.V2.EVENTS.EVENT.AUDIT.buildPath({
          eventId: createdEventDocument.id
        })
      },
      // `.storybook/preview.tsx`'s global loader seeds the query cache directly
      // (bypassing MSW) with a default config unless `offline.configs` is set
      // here, so mocking `event.config.get` via MSW alone is not enough.
      offline: {
        configs: [configuration]
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
      setEventData(createdEventDocument.id, createdEventDocument)
    },
    play: async ({ canvasElement, step }) => {
      const canvas = within(canvasElement)

      await step(
        'Shows the country-configured label instead of the hardcoded default',
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000))
          void canvas.getByTestId('action-dropdownMenu').click()

          const list = await waitFor(() =>
            document.querySelector('#action-Dropdown-Content')
          )

          const items = list?.querySelectorAll('li')
          if (!items || items.length < 1) {
            throw new Error('Menu items not found')
          }

          const unassignItem = Array.from(items).find((item) =>
            item.textContent?.includes('Put back')
          )

          await expect(unassignItem).toBeTruthy()
        }
      )
    }
  }
