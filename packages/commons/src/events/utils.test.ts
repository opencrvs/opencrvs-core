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
import { cloneDeep, difference } from 'lodash'
import { Action } from './ActionDocument'
import { ActionType } from './ActionType'
import {
  findLastAssignmentAction,
  getDeclaration,
  getDeclarationFields,
  getMixedPath,
  getPendingAction,
  omitHiddenPaginatedFields
} from './utils'
import { TokenUserType } from '../authentication'
import {
  createPrng,
  fieldConfigsToActionPayload,
  tennisClubMembershipEvent
} from '../client'

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
        createdByUserType: TokenUserType.enum.user,
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
        createdByUserType: TokenUserType.enum.user,
        createdAt: '2023-01-01T00:00:00Z'
      },
      {
        ...commonAction,
        type: ActionType.ASSIGN,
        createdByUserType: TokenUserType.enum.user,
        createdAt: '2023-01-01T01:00:00Z',
        assignedTo: 'user-id-2'
      }
    ],
    expected: {
      ...commonAction,
      type: ActionType.ASSIGN,
      createdByUserType: TokenUserType.enum.user,
      createdAt: '2023-01-01T01:00:00Z',
      assignedTo: 'user-id-2'
    }
  },
  {
    actions: [
      {
        ...commonAction,
        type: ActionType.CREATE,
        createdByUserType: TokenUserType.enum.user,
        createdAt: '2023-01-01T00:00:00Z'
      },
      {
        ...commonAction,
        type: ActionType.ASSIGN,
        createdByUserType: TokenUserType.enum.user,
        createdAt: '2023-01-01T01:00:00Z',
        assignedTo: 'user-id-2'
      },
      {
        ...commonAction,
        type: ActionType.UNASSIGN,
        createdByUserType: TokenUserType.enum.user,
        createdAt: '2023-01-01T02:00:00Z'
      }
    ],
    expected: {
      ...commonAction,
      type: ActionType.UNASSIGN,
      createdByUserType: TokenUserType.enum.user,
      createdAt: '2023-01-01T02:00:00Z'
    }
  },
  {
    actions: [
      {
        ...commonAction,
        type: ActionType.CREATE,
        createdByUserType: TokenUserType.enum.user,
        createdAt: '2023-01-01T00:00:00Z'
      },
      {
        ...commonAction,
        type: ActionType.ASSIGN,
        createdByUserType: TokenUserType.enum.user,
        createdAt: '2023-01-01T01:00:00Z',
        assignedTo: 'user-id-2'
      },
      {
        ...commonAction,
        type: ActionType.UNASSIGN,
        createdByUserType: TokenUserType.enum.user,
        createdAt: '2023-01-01T02:00:00Z'
      },
      {
        ...commonAction,
        type: ActionType.ASSIGN,
        createdByUserType: TokenUserType.enum.user,
        createdAt: '2023-01-01T03:00:00Z',
        assignedTo: 'user-id-4'
      }
    ],
    expected: {
      ...commonAction,
      type: ActionType.ASSIGN,
      createdByUserType: TokenUserType.enum.user,
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

describe('deepMerge', () => {
  const cases = [
    {
      description: 'Merging two simple objects',
      obj1: { a: 1, b: 2 },
      obj2: { b: 3, c: 4 },
      expected: { a: 1, b: 3, c: 4 }
    },
    {
      description: 'Merging nested objects',
      obj1: { a: { x: 1 }, b: 2 },
      obj2: { a: { y: 2 }, b: 3 },
      // x is overridden completely
      expected: { a: { y: 2 }, b: 3 }
    },
    {
      description: 'Merging arrays within objects',
      obj1: { a: [1, 2], b: 2 },
      obj2: { a: [3, 4], b: 3 },
      expected: { a: [3, 4], b: 3 }
    },
    {
      description:
        'Merging with deep nested structures and arrays in both objects',
      obj1: {
        a: {
          x: [1, 2],
          y: { z: [3] }
        }
      },
      obj2: {
        a: {
          x: [4],
          y: { z: [5, 6] }
        }
      },
      expected: {
        a: {
          x: [4],
          y: { z: [5, 6] }
        }
      }
    },
    {
      description: 'Merging deep action declarations without mutating them',
      obj1: {
        actions: [
          {
            createdBy: '68497c34f1e1900a891aa81b',
            createdByRole: 'REGISTRATION_AGENT',
            createdAtLocation: 'b04a70a5-a158-44a9-a882-1e5714a7c0f5',
            createdBySignature:
              '/random-bucket/45450674-6523-441d-90d3-5ad66c7e57d1.png',
            type: ActionType.DECLARE,
            createdAt: '2025-06-11T12:53:08.085Z',
            id: '01a8e3d9-6fce-4b4e-8aba-58f2f67976a0',

            status: 'Accepted',
            transactionId: '1238cce2-45e1-4c7d-98da-a357ef6bfc92',
            declaration: {
              'applicant.name': { firstname: 'Chris', surname: 'Sarajanen' }
            }
          }
        ]
      },
      obj2: {
        actions: [
          {
            createdBy: '68497c34f1e1900a891aa81b',
            createdByRole: 'FIELD_AGENT',
            createdAtLocation: 'b04a70a5-a158-44a9-a882-1e5714a7c0f5',
            createdBySignature:
              '/random-bucket/45450674-6523-441d-90d3-5ad66c7e57d1.png',
            type: ActionType.DECLARE,
            createdAt: '2025-06-11T12:53:08.085Z',
            id: '01a8e3d9-6fce-4b4e-8aba-58f2f67976a0',
            status: 'Accepted',
            transactionId: '1238cce2-45e1-4c7d-98da-a357ef6bfc92',
            declaration: {
              'applicant.name': { firstname: 'Changed', surname: 'Name' }
            }
          }
        ]
      },
      expected: {
        actions: [
          {
            createdAt: '2025-06-11T12:53:08.085Z',
            createdAtLocation: 'b04a70a5-a158-44a9-a882-1e5714a7c0f5',
            createdBy: '68497c34f1e1900a891aa81b',
            createdByRole: 'FIELD_AGENT',
            createdBySignature:
              '/random-bucket/45450674-6523-441d-90d3-5ad66c7e57d1.png',
            declaration: {
              'applicant.name': { firstname: 'Changed', surname: 'Name' }
            },
            id: '01a8e3d9-6fce-4b4e-8aba-58f2f67976a0',
            status: 'Accepted',
            transactionId: '1238cce2-45e1-4c7d-98da-a357ef6bfc92',
            type: ActionType.DECLARE
          }
        ]
      }
    }
  ]

  test.each(cases)('$description', ({ obj1, obj2, expected }) => {
    const cloneObj1 = cloneDeep(obj1)
    const cloneObj2 = cloneDeep(obj2)

    expect({ ...obj1, ...obj2 }).toEqual(expected)

    // Make sure the method is not mutating the payload.
    expect(obj1).toEqual(cloneObj1)
    expect(obj2).toEqual(cloneObj2)
  })
})

describe('getPendingAction', () => {
  it('throws when it finds more than one pending action', () => {
    const created = {
      ...commonAction,
      type: ActionType.CREATE,
      createdByUserType: TokenUserType.enum.user,
      createdAt: '2023-01-01T00:00:00Z',
      status: 'Accepted' as const
    }

    const requested1 = {
      ...commonAction,
      id: 'action-id-2' as UUID,
      type: ActionType.DECLARE,
      createdByUserType: TokenUserType.enum.user,
      createdAt: '2023-02-01T00:00:00Z',
      status: 'Requested' as const
    }

    const requested2 = {
      ...commonAction,
      id: 'action-id-3' as UUID,
      type: ActionType.REQUEST_CORRECTION,
      createdByUserType: TokenUserType.enum.user,
      createdAt: '2023-01-01T00:00:00Z',
      status: 'Requested' as const
    }

    expect(() =>
      getPendingAction([created, requested1, requested2])
    ).toThrowError(
      'Expected exactly one pending action, but found action-id-2, action-id-3'
    )
  })

  it('finds the pending action', () => {
    const created = {
      ...commonAction,
      type: ActionType.CREATE,
      createdByUserType: TokenUserType.enum.user,
      createdAt: '2023-01-01T00:00:00Z',
      status: 'Accepted' as const
    }

    const requested1 = {
      ...commonAction,
      id: 'action-id-2' as UUID,
      type: ActionType.DECLARE,
      createdByUserType: TokenUserType.enum.user,
      createdAt: '2023-02-01T00:00:00Z',
      status: 'Accepted' as const
    }

    const requested2 = {
      ...commonAction,
      id: 'action-id-3' as UUID,
      type: ActionType.REQUEST_CORRECTION,
      createdByUserType: TokenUserType.enum.user,
      createdAt: '2023-01-01T00:00:00Z',
      status: 'Requested' as const
    }

    expect(getPendingAction([created, requested1, requested2])).toMatchObject(
      requested2
    )
  })

  it('handles the history having already a Requested & Accepted pair: still finds the one pending', () => {
    const creates = {
      ...commonAction,
      type: ActionType.CREATE,
      createdByUserType: TokenUserType.enum.user,
      createdAt: '2023-01-01T00:00:00Z',
      status: 'Accepted' as const
    }

    const requests = {
      ...commonAction,
      id: 'action-id-2' as UUID,
      type: ActionType.DECLARE,
      createdByUserType: TokenUserType.enum.user,
      createdAt: '2023-02-01T00:00:00Z',
      status: 'Requested' as const
    }

    const accepts = {
      ...commonAction,
      id: 'action-id-4' as UUID,
      type: ActionType.DECLARE,
      createdByUserType: TokenUserType.enum.user,
      createdAt: '2023-02-01T00:00:00Z',
      status: 'Accepted' as const,
      originalActionId: 'action-id-2' as UUID
    }

    const requestsAgain = {
      ...commonAction,
      id: 'action-id-3' as UUID,
      type: ActionType.REQUEST_CORRECTION,
      createdByUserType: TokenUserType.enum.user,
      createdAt: '2023-01-01T00:00:00Z',
      status: 'Requested' as const
    }

    expect(
      getPendingAction([creates, requests, accepts, requestsAgain])
    ).toMatchObject(requestsAgain)
  })

  it('handles the history having already a Requested & Accepted pair: still throws on two requested', () => {
    const creates = {
      ...commonAction,
      type: ActionType.CREATE,
      createdByUserType: TokenUserType.enum.user,
      createdAt: '2023-01-01T00:00:00Z',
      status: 'Accepted' as const
    }

    const requests = {
      ...commonAction,
      id: 'action-id-2' as UUID,
      type: ActionType.DECLARE,
      createdByUserType: TokenUserType.enum.user,
      createdAt: '2023-02-01T00:00:00Z',
      status: 'Requested' as const
    }

    const accepts = {
      ...commonAction,
      id: 'action-id-3' as UUID,
      type: ActionType.DECLARE,
      createdByUserType: TokenUserType.enum.user,
      createdAt: '2023-02-01T00:00:00Z',
      status: 'Accepted' as const,
      originalActionId: 'action-id-2' as UUID
    }

    const requestsAgain = {
      ...commonAction,
      id: 'action-id-4' as UUID,
      type: ActionType.REQUEST_CORRECTION,
      createdByUserType: TokenUserType.enum.user,
      createdAt: '2023-01-01T00:00:00Z',
      status: 'Requested' as const
    }

    const requestsOnceTooMany = {
      ...commonAction,
      id: 'action-id-5' as UUID,
      type: ActionType.REGISTER,
      createdByUserType: TokenUserType.enum.user,
      createdAt: '2023-01-01T00:00:00Z',
      status: 'Requested' as const
    }

    expect(() =>
      getPendingAction([
        creates,
        requests,
        accepts,
        requestsAgain,
        requestsOnceTooMany
      ])
    ).toThrowError(
      'Expected exactly one pending action, but found action-id-4, action-id-5'
    )
  })
})

describe('omitHiddenPaginatedFields', () => {
  it('removes fields that are hidden by field conditionals when page conditional is true', () => {
    const rng = createPrng(101)

    const fields = getDeclarationFields(tennisClubMembershipEvent)

    const declarationConfig = getDeclaration(tennisClubMembershipEvent)

    const declaration = fieldConfigsToActionPayload(fields, rng)
    const declarationWithoutHiddenFields = omitHiddenPaginatedFields(
      declarationConfig,
      declaration,
      {}
    )

    const missingKeys = difference(
      Object.keys(declaration),
      Object.keys(declarationWithoutHiddenFields)
    )

    expect(missingKeys).toEqual([
      'applicant.dob', // dobUnknown is true
      'applicant.isRecommendedByFieldAgent', // user is not field agent
      'senior-pass.id', // dob is not before the threshhold
      'senior-pass.recommender', // dob is not before threshhold
      'recommender.name', // recommender.none is true
      'recommender.id' // recommender.none is true
    ])
  })
})
