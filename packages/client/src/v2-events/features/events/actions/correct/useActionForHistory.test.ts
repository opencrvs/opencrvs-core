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

import {
  ActionTypes,
  generateEventDocument,
  tennisClubMembershipEvent,
  TestUserRole
} from '@opencrvs/commons/client'
import { getTestValidatorContext } from '../../../../../../.storybook/decorators'
import {
  DECLARATION_ACTION_UPDATE,
  expandWithUpdateActions
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

const eventCreatedByRegAgent = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    {
      type: ActionTypes.enum.CREATE,
      user: {
        role: TestUserRole.enum.REGISTRATION_AGENT,
        id: '68e8bacf197c5cb688c4e0ee'
      }
    },
    {
      type: ActionTypes.enum.ASSIGN,
      user: {
        role: TestUserRole.enum.REGISTRATION_AGENT,
        id: '68e8bacf197c5cb688c4e0ee'
      }
    },
    {
      type: ActionTypes.enum.DECLARE,
      declarationOverrides: DECLARATION_ACTION_DETAILS,
      user: {
        role: TestUserRole.enum.REGISTRATION_AGENT,
        id: '68e8bacf197c5cb688c4e0ee'
      }
    },
    {
      type: ActionTypes.enum.VALIDATE,
      declarationOverrides: DECLARATION_ACTION_DETAILS,
      user: {
        role: TestUserRole.enum.REGISTRATION_AGENT,
        id: '68e8bacf197c5cb688c4e0ee'
      }
    },
    { type: ActionTypes.enum.UNASSIGN },
    {
      type: ActionTypes.enum.ASSIGN,
      user: {
        role: TestUserRole.enum.LOCAL_REGISTRAR,
        id: '68e8bacf197c5cb688c4e0f6'
      }
    },
    {
      type: ActionTypes.enum.REGISTER,
      declarationOverrides: DECLARATION_ACTION_DETAILS,
      user: {
        role: TestUserRole.enum.LOCAL_REGISTRAR,
        id: '68e8bacf197c5cb688c4e0f6'
      }
    },
    { type: ActionTypes.enum.UNASSIGN }
  ]
})

describe('useActionForHistory', () => {
  it('should not add synthetic UPDATE action if declaration did not change', () => {
    const updateActionForEventCreatedByRegAgent = expandWithUpdateActions(
      eventCreatedByRegAgent,
      getTestValidatorContext(),
      tennisClubMembershipEvent
    ).find((a) => a.type === DECLARATION_ACTION_UPDATE)

    expect(updateActionForEventCreatedByRegAgent).toBeUndefined()
  })
})
