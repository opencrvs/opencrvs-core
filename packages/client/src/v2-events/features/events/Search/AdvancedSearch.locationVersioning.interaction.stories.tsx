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
  Location,
  tennisClubMembershipEvent,
  TestUserRole,
  UUID,
  user,
  V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS,
  V2_DEFAULT_MOCK_LOCATIONS
} from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { TRPCProvider, AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AdvancedSearch } from './index'

const meta: Meta<typeof AdvancedSearch> = {
  title: 'AdvancedSearch/LocationVersioning',
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

const IBOMBO_ADMIN_AREA_ID = '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID

/**
 * A health facility in Ibombo that was renamed from "Old Riverside Health Post"
 * to "New Riverside Health Post". Both names live in the version history; the
 * current (resolved) name is the latest.
 */
const RENAMED_FACILITY: Location = {
  id: 'a1a1a1a1-1111-4111-8111-111111111111' as UUID,
  name: 'New Riverside Health Post',
  locationType: 'HEALTH_FACILITY',
  administrativeAreaId: IBOMBO_ADMIN_AREA_ID,
  externalId: null,
  status: 'active',
  versions: [
    {
      versionId: 'a1a1a1a1-1111-4111-8111-111111111112' as UUID,
      effectiveFrom: '0001-01-01',
      name: 'Old Riverside Health Post',
      externalId: null,
      status: 'active'
    },
    {
      versionId: 'a1a1a1a1-1111-4111-8111-111111111113' as UUID,
      effectiveFrom: '2023-01-01',
      name: 'New Riverside Health Post',
      externalId: null,
      status: 'active'
    }
  ]
}

/** A health facility in Ibombo that has since been inactivated (closed). */
const INACTIVE_FACILITY: Location = {
  id: 'b2b2b2b2-2222-4222-8222-222222222222' as UUID,
  name: 'Closed Hilltop Health Post',
  locationType: 'HEALTH_FACILITY',
  administrativeAreaId: IBOMBO_ADMIN_AREA_ID,
  externalId: null,
  status: 'inactive',
  versions: [
    {
      versionId: 'b2b2b2b2-2222-4222-8222-222222222223' as UUID,
      effectiveFrom: '0001-01-01',
      name: 'Closed Hilltop Health Post',
      externalId: null,
      status: 'inactive'
    }
  ]
}

const mockLocations: Location[] = [
  ...V2_DEFAULT_MOCK_LOCATIONS,
  RENAMED_FACILITY,
  INACTIVE_FACILITY
]

/**
 * ChildOnboardingEvent with an advanced search section for `child.birthLocation`
 * (a HEALTH_FACILITY selector), restricted by the user's `record.search`
 * placeOfEvent scope.
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
    eventLocations: [
      tRPCMsw.locations.list.query(() => mockLocations),
      tRPCMsw.administrativeAreas.list.query(
        () => V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS
      )
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
 * In advanced search, the health-institution (place of delivery) filter lists a
 * renamed facility under every name it has ever carried, and keeps listing an
 * inactivated facility — so records saved under an old name or at a now-closed
 * facility stay findable. Every name resolves to the same location id.
 */
export const RenamedAndInactiveFacilitiesStayFilterable: Story = {
  parameters: {
    ...storyParams,
    token: generator.user.token.communityLeaderRegisteredInAdministrativeArea,
    msw: mswConfig
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Health facility dropdown lists both the old and new name of a renamed facility',
      async () => {
        const listbox = await openHealthFacilityDropdown(canvasElement, canvas)
        const options = within(listbox).queryAllByRole('listitem')
        const labels = options.map((o) => o.textContent)

        await expect(labels).toContain('New Riverside Health Post')
        await expect(labels).toContain('Old Riverside Health Post')
      }
    )

    await step(
      'Health facility dropdown still lists an inactivated facility',
      async () => {
        const listbox = await canvas.findByRole('listbox')
        const options = within(listbox).queryAllByRole('listitem')
        const labels = options.map((o) => o.textContent)

        await expect(labels).toContain('Closed Hilltop Health Post')
      }
    )
  }
}
