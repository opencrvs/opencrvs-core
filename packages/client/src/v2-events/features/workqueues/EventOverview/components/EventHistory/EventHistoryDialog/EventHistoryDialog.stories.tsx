/* eslint-disable max-lines */
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
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { within } from 'storybook/test'
import addDays from 'date-fns/addDays'
import {
  ActionType,
  generateUuid,
  getUUID,
  tennisClubMembershipEvent,
  generateActionDocument,
  createPrng,
  UUID,
  EventDocument,
  generateEventDocument,
  TestUserRole,
  generateRandomDatetime,
  DocumentPath,
  FieldType,
  generateTranslationConfig
} from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { getTestValidatorContext } from '../../../../../../../../.storybook/decorators'
import { EventHistoryDialog } from './EventHistoryDialog'

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
  createdByUserType: 'user' as const,
  status: 'Accepted' as const,
  transactionId: '123',
  declaration: {},
  requestId: '123',
  annotation: {}
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
  validatorContext: getTestValidatorContext(),
  action: {
    ...actionBase
  }
}

const meta: Meta<typeof EventHistoryDialog> = {
  title: 'Components/EventHistoryDialog',
  component: EventHistoryDialog,
  args: {
    userName: 'Jhon Doe',
    fullEvent,
    validatorContext: getTestValidatorContext()
  }
}

export default meta

type Story = StoryObj<typeof EventHistoryDialog>

export const Created: Story = {
  args: {
    ...argbase,
    title: 'Draft',
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
    title: 'Sent incomplete',
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
    title: 'Viewed',
    action: { ...argbase.action, id: generateUuid(prng), type: ActionType.READ }
  }
}

const createActionCreatedAt = generateRandomDatetime(
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

export const Declared: Story = {
  args: {
    ...argbase,
    title: 'Sent for review',
    action: {
      ...argbase.action,
      id: generateUuid(prng),
      type: ActionType.DECLARE
    }
  }
}

const eventWhenRegisterUpdatesDeclaration = {
  trackingId: generateUuid(prng),
  type: tennisClubMembershipEvent.id,
  actions: [createAction, declareAction, registerAction],
  createdAt: createActionCreatedAt,
  id: generateUuid(prng),
  updatedAt: addDays(new Date(createActionCreatedAt), 3).toISOString()
}

export const Registered: Story = {
  args: {
    ...argbase,
    title: 'Registered',
    action: {
      ...argbase.action,
      id: eventWhenRegisterUpdatesDeclaration.id,
      type: ActionType.REGISTER
    }
  }
}

// #11305: core actions (NOTIFY/DECLARE/REGISTER/ARCHIVE/REJECT) can configure
// a confirmation-dialog `form`; submitted values persist as the action's
// `annotation` and are rendered in the audit history dialog by
// `ActionFormContent`. This is the only story exercising that populated path.
const registerDialogCommentsField = {
  id: 'register.dialog.comments',
  type: FieldType.TEXTAREA,
  required: true,
  label: generateTranslationConfig('Comments')
}

const eventConfigurationWithRegisterForm = {
  ...tennisClubMembershipEvent,
  actions: tennisClubMembershipEvent.actions.map((action) =>
    action.type === ActionType.REGISTER
      ? { ...action, form: [registerDialogCommentsField] }
      : action
  )
}

const registerActionWithDialogFormAnnotation = {
  ...actionBase,
  id: generateUuid(prng),
  type: ActionType.REGISTER,
  declaration,
  annotation: {
    'register.dialog.comments': 'Reviewed all supporting documents'
  }
}

const eventWithRegisterDialogFormAnnotation = {
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
    registerActionWithDialogFormAnnotation
  ],
  trackingId: 'ABCD123',
  updatedAt: '2021-01-01',
  createdAt: '2021-01-01'
}

export const RegisteredWithDialogFormValues: Story = {
  args: {
    ...argbase,
    title: 'Registered',
    fullEvent: eventWithRegisterDialogFormAnnotation,
    action: registerActionWithDialogFormAnnotation
  },
  parameters: {
    offline: {
      configs: [eventConfigurationWithRegisterForm]
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByText('Comments')).resolves.toBeInTheDocument()
    await expect(
      canvas.findByText('Reviewed all supporting documents')
    ).resolves.toBeInTheDocument()
  }
}

