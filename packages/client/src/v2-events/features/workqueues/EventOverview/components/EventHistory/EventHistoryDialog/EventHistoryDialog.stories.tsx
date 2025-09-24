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
import addDays from 'date-fns/addDays'
import {
  ActionType,
  generateUuid,
  getUUID,
  tennisClubMembershipEvent,
  generateActionDocument,
  createPrng,
  getRandomDatetime
} from '@opencrvs/commons/client'
import { DECLARATION_ACTION_UPDATE } from '@client/v2-events/features/events/actions/correct/useActionForHistory'
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
  createdAt: '2021-01-01',
  createdBy: 'John Doe',
  createdByRole: 'User',
  createdByUserType: 'user',
  status: 'Accepted',
  transactionId: '123',
  declaration: {},
  requestId: '123'
} as const

const prng = createPrng(1231232)

const requestCorrectionAction = {
  ...actionBase,
  id: generateUuid(prng),
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

const updateAction = {
  ...actionBase,
  id: generateUuid(prng),
  type: DECLARATION_ACTION_UPDATE,
  declaration: {
    'applicant.email': 'newmail@baz.fi',
    'recommender.name': {
      firstname: 'Updated',
      surname: 'Name'
    }
  }
}

const fullEvent = {
  id: getUUID(),
  type: 'tennis-club-membership',
  actions: [
    {
      ...actionBase,
      id: generateUuid(prng),
      type: ActionType.CREATE
    },
    {
      ...actionBase,
      id: generateUuid(prng),
      type: ActionType.DECLARE,
      declaration
    },
    {
      ...actionBase,
      id: generateUuid(prng),
      type: ActionType.VALIDATE,
      declaration
    },
    {
      ...actionBase,
      id: generateUuid(prng),
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
  args: {
    ...argbase,
    action: {
      ...argbase.action,
      id: generateUuid(prng),
      type: ActionType.CREATE
    }
  }
}

export const Notified: Story = {
  args: {
    ...argbase,
    action: {
      ...argbase.action,
      id: generateUuid(prng),
      type: ActionType.NOTIFY
    }
  }
}

export const Read: Story = {
  args: {
    ...argbase,
    action: { ...argbase.action, id: generateUuid(prng), type: ActionType.READ }
  }
}

const createActionCreatedAt = getRandomDatetime(
  prng,
  new Date('2023-12-12'),
  new Date('2023-12-31')
)

const createAction = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.CREATE,
  rng: prng,
  defaults: {
    createdAt: createActionCreatedAt,
    id: generateUuid(prng)
  }
})

const declareAction = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.DECLARE,
  rng: prng,
  defaults: {
    createdAt: addDays(new Date(createActionCreatedAt), 1).toISOString(),
    id: generateUuid(prng)
  }
})

const validateAction = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.VALIDATE,
  rng: prng,
  defaults: {
    createdAt: addDays(new Date(createActionCreatedAt), 2).toISOString(),
    id: generateUuid(prng)
  },
  declarationOverrides: {
    'applicant.email': 'mail.that.updated@opencrvs.org'
  }
})

const registerAction = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.REGISTER,
  rng: prng,
  defaults: {
    createdAt: addDays(new Date(createActionCreatedAt), 3).toISOString(),
    id: generateUuid(prng)
  },
  declarationOverrides: {
    'applicant.email': 'mail.updated.again.during.registration@opencrvs.org'
  }
})

const eventWhenDeclareUpdatesDeclaration = {
  trackingId: generateUuid(prng),
  type: tennisClubMembershipEvent.id,
  actions: [createAction, declareAction],
  createdAt: createActionCreatedAt,
  id: generateUuid(prng),
  updatedAt: addDays(new Date(createActionCreatedAt), 1).toISOString()
}

export const Declared: Story = {
  args: {
    ...argbase,
    action: {
      ...argbase.action,
      id: generateUuid(prng),
      type: ActionType.DECLARE
    }
  }
}

export const DeclaredOnDeclarationUpdate: Story = {
  args: {
    fullEvent: eventWhenDeclareUpdatesDeclaration,
    action: declareAction
  }
}

const eventWhenValidateUpdatesDeclaration = {
  trackingId: generateUuid(prng),
  type: tennisClubMembershipEvent.id,
  actions: [createAction, declareAction, validateAction],
  createdAt: createActionCreatedAt,
  id: generateUuid(prng),
  updatedAt: addDays(new Date(createActionCreatedAt), 2).toISOString()
}

