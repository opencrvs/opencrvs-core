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
import { V2_DEFAULT_MOCK_LOCATIONS } from '../../../../.storybook/default-request-handlers'
import { TeamPage } from './Team'

const meta: Meta<typeof TeamPage> = {
  title: 'Team'
}

export default meta

type Story = StoryObj<typeof TeamPage>

const locationId = V2_DEFAULT_MOCK_LOCATIONS.find(
  (location) => location.name === 'Ibombo District Office'
)?.id

export const TeamPageStory: Story = {
  name: 'Team Page',
  parameters: {
    userRole: TestUserRole.Enum.LOCAL_REGISTRAR,
    reactRouter: {
      router: routesConfig,
      initialPath: V1_LEGACY_ROUTES.TEAM_USER_LIST + `?locationId=${locationId}`
    }
  }
}