const generator = testDataGenerator()

export const Rejected: Story = {
  args: {
    ...argbase,
    title: 'Rejected',
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

// #13265: archiving from the action menu collects no reason, so the dialog must
// not render an empty `Comment` section. Only `MarkedAsDuplicate` below archives
// with a reason attached.
export const Archived: Story = {
  name: 'Archived without a reason — no Comment section (regression: #13265)',
  args: {
    ...argbase,
    title: 'Archived',
    action: {
      ...argbase.action,
      id: generateUuid(prng),
      type: ActionType.ARCHIVE
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Wait for the dialog to render before asserting on absence.
    await expect(
      canvas.findByText('Jhon Doe', { exact: false })
    ).resolves.toBeInTheDocument()
    await expect(canvas.queryByText('Comment')).not.toBeInTheDocument()
  }
}

export const MarkedAsDuplicate: Story = {
  args: {
    ...argbase,
    title: 'Archived',
    action: {
      ...argbase.action,
      id: generateUuid(prng),
      type: ActionType.ARCHIVE,
      content: {
        reason: 'Duplicate record found'
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.findByText('Comment')).resolves.toBeInTheDocument()
    await expect(
      canvas.findByText('Duplicate record found')
    ).resolves.toBeInTheDocument()
  }
}

export const Certified: Story = {
  args: {
    ...argbase,
    title: 'Certified',
    action: {
      ...argbase.action,
      id: generateUuid(prng),
      type: ActionType.PRINT_CERTIFICATE,
      annotation: {
        'collector.identity.verify': true,
        'collector.requesterId': 'INFORMANT'
      },
      content: {
        templateId: 'tennis-club-membership-certified-certificate'
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

export const CertifiedBySomeoneElse: Story = {
  args: {
    ...argbase,
    title: 'Certified',
    action: {
      ...argbase.action,
      id: generateUuid(prng),
      type: ActionType.PRINT_CERTIFICATE,
      annotation: {
        'collector.requesterId': 'OTHER',
        'collector.OTHER.idType': 'PASSPORT',
        'collector.PASSPORT.details': '1234567890',
        'collector.OTHER.firstName': 'Paul',
        'collector.OTHER.lastName': 'Printterguy',
        'collector.OTHER.relationshipToMember': 'Brother',
        // random field which should not be visible
        'random-field': 'random-value'
      },
      content: {
        templateId: 'tennis-club-membership-certificate'
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
    title: 'Correction requested',
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
    title: 'Record corrected',
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
          content: { immediateCorrection: true }
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
    title: 'Correction rejected',
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
    title: 'Correction approved',
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
    title: 'Assigned',
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
    title: 'Unassigned',
    action: {
      ...argbase.action,
      id: generateUuid(prng),
      type: ActionType.UNASSIGN
    }
  }
}

// Regression: #13029 — Number.Output crashed with "Cannot read properties of null
// (reading 'toString')" when a number field was cleared during an edit action.
const editActionClearingAge = {
  ...actionBase,
  id: generateUuid(prng),
  type: ActionType.EDIT,
  declaration: { 'applicant.age': null },
  content: {}
}

const eventWithEditClearingNumberField = {
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
      type: ActionType.NOTIFY,
      declaration: {
        'applicant.name': { firstname: 'Jane', surname: 'Doe', middlename: '' },
        'applicant.dobUnknown': true,
        'applicant.age': 42,
        'recommender.none': true
      }
    },
    editActionClearingAge
  ],
  trackingId: 'EDIT123',
  updatedAt: '2021-01-01',
  createdAt: '2021-01-01'
}

export const EditClearsNumberField: Story = {
  name: 'Edit clears a number field — shows previous value (regression: #13029)',
  args: {
    ...argbase,
    title: 'Edited',
    action: editActionClearingAge,
    fullEvent: eventWithEditClearingNumberField
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Previous value must be visible in the comparison table.
    // Before the fix, Number.Output crashed on null and this assertion times out.
    await expect(canvas.findByText('42')).resolves.toBeInTheDocument()
  }
}
