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
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import {
  TestUserRole,
  UUID,
  V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS,
  V2_DEFAULT_MOCK_LOCATIONS
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { routesConfig } from '@client/v2-events/routes'
import * as V1_LEGACY_ROUTES from '@client/navigation/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { buildInactiveLocation } from '@client/tests/v2-events/location.utils'
import { TeamPage } from './Team'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const generator = testDataGenerator()
const felix = generator.user.registrationAgent().v2

const mockRoles = [{ id: TestUserRole.enum.REGISTRATION_AGENT, scopes: [] }]

const IBOMBO_DISTRICT_OFFICE_ID = '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID
const INACTIVE_OFFICE_ID = 'f2f2f2f2-2222-4222-8222-222222222222' as UUID
const INACTIVE_OFFICE_NAME = 'Closed Ibombo Office'

const INACTIVE_OFFICE = buildInactiveLocation({
  id: INACTIVE_OFFICE_ID,
  name: INACTIVE_OFFICE_NAME,
  locationType: 'CRVS_OFFICE',
  administrativeAreaId: '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID
})

const meta: Meta<typeof TeamPage> = {
  title: 'Team/OfficeActiveOnly',
  parameters: {
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        user: [
          tRPCMsw.user.search.query(() => [felix]),
          tRPCMsw.user.get.query(() => felix),
          tRPCMsw.user.roles.list.query(() => mockRoles)
        ],
        eventLocations: [
          tRPCMsw.locations.list.query(() => [
            ...V2_DEFAULT_MOCK_LOCATIONS,
            INACTIVE_OFFICE
          ]),
          tRPCMsw.administrativeAreas.list.query(
            () => V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS
          )
        ]
      }
    },
    reactRouter: {
      router: routesConfig,
      initialPath:
        V1_LEGACY_ROUTES.TEAM_USER_LIST +
        `?locationId=${IBOMBO_DISTRICT_OFFICE_ID}`
    }
  }
}

export default meta
type Story = StoryObj<typeof TeamPage>

export const OfficePickerExcludesInactiveOffice: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Open the office picker', async () => {
      await userEvent.click(
        await canvas.findByTestId('location-range-picker-action')
      )
    })

    await step('An active office is still searchable', async () => {
      const searchInput = await canvas.findByTestId('locationSearchInput')

      await fireEvent.change(searchInput, {
        target: { value: 'Ibombo District Office' }
      })
      await waitFor(async () =>
        expect(
          canvas.queryByTestId(`locationOption${IBOMBO_DISTRICT_OFFICE_ID}`)
        ).not.toBeNull()
      )
    })

    await step('The inactive office is excluded from search', async () => {
      const searchInput = canvas.getByTestId('locationSearchInput')
      await fireEvent.change(searchInput, {
        target: { value: INACTIVE_OFFICE_NAME }
      })
      await waitFor(async () =>
        expect(
          canvas.queryByTestId(`locationOption${INACTIVE_OFFICE_ID}`)
        ).toBeNull()
      )
    })
  }
}
