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
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import {
  TestUserRole,
  UUID,
  V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS,
  V2_DEFAULT_MOCK_LOCATIONS
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { ROUTES } from '@client/v2-events/routes/routes'
import { routesConfig } from '@client/v2-events/routes/config'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { createTemporaryId } from '@client/v2-events/utils'
import { buildInactiveLocation } from '@client/tests/v2-events/location.utils'
import { useUserFormState } from './useUserFormState'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const mockRoles = [{ id: TestUserRole.enum.REGISTRATION_AGENT, scopes: [] }]

const generator = testDataGenerator()
const mockUser = generator.user.registrationAgent().v2

const IBOMBO_ADMIN_AREA_ID = '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID
const INACTIVE_OFFICE_ID = 'f1f1f1f1-1111-4111-8111-111111111111' as UUID
const INACTIVE_OFFICE_NAME = 'Closed Ibombo Office'

const INACTIVE_OFFICE = buildInactiveLocation({
  id: INACTIVE_OFFICE_ID,
  name: INACTIVE_OFFICE_NAME,
  locationType: 'CRVS_OFFICE',
  administrativeAreaId: IBOMBO_ADMIN_AREA_ID
})

const meta: Meta = {
  title: 'SysAdmin/UserEditor/OfficeActiveOnly',
  parameters: {
    chromatic: { disableSnapshot: true },
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    msw: {
      handlers: {
        userRoles: [tRPCMsw.user.roles.list.query(() => mockRoles)],
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
    }
  },
  beforeEach: () => {
    useUserFormState.getState().clear()
  }
}

export default meta

async function expectInactiveOfficeExcludedFromPicker(
  canvas: ReturnType<typeof within>
) {
  const input = await canvas.findByRole('combobox')
  await userEvent.type(input, 'Ibombo District Office')
  await expect(
    canvas.findByText('Ibombo District Office')
  ).resolves.toBeInTheDocument()

  await userEvent.clear(input)
  await userEvent.type(input, INACTIVE_OFFICE_NAME)
  await waitFor(() =>
    expect(canvas.queryByText(INACTIVE_OFFICE_NAME)).toBeNull()
  )
}

export const CreateUserOfficePickerExcludesInactiveOffice: StoryObj = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
        userId: createTemporaryId(),
        pageId: 'user.office'
      })
    }
  },
  play: async ({ canvasElement }) => {
    await expectInactiveOfficeExcludedFromPicker(within(canvasElement))
  }
}

export const EditUserOfficePickerExcludesInactiveOffice: StoryObj = {
  parameters: {
    msw: {
      handlers: {
        userRoles: [tRPCMsw.user.roles.list.query(() => mockRoles)],
        user: [tRPCMsw.user.get.query(() => mockUser)]
      }
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
        userId: mockUser.id,
        pageId: 'user.office'
      })
    }
  },
  play: async ({ canvasElement }) => {
    await expectInactiveOfficeExcludedFromPicker(within(canvasElement))
  }
}
