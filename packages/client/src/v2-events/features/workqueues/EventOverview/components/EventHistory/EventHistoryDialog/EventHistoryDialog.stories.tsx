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
import { ActionType, getUUID } from '@opencrvs/commons/client'
import { EventHistoryDialog } from './EventHistoryDialog'

const meta: Meta<typeof EventHistoryDialog> = {
  title: 'Components/EventHistoryDialog',
  component: EventHistoryDialog
}

export default meta

type Story = StoryObj<typeof EventHistoryDialog>

const declaration = {
  'applicant.email': 'foo@bar.fi',
  'recommender.name': {
    firstname: 'John',
    surname: 'Doe'
  }
}

const actionBase = {
  id: getUUID(),
  createdAt: '2021-01-01',
  createdBy: 'John Doe',
  createdByRole: 'User',
  createdByUserType: 'user',
  status: 'Accepted',
  transactionId: '123',
  declaration: {},
  requestId: '123'
} as const

const requestCorrectionAction = {
  ...actionBase,
  id: getUUID(),
  type: ActionType.REQUEST_CORRECTION,
  declaration: {
    'applicant.email': 'foo@baz.fi',
    'recommender.name': {
      firstname: 'Jane',
      surname: 'Doe'
    }
  },
  annotation: {
    'correction.request.reason': 'My reason',
    'identity-check': true
  }
}

const fullEvent = {
  id: getUUID(),
  type: 'tennis-club-membership',
  actions: [
    {
      ...actionBase,
      type: ActionType.CREATE
    },
    {
      ...actionBase,
      type: ActionType.DECLARE,
      declaration
    },
    {
      ...actionBase,
      type: ActionType.VALIDATE,
      declaration
    },
    {
      ...actionBase,
      type: ActionType.REGISTER,
      declaration
    }
  ],
  trackingId: 'ABCD123',
  updatedAt: '2021-01-01',
  createdAt: '2021-01-01'
}

const argbase = {
  userName: 'Jhon Doe',
  fullEvent,
  action: {
    ...actionBase
  }
}
export const Created: Story = {
  args: { ...argbase, action: { ...argbase.action, type: ActionType.CREATE } }
}

export const Notified: Story = {
  args: { ...argbase, action: { ...argbase.action, type: ActionType.NOTIFY } }
}

export const Read: Story = {
  args: { ...argbase, action: { ...argbase.action, type: ActionType.READ } }
}

export const Declared: Story = {
  args: { ...argbase, action: { ...argbase.action, type: ActionType.DECLARE } }
}

export const Validated: Story = {
  args: { ...argbase, action: { ...argbase.action, type: ActionType.VALIDATE } }
}

export const Registered: Story = {
  args: { ...argbase, action: { ...argbase.action, type: ActionType.REGISTER } }
}

export const Rejected: Story = {
  args: {
    ...argbase,
    action: {
      ...argbase.action,
      type: ActionType.REJECT,
      content: {
        reason: 'Invalid information provided'
      }
    }
  }
}

export const Archived: Story = {
  args: {
    ...argbase,
    action: {
      ...argbase.action,
      type: ActionType.ARCHIVE,
      content: {
        reason: 'Record archived'
      }
    }
  }
}

export const MarkedAsDuplicate: Story = {
  args: {
    ...argbase,
    action: {
      ...argbase.action,
      type: ActionType.ARCHIVE,
      content: {
        reason: 'Duplicate record found'
      }
    }
  }
}

export const PrintCertificate: Story = {
  args: {
    ...argbase,
    action: {
      ...argbase.action,
      type: ActionType.PRINT_CERTIFICATE,
      annotation: {
        'collector.identity.verify': true,
        'collector.requesterId': 'INFORMANT'
      }
    },
    fullEvent: {
      id: getUUID(),
      type: 'tennis-club-membership',
      actions: [
        {
          ...actionBase,
          type: ActionType.CREATE
        },
        {
          ...actionBase,
          type: ActionType.DECLARE,
          declaration
        },
        {
          ...actionBase,
          type: ActionType.VALIDATE,
          declaration
        },
        {
          ...actionBase,
          type: ActionType.REGISTER,
          declaration
        }
      ],
      trackingId: 'ABCD123',
      updatedAt: '2021-01-01',
      createdAt: '2021-01-01'
    }
  }
}

export const RequestCorrection: Story = {
  args: {
    ...argbase,
    action: requestCorrectionAction,
    fullEvent: {
      id: getUUID(),
      type: 'tennis-club-membership',
      actions: [
        {
          ...actionBase,
          id: getUUID(),
          type: ActionType.CREATE
        },
        {
          ...actionBase,
          id: getUUID(),
          type: ActionType.DECLARE,
          declaration
        },
        {
          ...actionBase,
          id: getUUID(),
          type: ActionType.VALIDATE,
          declaration
        },
        {
          ...actionBase,
          id: getUUID(),
          type: ActionType.REGISTER,
          declaration
        },
        requestCorrectionAction
      ],
      trackingId: 'ABCD123',
      updatedAt: '2021-01-01',
      createdAt: '2021-01-01'
    }
  }
}
export const RecordCorrected: Story = {
  args: {
    ...argbase,
    action: {
      ...requestCorrectionAction,
      annotation: {
        ...requestCorrectionAction.annotation,
        isImmediateCorrection: true
      }
    },
    fullEvent: {
      id: getUUID(),
      type: 'tennis-club-membership',
      actions: [
        {
          ...actionBase,
          id: getUUID(),
          type: ActionType.CREATE
        },
        {
          ...actionBase,
          id: getUUID(),
          type: ActionType.DECLARE,
          declaration
        },
        {
          ...actionBase,
          id: getUUID(),
          type: ActionType.VALIDATE,
          declaration
        },
        {
          ...actionBase,
          id: getUUID(),
          type: ActionType.REGISTER,
          declaration
        },
        {
          ...requestCorrectionAction,
          annotation: {
            ...requestCorrectionAction.annotation,
            isImmediateCorrection: true
          }
        },
        {
          ...actionBase,
          id: getUUID(),
          type: ActionType.APPROVE_CORRECTION,
          requestId: requestCorrectionAction.id,
          annotation: {
            isImmediateCorrection: true
          }
        }
      ],
      trackingId: 'ABCD123',
      updatedAt: '2021-01-01',
      createdAt: '2021-01-01'
    }
  }
}

export const RejectCorrection: Story = {
  args: {
    ...argbase,
    action: {
      ...argbase.action,
      type: ActionType.REJECT_CORRECTION,
      content: { reason: 'No legal proof' }
    }
  }
}

export const ApproveCorrection: Story = {
  args: {
    ...argbase,
    action: { ...argbase.action, type: ActionType.APPROVE_CORRECTION }
  }
}

export const Assigned: Story = {
  args: {
    ...argbase,
    action: {
      ...argbase.action,
      type: ActionType.ASSIGN,
      assignedTo: 'John Doe'
    }
  }
}

export const Unassigned: Story = {
  args: { ...argbase, action: { ...argbase.action, type: ActionType.UNASSIGN } }
}
