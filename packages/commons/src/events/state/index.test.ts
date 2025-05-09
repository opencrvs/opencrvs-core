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

import { deepDropNulls, getCurrentEventState } from '.'
import { tennisClubMembershipEvent } from '../../fixtures'
import { getUUID } from '../../uuid'
import { ActionStatus } from '../ActionDocument'
import { ActionType } from '../ActionType'
import { AddressType } from '../CompositeFieldValue'
import { generateActionDocument } from '../test.utils'

describe('correction requests', () => {
  test('proposed correction data is not applied before the correction request is approved', () => {
    const state = getCurrentEventState({
      type: 'tennis-club-membership',
      id: 'f743a5d5-19d4-44eb-9b0f-301a2d823bcf',
      trackingId: 'TEST12',
      createdAt: '2025-01-23T02:21:38.343Z',
      updatedAt: '2025-01-23T02:21:42.230Z',
      dateOfEvent: { fieldId: 'child.dob' },
      updatedAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
      actions: [
        {
          type: 'CREATE',
          createdAt: '2025-01-23T02:21:38.343Z',
          createdBy: '6791a7b2d7f8663e9f9dcbf0',
          createdByRole: 'some-role',
          createdAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
          id: '63d19916-dcc8-4cf2-8161-eab9989765e8',
          declaration: {},
          status: ActionStatus.Accepted,
          transactionId: getUUID()
        },
        {
          declaration: { name: 'John Doe' },
          type: 'DECLARE',
          createdBy: '6791a7b2d7f8663e9f9dcbf0',
          createdByRole: 'some-role',
          createdAt: '2025-01-23T02:21:39.161Z',
          createdAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
          id: 'eb4c18e5-93bc-42f6-b110-909815f6a7c8',
          status: ActionStatus.Accepted,
          transactionId: getUUID()
        },
        {
          declaration: {},
          type: 'REGISTER',
          createdBy: '6791a7b2d7f8663e9f9dcbf0',
          createdByRole: 'some-role',
          createdAt: '2025-01-23T02:21:40.182Z',
          createdAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
          id: 'bec6b33a-7a5f-4acd-9638-9e77db1800e2',
          status: ActionStatus.Accepted,
          transactionId: getUUID()
        },
        {
          declaration: { name: 'Doe John' },
          type: 'REQUEST_CORRECTION',
          createdBy: '6791a7b2d7f8663e9f9dcbf0',
          createdByRole: 'some-role',
          createdAt: '2025-01-23T02:21:41.206Z',
          createdAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
          id: '8f4d3b15-dfe9-44fb-b2b4-4b6e294c1c8d',
          status: ActionStatus.Accepted,
          transactionId: getUUID()
        }
      ]
    })

    expect(state.declaration.name).toBe('John Doe')
  })
  test('proposed correction data is applied after the correction request is approved', () => {
    const state = getCurrentEventState({
      type: 'tennis-club-membership',
      id: 'f743a5d5-19d4-44eb-9b0f-301a2d823bcf',
      trackingId: 'TEST12',
      createdAt: '2025-01-23T02:21:38.343Z',
      updatedAt: '2025-01-23T02:21:42.230Z',
      dateOfEvent: { fieldId: 'child.dob' },
      updatedAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
      actions: [
        {
          type: 'CREATE',
          createdAt: '2025-01-23T02:21:38.343Z',
          createdBy: '6791a7b2d7f8663e9f9dcbf0',
          createdByRole: 'some-role',
          createdAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
          id: '63d19916-dcc8-4cf2-8161-eab9989765e8',
          declaration: {},
          status: ActionStatus.Accepted,
          transactionId: getUUID()
        },
        {
          declaration: { name: 'John Doe' },
          type: 'DECLARE',
          createdBy: '6791a7b2d7f8663e9f9dcbf0',
          createdByRole: 'some-role',
          createdAt: '2025-01-23T02:21:39.161Z',
          createdAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
          id: 'eb4c18e5-93bc-42f6-b110-909815f6a7c8',
          status: ActionStatus.Accepted,
          transactionId: getUUID()
        },
        {
          declaration: {},
          type: 'REGISTER',
          createdBy: '6791a7b2d7f8663e9f9dcbf0',
          createdByRole: 'some-role',
          createdAt: '2025-01-23T02:21:40.182Z',
          createdAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
          id: 'bec6b33a-7a5f-4acd-9638-9e77db1800e2',
          status: ActionStatus.Accepted,
          transactionId: getUUID()
        },
        {
          declaration: { name: 'Doe John' },
          type: 'REQUEST_CORRECTION',
          createdBy: '6791a7b2d7f8663e9f9dcbf0',
          createdByRole: 'some-role',
          createdAt: '2025-01-23T02:21:41.206Z',
          createdAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
          id: '8f4d3b15-dfe9-44fb-b2b4-4b6e294c1c8d',
          status: ActionStatus.Accepted,
          transactionId: getUUID()
        },
        {
          declaration: {},
          requestId: '8f4d3b15-dfe9-44fb-b2b4-4b6e294c1c8d',
          type: 'APPROVE_CORRECTION',
          createdBy: '6791a7b2d7f8663e9f9dcbf0',
          createdByRole: 'some-role',
          createdAt: '2025-01-23T02:21:42.230Z',
          createdAtLocation: '492a62a5-d55f-4421-84f5-defcfb9fe6ba',
          id: '94d5a963-0125-4d31-85f0-6d77080758f4',
          status: ActionStatus.Accepted,
          transactionId: getUUID()
        }
      ]
    })

    expect(state.declaration.name).toBe('Doe John')
  })
})

