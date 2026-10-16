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

import { describe, expect, it } from 'vitest'
import {
  ActionType,
  EventConfig,
  EventDocument,
  generateEventDocument,
  getActionConfig,
  getUUID,
  ActionInput,
  ActionStatus,
  generateActionDocument
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  getActionAnchorDate,
  getEventConfigForAction,
  getEventConfigForConfirmation,
  resolveEffectiveFromForAction,
  throwConflictIfActionNotInEffect,
  throwIfPerformedAtOutOfBounds
} from './actionVersion'

const now = new Date('2020-06-01T10:00:00.000Z')

function version(type: ActionType, effectiveFrom?: string) {
  const base = tennisClubMembershipEvent.actions.find((a) => a.type === type)
  if (!base) {
    throw new Error(`Fixture has no ${type} action`)
  }
  return { ...base, effectiveFrom }
}

const config = {
  ...tennisClubMembershipEvent,
  actions: [
    ...tennisClubMembershipEvent.actions.filter(
      (a) => a.type !== ActionType.DECLARE && a.type !== ActionType.REGISTER
    ),
    version(ActionType.DECLARE),
    version(ActionType.DECLARE, '2010-01-01'),
    version(ActionType.REGISTER),
    version(ActionType.REGISTER, '2015-01-01')
  ]
} as EventConfig

const baseEvent: EventDocument = generateEventDocument({
  configuration: config,
  actions: [{ type: ActionType.CREATE }]
})

const eventId = baseEvent.id
const originalId = getUUID()

function parseInput(input: Record<string, unknown>) {
  return ActionInput.parse({
    eventId,
    transactionId: getUUID(),
    declaration: {},
    annotation: {},
    ...input
  })
}

const declareInput = parseInput({ type: ActionType.DECLARE })
const notifyInput = parseInput({ type: ActionType.NOTIFY })
const registerInput = parseInput({ type: ActionType.REGISTER })

const requestedRegisterAction = generateActionDocument({
  configuration: config,
  action: ActionType.REGISTER,
  defaults: { status: ActionStatus.Requested }
})

describe('action version resolution', () => {
  it('anchors DECLARE and NOTIFY at the event creation date', () => {
    const event = { ...baseEvent, createdAt: '2009-12-31T23:00:00.000Z' }
    expect(getActionAnchorDate(declareInput, event, now)).toBe('2009-12-31')
    expect(getActionAnchorDate(notifyInput, event, now)).toBe('2009-12-31')
  })

  it('anchors every other action at now (UTC date)', () => {
    expect(getActionAnchorDate(registerInput, baseEvent, now)).toBe(
      '2020-06-01'
    )
  })

  it('anchors at the time the client performed the action, when it sends one', () => {
    const offlineCreated = {
      ...baseEvent,
      actions: baseEvent.actions.map((action) =>
        action.type === ActionType.CREATE
          ? { ...action, performedAt: '2009-12-31T23:00:00.000Z' }
          : action
      )
    }
    const performedRegister = {
      ...registerInput,
      performedAt: '2014-12-31T23:00:00.000Z'
    }

    expect(getActionAnchorDate(declareInput, offlineCreated, now)).toBe(
      '2009-12-31'
    )
    expect(getActionAnchorDate(performedRegister, baseEvent, now)).toBe(
      '2014-12-31'
    )
  })

  it('stamps the version effective at the anchor', () => {
    const old = { ...baseEvent, createdAt: '2009-01-01T00:00:00.000Z' }
    const recent = { ...baseEvent, createdAt: '2011-01-01T00:00:00.000Z' }
    expect(
      resolveEffectiveFromForAction(config, declareInput, old, now)
    ).toBeUndefined()
    expect(
      resolveEffectiveFromForAction(config, declareInput, recent, now)
    ).toBe('2010-01-01')
    expect(resolveEffectiveFromForAction(config, registerInput, old, now)).toBe(
      '2015-01-01'
    )
  })

  it('copies the stamp of the original action for a confirmation', () => {
    const requested = {
      ...requestedRegisterAction,
      id: originalId,
      effectiveFrom: '2001-01-01'
    }
    const event = { ...baseEvent, actions: [...baseEvent.actions, requested] }
    expect(
      resolveEffectiveFromForAction(
        config,
        { ...registerInput, originalActionId: originalId },
        event,
        now
      )
    ).toBe('2001-01-01')
  })

  it('gives no DECLARE version for a record created before every DECLARE version', () => {
    const datedOnly = {
      ...config,
      actions: config.actions.filter(
        (a) => a.type !== ActionType.DECLARE || a.effectiveFrom
      )
    } as EventConfig
    const old = { ...baseEvent, createdAt: '2001-01-01T00:00:00.000Z' }
    const view = getEventConfigForAction(datedOnly, declareInput, old, now)

    expect(view.actions.some((a) => a.type === ActionType.DECLARE)).toBeFalsy()
    expect(() =>
      throwConflictIfActionNotInEffect({
        fetchedEventConfiguration: datedOnly,
        eventConfiguration: view,
        actionType: ActionType.DECLARE,
        recordCreatedOn: '2001-01-01'
      })
    ).toThrow(
      "Action 'DECLARE' has no version in effect on 2001-01-01, when the record was created, action cannot be performed"
    )
  })

  it('gives a view where the DECLARE found first is the anchored version', () => {
    const recent = { ...baseEvent, createdAt: '2011-01-01T00:00:00.000Z' }
    const view = getEventConfigForAction(config, declareInput, recent, now)
    expect(
      getActionConfig({
        eventConfiguration: view,
        actionType: ActionType.DECLARE
      })?.effectiveFrom
    ).toBe('2010-01-01')
  })
})

