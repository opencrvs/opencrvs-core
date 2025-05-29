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

import { UUID } from '../uuid'
import { Action } from './ActionDocument'
import { ActionType } from './ActionType'
import { findLastAssignmentAction, getMixedPath } from './utils'

const commonAction = {
  status: 'Requested' as const,
  id: 'action-id-1' as UUID,
  declaration: {},
  createdBy: 'user-id-1',
  createdByRole: 'user-role-1',
  createdAtLocation: 'location-id-1' as UUID,
  transactionId: 'transaction-id-1'
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
        createdAt: '2023-01-01T02:00:00Z',
        assignedTo: null
      }
    ],
    expected: {
      ...commonAction,
      type: ActionType.UNASSIGN,
      createdAt: '2023-01-01T02:00:00Z',
      assignedTo: null
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
        createdAt: '2023-01-01T02:00:00Z',
        assignedTo: null
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

describe('getMixedPath', () => {
  const cases = [
    {
      description: 'Simple flat dotted key',
      obj: { 'user.name': 'Alice' },
      path: 'user.name',
      expected: 'Alice'
    },
    {
      description: 'Simple nested key',
      obj: { user: { name: 'Alice' } },
      path: 'user.name',
      expected: 'Alice'
    },
    {
      description: 'Mixed: top-level dotted, then nested',
      obj: {
        'user.profile': {
          age: 30
        }
      },
      path: 'user.profile.age',
      expected: 30
    },
    {
      description: 'Mixed: nested then dotted',
      obj: {
        user: {
          'profile.age': 30
        }
      },
      path: 'user.profile.age',
      expected: 30
    },
    {
      description: 'Deep mixed nesting and compound keys',
      obj: {
        'user.profile': {
          name: {
            'first.name': {
              markus: 'markus'
            }
          }
        }
      },
      path: 'user.profile.name.first.name.markus',
      expected: 'markus'
    },
    {
      description: 'Array access with index',
      obj: {
        users: [{ name: 'Alice' }, { name: 'Bob' }]
      },
      path: 'users.1.name',
      expected: 'Bob'
    },
    {
      description: 'Compound key contains array index',
      obj: {
        'users.1.name': 'Charlie'
      },
      path: 'users.1.name',
      expected: 'Charlie'
    },
    {
      description: 'Fallback to default value on missing path',
      obj: {
        user: {
          name: 'Alice'
        }
      },
      path: 'user.age',
      defaultValue: 99,
      expected: 99
    }
  ]

  test.each(cases)('$description', ({ obj, path, defaultValue, expected }) => {
    expect(getMixedPath(obj, path, defaultValue)).toEqual(expected)
  })
})
