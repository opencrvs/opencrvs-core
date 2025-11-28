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

import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { UserAuditHistory } from './UserAuditHistory'
import { TestUserRole } from '@opencrvs/commons/client'

import { TRPCProvider } from '../../v2-events/trpc'

const meta: Meta<typeof UserAuditHistory> = {
  title: 'UserAudit/UserAuditHistory',
  component: UserAuditHistory,
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR
  },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof UserAuditHistory>

export const Default: Story = {}