describe('getEventConfigForConfirmation()', () => {
  function eventWithRequestedRegister(effectiveFrom?: string) {
    const requested = {
      ...requestedRegisterAction,
      id: originalId,
      effectiveFrom
    }
    return { ...baseEvent, actions: [...baseEvent.actions, requested] }
  }

  function registerVersionOf(view: EventConfig) {
    const registerVersions = view.actions.filter(
      (a) => a.type === ActionType.REGISTER
    )
    expect(registerVersions).toHaveLength(1)
    return registerVersions[0].effectiveFrom
  }

  it('uses the version the Requested action is stamped with, not the newest', () => {
    const event = eventWithRequestedRegister()
    expect(
      registerVersionOf(
        getEventConfigForConfirmation(
          config,
          registerInput,
          event,
          originalId,
          now
        )
      )
    ).toBeUndefined()
  })

  it('uses a dated stamp when that version is still configured', () => {
    const newer = {
      ...config,
      actions: [...config.actions, version(ActionType.REGISTER, '2018-01-01')]
    } as EventConfig
    const event = eventWithRequestedRegister('2015-01-01')
    expect(
      registerVersionOf(
        getEventConfigForConfirmation(
          newer,
          registerInput,
          event,
          originalId,
          now
        )
      )
    ).toBe('2015-01-01')
  })

  it('falls back to the version effective now when the stamped version is gone', () => {
    const event = eventWithRequestedRegister('2001-01-01')
    expect(
      registerVersionOf(
        getEventConfigForConfirmation(
          config,
          registerInput,
          event,
          originalId,
          now
        )
      )
    ).toBe('2015-01-01')
  })
})

