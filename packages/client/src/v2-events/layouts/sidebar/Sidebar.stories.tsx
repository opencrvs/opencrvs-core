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

import { Sidebar } from './Sidebar'

const meta: Meta<typeof Sidebar> = {
  title: 'Sidebar',
  component: Sidebar
}

export default meta

type Story = StoryObj<typeof Sidebar>

export const LocalRegistrar: Story = {
  parameters: {
    userRole: TestUserRole.Enum.LOCAL_REGISTRAR
  }
}

export const FieldAgent: Story = {
  parameters: {
    userRole: TestUserRole.Enum.FIELD_AGENT
  }
}

export const RegistrationAgent: Story = {
  parameters: {
    userRole: TestUserRole.Enum.REGISTRATION_AGENT
  }
}

export const LocalSystemAdmin: Story = {
  parameters: {
    userRole: TestUserRole.Enum.LOCAL_SYSTEM_ADMIN
  }
}
