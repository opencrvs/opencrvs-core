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