describe('the declaration version of actions anchored at now', () => {
  function declareVersionOf(view: EventConfig) {
    const versions = view.actions.filter((a) => a.type === ActionType.DECLARE)
    expect(versions).toHaveLength(1)
    return versions[0].effectiveFrom
  }

  function acceptedAction(type: ActionType, effectiveFrom?: string) {
    return {
      ...generateActionDocument({
        configuration: config,
        action: type,
        defaults: { status: ActionStatus.Accepted }
      }),
      effectiveFrom
    }
  }

  function eventWith(createdAt: string, actions: EventDocument['actions']) {
    return {
      ...baseEvent,
      createdAt,
      actions: [...baseEvent.actions, ...actions]
    }
  }

  it('reads the declaration with the DECLARE version the record is stamped with', () => {
    // Today's DECLARE is '2010-01-01', the record was declared with the undated one.
    const event = eventWith('2011-01-01T00:00:00.000Z', [
      acceptedAction(ActionType.DECLARE)
    ])
    expect(
      declareVersionOf(
        getEventConfigForAction(config, registerInput, event, now)
      )
    ).toBeUndefined()
  })

  it('resolves DECLARE at creation for a record that was only notified', () => {
    // The NOTIFY stamp does not choose the DECLARE version: at creation it is '2010-01-01'.
    const event = eventWith('2011-01-01T00:00:00.000Z', [
      acceptedAction(ActionType.NOTIFY)
    ])
    expect(
      declareVersionOf(
        getEventConfigForAction(config, registerInput, event, now)
      )
    ).toBe('2010-01-01')
  })

  it('resolves DECLARE and NOTIFY each from its own stamp', () => {
    const versionedNotify = {
      ...config,
      actions: [
        ...config.actions.filter((a) => a.type !== ActionType.NOTIFY),
        version(ActionType.NOTIFY),
        version(ActionType.NOTIFY, '2012-01-01')
      ]
    } as EventConfig
    // At creation DECLARE is '2010-01-01' and NOTIFY '2012-01-01'.
    const event = eventWith('2013-01-01T00:00:00.000Z', [
      acceptedAction(ActionType.NOTIFY, '2012-01-01'),
      acceptedAction(ActionType.DECLARE)
    ])

    const view = getEventConfigForAction(
      versionedNotify,
      registerInput,
      event,
      now
    )

    expect(declareVersionOf(view)).toBeUndefined()
    const notifyVersions = view.actions.filter(
      (a) => a.type === ActionType.NOTIFY
    )
    expect(notifyVersions).toHaveLength(1)
    expect(notifyVersions[0].effectiveFrom).toBe('2012-01-01')
  })

  it('takes the latest accepted DECLARE over earlier ones and over NOTIFY', () => {
    const event = eventWith('2011-01-01T00:00:00.000Z', [
      acceptedAction(ActionType.NOTIFY, '2010-01-01'),
      acceptedAction(ActionType.DECLARE, '2010-01-01'),
      acceptedAction(ActionType.DECLARE)
    ])
    expect(
      declareVersionOf(
        getEventConfigForAction(config, registerInput, event, now)
      )
    ).toBeUndefined()
  })

  it('falls back to the version effective at creation without a stamped action', () => {
    const event = eventWith('2001-01-01T00:00:00.000Z', [])
    expect(
      declareVersionOf(
        getEventConfigForAction(config, registerInput, event, now)
      )
    ).toBeUndefined()
  })

  it('falls back to the version effective at creation when the stamped version is gone', () => {
    const event = eventWith('2001-01-01T00:00:00.000Z', [
      acceptedAction(ActionType.DECLARE, '2005-01-01')
    ])
    expect(
      declareVersionOf(
        getEventConfigForAction(config, registerInput, event, now)
      )
    ).toBeUndefined()
  })

  it('returns the same view for the same config, action and record', () => {
    const event = eventWith('2011-01-01T00:00:00.000Z', [
      acceptedAction(ActionType.DECLARE)
    ])
    expect(getEventConfigForAction(config, registerInput, event, now)).toBe(
      getEventConfigForAction(config, registerInput, event, now)
    )
  })
})

describe('getEventConfigForConfirmation() view identity', () => {
  it('returns the action view itself when it already holds the stamped version', () => {
    const requested = {
      ...requestedRegisterAction,
      id: originalId,
      effectiveFrom: '2015-01-01'
    }
    const event = { ...baseEvent, actions: [...baseEvent.actions, requested] }
    expect(
      getEventConfigForConfirmation(
        config,
        registerInput,
        event,
        originalId,
        now
      )
    ).toBe(getEventConfigForAction(config, registerInput, event, now))
  })
})

