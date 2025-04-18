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

import { Action } from './ActionDocument'
import { ActionType } from './ActionType'
import { findLastAssignmentAction } from './utils'

const commonAction = {
  status: 'Requested' as const,
  id: 'action-id-1',
  declaration: {},
  createdBy: 'user-id-1',
  createdAtLocation: 'location-id-1',
  updatedAtLocation: 'location-id-2'
}

const testCases: { actions: Action[]; expected: Action | undefined }[] = [
  {
    actions: [],
    expected: undefined
  },
  {
    actions: [
      {
        ...commonAction,
        type: ActionType.CREATE,
        createdAt: '2023-01-01T00:00:00Z'
      }
    ],
    expected: undefined
  },
  {
    actions: [
      {
        ...commonAction,
        type: ActionType.CREATE,
        createdAt: '2023-01-01T00:00:00Z'
      },
      {
        ...commonAction,
        type: ActionType.ASSIGN,
        createdAt: '2023-01-01T01:00:00Z',
        assignedTo: 'user-id-2'
      }
    ],
    expected: {
      ...commonAction,
      type: ActionType.ASSIGN,
      createdAt: '2023-01-01T01:00:00Z',
      assignedTo: 'user-id-2'
    }
  },
  {
    actions: [
      {
        ...commonAction,
        type: ActionType.CREATE,
        createdAt: '2023-01-01T00:00:00Z'
      },
      {
        ...commonAction,
        type: ActionType.ASSIGN,
        createdAt: '2023-01-01T01:00:00Z',
        assignedTo: 'user-id-2'
      },
      {
        ...commonAction,
        type: ActionType.UNASSIGN,
        createdAt: '2023-01-01T02:00:00Z'
      }
    ],
    expected: {
      ...commonAction,
      type: ActionType.UNASSIGN,
      createdAt: '2023-01-01T02:00:00Z'
    }
  },
  {
    actions: [
      {
        ...commonAction,
        type: ActionType.CREATE,
        createdAt: '2023-01-01T00:00:00Z'
      },
      {
        ...commonAction,
        type: ActionType.ASSIGN,
        createdAt: '2023-01-01T01:00:00Z',
        assignedTo: 'user-id-2'
      },
      {
        ...commonAction,
        type: ActionType.UNASSIGN,
        createdAt: '2023-01-01T02:00:00Z'
      },
      {
        ...commonAction,
        type: ActionType.ASSIGN,
        createdAt: '2023-01-01T03:00:00Z',
        assignedTo: 'user-id-4'
      }
    ],
    expected: {
      ...commonAction,
      type: ActionType.ASSIGN,
      createdAt: '2023-01-01T03:00:00Z',
      assignedTo: 'user-id-4'
    }
  }
]

describe('findLastAssignmentAction', () => {
  testCases.forEach(({ expected, actions }) => {
    it(`When actions are ${actions.map(
      ({ type, createdAt }) => `${type}-${createdAt}`
    )}`, () => {
      const result = findLastAssignmentAction(actions)
      expect(result).toEqual(expected)
    })
  })
})
