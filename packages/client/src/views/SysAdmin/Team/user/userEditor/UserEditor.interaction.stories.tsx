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
import type { Meta, StoryObj } from '@storybook/react'
import { within, expect } from '@storybook/test'
import { userEvent } from '@storybook/testing-library'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { TestUserRole, UUID } from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { EditUser, useUserFormState } from './UserEditor'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const mockRoles = [
  { id: TestUserRole.enum.REGISTRATION_AGENT, scopes: [] },
  { id: TestUserRole.enum.LOCAL_REGISTRAR, scopes: [] }
]

const meta: Meta<typeof EditUser> = {
  title: 'SysAdmin/UserEditor/Interaction',
  parameters: {
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    msw: {
      handlers: {
        userRoles: [tRPCMsw.user.roles.list.query(() => mockRoles)]
      }
    }
  }
}

export default meta

/**
 * Regression test for: hospital offices not appearing as Registration Office options.
 *
 * The registration office field must include both CRVS_OFFICE and HEALTH_FACILITY
 * locations so that hospital clerks can be assigned to a hospital as their office.
 */
export const RegistrationOfficeIncludesHospitals: StoryObj<typeof EditUser> = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
        userId: '__NEW__' as UUID, // @TODO: Figure out what this concept is
        pageId: 'user.office'
      })
    }
  },
  loaders: [
    async () => {
      window.config.ADDITIONAL_USER_FIELDS = []
      useUserFormState.getState().clear()
    }
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Registration office dropdown shows both CRVS offices and hospital facilities',
      async () => {
        const input = await canvas.findByRole('combobox')

        await userEvent.type(input, 'Ibombo')

        await expect(
          canvas.findByText('Ibombo District Office')
        ).resolves.toBeInTheDocument()

        await expect(
          canvas.findByText('Ibombo Rural Health Centre')
        ).resolves.toBeInTheDocument()
      }
    )
  }
}
