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
import { Role } from './roles'
import {
  defineRoles,
  defineScopes,
  getEventTypesWithNotifyAndDeclare
} from './scopes'

describe('getEventTypesWithNotifyAndDeclare()', () => {
  it('returns no event types when the scopes only notify', () => {
    expect(
      getEventTypesWithNotifyAndDeclare(
        defineScopes([{ type: 'record.notify' }])
      )
    ).toEqual([])
  })

  it('returns no event types when the scopes only declare', () => {
    expect(
      getEventTypesWithNotifyAndDeclare(
        defineScopes([{ type: 'record.declare' }])
      )
    ).toEqual([])
  })

  it('returns no event types when notify and declare are for different event types', () => {
    expect(
      getEventTypesWithNotifyAndDeclare(
        defineScopes([
          { type: 'record.notify', options: { event: ['birth'] } },
          { type: 'record.declare', options: { event: ['death'] } }
        ])
      )
    ).toEqual([])
  })

  it('returns the event types both notify and declare are for', () => {
    expect(
      getEventTypesWithNotifyAndDeclare(
        defineScopes([
          { type: 'record.notify', options: { event: ['birth', 'death'] } },
          { type: 'record.declare', options: { event: ['death', 'marriage'] } }
        ])
      )
    ).toEqual(['death'])
  })

  it('returns the declared event types when notify is for every event type', () => {
    expect(
      getEventTypesWithNotifyAndDeclare(
        defineScopes([
          { type: 'record.notify', options: { placeOfEvent: 'location' } },
          { type: 'record.declare', options: { event: ['birth'] } }
        ])
      )
    ).toEqual(['birth'])
  })

  it('returns the notified event types when declare is for every event type', () => {
    expect(
      getEventTypesWithNotifyAndDeclare(
        defineScopes([
          { type: 'record.notify', options: { event: ['birth'] } },
          { type: 'record.declare' }
        ])
      )
    ).toEqual(['birth'])
  })

  it("returns 'all' when both are for every event type", () => {
    expect(
      getEventTypesWithNotifyAndDeclare(
        defineScopes([
          { type: 'record.notify', options: { placeOfEvent: 'location' } },
          {
            type: 'record.declare',
            options: { placeOfEvent: 'administrativeArea' }
          }
        ])
      )
    ).toEqual('all')
  })

  it('combines several scopes of the same type', () => {
    expect(
      getEventTypesWithNotifyAndDeclare(
        defineScopes([
          { type: 'record.notify', options: { event: ['birth'] } },
          { type: 'record.notify', options: { event: ['death'] } },
          { type: 'record.declare', options: { event: ['death'] } }
        ])
      )
    ).toEqual(['death'])
  })
})

const notifier = {
  id: 'HOSPITAL_CLERK',
  scopes: defineScopes([
    { type: 'record.notify', options: { event: ['birth'] } }
  ])
}

const notifierAndDeclarer = {
  id: 'COMMUNITY_LEADER',
  scopes: defineScopes([
    { type: 'record.notify', options: { event: ['birth'] } },
    { type: 'record.declare' }
  ])
}

describe('defineRoles()', () => {
  it('returns the roles as they are when they are valid', () => {
    const roles = [{ ...notifier, label: 'Hospital clerk' }]

    expect(defineRoles(roles)).toBe(roles)
  })

  it('throws when a role can both notify and declare the same event type', () => {
    expect(() => defineRoles([notifier, notifierAndDeclarer])).toThrow(
      'Role "COMMUNITY_LEADER" has both record.notify and record.declare scopes for event type(s) "birth"'
    )
  })

  it('names every event type when the scopes are not limited to event types', () => {
    expect(() =>
      defineRoles([
        {
          id: 'FIELD_AGENT',
          scopes: defineScopes([
            { type: 'record.notify' },
            { type: 'record.declare' }
          ])
        }
      ])
    ).toThrow('for every event type')
  })
})

describe('Role', () => {
  it('parses a role that only notifies', () => {
    expect(Role.safeParse(notifier).success).toBe(true)
  })

  it('rejects a role that can both notify and declare the same event type', () => {
    const result = Role.safeParse(notifierAndDeclarer)

    expect(result.success).toBe(false)
    expect(result.error?.issues).toMatchObject([
      {
        path: ['scopes'],
        message: expect.stringContaining('A role can either notify or declare')
      }
    ])
  })
})
