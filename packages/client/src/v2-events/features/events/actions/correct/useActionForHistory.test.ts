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
  EventDocument,
  tennisClubMembershipEvent,
  UUID
} from '@opencrvs/commons/client'
import { getTestValidatorContext } from '../../../../../../.storybook/decorators'
import {
  DECLARATION_ACTION_UPDATE,
  expandWithUpdateActions
} from './useActionForHistory'

const eventCreatedByRegAgent = {
  id: 'f6b33b15-6fc1-4f7e-84ce-1ba6b8009be7' as UUID,
  type: 'tennis-club-membership',
  createdAt: '2025-10-10T13:16:20.507Z',
  updatedAt: '2025-10-10T13:16:20.507Z',
  actions: [
    {
      id: '76f42842-1f95-4d60-8421-271032f3fe34' as UUID,
      transactionId: 'tmp-e3633895-ecb7-44ce-994e-755367103b1a',
      createdByUserType: 'user',
      createdAt: '2025-10-10T13:16:20.507Z',
      createdBy: '68e8bacf197c5cb688c4e0ee',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: 'a4a42ede-2226-4602-9b07-6b41514588d0' as UUID,
      declaration: {},
      status: 'Accepted',
      type: 'CREATE'
    },
    {
      id: 'aacd0ee9-f22c-4092-83f3-8ac8af446a8e' as UUID,
      transactionId: 'tmp-e3633895-ecb7-44ce-994e-755367103b1a',
      createdByUserType: 'user',
      createdAt: '2025-10-10T13:16:20.507Z',
      createdBy: '68e8bacf197c5cb688c4e0ee',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: 'a4a42ede-2226-4602-9b07-6b41514588d0' as UUID,
      declaration: {},
      status: 'Accepted',
      type: 'ASSIGN',
      assignedTo: '68e8bacf197c5cb688c4e0ee'
    },
    {
      id: '9ebb1dda-7228-4914-a7f6-7990b98fcdaa' as UUID,
      transactionId: '3860bd34-229f-4da8-983e-f6160963cda6',
      createdByUserType: 'user',
      createdAt: '2025-10-10T13:16:40.334Z',
      createdBy: '68e8bacf197c5cb688c4e0ee',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: 'a4a42ede-2226-4602-9b07-6b41514588d0' as UUID,
      declaration: {
        'applicant.dob': '1999-11-11',
        'applicant.name': {
          surname: 'Drinkwater',
          firstname: 'Danny',
          middlename: ''
        },
        'senior-pass.id': '23213213',
        'recommender.none': true,
        'applicant.image.label': ''
      },
      annotation: {},
      status: 'Accepted',
      type: 'DECLARE'
    },
    {
      id: '0d63b616-2dc3-4dde-b062-3b7b6810400d' as UUID,
      transactionId: '3860bd34-229f-4da8-983e-f6160963cda6',
      createdByUserType: 'user',
      createdAt: '2025-10-10T13:16:41.994Z',
      createdBy: '68e8bacf197c5cb688c4e0ee',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: 'a4a42ede-2226-4602-9b07-6b41514588d0' as UUID,
      declaration: {},
      status: 'Accepted',
      originalActionId: '18c64b98-77bf-49fd-84f5-e7130a2ec392' as UUID,
      type: 'VALIDATE'
    },
    {
      id: '53a673cd-281f-44ed-b8d3-2d3fd924cdb1' as UUID,
      transactionId: '3860bd34-229f-4da8-983e-f6160963cda6',
      createdByUserType: 'user',
      createdAt: '2025-10-10T13:16:41.997Z',
      createdBy: '68e8bacf197c5cb688c4e0ee',
      createdByRole: 'REGISTRATION_AGENT',
      createdAtLocation: 'a4a42ede-2226-4602-9b07-6b41514588d0' as UUID,
      declaration: {},
      status: 'Accepted',
      type: 'UNASSIGN'
    },
    {
      id: 'cebd8b25-9e03-4686-8dc2-f2404b27c7f0' as UUID,
      transactionId: 'f9669152-c380-43a7-96fe-349aa2a5a2d3',
      createdByUserType: 'user',
      createdAt: '2025-10-10T13:16:54.195Z',
      createdBy: '68e8bacf197c5cb688c4e0f6',
      createdByRole: 'LOCAL_REGISTRAR',
      createdAtLocation: 'a4a42ede-2226-4602-9b07-6b41514588d0' as UUID,
      declaration: {},
      annotation: {},
      status: 'Accepted',
      type: 'ASSIGN',
      assignedTo: '68e8bacf197c5cb688c4e0f6'
    },
    {
      id: 'f41251dc-1e56-49ba-a36d-6d4bd41e68c0' as UUID,
      transactionId: 'a0b65404-ac2f-452a-968c-3fd5b2f26d40',
      createdByUserType: 'user',
      createdAt: '2025-10-10T13:16:59.571Z',
      createdBy: '68e8bacf197c5cb688c4e0f6',
      createdByRole: 'LOCAL_REGISTRAR',
      createdAtLocation: 'a4a42ede-2226-4602-9b07-6b41514588d0' as UUID,
      declaration: {
        'applicant.dob': '1999-11-11',
        'applicant.name': {
          surname: 'Drinkwater',
          firstname: 'Danny',
          middlename: ''
        },
        'senior-pass.id': '23213213',
        'recommender.none': true,
        'applicant.image.label': ''
      },
      annotation: {},
      status: 'Accepted',
      type: 'REGISTER'
    },
    {
      id: '89f477eb-fb67-4cc1-a9ab-ea65fa2337dd' as UUID,
      transactionId: 'a0b65404-ac2f-452a-968c-3fd5b2f26d40',
      createdByUserType: 'user',
      createdAt: '2025-10-10T13:16:59.660Z',
      createdBy: '68e8bacf197c5cb688c4e0f6',
      createdByRole: 'LOCAL_REGISTRAR',
      createdAtLocation: 'a4a42ede-2226-4602-9b07-6b41514588d0' as UUID,
      declaration: {},
      status: 'Accepted',
      type: 'UNASSIGN'
    }
  ],
  trackingId: 'VZ7FXU'
} satisfies EventDocument

const updateActionForEventCreatedByRegAgent = expandWithUpdateActions(
  eventCreatedByRegAgent,
  getTestValidatorContext(),
  tennisClubMembershipEvent
).find((a) => a.type === DECLARATION_ACTION_UPDATE)

describe('useActionForHistory', () => {
  it('should not add synthetic UPDATE action if declaration did not change', () => {
    expect(updateActionForEventCreatedByRegAgent).toBeUndefined()
  })
})
