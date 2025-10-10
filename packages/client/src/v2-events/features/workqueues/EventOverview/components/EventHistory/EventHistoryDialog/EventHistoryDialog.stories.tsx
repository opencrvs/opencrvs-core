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
import type { Meta, StoryObj } from '@storybook/react'
import addDays from 'date-fns/addDays'
import {
  ActionType,
  generateUuid,
  getUUID,
  tennisClubMembershipEvent,
  generateActionDocument,
  createPrng,
  getRandomDatetime,
  UUID,
  getAcceptedActions,
  EventDocument
} from '@opencrvs/commons/client'
import {
  DECLARATION_ACTION_UPDATE,
  expandWithUpdateActions
} from '@client/v2-events/features/events/actions/correct/useActionForHistory'
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
  },
  annotation: {
    'review.comment': 'My comment'
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

const updateActionForValidate = expandWithUpdateActions(
  eventWhenValidateUpdatesDeclaration,
  getTestValidatorContext()
).find((a) => a.type === DECLARATION_ACTION_UPDATE)

export const ValidatedOnDeclarationUpdate: Story = {
  args: {
    fullEvent: eventWhenValidateUpdatesDeclaration,
    action: updateActionForValidate
  }
}

const newFullEvent = {
  id: '7774a11b-ad7b-4cf2-8433-79ab72f25cc3' as UUID,
  type: 'tennis-club-membership',
  createdAt: '2025-09-26T06:55:05.836Z',
  updatedAt: '2025-09-26T06:55:05.836Z',
  trackingId: '28W273',
  actions: [
    {
      id: '8bb2f77c-db06-4796-95bb-264a6892875c' as UUID,
      transactionId: 'tmp-edae6efa-41a6-4c7b-a50e-59cff6f36ffa',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:55:05.836Z',
      createdBy: '68cbd26ec6476156546958dd',
      createdByRole: 'SOCIAL_WORKER',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      status: 'Accepted' as const,
      type: 'CREATE' as const
    },
    {
      id: '7339b3ad-8863-4b2c-9c01-7a79913f416a' as UUID,
      transactionId: 'tmp-edae6efa-41a6-4c7b-a50e-59cff6f36ffa',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:55:05.836Z',
      createdBy: '68cbd26ec6476156546958dd',
      createdByRole: 'SOCIAL_WORKER',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      status: 'Accepted' as const,
      type: 'ASSIGN' as const,
      assignedTo: '68cbd26ec6476156546958dd'
    },
    {
      id: '681446f7-d4c7-47b4-a748-80e3952c4bd3' as UUID,
      transactionId: '8196e485-9531-426c-ae24-ba229c932c1c',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:55:28.157Z',
      createdBy: '68cbd26ec6476156546958dd',
      createdByRole: 'SOCIAL_WORKER',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {
        'applicant.dob': '2025-05-22',
        'applicant.name': {
          surname: 'last',
          firstname: 'first',
          middlename: 'middle'
        },
        'recommender.none': true,
        'applicant.image.label': 'picture text'
      },
      annotation: {},
      status: 'Requested' as const,
      type: 'NOTIFY' as const
    },
    {
      id: '0aad8e49-fdf7-4839-8e80-6a842dd08169' as UUID,
      transactionId: '8196e485-9531-426c-ae24-ba229c932c1c',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:55:28.219Z',
      createdBy: '68cbd26ec6476156546958dd',
      createdByRole: 'SOCIAL_WORKER',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      status: 'Accepted' as const,
      originalActionId: '681446f7-d4c7-47b4-a748-80e3952c4bd3' as UUID,
      type: 'NOTIFY' as const
    },
    {
      id: '95e54654-55b7-4117-9992-687da243fae3' as UUID,
      transactionId: '8196e485-9531-426c-ae24-ba229c932c1c',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:55:28.222Z',
      createdBy: '68cbd26ec6476156546958dd',
      createdByRole: 'SOCIAL_WORKER',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      status: 'Accepted' as const,
      type: 'UNASSIGN' as const
    },
    {
      id: '900d6339-c127-413d-a4ec-bf3e88bb51cb' as UUID,
      transactionId: '321695f5-8b78-4f85-b39c-3faddd9aea61',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:55:49.493Z',
      createdBy: '68cbd26ec6476156546958e5',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      annotation: {},
      status: 'Accepted' as const,
      type: 'ASSIGN' as const,
      assignedTo: '68cbd26ec6476156546958e5'
    },
    {
      id: '6c95d0fe-74d1-4aa1-96bb-78e188ead725' as UUID,
      transactionId: '9dd814b2-c74b-4688-bf23-813eeb83b4c8',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:56:10.673Z',
      createdBy: '68cbd26ec6476156546958e5',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      annotation: {},
      status: 'Requested' as const,
      type: 'REJECT' as const,
      content: {
        reason: 'pass id missing'
      }
    },
    {
      id: '7bbbc4db-08fd-47f1-9845-5b99517c49e9' as UUID,
      transactionId: '9dd814b2-c74b-4688-bf23-813eeb83b4c8',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:56:10.728Z',
      createdBy: '68cbd26ec6476156546958e5',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      status: 'Accepted' as const,
      originalActionId: '6c95d0fe-74d1-4aa1-96bb-78e188ead725' as UUID,
      type: 'REJECT' as const,
      content: {
        reason: 'pass id missing'
      }
    },
    {
      id: '0e9b66fa-5a90-4f87-ab83-7b5c1e0d0ba1' as UUID,
      transactionId: '9dd814b2-c74b-4688-bf23-813eeb83b4c8',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:56:10.730Z',
      createdBy: '68cbd26ec6476156546958e5',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      status: 'Accepted' as const,
      type: 'UNASSIGN' as const
    },
    {
      id: '1a2ed084-4fc1-40c3-bbf9-6f451179755f' as UUID,
      transactionId: '73043b4e-3c40-4fc4-b3e0-7703c35526b3',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:56:19.690Z',
      createdBy: '68cbd26ec6476156546958dd',
      createdByRole: 'SOCIAL_WORKER',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      annotation: {},
      status: 'Accepted' as const,
      type: 'ASSIGN' as const,
      assignedTo: '68cbd26ec6476156546958dd'
    },
    {
      id: '80d59313-bd0c-4fb2-bdb1-aa6f5149d447' as UUID,
      transactionId: '2c483b2f-d28c-456b-804e-6e5bfea26277',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:56:30.585Z',
      createdBy: '68cbd26ec6476156546958dd',
      createdByRole: 'SOCIAL_WORKER',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {
        'applicant.dob': '2025-05-22',
        'applicant.name': {
          surname: 'last',
          firstname: 'first',
          middlename: 'middle'
        },
        'senior-pass.id': '123123', // Senior pass ID was added here. First Update. Looks correct.
        'recommender.none': true,
        'applicant.image.label': 'picture text'
      },
      annotation: {},
      status: 'Requested' as const,
      type: 'DECLARE' as const
    },
    {
      id: 'd72e75f5-d5b0-41fd-9677-b3fd8107d1ed' as UUID,
      transactionId: '2c483b2f-d28c-456b-804e-6e5bfea26277',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:56:30.639Z',
      createdBy: '68cbd26ec6476156546958dd',
      createdByRole: 'SOCIAL_WORKER',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      status: 'Accepted' as const,
      originalActionId: '80d59313-bd0c-4fb2-bdb1-aa6f5149d447' as UUID,
      type: 'DECLARE' as const
    },
    {
      id: 'b5222507-a3f7-4524-a03f-bf6eb8157122' as UUID,
      transactionId: '2c483b2f-d28c-456b-804e-6e5bfea26277',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:56:30.641Z',
      createdBy: '68cbd26ec6476156546958dd',
      createdByRole: 'SOCIAL_WORKER',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      status: 'Accepted' as const,
      type: 'UNASSIGN' as const
    },
    {
      id: '2ac68845-b958-4f52-820d-7385f6533cb5' as UUID,
      transactionId: '415202f2-4d8c-49cb-a327-fd3c92e82ca4',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:56:38.853Z',
      createdBy: '68cbd26ec6476156546958e5',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      annotation: {},
      status: 'Accepted' as const,
      type: 'ASSIGN' as const,
      assignedTo: '68cbd26ec6476156546958e5'
    },
    {
      id: '0a38f1e0-b7eb-4aeb-9290-a9d82fcda252' as UUID,
      transactionId: 'c5e7515b-4b2f-4e6b-8158-74d71ce2cbc5',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:57:38.800Z',
      createdBy: '68cbd26ec6476156546958e5',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {
        'applicant.dob': '2025-05-22',
        'applicant.name': {
          surname: 'last',
          firstname: 'first',
          middlename: 'middle'
        },
        'recommender.id': '123123',
        'senior-pass.id': '123123', // Senior pass ID was added on the previous action. Still visible on the change set of record audit. Should not be visible.
        'recommender.name': {
          surname: 'rec last', // Recommender added, visible correctly.
          firstname: 'rec first',
          middlename: ''
        },
        'recommender.none': false, // Should be visible.
        'applicant.image.label': 'picture text'
      },
      annotation: {},
      status: 'Requested' as const,
      type: 'VALIDATE' as const
    },
    {
      id: '9ef1c7e9-b761-4d5a-a0da-80a9e4eb096a' as UUID,
      transactionId: 'c5e7515b-4b2f-4e6b-8158-74d71ce2cbc5',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:57:38.868Z',
      createdBy: '68cbd26ec6476156546958e5',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      status: 'Accepted' as const,
      originalActionId: '0a38f1e0-b7eb-4aeb-9290-a9d82fcda252' as UUID,
      type: 'VALIDATE' as const
    },
    {
      id: 'cdaf8cb4-f01e-45c4-b744-56261a71291c' as UUID,
      transactionId: 'c5e7515b-4b2f-4e6b-8158-74d71ce2cbc5',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:57:38.871Z',
      createdBy: '68cbd26ec6476156546958e5',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      status: 'Accepted' as const,
      type: 'UNASSIGN' as const
    },
    {
      id: '626e8308-e598-45e5-85a4-8f8b93e89c53' as UUID,
      transactionId: 'a169def8-0a59-429c-b779-51f625deea86',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:57:58.176Z',
      createdBy: '68cbd26ec6476156546958ed',
      createdByRole: 'LOCAL_REGISTRAR',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      annotation: {},
      status: 'Accepted' as const,
      type: 'ASSIGN' as const,
      assignedTo: '68cbd26ec6476156546958ed'
    },
    {
      id: 'a4400047-c1f5-4890-b90b-187d36bd67a6' as UUID,
      transactionId: '62e395ed-2ed8-40cd-b02f-f528f131930e',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:58:32.768Z',
      createdBy: '68cbd26ec6476156546958ed',
      createdByRole: 'LOCAL_REGISTRAR',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      annotation: {},
      status: 'Requested' as const,
      type: 'REJECT' as const,
      content: {
        reason: 'rejected for test purposes'
      }
    },
    {
      id: '3c77649b-2969-4647-938d-ef39b8115f8c' as UUID,
      transactionId: '62e395ed-2ed8-40cd-b02f-f528f131930e',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:58:32.850Z',
      createdBy: '68cbd26ec6476156546958ed',
      createdByRole: 'LOCAL_REGISTRAR',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      status: 'Accepted' as const,
      originalActionId: 'a4400047-c1f5-4890-b90b-187d36bd67a6' as UUID,
      type: 'REJECT' as const,
      content: {
        reason: 'rejected for test purposes'
      }
    },
    {
      id: 'b59cb399-0b92-464b-a1f4-6c0b52b5312e' as UUID,
      transactionId: '62e395ed-2ed8-40cd-b02f-f528f131930e',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:58:32.853Z',
      createdBy: '68cbd26ec6476156546958ed',
      createdByRole: 'LOCAL_REGISTRAR',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      status: 'Accepted' as const,
      type: 'UNASSIGN' as const
    },
    {
      id: '88b34655-f8f8-42c0-8266-7f7b3f337d4e' as UUID,
      transactionId: '032c6089-442e-4e1c-8eb4-93ffef363faf',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:59:00.571Z',
      createdBy: '68cbd26ec6476156546958e5',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      annotation: {},
      status: 'Accepted' as const,
      type: 'ASSIGN' as const,
      assignedTo: '68cbd26ec6476156546958e5'
    },
    {
      id: '4f50fcad-586f-4794-baa6-008b4a335f10' as UUID,
      transactionId: '9d7c6402-69b1-41a5-8114-d0af76bc7d41',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:59:44.323Z',
      createdBy: '68cbd26ec6476156546958e5',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {
        'applicant.dob': '2025-05-22',
        'applicant.name': {
          surname: 'last',
          firstname: 'FIRST CAPITALIZED', // Changes name, should show.
          middlename: 'middle'
        },
        'recommender.id': '123123', // Should not show since present on previous actions.
        'senior-pass.id': '123123', // Should not show since present on previous actions.
        'recommender.name': {
          surname: 'rec last', // Recommender added on previous VALIDATE action, should not be visible.
          firstname: 'rec first',
          middlename: ''
        },
        'recommender.none': false, // Should never be visible
        'applicant.image.label': 'picture text222' // Changes image label, shown correctly.
      },
      annotation: {
        'review.comment': 'dfsdfdsf', // should show in review section
        'review.signature': {
          path: '/ocrvs/7774a11b-ad7b-4cf2-8433-79ab72f25cc3/c9dfff3c-394e-4095-a5b6-2429d7492436.png',
          type: 'image/png',
          originalFilename: 'signature-review____signature-1758869981775.png'
        }
      },
      status: 'Requested' as const,
      type: 'VALIDATE' as const // Second VALIDATE. After rejection, previous action must be resent.
    },
    {
      id: '3307ab9d-8d0a-4a42-819e-547df61cc297' as UUID,
      transactionId: '9d7c6402-69b1-41a5-8114-d0af76bc7d41',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:59:44.410Z',
      createdBy: '68cbd26ec6476156546958e5',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      status: 'Accepted' as const,
      originalActionId: '4f50fcad-586f-4794-baa6-008b4a335f10' as UUID,
      type: 'VALIDATE' as const
    },
    {
      id: 'b15c3e45-6404-4dd6-99eb-e57a240f9e26' as UUID,
      transactionId: '9d7c6402-69b1-41a5-8114-d0af76bc7d41',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:59:44.412Z',
      createdBy: '68cbd26ec6476156546958e5',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      status: 'Accepted' as const,
      type: 'UNASSIGN' as const
    },
    {
      id: 'b15df1da-0f88-4ee6-810d-8f429987b23d' as UUID,
      transactionId: 'f3e74401-f98d-42d3-a166-15e04cd56f77',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T06:59:53.842Z',
      createdBy: '68cbd26ec6476156546958ed',
      createdByRole: 'LOCAL_REGISTRAR',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      annotation: {},
      status: 'Accepted' as const,
      type: 'ASSIGN' as const,
      assignedTo: '68cbd26ec6476156546958ed'
    },
    {
      id: '0d43a4e3-87f9-4108-ab29-e96f8aafe7d9' as UUID,
      transactionId: 'e76c6fde-e383-4930-9732-601c284f8b90',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T07:00:11.286Z',
      createdBy: '68cbd26ec6476156546958ed',
      createdByRole: 'LOCAL_REGISTRAR',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {
        'applicant.dob': '2000-05-22', // Changes dob, should show correctly.
        'applicant.name': {
          // already changed previously, should not be visible.
          surname: 'last',
          firstname: 'FIRST CAPITALIZED',
          middlename: 'middle'
        },
        'recommender.id': '123123', // already changed previously, should not be visible.
        'senior-pass.id': '123123', // already changed previously, should not be visible.
        'recommender.name': {
          // already changed previously, should not be visible?
          surname: 'rec last',
          firstname: 'rec first',
          middlename: ''
        },
        'recommender.none': false,
        'applicant.image.label': 'picture text222'
      },
      annotation: {
        'review.comment': 'dfsdfdsf',
        'review.signature': {
          path: '/ocrvs/7774a11b-ad7b-4cf2-8433-79ab72f25cc3/c9dfff3c-394e-4095-a5b6-2429d7492436.png',
          type: 'image/png',
          originalFilename: 'signature-review____signature-1758869981775.png'
        }
      },
      status: 'Requested' as const,
      type: 'REGISTER' as const
    },
    {
      id: 'b1ded8c9-51fb-437c-abd9-30b44f0398cc' as UUID,
      transactionId: 'e76c6fde-e383-4930-9732-601c284f8b90',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T07:00:11.364Z',
      createdBy: '68cbd26ec6476156546958ed',
      createdByRole: 'LOCAL_REGISTRAR',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      status: 'Accepted' as const,
      originalActionId: '0d43a4e3-87f9-4108-ab29-e96f8aafe7d9' as UUID,
      type: 'REGISTER' as const,
      registrationNumber: '37QS7BP87KQF'
    },
    {
      id: '7107f3f9-e1dd-464e-a686-6e96cff21c27' as UUID,
      transactionId: 'e76c6fde-e383-4930-9732-601c284f8b90',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T07:00:11.366Z',
      createdBy: '68cbd26ec6476156546958ed',
      createdByRole: 'LOCAL_REGISTRAR',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      status: 'Accepted' as const,
      type: 'UNASSIGN' as const
    },
    {
      id: 'fcf25859-548f-47a3-a24e-940b87e4d664' as UUID,
      transactionId: 'ac8e23b2-30d2-428c-9893-ff1e20031aa1',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T07:00:25.055Z',
      createdBy: '68cbd26ec6476156546958ed',
      createdByRole: 'LOCAL_REGISTRAR',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      annotation: {},
      status: 'Accepted' as const,
      type: 'ASSIGN' as const,
      assignedTo: '68cbd26ec6476156546958ed'
    },
    {
      id: 'b5883172-4fdf-4222-bea5-746da72bb9f2' as UUID,
      transactionId: 'c9372395-0059-4bd2-a393-89727546c60f',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T07:02:50.259Z',
      createdBy: '68cbd26ec6476156546958ed',
      createdByRole: 'LOCAL_REGISTRAR',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      annotation: {},
      status: 'Accepted' as const,
      type: 'UNASSIGN' as const
    },
    {
      id: '7cb38c67-ac6a-408b-a53c-49eb3274264d' as UUID,
      transactionId: '574ad16b-eac0-48de-9045-e8b9ccce5da6',
      createdByUserType: 'user' as const,
      createdAt: '2025-09-26T07:02:53.696Z',
      createdBy: '68cbd26ec6476156546958ed',
      createdByRole: 'LOCAL_REGISTRAR',
      createdAtLocation: '07cd7e8c-fa6e-4828-8d79-035dab47adc5' as UUID,
      declaration: {},
      annotation: {},
      status: 'Accepted' as const,
      type: 'ASSIGN' as const,
      assignedTo: '68cbd26ec6476156546958ed'
    }
  ]
}

const updateActions = expandWithUpdateActions(
  newFullEvent,
  getTestValidatorContext()
).filter((a) => a.type === DECLARATION_ACTION_UPDATE)

export const DeclarationUpdateOnDeclare: Story = {
  args: {
    fullEvent: newFullEvent,
    action: updateActions[0]
  }
}

export const DeclarationUpdateOnValidate: Story = {
  args: {
    fullEvent: newFullEvent,
    action: updateActions[1]
  }
}

export const DeclarationUpdateOnSecondValidate: Story = {
  args: {
    fullEvent: newFullEvent,
    action: updateActions[2]
  }
}

export const DeclarationUpdateOnRegister: Story = {
  args: {
    fullEvent: newFullEvent,
    action: updateActions[3]
  }
}

const eventWithNotifyActions = {
  id: '2eec9e19-c356-4a0a-8a2d-0730cbc39dca' as UUID,
  type: 'tennis-club-membership',
  createdAt: '2025-09-30T06:50:33.629Z',
  updatedAt: '2025-09-30T06:50:33.629Z',
  trackingId: '28W273',
  actions: [
    {
      id: '68b78b5e-a2fd-45b5-8b3c-ce1e9dc649b0' as UUID,
      transactionId: 'tmp-8026e5be-2ccb-483e-9507-97796a872083',
      createdByUserType: 'user',
      createdAt: '2025-09-30T06:50:33.629Z',
      createdBy: '68da88dfd0d608fec619f142',
      createdByRole: 'SOCIAL_WORKER',
      createdAtLocation: '899e81dd-9cc8-4370-8038-4e9cc25a941f' as UUID,
      declaration: {},
      status: 'Accepted',
      type: 'CREATE'
    },
    {
      id: '813dd280-9b86-4888-a772-b4d0efbd0e88' as UUID,
      transactionId: 'tmp-8026e5be-2ccb-483e-9507-97796a872083',
      createdByUserType: 'user',
      createdAt: '2025-09-30T06:50:33.629Z',
      createdBy: '68da88dfd0d608fec619f142',
      createdByRole: 'SOCIAL_WORKER',
      createdAtLocation: '899e81dd-9cc8-4370-8038-4e9cc25a941f' as UUID,
      declaration: {},
      status: 'Accepted',
      type: 'ASSIGN',
      assignedTo: '68da88dfd0d608fec619f142'
    },
    {
      id: '8b763619-35a3-4236-9f4e-5d9b31f8d7ac' as UUID,
      transactionId: '5bd48b60-f2f8-4a7e-9917-1aa6de56fc3c',
      createdByUserType: 'user',
      createdAt: '2025-09-30T06:50:46.275Z',
      createdBy: '68da88dfd0d608fec619f142',
      createdByRole: 'SOCIAL_WORKER',
      createdAtLocation: '899e81dd-9cc8-4370-8038-4e9cc25a941f' as UUID,
      declaration: {
        'applicant.name': {
          surname: 'first',
          firstname: 'first',
          middlename: 'last'
        },
        'recommender.none': false
      },
      annotation: {},
      status: 'Requested',
      type: 'NOTIFY'
    },
    {
      id: '025f676e-62fc-4315-8a53-28707c9e3fae' as UUID,
      transactionId: '5bd48b60-f2f8-4a7e-9917-1aa6de56fc3c',
      createdByUserType: 'user',
      createdAt: '2025-09-30T06:50:46.406Z',
      createdBy: '68da88dfd0d608fec619f142',
      createdByRole: 'SOCIAL_WORKER',
      createdAtLocation: '899e81dd-9cc8-4370-8038-4e9cc25a941f' as UUID,
      declaration: {},
      status: 'Accepted',
      originalActionId: '8b763619-35a3-4236-9f4e-5d9b31f8d7ac' as UUID,
      type: 'NOTIFY'
    },
    {
      id: '9d9d8e87-4134-42ff-b515-f6c038551c34' as UUID,
      transactionId: '5bd48b60-f2f8-4a7e-9917-1aa6de56fc3c',
      createdByUserType: 'user',
      createdAt: '2025-09-30T06:50:46.409Z',
      createdBy: '68da88dfd0d608fec619f142',
      createdByRole: 'SOCIAL_WORKER',
      createdAtLocation: '899e81dd-9cc8-4370-8038-4e9cc25a941f' as UUID,
      declaration: {},
      status: 'Accepted',
      type: 'UNASSIGN'
    },
    {
      id: '5b10ffbd-c3d0-4d98-a143-fcd88013f1bc' as UUID,
      transactionId: '951b19b5-8bb9-45c0-9163-22eebb9cdcea',
      createdByUserType: 'user',
      createdAt: '2025-09-30T06:51:29.228Z',
      createdBy: '68da88dfd0d608fec619f14a',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: '899e81dd-9cc8-4370-8038-4e9cc25a941f' as UUID,
      declaration: {},
      annotation: {},
      status: 'Accepted',
      type: 'ASSIGN',
      assignedTo: '68da88dfd0d608fec619f14a'
    },
    {
      id: '66d6c0b3-c506-4b79-9032-22dd82261fff' as UUID,
      transactionId: '64f190d6-2fc6-45ef-955f-0e7650c6e2cb',
      createdByUserType: 'user',
      createdAt: '2025-09-30T06:51:40.814Z',
      createdBy: '68da88dfd0d608fec619f14a',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: '899e81dd-9cc8-4370-8038-4e9cc25a941f' as UUID,
      declaration: {},
      annotation: {},
      status: 'Requested',
      type: 'REJECT',
      content: {
        reason: 'fill it up!!'
      }
    },
    {
      id: '70eddf69-498c-486c-aa55-7045acdd3d8c' as UUID,
      transactionId: '64f190d6-2fc6-45ef-955f-0e7650c6e2cb',
      createdByUserType: 'user',
      createdAt: '2025-09-30T06:51:40.873Z',
      createdBy: '68da88dfd0d608fec619f14a',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: '899e81dd-9cc8-4370-8038-4e9cc25a941f' as UUID,
      declaration: {},
      status: 'Accepted',
      originalActionId: '66d6c0b3-c506-4b79-9032-22dd82261fff' as UUID,
      type: 'REJECT',
      content: {
        reason: 'fill it up!!'
      }
    },
    {
      id: 'e827d3a7-5bd1-4b2c-becb-1ea7608448fe' as UUID,
      transactionId: '64f190d6-2fc6-45ef-955f-0e7650c6e2cb',
      createdByUserType: 'user',
      createdAt: '2025-09-30T06:51:40.876Z',
      createdBy: '68da88dfd0d608fec619f14a',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: '899e81dd-9cc8-4370-8038-4e9cc25a941f' as UUID,
      declaration: {},
      status: 'Accepted',
      type: 'UNASSIGN'
    },
    {
      id: '8c53d5b9-9113-43c0-ada1-a4675b4f9f89' as UUID,
      transactionId: '0d3de8fb-71a2-41f8-a61c-d3c98908c9e4',
      createdByUserType: 'user',
      createdAt: '2025-09-30T06:51:50.462Z',
      createdBy: '68da88dfd0d608fec619f142',
      createdByRole: 'SOCIAL_WORKER',
      createdAtLocation: '899e81dd-9cc8-4370-8038-4e9cc25a941f' as UUID,
      declaration: {},
      annotation: {},
      status: 'Accepted',
      type: 'ASSIGN',
      assignedTo: '68da88dfd0d608fec619f142'
    },
    {
      id: '85c72614-b472-4078-a32b-a7a57e46e771' as UUID,
      transactionId: '75b3df01-5367-43a6-94e4-b96d276ed772',
      createdByUserType: 'user',
      createdAt: '2025-09-30T06:52:10.919Z',
      createdBy: '68da88dfd0d608fec619f142',
      createdByRole: 'SOCIAL_WORKER',
      createdAtLocation: '899e81dd-9cc8-4370-8038-4e9cc25a941f' as UUID,
      declaration: {
        'applicant.dob': '2000-02-22', // dob was added in second notify after rejection. Should not be track the diff
        'applicant.name': {
          surname: 'first',
          firstname: 'first',
          middlename: 'last'
        },
        'recommender.none': false
      },
      annotation: {},
      status: 'Requested',
      type: 'NOTIFY'
    },
    {
      id: '85c72614-b472-4078-a32b-a7a57e46e771' as UUID,
      transactionId: '75b3df01-5367-43a6-94e4-b96d276ed772',
      createdByUserType: 'user',
      createdAt: '2025-09-30T06:52:10.919Z',
      createdBy: '68da88dfd0d608fec619f142',
      createdByRole: 'SOCIAL_WORKER',
      createdAtLocation: '899e81dd-9cc8-4370-8038-4e9cc25a941f' as UUID,
      declaration: {},
      originalActionId: '85c72614-b472-4078-a32b-a7a57e46e771' as UUID,
      annotation: {},
      status: 'Accepted',
      type: 'NOTIFY'
    }
  ]
} satisfies EventDocument

const updateActionsForNotifyActions = expandWithUpdateActions(
  eventWithNotifyActions,
  getTestValidatorContext()
).filter((a) => a.type === DECLARATION_ACTION_UPDATE)

export const DeclarationUpdateNotify: Story = {
  args: {
    fullEvent: eventWithNotifyActions,
    action: updateActionsForNotifyActions[0]
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

const updateActionForRegister = expandWithUpdateActions(
  eventWhenRegisterUpdatesDeclaration,
  getTestValidatorContext()
).find((a) => a.type === DECLARATION_ACTION_UPDATE)

export const RegisteredOnDeclarationUpdate: Story = {
  args: {
    fullEvent: eventWhenRegisterUpdatesDeclaration,
    action: updateActionForRegister
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

export const Certified: Story = {
  args: {
    ...argbase,
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

export const CertifiedBySomeoneElse: Story = {
  args: {
    ...argbase,
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