describe('throwIfPerformedAtOutOfBounds()', () => {
  const transactionId = getUUID()

  function actionAt(
    type: ActionType,
    createdAt: string,
    defaults: { transactionId?: string; performedAt?: string } = {}
  ) {
    return {
      ...generateActionDocument({ configuration: config, action: type }),
      createdAt,
      ...defaults
    }
  }

  const event = {
    ...baseEvent,
    actions: [
      actionAt(ActionType.CREATE, '2020-05-01T00:00:00.000Z'),
      actionAt(ActionType.DECLARE, '2020-05-31T00:00:00.000Z', {
        performedAt: '2020-05-10T00:00:00.000Z'
      }),
      // Another user reading the record does not change it.
      actionAt(ActionType.READ, '2020-05-20T00:00:00.000Z')
    ]
  }

  it('accepts an action without performedAt', () => {
    expect(() =>
      throwIfPerformedAtOutOfBounds(
        { type: ActionType.REGISTER, transactionId },
        event,
        now
      )
    ).not.toThrow()
  })

  it('accepts a time after the latest action that changed the record, read at its performedAt', () => {
    expect(() =>
      throwIfPerformedAtOutOfBounds(
        {
          type: ActionType.REGISTER,
          transactionId,
          performedAt: '2020-05-15T00:00:00.000Z'
        },
        event,
        now
      )
    ).not.toThrow()
  })

  it('rejects a time before the latest action from another transaction', () => {
    expect(() =>
      throwIfPerformedAtOutOfBounds(
        {
          type: ActionType.REGISTER,
          transactionId,
          performedAt: '2020-05-05T00:00:00.000Z'
        },
        event,
        now
      )
    ).toThrow(
      'performedAt 2020-05-05T00:00:00.000Z is before the latest action of the record, performed at 2020-05-10T00:00:00.000Z'
    )
  })

  it('tolerates clock drift between clients, but rejects a time further before the latest action', () => {
    expect(() =>
      throwIfPerformedAtOutOfBounds(
        {
          type: ActionType.REGISTER,
          transactionId,
          performedAt: '2020-05-09T23:56:00.000Z'
        },
        event,
        now
      )
    ).not.toThrow()
    expect(() =>
      throwIfPerformedAtOutOfBounds(
        {
          type: ActionType.REGISTER,
          transactionId,
          performedAt: '2020-05-09T23:54:00.000Z'
        },
        event,
        now
      )
    ).toThrow('is before the latest action of the record')
  })

  it.each([ActionType.READ, ActionType.ASSIGN, ActionType.UNASSIGN])(
    'does not bound %s, which does not change the record',
    (type) => {
      expect(() =>
        throwIfPerformedAtOutOfBounds(
          { type, transactionId, performedAt: '2020-05-05T00:00:00.000Z' },
          event,
          now
        )
      ).not.toThrow()
    }
  )

  it('bounds by a confirmation at the time of the action it confirms', () => {
    const requested = actionAt(
      ActionType.REGISTER,
      '2020-05-12T00:00:00.000Z',
      {
        performedAt: '2020-05-11T00:00:00.000Z'
      }
    )
    const withConfirmation = {
      ...event,
      actions: [
        ...event.actions,
        { ...requested, status: ActionStatus.Requested },
        {
          ...actionAt(ActionType.REGISTER, '2020-05-25T00:00:00.000Z'),
          originalActionId: requested.id
        }
      ]
    }

    expect(() =>
      throwIfPerformedAtOutOfBounds(
        {
          type: ActionType.REGISTER,
          transactionId,
          performedAt: '2020-05-15T00:00:00.000Z'
        },
        withConfirmation,
        now
      )
    ).not.toThrow()
  })

  it('ignores actions of the same transaction', () => {
    const declare = event.actions[1]
    expect(() =>
      throwIfPerformedAtOutOfBounds(
        {
          type: ActionType.REGISTER,
          transactionId: declare.transactionId,
          performedAt: '2020-05-05T00:00:00.000Z'
        },
        event,
        now
      )
    ).not.toThrow()
  })

  it('tolerates clock drift, but rejects a time further in the future', () => {
    expect(() =>
      throwIfPerformedAtOutOfBounds(
        {
          type: ActionType.REGISTER,
          transactionId,
          performedAt: '2020-06-01T10:04:00.000Z'
        },
        event,
        now
      )
    ).not.toThrow()
    expect(() =>
      throwIfPerformedAtOutOfBounds(
        {
          type: ActionType.REGISTER,
          transactionId,
          performedAt: '2020-06-01T10:06:00.000Z'
        },
        undefined,
        now
      )
    ).toThrow('performedAt 2020-06-01T10:06:00.000Z is in the future')
  })
})
