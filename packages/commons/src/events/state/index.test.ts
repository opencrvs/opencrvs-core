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
import { EventStatus } from '../EventMetadata'
import { generateActionDocument, generateEventDocument } from '../test.utils'
import { EventIndex } from '../EventIndex'

/* eslint-disable max-lines */

describe('getCurrentEventState()', () => {
  test('Sets legalStatuses when event has been declared and registered', () => {
    const event = generateEventDocument({
      configuration: tennisClubMembershipEvent,
      actions: [ActionType.CREATE, ActionType.DECLARE, ActionType.REGISTER]
    })

    const state = getCurrentEventState(event, tennisClubMembershipEvent)

    expect(state.legalStatuses[EventStatus.DECLARED]).toEqual({
      createdAt: event.actions[1].createdAt,
      createdBy: event.actions[1].createdBy,
      createdAtLocation: event.actions[1].createdAtLocation,
      createdByRole: event.actions[1].createdByRole,
      acceptedAt: event.actions[1].createdAt
    })

    expect(state.legalStatuses[EventStatus.REGISTERED]).toEqual({
      createdAt: event.actions[2].createdAt,
      createdBy: event.actions[2].createdBy,
      createdAtLocation: event.actions[2].createdAtLocation,
      createdByRole: event.actions[2].createdByRole,
      acceptedAt: event.actions[2].createdAt
    })
  })

  test('legalStatuses are not set when actions are not accepted', () => {
    const actions = [
      ActionType.CREATE,
      ActionType.DECLARE,
      ActionType.REGISTER
    ].map((action) =>
      generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action,
        defaults: {
          status: ActionStatus.Requested
        }
      })
    )

    const event = {
      trackingId: getUUID(),
      type: tennisClubMembershipEvent.id,
      actions,
      createdAt: new Date(Date.now()).toISOString(),
      id: getUUID(),

      updatedAt: new Date(Date.now()).toISOString()
    }

    const state = getCurrentEventState(event, tennisClubMembershipEvent)

    expect(state.legalStatuses[EventStatus.DECLARED]).toBe(undefined)

    expect(state.legalStatuses[EventStatus.REGISTERED]).toBe(undefined)
  })

  test('legalStatuses are shown when requests have been accepted async', () => {
    const actions = [
      generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.CREATE
      }),
      ...[ActionType.DECLARE, ActionType.REGISTER].flatMap((action, i) => [
        generateActionDocument({
          configuration: tennisClubMembershipEvent,
          action,
          defaults: {
            status: ActionStatus.Requested,
            // While running tests we need to make sure that the timestamps are different. Using current date causes false positives.
            createdAt: `2023-01-01T00:0${i}:00.000Z`
          }
        }),
        generateActionDocument({
          configuration: tennisClubMembershipEvent,
          action,
          defaults: {
            status: ActionStatus.Accepted,
            createdAt: `2023-01-01T00:0${i + 1}:00.000Z`
          }
        })
      ])
    ]

    const event = {
      trackingId: getUUID(),
      type: tennisClubMembershipEvent.id,
      actions,
      createdAt: new Date(Date.now()).toISOString(),
      id: getUUID(),

      updatedAt: new Date(Date.now()).toISOString()
    }

    const state = getCurrentEventState(event, tennisClubMembershipEvent)

    const declareRequest = actions.find(
      (action) =>
        action.type === ActionType.DECLARE &&
        action.status === ActionStatus.Requested
    )

    const declareAccept = actions.find(
      (action) =>
        action.type === ActionType.DECLARE &&
        action.status === ActionStatus.Accepted
    )

    const registerRequest = actions.find(
      (action) =>
        action.type === ActionType.REGISTER &&
        action.status === ActionStatus.Requested
    )

    const registerAccept = actions.find(
      (action) =>
        action.type === ActionType.REGISTER &&
        action.status === ActionStatus.Accepted
    )

    expect(state.legalStatuses[EventStatus.DECLARED]).toEqual({
      createdAt: declareRequest?.createdAt,
      createdBy: declareRequest?.createdBy,
      createdAtLocation: declareRequest?.createdAtLocation,
      createdByRole: declareRequest?.createdByRole,
      acceptedAt: declareAccept?.createdAt
    })

    expect(state.legalStatuses[EventStatus.REGISTERED]).toEqual({
      createdAt: registerRequest?.createdAt,
      createdBy: registerRequest?.createdBy,
      createdAtLocation: registerRequest?.createdAtLocation,
      createdByRole: registerRequest?.createdByRole,
      acceptedAt: registerAccept?.createdAt
    })
  })

  test('Sets timestamps correctly when legal statuses were accepted async', () => {
    // NOTE: Values are not important, just the fact that right one is set. Using human-readable values for clarity
    const createAction = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.CREATE,
      defaults: {
        status: ActionStatus.Accepted,
        createdAt: '2023-01-01T00:00:00.000Z',
        createdBy: 'user1',
        createdAtLocation: 'location1',
        createdByRole: 'FIELD_AGENT'
      }
    })

    // Same person created the event and declared it
    const declareRequestAction = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.DECLARE,
      defaults: {
        status: ActionStatus.Requested,
        createdAt: '2023-02-01T00:00:00.000Z',
        createdBy: 'user1',
        createdAtLocation: 'location1',
        createdByRole: 'FIELD_AGENT'
      }
    })

    // 3rd party API accepted declaration async
    const declareAcceptAction = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.DECLARE,
      defaults: {
        status: ActionStatus.Accepted,
        createdAt: '2023-03-01T00:00:00.000Z',
        createdBy: 'computer1',
        createdAtLocation: 'location2',
        createdByRole: '3RD_PARTY_API'
      }
    })
    // Validate accepted directly by 3rd party API. Single action created.
    const validateAcceptAction = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.VALIDATE,
      defaults: {
        status: ActionStatus.Accepted,
        createdAt: '2023-04-01T00:00:00.000Z',
        createdBy: 'user2',
        createdAtLocation: 'location3',
        createdByRole: 'REGISTRATION_AGENT'
      }
    })

    const registerRequestAction = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.REGISTER,
      defaults: {
        status: ActionStatus.Requested,
        createdAt: '2023-05-01T00:00:00.000Z',
        createdBy: 'user3',
        createdAtLocation: 'location4',
        createdByRole: 'LOCAL_REGISTRAR'
      }
    })

    const registerAcceptAction = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.REGISTER,
      defaults: {
        status: ActionStatus.Accepted,
        createdAt: '2023-06-01T00:00:00.000Z',
        createdBy: 'computer2',
        createdAtLocation: 'location5',
        createdByRole: '3RD_PARTY_API',
        registrationNumber: '123456789'
      }
    })

    const actions = [
      createAction,
      declareRequestAction,
      declareAcceptAction,
      validateAcceptAction,
      registerRequestAction,
      registerAcceptAction
    ]

    const event = {
      trackingId: getUUID(),
      type: tennisClubMembershipEvent.id,
      actions,
      createdAt: new Date(Date.now()).toISOString(),
      id: getUUID(),
      updatedAt: new Date(Date.now()).toISOString()
    }

    const state = getCurrentEventState(event, tennisClubMembershipEvent)

    expect(state).toStrictEqual({
      createdAt: createAction.createdAt,
      createdBy: createAction.createdBy,
      createdAtLocation: createAction.createdAtLocation,
      updatedAt: registerRequestAction.createdAt,
      updatedBy: registerRequestAction.createdBy,
      id: event.id,
      type: event.type,
      trackingId: event.trackingId,
      status: EventStatus.REGISTERED,
      updatedByUserRole: registerRequestAction.createdByRole,
      updatedAtLocation: registerRequestAction.createdAtLocation,
      declaration: deepDropNulls(declareRequestAction.declaration),
      flags: [],
      legalStatuses: {
        [EventStatus.DECLARED]: {
          createdAt: declareRequestAction.createdAt,
          createdBy: declareRequestAction.createdBy,
          createdAtLocation: declareRequestAction.createdAtLocation,
          createdByRole: declareRequestAction.createdByRole,
          acceptedAt: declareAcceptAction.createdAt
        },
        [EventStatus.REGISTERED]: {
          createdAt: registerRequestAction.createdAt,
          createdBy: registerRequestAction.createdBy,
          createdAtLocation: registerRequestAction.createdAtLocation,
          acceptedAt: registerAcceptAction.createdAt,
          createdByRole: registerRequestAction.createdByRole,
          // @ts-expect-error -- We do not have sufficient types for this in generator
          registrationNumber: registerAcceptAction.registrationNumber
        }
      }
    } satisfies EventIndex)
  })

  test('Sets timestamps correctly when legal statuses were accepted immediately', () => {
    // NOTE: Values are not important, just the fact that right one is set. Using human-readable values for clarity
    const createAction = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.CREATE,
      defaults: {
        status: ActionStatus.Accepted,
        createdAt: '2023-01-01T00:00:00.000Z',
        createdBy: 'user1',
        createdAtLocation: 'location1',
        createdByRole: 'FIELD_AGENT'
      }
    })

    // Same person created the event and declared it
    const declareAcceptAction = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.DECLARE,
      defaults: {
        status: ActionStatus.Accepted,
        createdAt: '2023-02-01T00:00:00.000Z',
        createdBy: 'user1',
        createdAtLocation: 'location1',
        createdByRole: 'FIELD_AGENT'
      }
    })

    const validateAcceptAction = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.VALIDATE,
      defaults: {
        status: ActionStatus.Accepted,
        createdAt: '2023-04-01T00:00:00.000Z',
        createdBy: 'user2',
        createdAtLocation: 'location3',
        createdByRole: 'REGISTRATION_AGENT'
      }
    })

    const registerAcceptAction = generateActionDocument({
      configuration: tennisClubMembershipEvent,
      action: ActionType.REGISTER,
      defaults: {
        status: ActionStatus.Accepted,
        createdAt: '2023-05-01T00:00:00.000Z',
        createdBy: 'user3',
        createdAtLocation: 'location4',
        createdByRole: 'LOCAL_REGISTRAR',
        registrationNumber: '123456789'
      }
    })

    const actions = [
      createAction,
      declareAcceptAction,
      validateAcceptAction,
      registerAcceptAction
    ]

    const event = {
      trackingId: getUUID(),
      type: tennisClubMembershipEvent.id,
      actions,
      createdAt: new Date(Date.now()).toISOString(),
      id: getUUID(),
      updatedAt: new Date(Date.now()).toISOString()
    }

    const state = getCurrentEventState(event, tennisClubMembershipEvent)

    expect(state).toStrictEqual({
      createdAt: createAction.createdAt,
      createdBy: createAction.createdBy,
      createdAtLocation: createAction.createdAtLocation,
      updatedAt: registerAcceptAction.createdAt,
      updatedBy: registerAcceptAction.createdBy,
      id: event.id,
      type: event.type,
      trackingId: event.trackingId,
      status: EventStatus.REGISTERED,
      updatedByUserRole: registerAcceptAction.createdByRole,
      updatedAtLocation: registerAcceptAction.createdAtLocation,
      declaration: deepDropNulls(declareAcceptAction.declaration),
      flags: [],
      legalStatuses: {
        [EventStatus.DECLARED]: {
          createdAt: declareAcceptAction.createdAt,
          createdBy: declareAcceptAction.createdBy,
          createdAtLocation: declareAcceptAction.createdAtLocation,
          acceptedAt: declareAcceptAction.createdAt,
          createdByRole: declareAcceptAction.createdByRole
        },
        [EventStatus.REGISTERED]: {
          createdAt: registerAcceptAction.createdAt,
          createdBy: registerAcceptAction.createdBy,
          createdAtLocation: registerAcceptAction.createdAtLocation,
          acceptedAt: registerAcceptAction.createdAt,
          createdByRole: registerAcceptAction.createdByRole,
          // @ts-expect-error -- We do not have sufficient types for this in generator
          registrationNumber: registerAcceptAction.registrationNumber
        }
      }
    } satisfies EventIndex)
  })
})

