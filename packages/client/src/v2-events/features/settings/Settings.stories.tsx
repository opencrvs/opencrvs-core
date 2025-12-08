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
import { TestUserRole } from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { SettingsPage } from './Settings'

const meta: Meta<typeof SettingsPage> = {
  title: 'Settings'
}

export default meta

type Story = StoryObj<typeof SettingsPage>

export const LocalRegistrar: Story = {
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.buildPath({})
    }
  }
}

export const FieldAgent: Story = {
  parameters: {
    userRole: TestUserRole.enum.FIELD_AGENT,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.buildPath({})
    }
  }
}

export const RegistrationAgent: Story = {
  parameters: {
    userRole: TestUserRole.enum.REGISTRATION_AGENT,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.buildPath({})
    }
  }
}

export const LocalSystemAdmin: Story = {
  parameters: {
    userRole: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.SETTINGS.buildPath({})
    }
  }
}