export const Validated: Story = {
  args: {
    ...argbase,
    action: {
      ...argbase.action,
      id: generateUuid(prng),
      type: ActionType.VALIDATE
    }
  }
}

export const ValidatedOnDeclarationUpdate: Story = {
  args: {
    fullEvent: eventWhenValidateUpdatesDeclaration,
    action: validateAction
  }
}

const eventWhenRegisterUpdatesDeclaration = {
  trackingId: generateUuid(prng),
  type: tennisClubMembershipEvent.id,
  actions: [createAction, declareAction, validateAction, registerAction],
  createdAt: createActionCreatedAt,
  id: generateUuid(prng),
  updatedAt: addDays(new Date(createActionCreatedAt), 3).toISOString()
}

export const Registered: Story = {
  args: {
    ...argbase,
    action: {
      ...argbase.action,
      id: eventWhenRegisterUpdatesDeclaration.id,
      type: ActionType.REGISTER
    }
  }
}

export const RegisteredOnDeclarationUpdate: Story = {
  args: {
    fullEvent: eventWhenRegisterUpdatesDeclaration,
    action: registerAction
  }
}

export const Rejected: Story = {
  args: {
    ...argbase,
    action: {
      ...argbase.action,
      id: generateUuid(prng),
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
      id: generateUuid(prng),
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
      id: generateUuid(prng),
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
      id: generateUuid(prng),
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
          id: generateUuid(prng),
          type: ActionType.CREATE
        },
        {
          ...actionBase,
          id: generateUuid(prng),
          type: ActionType.DECLARE,
          declaration
        },
        {
          ...actionBase,
          id: generateUuid(prng),
          type: ActionType.VALIDATE,
          declaration
        },
        {
          ...actionBase,
          id: generateUuid(prng),
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
          id: generateUuid(prng),
          type: ActionType.CREATE
        },
        {
          ...actionBase,
          id: generateUuid(prng),
          type: ActionType.DECLARE,
          declaration
        },
        {
          ...actionBase,
          id: generateUuid(prng),
          type: ActionType.VALIDATE,
          declaration
        },
        {
          ...actionBase,
          id: generateUuid(prng),
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

export const UpdateAction: Story = {
  args: {
    ...argbase,
    action: updateAction,
    fullEvent: {
      id: getUUID(),
      type: 'tennis-club-membership',
      actions: [
        {
          ...actionBase,
          id: generateUuid(prng),
          type: ActionType.CREATE
        },
        {
          ...actionBase,
          id: generateUuid(prng),
          type: ActionType.DECLARE,
          declaration
        },
        // @ts-expect-error - Storybook uses EventHistoryDocument (with UPDATE) instead of EventDocument
        updateAction,
        {
          ...actionBase,
          id: generateUuid(prng),
          type: ActionType.VALIDATE,
          declaration: {}
        },
        {
          ...actionBase,
          id: generateUuid(prng),
          type: ActionType.REGISTER,
          declaration: {}
        }
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
      id: generateUuid(prng),
      type: 'tennis-club-membership',
      actions: [
        {
          ...actionBase,
          id: generateUuid(prng),
          type: ActionType.CREATE
        },
        {
          ...actionBase,
          id: generateUuid(prng),
          type: ActionType.DECLARE,
          declaration
        },
        {
          ...actionBase,
          id: generateUuid(prng),
          type: ActionType.VALIDATE,
          declaration
        },
        {
          ...actionBase,
          id: generateUuid(prng),
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
          id: generateUuid(prng),
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
      id: generateUuid(prng),
      type: ActionType.REJECT_CORRECTION,
      content: { reason: 'No legal proof' }
    }
  }
}

export const ApproveCorrection: Story = {
  args: {
    ...argbase,
    action: {
      ...argbase.action,
      id: generateUuid(prng),
      type: ActionType.APPROVE_CORRECTION
    }
  }
}

export const Assigned: Story = {
  args: {
    ...argbase,
    action: {
      ...argbase.action,
      id: generateUuid(prng),
      type: ActionType.ASSIGN,
      assignedTo: 'John Doe'
    }
  }
}

export const Unassigned: Story = {
  args: {
    ...argbase,
    action: {
      ...argbase.action,
      id: generateUuid(prng),
      type: ActionType.UNASSIGN
    }
  }
}
