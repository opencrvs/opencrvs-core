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
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import * as selectEvent from 'react-select-event'
import {
  ChildOnboardingEvent,
  EventConfig,
  field,
  footballClubMembershipEvent,
  tennisClubMembershipEvent,
  TestUserRole,
  UUID,
  user
} from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { TRPCProvider, AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AdvancedSearch } from './index'

const meta: Meta<typeof AdvancedSearch> = {
  title: 'AdvancedSearch/Interaction',
  component: AdvancedSearch,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}
export default meta

type Story = StoryObj<typeof AdvancedSearch>

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

/**
 * ChildOnboardingEvent with an advanced search section for `child.birthLocation`
 * restricted by the user's `record.search` placeOfEvent scope. This mirrors the
 * real countryconfig birth advancedSearch config introduced in #12810.
 */
const childOnboardingWithHealthFacilitySearch: EventConfig = {
  ...ChildOnboardingEvent,
  advancedSearch: [
    {
      title: {
        defaultMessage: 'Event details',
        description: 'Event details accordion title',
        id: 'advancedSearch.form.eventDetails'
      },
      fields: [
        field('child.placeOfBirth').exact(),
        field('child.birthLocation', {
          allowedLocations: user.jurisdiction(
            user.scope('record.search').attribute('placeOfEvent')
          )
        }).exact(),
        field('child.birthLocation.privateHome', {
          allowedLocations: user.jurisdiction(
            user.scope('record.search').attribute('placeOfEvent')
          )
        }).exact()
      ]
    }
  ]
}

const generator = testDataGenerator()

const mockUser = {
  ...generator.user.communityLeader().summary,
  primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID
}

const mockUserFull = {
  ...generator.user.communityLeader().v2,
  primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID
}

const mswConfig = {
  handlers: {
    events: [
      tRPCMsw.event.config.get.query(() => {
        return [
          childOnboardingWithHealthFacilitySearch,
          tennisClubMembershipEvent,
          footballClubMembershipEvent
        ]
      })
    ],
    user: [
      tRPCMsw.user.list.query(() => {
        return [mockUser]
      }),
      tRPCMsw.user.get.query(() => {
        return mockUserFull
      })
    ]
  }
}

const storyParams = {
  userRole: TestUserRole.enum.COMMUNITY_LEADER,
  reactRouter: {
    router: routesConfig,
    initialPath: ROUTES.V2.ADVANCED_SEARCH.buildPath({})
  },
  chromatic: { disableSnapshot: true },
  offline: {
    configs: [
      childOnboardingWithHealthFacilitySearch,
      tennisClubMembershipEvent,
      footballClubMembershipEvent
    ]
  }
}

async function openHealthFacilityDropdown(
  canvasElement: HTMLElement,
  canvas: ReturnType<typeof within>
) {
  const accordion = await canvas.findByTestId(
    'accordion-advancedSearch.form.eventDetails'
  )
  await userEvent.click(within(accordion).getByRole('button', { name: 'Show' }))

  const placeOfBirthWrapper = await canvas.findByTestId(
    'select__child____placeOfBirth'
  )
  await selectEvent.select(placeOfBirthWrapper, 'Health Institution')

  const facilityInput = canvasElement.querySelector(
    '#searchable-select-child____birthLocation input'
  )

  if (!facilityInput) {
    throw new Error('Health facility input not found')
  }

  await userEvent.click(facilityInput)
  return canvas.findByRole('listbox')
}

/**
 * record.search[registeredIn=administrativeArea, placeOfEvent=administrativeArea]
 * — health institution dropdown restricted to the user's Ibombo administrative
 * area. All 11 Ibombo health facilities are shown; Central Health Post
 * (a different province) is excluded.
 */
export const PlaceOfEventScope_AdministrativeArea: Story = {
  parameters: {
    ...storyParams,
    token: generator.user.token.communityLeaderRegisteredInAdministrativeArea,
    msw: mswConfig
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Health facility dropdown shows only facilities in the Ibombo administrative area',
      async () => {
        const listbox = await openHealthFacilityDropdown(canvasElement, canvas)
        const options = within(listbox).queryAllByRole('listitem')

        await expect(options).toHaveLength(11)
        await expect(
          options.some((o) =>
            o.textContent?.includes('Ibombo Rural Health Centre')
          )
        ).toBe(true)
        await expect(
          options.some((o) => o.textContent?.includes('Central Health Post'))
        ).toBe(false)
      }
    )
  }
}

/**
 * record.search[registeredIn=location, placeOfEvent=location] — the user's
 * primary office is a CRVS_OFFICE (Ibombo District Office), which does not
 * match the HEALTH_FACILITY location type. The dropdown returns no options,
 * since the 'location' scope only applies to the user's own office, not to
 * other locations of a different type.
 */
export const PlaceOfEventScope_Location: Story = {
  parameters: {
    ...storyParams,
    token: generator.user.token.communityLeaderRegisteredInLocation,
    msw: mswConfig
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      "Health facility dropdown shows no options when user's office type doesn't match",
      async () => {
        const listbox = await openHealthFacilityDropdown(canvasElement, canvas)
        const options = within(listbox).queryAllByRole('listitem')

        await expect(options).toHaveLength(0)
      }
    )
  }
}

/**
 * Two record.search scopes: one with placeOfEvent=location, one with only
 * registeredIn=location (no placeOfEvent). Most relaxed placeOfEvent wins:
 * undefined (no restriction) beats 'location', so all 12 facilities are shown.
 * This mirrors a user whose token carries an unrestricted search scope.
 */
export const PlaceOfEventScope_NoRestriction: Story = {
  parameters: {
    ...storyParams,
    token: generator.user.token.communityLeaderSearchAllAndLocation,
    msw: mswConfig
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Health facility dropdown shows all facilities when placeOfEvent is not set',
      async () => {
        const listbox = await openHealthFacilityDropdown(canvasElement, canvas)
        const options = within(listbox).queryAllByRole('listitem')

        await expect(options).toHaveLength(12)
        await expect(
          options.some((o) =>
            o.textContent?.includes('Ibombo Rural Health Centre')
          )
        ).toBe(true)
        await expect(
          options.some((o) => o.textContent?.includes('Central Health Post'))
        ).toBe(true)
      }
    )
  }
}