describe('address state transitions', () => {
  const addressWithoutVillage = {
    country: 'FAR',
    addressType: AddressType.DOMESTIC,
    province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
    district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
    urbanOrRural: 'RURAL' as const
  }

  const initialAddress = {
    ...addressWithoutVillage,
    village: 'Small village'
  }

  const initialForm = {
    'applicant.dob': '2000-02-01',
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
    'recommender.none': true,
    'applicant.address': { ...initialAddress }
  }

  const initialActions = [
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.CREATE
    }),
    generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.DECLARE,
      defaults: {
        declaration: initialForm
      }
    })
  ]

  test('should persist optional "village" field in address, even if it is not included in payload', () => {
    const actions = [
      ...initialActions,
      generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.DECLARE,
        defaults: {
          declaration: {
            'applicant.address': addressWithoutVillage
          }
        }
      })
    ]

    const state = getCurrentEventState({
      trackingId: getUUID(),
      type: tennisClubMembershipEvent.id,
      createdAt: new Date().toISOString(),
      actions,
      id: getUUID(),
      updatedAt: new Date().toISOString(),
      updatedAtLocation: getUUID(),
      dateOfEvent: { fieldId: 'child.dob' }
    })

    expect(state.declaration).toEqual(initialForm)
  })

  test('should remove optional "village" field in address when it is set to null', () => {
    const addressWithNullVillage = {
      ...addressWithoutVillage,
      village: null
    }

    const actions = [
      ...initialActions,
      generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.DECLARE,
        defaults: {
          declaration: {
            'applicant.address': addressWithNullVillage
          }
        }
      })
    ]

    const state = getCurrentEventState({
      trackingId: getUUID(),
      type: tennisClubMembershipEvent.id,
      createdAt: new Date().toISOString(),
      actions,
      id: getUUID(),
      updatedAt: new Date().toISOString(),
      updatedAtLocation: getUUID(),
      dateOfEvent: { fieldId: 'child.dob' }
    })

    expect(state.declaration).toEqual({
      ...initialForm,
      'applicant.address': addressWithoutVillage
    })
  })
})

describe('deepDropNulls()', () => {
  it('should clean nulls correctly with nested objects', () => {
    const before = {
      a: null,
      b: {
        c: null,
        d: 'foo',
        e: [{ foo: 'bar' }]
      },
      f: [{ asd: 'asd' }]
    }

    const after = deepDropNulls(before)

    expect(after).toEqual({
      b: {
        d: 'foo',
        e: [{ foo: 'bar' }]
      },
      f: [{ asd: 'asd' }]
    })
  })

  it('should preserve primitive values', () => {
    expect(deepDropNulls('string')).toBe('string')
    expect(deepDropNulls(123)).toBe(123)
    expect(deepDropNulls(false)).toBe(false)
    expect(deepDropNulls(null)).toBe(null)
    expect(deepDropNulls(undefined)).toBe(undefined)
  })
})