describe('correction requests', () => {
  test('proposed correction data is not applied before the correction request is approved', () => {
    const state = getCurrentEventState(
      {
        type: 'TENNIS_CLUB_MEMBERSHIP',
        id: 'f743a5d5-19d4-44eb-9b0f-301a2d823bcf',
        trackingId: 'TEST12',
        createdAt: '2025-01-23T02:21:38.343Z',
        updatedAt: '2025-01-23T02:21:42.230Z',
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
      },
      tennisClubMembershipEvent
    )

    expect(state.declaration.name).toBe('John Doe')
  })
  test('proposed correction data is applied after the correction request is approved', () => {
    const state = getCurrentEventState(
      {
        type: 'TENNIS_CLUB_MEMBERSHIP',
        id: 'f743a5d5-19d4-44eb-9b0f-301a2d823bcf',
        trackingId: 'TEST12',
        createdAt: '2025-01-23T02:21:38.343Z',
        updatedAt: '2025-01-23T02:21:42.230Z',
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
      },
      tennisClubMembershipEvent
    )

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

    const state = getCurrentEventState(
      {
        trackingId: getUUID(),
        type: tennisClubMembershipEvent.id,
        createdAt: new Date().toISOString(),
        actions,
        id: getUUID(),
        updatedAt: new Date().toISOString()
      },
      tennisClubMembershipEvent
    )

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

    const state = getCurrentEventState(
      {
        trackingId: getUUID(),
        type: tennisClubMembershipEvent.id,
        createdAt: new Date().toISOString(),
        actions,
        id: getUUID(),
        updatedAt: new Date().toISOString()
      },
      tennisClubMembershipEvent
    )

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
