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
import { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, waitFor, within, expect } from 'storybook/test'
import superjson from 'superjson'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import {
  ActionType,
  ConditionalType,
  createPrng,
  flag,
  generateEventDocument,
  generateTrackingId,
  getCurrentEventState,
  not,
  tennisClubMembershipEvent,
  TestUserRole
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import {
  setEventData,
  updateLocalEventIndex
} from '@client/v2-events/features/events/useEvents/api'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { ActionMenu } from '../ActionMenu'

export default {
  title: 'ActionMenu/CoreActionConfig/Delete'
} as Meta<typeof ActionMenu>

/**
 * A country config for DELETE, overriding the hardcoded default label/icon
 * (`actionLabels`/`actionIcons` in Actions/utils.ts) to prove the action menu
 * reads from ActionConfig when present.
 */
const configuration = {
  ...tennisClubMembershipEvent,
  actions: [
    ...tennisClubMembershipEvent.actions,
    {
      type: ActionType.DELETE,
      label: {
        id: 'storybook.action.delete.custom-label',
        defaultMessage: 'Discard application',
        description: 'Country-configured label for the delete action'
      },
      icon: 'ArchiveBox',
      flags: []
    }
  ]
}

const createdEventDocument = generateEventDocument({
  configuration,
  actions: [
    {
      type: ActionType.CREATE,
      user: {
        id: testDataGenerator().user.registrationAgent().v2.id,
        assignedTo: testDataGenerator().user.registrationAgent().v2.id
      }
    },
    {
      type: ActionType.ASSIGN,
      user: {
        id: testDataGenerator().user.registrationAgent().v2.id,
        assignedTo: testDataGenerator().user.registrationAgent().v2.id
      }
    }
  ],
  defaults: {
    trackingId: generateTrackingId(createPrng(1234))
  }
})

const eventState = getCurrentEventState(createdEventDocument, configuration)

/**
 * A country config for DELETE with a SHOW conditional gated on the absence
 * of a 'locked-for-review' flag, to prove the action menu actually respects
 * ActionConfig.conditionals (not just label/icon). A CUSTOM action adds the
 * flag, since DELETE/ASSIGN/UNASSIGN don't support `flags` themselves.
 */
const configurationWithConditionalDelete = {
  ...tennisClubMembershipEvent,
  actions: [
    ...tennisClubMembershipEvent.actions,
    {
      type: ActionType.DELETE,
      label: {
        id: 'storybook.action.delete.custom-label',
        defaultMessage: 'Discard application',
        description: 'Country-configured label for the delete action'
      },
      icon: 'ArchiveBox',
      flags: [],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(flag('locked-for-review'))
        }
      ]
    },
    {
      type: ActionType.CUSTOM,
      // `generateActionDocument`'s test util hardcodes this value for CUSTOM
      // actions, so the config must match it to resolve correctly.
      customActionType: 'CUSTOM_ACTION_TYPE',
      label: {
        id: 'storybook.action.lock-for-review.label',
        defaultMessage: 'Lock for review',
        description: 'Country-configured label for the lock-for-review action'
      },
      form: [],
      auditHistoryLabel: {
        id: 'storybook.action.lock-for-review.audit-history-label',
        defaultMessage: 'Locked for review',
        description: 'Audit history label for the lock-for-review action'
      },
      flags: [{ id: 'locked-for-review', operation: 'add' as const }]
    }
  ]
}

// `setEventData()` recomputes the event index from this document's real
// action history (see updateLocalEventIndex) rather than using any mocked
// `event.search` response, so the 'locked-for-review' flag needs to come
// from an actual accepted action, not a manually-injected flags override.
const createdEventDocumentWithLockedFlag = generateEventDocument({
  configuration: configurationWithConditionalDelete,
  actions: [
    {
      type: ActionType.CREATE,
      user: {
        id: testDataGenerator().user.registrationAgent().v2.id,
        assignedTo: testDataGenerator().user.registrationAgent().v2.id
      }
    },
    {
      type: ActionType.ASSIGN,
      user: {
        id: testDataGenerator().user.registrationAgent().v2.id,
        assignedTo: testDataGenerator().user.registrationAgent().v2.id
      }
    },
    {
      type: ActionType.CUSTOM,
      user: {
        id: testDataGenerator().user.registrationAgent().v2.id
      }
    }
  ],
  defaults: {
    trackingId: generateTrackingId(createPrng(1234))
  }
})

const eventStateWithLockedFlag = getCurrentEventState(
  createdEventDocumentWithLockedFlag,
  configurationWithConditionalDelete
)

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export const deleteLabelAndIconAreConfigurable: StoryObj<typeof ActionMenu> = {
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
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    setEventData(createdEventDocument.id, createdEventDocument)
    updateLocalEventIndex(createdEventDocument.id, createdEventDocument)
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
        if (!items || items.length < 2) {
          throw new Error('Menu items not found')
        }

        await expect(items[1]).toHaveTextContent('Discard application')
        await expect(items[1]).not.toHaveTextContent('Delete')

        await userEvent.click(items[1])

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

export const deleteIsHiddenWhenConditionalIsNotMet: StoryObj<
  typeof ActionMenu
> = {
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.REGISTRATION_AGENT,
    layout: 'centered',
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.AUDIT.buildPath({
        eventId: createdEventDocumentWithLockedFlag.id
      })
    },
    offline: {
      configs: [configurationWithConditionalDelete]
    },
    msw: {
      events: [
        tRPCMsw.event.search.query(() => {
          return {
            results: [eventStateWithLockedFlag],
            total: 1
          }
        })
      ]
    }
  },
  beforeEach: () => {
    setEventData(
      createdEventDocumentWithLockedFlag.id,
      createdEventDocumentWithLockedFlag
    )
    updateLocalEventIndex(
      createdEventDocumentWithLockedFlag.id,
      createdEventDocumentWithLockedFlag
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Hides the action when its SHOW conditional is not met',
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        void canvas.getByTestId('action-dropdownMenu').click()

        const list = await waitFor(() =>
          document.querySelector('#action-Dropdown-Content')
        )

        const items = list?.querySelectorAll('li')
        const deleteItem = Array.from(items ?? []).find((item) =>
          item.textContent.includes('Discard application')
        )

        await expect(deleteItem).toBeUndefined()
      }
    )
  }
}
