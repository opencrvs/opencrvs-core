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
import type { Meta, StoryObj } from '@storybook/react-vite'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { expect, within } from 'storybook/test'
import {
  TestUserRole,
  UUID,
  V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS,
  V2_DEFAULT_MOCK_LOCATIONS
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { routesConfig } from '@client/v2-events/routes'
import { formatUrl } from '@client/navigation'
import * as routes from '@client/navigation/routes'
import {
  buildFutureAdministrativeArea,
  buildFutureLocation
} from '@client/tests/v2-events/location.utils'
import { OrganisationPage } from '@client/v2-events/features/organisation/Organisation'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const ISAMBA_DISTRICT_ID = '967032fd-3f81-478a-826c-30cb8fe121bd' as UUID

const FUTURE_AREA_NAME = 'Ndalu'
const FUTURE_OFFICE_NAME = 'Ndalu District Office'

const FUTURE_AREA = buildFutureAdministrativeArea({
  id: 'aaaa1111-2222-4333-8444-555566667777' as UUID,
  name: FUTURE_AREA_NAME,
  parentId: ISAMBA_DISTRICT_ID
})

const FUTURE_OFFICE = buildFutureLocation({
  id: 'bbbb1111-2222-4333-8444-555566667777' as UUID,
  name: FUTURE_OFFICE_NAME,
  locationType: 'CRVS_OFFICE',
  administrativeAreaId: ISAMBA_DISTRICT_ID
})

const meta: Meta<typeof OrganisationPage> = {
  title: 'Organisation/FutureDated',
  parameters: {
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        eventLocations: [
          tRPCMsw.locations.list.query(() => [
            ...V2_DEFAULT_MOCK_LOCATIONS,
            FUTURE_OFFICE
          ]),
          tRPCMsw.administrativeAreas.list.query(() => [
            ...V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS,
            FUTURE_AREA
          ])
        ]
      }
    },
    reactRouter: {
      router: routesConfig,
      initialPath: formatUrl(routes.ORGANISATIONS_INDEX, {
        locationId: ISAMBA_DISTRICT_ID
      })
    }
  }
}

export default meta

type Story = StoryObj<typeof OrganisationPage>

/**
 * A location or administrative area whose first version only takes effect in
 * the future exists in the system, but the Organisation tab is a present-tense
 * surface: it must not list either until their `effectiveFrom` has passed.
 */
export const FutureDatedEntitiesAreHidden: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Entities effective today are listed', async () => {
      await expect(
        await canvas.findByRole('button', { name: 'Mbula' })
      ).toBeVisible()
      await expect(
        await canvas.findByText('Isamba District Office')
      ).toBeVisible()
    })

    await step('The future-dated administrative area is not listed', () => {
      expect(canvas.queryByText(FUTURE_AREA_NAME)).toBeNull()
    })

    await step('The future-dated office is not listed', () => {
      expect(canvas.queryByText(FUTURE_OFFICE_NAME)).toBeNull()
    })
  }
}
