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
import { waitFor, within, expect } from 'storybook/test'
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
  title: 'ActionMenu/CoreActionConfig/MarkAsDuplicate'
} as Meta<typeof ActionMenu>

/**
 * A country config for MARK_AS_DUPLICATE, overriding the hardcoded default
 * label/icon (`actionLabels`/`actionIcons` in Actions/utils.ts) to prove the
 * action menu reads from ActionConfig when present.
 */
const configuration = {
  ...tennisClubMembershipEvent,
  actions: [
    ...tennisClubMembershipEvent.actions,
    {
      type: ActionType.MARK_AS_DUPLICATE,
      label: {
        id: 'storybook.action.mark-as-duplicate.custom-label',
        defaultMessage: 'Compare duplicates',
        description: 'Country-configured label for the mark-as-duplicate action'
      },
      icon: 'Copy',
      flags: []
    }
  ]
}

// MARK_AS_DUPLICATE is only offered when the record has the POTENTIAL_DUPLICATE
// flag (see ACTION_FILTERS in availableActions.ts), which DUPLICATE_DETECTED
// sets, and only once downloaded and assigned to the user.
const localRegistrarId = testDataGenerator().user.localRegistrar().v2.id
const createdEventDocument = generateEventDocument({
  configuration,
  actions: [
    {
      type: ActionType.CREATE,
      user: { id: localRegistrarId }
    },
    {
      type: ActionType.NOTIFY,
      user: { id: localRegistrarId }
    },
    {
      type: ActionType.ASSIGN,
      user: { id: localRegistrarId, assignedTo: localRegistrarId }
    },
    {
      type: ActionType.DUPLICATE_DETECTED,
      user: { id: localRegistrarId }
    }
  ],
  defaults: {
    trackingId: generateTrackingId(createPrng(1234))
  }
})

const eventState = getCurrentEventState(createdEventDocument, configuration)

// A separate config (DUPLICATE_DETECTED already supports `flags`, so no
// CUSTOM action is needed here) with a SHOW conditional on MARK_AS_DUPLICATE.
const configurationWithConditional = {
  ...tennisClubMembershipEvent,
  actions: [
    ...tennisClubMembershipEvent.actions,
    {
      type: ActionType.MARK_AS_DUPLICATE,
      label: {
        id: 'storybook.action.mark-as-duplicate.custom-label',
        defaultMessage: 'Compare duplicates',
        description: 'Country-configured label for the mark-as-duplicate action'
      },
      icon: 'Copy',
      flags: [],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(flag('locked-for-review'))
        }
      ]
    },
    {
      type: ActionType.DUPLICATE_DETECTED,
      flags: [{ id: 'locked-for-review', operation: 'add' as const }]
    }
  ]
}

const lockedEventDocument = generateEventDocument({
  configuration: configurationWithConditional,
  actions: [
    { type: ActionType.CREATE, user: { id: localRegistrarId } },
    { type: ActionType.NOTIFY, user: { id: localRegistrarId } },
    {
      type: ActionType.ASSIGN,
      user: { id: localRegistrarId, assignedTo: localRegistrarId }
    },
    { type: ActionType.DUPLICATE_DETECTED, user: { id: localRegistrarId } }
  ],
  defaults: { trackingId: generateTrackingId(createPrng(1234)) }
})
const lockedEventState = getCurrentEventState(
  lockedEventDocument,
  configurationWithConditional
)

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export const markAsDuplicateLabelAndIconAreConfigurable: StoryObj<
  typeof ActionMenu
> = {
  parameters: {
    // Snapshot enabled here to visually verify the configured icon.
    chromatic: { disableSnapshot: false },
    // Requires `record.review-duplicates`, which REGISTRATION_AGENT lacks
    // in the test scope fixtures — LOCAL_REGISTRAR has it.
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
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
        if (!items || items.length < 1) {
          throw new Error('Menu items not found')
        }

        const markAsDuplicateItem = Array.from(items).find((item) =>
          item.textContent.includes('Compare duplicates')
        )

        await expect(markAsDuplicateItem).toBeTruthy()
        await expect(
          Array.from(items).some((item) =>
            item.textContent.includes('Review potential duplicates')
          )
        ).toBe(false)
      }
    )
  }
}

export const markAsDuplicateIsHiddenWhenConditionalIsNotMet: StoryObj<
  typeof ActionMenu
> = {
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    layout: 'centered',
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.AUDIT.buildPath({
        eventId: lockedEventDocument.id
      })
    },
    offline: { configs: [configurationWithConditional] },
    msw: {
      events: [
        tRPCMsw.event.search.query(() => ({
          results: [lockedEventState],
          total: 1
        }))
      ]
    }
  },
  beforeEach: () => {
    setEventData(lockedEventDocument.id, lockedEventDocument)
    updateLocalEventIndex(lockedEventDocument.id, lockedEventDocument)
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await new Promise((resolve) => setTimeout(resolve, 2000))
    void canvas.getByTestId('action-dropdownMenu').click()

    const list = await waitFor(() =>
      document.querySelector('#action-Dropdown-Content')
    )
    const items = Array.from(list?.querySelectorAll('li') ?? [])

    await expect(
      items.find((item) => item.textContent.includes('Compare duplicates'))
    ).toBeUndefined()
  }
}
