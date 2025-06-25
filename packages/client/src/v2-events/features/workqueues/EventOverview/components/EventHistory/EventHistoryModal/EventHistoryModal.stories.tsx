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
import { ActionType, tennisClubMembershipEvent } from '@opencrvs/commons/client'
import { EventHistoryModal } from './EventHistoryModal'

const meta: Meta<typeof EventHistoryModal> = {
  title: 'Components/EventHistoryModal',
  component: EventHistoryModal
}

export default meta

type Story = StoryObj<typeof EventHistoryModal>

const actionBase = {
  id: '123',
  createdAt: '2021-01-01',
  createdBy: 'John Doe',
  createdByRole: 'User',
  createdByUserType: 'user',
  status: 'Accepted',
  transactionId: '123',
  declaration: {},
  requestId: '123'
} as const

export const Created: Story = {
  args: {
    action: {
      ...actionBase,
      type: ActionType.CREATE
    }
  }
}

export const Notified: Story = {
  args: {
    action: {
      ...actionBase,
      type: ActionType.NOTIFY
    }
  }
}

export const Read: Story = {
  args: {
    action: {
      ...actionBase,
      type: ActionType.READ
    }
  }
}

export const Declared: Story = {
  args: {
    action: {
      ...actionBase,
      type: ActionType.DECLARE
    }
  }
}
export const Validated: Story = {
  args: {
    action: {
      ...actionBase,
      type: ActionType.VALIDATE
    }
  }
}

export const Registered: Story = {
  args: {
    action: {
      ...actionBase,
      type: ActionType.REGISTER
    }
  }
}

export const Rejected: Story = {
  args: {
    action: {
      ...actionBase,
      type: ActionType.REJECT,
      reason: {
        message: 'Invalid information provided'
      }
    }
  }
}

export const Archived: Story = {
  args: {
    action: {
      ...actionBase,
      type: ActionType.ARCHIVE,
      reason: {
        message: 'Record archived',
        isDuplicate: false
      }
    }
  }
}

export const MarkedAsDuplicate: Story = {
  args: {
    action: {
      ...actionBase,
      type: ActionType.ARCHIVE,
      reason: {
        message: 'Duplicate record found',
        isDuplicate: true
      }
    }
  }
}

export const PrintCertificate: Story = {
  args: {
    action: {
      ...actionBase,
      type: ActionType.PRINT_CERTIFICATE
    }
  }
}

export const RequestCorrection: Story = {
  args: {
    action: {
      ...actionBase,
      type: ActionType.REQUEST_CORRECTION
    }
  }
}

export const RejectCorrection: Story = {
  args: {
    action: {
      ...actionBase,
      type: ActionType.REJECT_CORRECTION
    }
  }
}

export const ApproveCorrection: Story = {
  args: {
    action: {
      ...actionBase,
      type: ActionType.APPROVE_CORRECTION
    }
  }
}

export const Assigned: Story = {
  args: {
    action: {
      ...actionBase,
      type: ActionType.ASSIGN,
      assignedTo: 'John Doe'
    }
  }
}

export const Unassigned: Story = {
  args: {
    action: {
      ...actionBase,
      type: ActionType.UNASSIGN,
      assignedTo: null
    }
  }
}
