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

import addDays from 'date-fns/addDays'
import {
  ActionDocument,
  ActionStatus,
  ActionType,
  ActionTypes,
  createPrng,
  generateActionDocument,
  generateEventDocument,
  generateRandomDatetime,
  generateRandomSignature,
  generateTrackingId,
  generateUuid,
  tennisClubMembershipEvent,
  TestUserRole
} from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { getTestValidatorContext } from '../../../../../../.storybook/decorators'
import {
  DECLARATION_ACTION_UPDATE,
  expandWithClientSpecificActions
} from './useActionForHistory'

const DECLARATION_ACTION_DETAILS = {
  'applicant.dob': '1999-11-11',
  'applicant.name': {
    surname: 'Drinkwater',
    firstname: 'Danny',
    middlename: ''
  },
  'senior-pass.id': '23213213',
  'recommender.none': true,
  'applicant.image.label': ''
}

const generator = testDataGenerator()
const eventCreatedByRegAgent = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    {
      type: ActionTypes.enum.CREATE,
      user: {
        role: TestUserRole.enum.REGISTRATION_AGENT,
        id: generator.user.id.registrationAgent
      }
    },
    {
      type: ActionTypes.enum.ASSIGN,
      user: {
        role: TestUserRole.enum.REGISTRATION_AGENT,
        id: generator.user.id.registrationAgent
      }
    },
    {
      type: ActionTypes.enum.DECLARE,
      declarationOverrides: DECLARATION_ACTION_DETAILS,
      user: {
        role: TestUserRole.enum.REGISTRATION_AGENT,
        id: generator.user.id.registrationAgent
      }
    },
    {
      type: ActionTypes.enum.VALIDATE,
      declarationOverrides: {},
      user: {
        role: TestUserRole.enum.REGISTRATION_AGENT,
        id: generator.user.id.registrationAgent
      }
    },
    { type: ActionTypes.enum.UNASSIGN },
    {
      type: ActionTypes.enum.ASSIGN,
      user: {
        role: TestUserRole.enum.LOCAL_REGISTRAR,
        id: generator.user.id.localRegistrar
      }
    },
    {
      type: ActionTypes.enum.REGISTER,
      declarationOverrides: {},
      user: {
        role: TestUserRole.enum.LOCAL_REGISTRAR,
        id: generator.user.id.localRegistrar
      }
    },
    { type: ActionTypes.enum.UNASSIGN }
  ]
})

describe('useActionForHistory', () => {
  it('should not add synthetic UPDATE action if declaration did not change', () => {
    const updateActionForEventCreatedByRegAgent =
      expandWithClientSpecificActions(
        eventCreatedByRegAgent,
        getTestValidatorContext(),
        tennisClubMembershipEvent
      ).find((a) => a.type === DECLARATION_ACTION_UPDATE)

    expect(updateActionForEventCreatedByRegAgent).toBeUndefined()
  })

  const rng = createPrng(3123)
  const validateActionUuid = generateUuid(rng)

  const actionDefaults = {
    createdAt: generateRandomDatetime(
      createPrng(82),
      new Date('2024-03-01'),
      new Date('2024-04-01')
    ),
    createdBy: generator.user.id.localRegistrar,
    createdByRole: TestUserRole.Enum.LOCAL_REGISTRAR,
    createdAtLocation: generator.user.localRegistrar().v2.primaryOfficeId
  } satisfies Partial<ActionDocument>

  it('should add synthetic UPDATE action when only annotation changes', () => {
    const annotationUpdateOnValidateEvent = {
      id: generateUuid(rng),
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
            createdAt: addDays(
              new Date(actionDefaults.createdAt),
              1
            ).toISOString(),
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
            createdAt: addDays(
              new Date(actionDefaults.createdAt),
              2
            ).toISOString(),
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
            createdAt: addDays(
              new Date(actionDefaults.createdAt),
              2
            ).toISOString(),
            status: ActionStatus.Accepted,
            originalActionId: validateActionUuid
          }
        }),
        generateActionDocument({
          configuration: tennisClubMembershipEvent,
          action: ActionType.ASSIGN,
          defaults: {
            ...actionDefaults,
            createdAt: addDays(
              new Date(actionDefaults.createdAt),
              3
            ).toISOString(),
            assignedTo: generator.user.id.localRegistrar
          }
        })
      ],
      trackingId: generateTrackingId(rng),
      updatedAt: actionDefaults.createdAt,
      createdAt: actionDefaults.createdAt
    }

    const updateAction = expandWithClientSpecificActions(
      annotationUpdateOnValidateEvent,
      getTestValidatorContext(),
      tennisClubMembershipEvent
    ).find((a) => a.type === DECLARATION_ACTION_UPDATE)

    expect(updateAction).not.toBeUndefined()
  })
})
