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
  getUUID,
  tennisClubMembershipEvent,
  generateActionDocument,
  ActionStatus,
  generateUuid,
  createPrng,
  generateRandomDatetime,
  TestUserRole,
  ActionDocument,
  generateRandomSignature,
  generateTrackingId
} from '@opencrvs/commons/client'
import { getTestValidatorContext } from '../../../../../../../../.storybook/decorators'
import { expandWithClientSpecificActions } from '../../../../../events/actions/correct/useActionForHistory'
import { DECLARATION_ACTION_UPDATE } from '../../../../../events/registered-fields'
import { testDataGenerator } from '../../../../../../../tests/test-data-generators'
import { EventHistoryDialog } from './EventHistoryDialog'

const rng = createPrng(3123)
const validateActionUuid = generateUuid(rng)

const generator = testDataGenerator()

const actionDefaults = {
  createdAt: generateRandomDatetime(
    createPrng(92),
    new Date('2024-03-01'),
    new Date('2024-04-01')
  ),
  createdBy: generator.user.id.localRegistrar,
  createdByRole: TestUserRole.enum.LOCAL_REGISTRAR,
  createdAtLocation: generator.user.localRegistrar().v2.primaryOfficeId,
  transactionId: getUUID()
} satisfies Partial<ActionDocument>

const annotationUpdateOnValidateEvent = {
  id: getUUID(),
  type: 'tennis-club-membership',
  actions: [
    generateActionDocument({
      action: ActionType.CREATE,
      configuration: tennisClubMembershipEvent,
      defaults: {
        ...actionDefaults,
        createdAt: actionDefaults.createdAt
      }
    }),
    generateActionDocument({
      action: ActionType.DECLARE,
      configuration: tennisClubMembershipEvent,
      defaults: {
        ...actionDefaults,
        createdAt: addDays(new Date(actionDefaults.createdAt), 1).toISOString(),
        annotation: {
          'review.signature': generateRandomSignature(rng)
        }
      }
    }),
    generateActionDocument({
      action: ActionType.VALIDATE,
      configuration: tennisClubMembershipEvent,
      declarationOverrides: {},
      defaults: {
        ...actionDefaults,
        createdAt: addDays(new Date(actionDefaults.createdAt), 2).toISOString(),
        id: validateActionUuid,
        status: ActionStatus.Requested,
        annotation: {
          'review.signature': generateRandomSignature(rng)
        }
      }
    }),
    generateActionDocument({
      action: ActionType.VALIDATE,
      configuration: tennisClubMembershipEvent,
      declarationOverrides: {},
      defaults: {
        ...actionDefaults,
        createdAt: addDays(new Date(actionDefaults.createdAt), 2).toISOString(),
        status: ActionStatus.Accepted,
        originalActionId: validateActionUuid
      }
    }),
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.ASSIGN,
      defaults: {
        ...actionDefaults,
        createdAt: addDays(new Date(actionDefaults.createdAt), 3).toISOString(),
        assignedTo: generator.user.id.localRegistrar
      }
    })
  ],
  trackingId: generateTrackingId(rng),
  updatedAt: actionDefaults.createdAt,
  createdAt: actionDefaults.createdAt
}

const meta: Meta<typeof EventHistoryDialog> = {
  title: 'Components/EventHistoryDialog/Annotation',
  component: EventHistoryDialog,
  args: {
    userName: 'Jan Doe',
    fullEvent: annotationUpdateOnValidateEvent,
    validatorContext: getTestValidatorContext()
  }
}

const updateActionForValidate = expandWithClientSpecificActions(
  annotationUpdateOnValidateEvent,
  getTestValidatorContext(),
  tennisClubMembershipEvent
).find((a) => a.type === DECLARATION_ACTION_UPDATE)

export default meta
type Story = StoryObj<typeof EventHistoryDialog>
export const AnnotationUpdateOnValidate: Story = {
  args: {
    fullEvent: annotationUpdateOnValidateEvent,
    action: updateActionForValidate
  }
}

const registerActionUuid = generateUuid(rng)

const annotationUpdateOnRegisterEvent = {
  id: getUUID(),
  type: 'tennis-club-membership',
  actions: [
    generateActionDocument({
      action: ActionType.CREATE,
      configuration: tennisClubMembershipEvent,
      defaults: {
        ...actionDefaults
      }
    }),
    generateActionDocument({
      action: ActionType.DECLARE,
      configuration: tennisClubMembershipEvent,
      defaults: {
        ...actionDefaults,
        createdAt: addDays(new Date(actionDefaults.createdAt), 1).toISOString(),
        annotation: {
          'review.signature': generateRandomSignature(rng)
        }
      }
    }),
    generateActionDocument({
      action: ActionType.VALIDATE,
      configuration: tennisClubMembershipEvent,
      defaults: {
        ...actionDefaults,
        createdAt: addDays(new Date(actionDefaults.createdAt), 2).toISOString()
      },
      declarationOverrides: {}
    }),
    generateActionDocument({
      action: ActionType.REGISTER,
      configuration: tennisClubMembershipEvent,
      declarationOverrides: {},
      defaults: {
        ...actionDefaults,
        createdAt: addDays(new Date(actionDefaults.createdAt), 3).toISOString(),
        id: registerActionUuid,
        status: ActionStatus.Requested,
        annotation: {
          'review.signature': generateRandomSignature(rng)
        }
      }
    }),
    generateActionDocument({
      action: ActionType.REGISTER,
      configuration: tennisClubMembershipEvent,
      declarationOverrides: {},
      defaults: {
        ...actionDefaults,
        createdAt: addDays(new Date(actionDefaults.createdAt), 3).toISOString(),
        originalActionId: registerActionUuid
      }
    }),
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.ASSIGN,
      defaults: {
        ...actionDefaults,
        createdAt: addDays(new Date(actionDefaults.createdAt), 3).toISOString(),
        assignedTo: generator.user.id.localRegistrar
      }
    })
  ],
  trackingId: generateTrackingId(rng),
  updatedAt: actionDefaults.createdAt,
  createdAt: actionDefaults.createdAt
}

const updateActionForRegister = expandWithClientSpecificActions(
  annotationUpdateOnRegisterEvent,
  getTestValidatorContext(),
  tennisClubMembershipEvent
).find((a) => a.type === DECLARATION_ACTION_UPDATE)

export const AnnotationUpdateOnRegister: Story = {
  args: {
    fullEvent: annotationUpdateOnRegisterEvent,
    action: updateActionForRegister
  }
}
