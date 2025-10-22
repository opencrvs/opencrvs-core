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
import * as V1_LEGACY_ROUTES from '@client/navigation/routes'
import { OrganisationPage } from './Organisation'

const meta: Meta<typeof OrganisationPage> = {
  title: 'Organisation'
}

export default meta

type Story = StoryObj<typeof OrganisationPage>

export const OrganisationPageStory: Story = {
  name: 'Organisation Page',
  parameters: {
    userRole: TestUserRole.Enum.LOCAL_REGISTRAR,
    reactRouter: {
      router: routesConfig,
      initialPath: V1_LEGACY_ROUTES.ORGANISATIONS_INDEX
    }
  }
}
