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
import { routesConfig } from '@client/v2-events/routes'
import { UserList } from '../../views/SysAdmin/Team/user/UserList'
import { testDataGenerator } from '../../tests/test-data-generators'

const meta: Meta<typeof UserList> = {
  title: 'Routes/Legacy'
}

export default meta
export const Organisation: StoryObj<typeof UserList> = {
  parameters: {
    reactRouter: {
      initialPath: '/v2/organisation',
      router: routesConfig
    }
  }
}

const generator = testDataGenerator()

export const Team: StoryObj<typeof UserList> = {
  parameters: {
    userRole: TestUserRole.enum.REGISTRATION_AGENT,
    reactRouter: {
      initialPath: `/v2/team/users?locationId=${generator.user.registrationAgent().v2.primaryOfficeId}`,
      router: routesConfig
    }
  }
}

export const UserProfile: StoryObj<typeof UserList> = {
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    reactRouter: {
      initialPath: `/v2/userProfile/${generator.user.registrationAgent().v2.id}`,
      router: routesConfig
    }
  }
}

export const SystemList: StoryObj<typeof UserList> = {
  parameters: {
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    reactRouter: {
      initialPath: '/v2/config/integration',
      router: routesConfig
    }
  }
}

export const EmailAllUsers: StoryObj<typeof UserList> = {
  parameters: {
    userRole: TestUserRole.enum.NATIONAL_SYSTEM_ADMIN,
    reactRouter: {
      initialPath: '/v2/communications/emailAllUsers',
      router: routesConfig
    }
  }
}
