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
  footballClubMembershipEvent,
  tennisClubMembershipEvent
} from '../fixtures'
import { validateRole, validateRoles } from './roleValidations'
import { encodeScope, Scope } from './scopes'

/** Configures a NOTIFY action. */
const TENNIS_CLUB = tennisClubMembershipEvent.id
/** Configures no NOTIFY action. */
const FOOTBALL_CLUB = footballClubMembershipEvent.id

const eventConfigs = [tennisClubMembershipEvent, footballClubMembershipEvent]

function role(...scopes: Scope[]) {
  return { id: 'COMMUNITY_LEADER', scopes: scopes.map(encodeScope) }
}

describe('event ids in scopes', () => {
  it('reports an event that is not configured', () => {
    const scope = encodeScope({
      type: 'record.declare',
      options: { event: [TENNIS_CLUB, 'v2.nonsense'] }
    })

    expect(
      validateRole({ id: 'COMMUNITY_LEADER', scopes: [scope] }, eventConfigs)
    ).toEqual([`Scope "${scope}" contains invalid event IDs: v2.nonsense`])
  })

  it('accepts configured events, and scopes without an event option', () => {
    expect(
      validateRole(
        role(
          { type: 'record.declare', options: { event: [TENNIS_CLUB] } },
          { type: 'record.read' }
        ),
        eventConfigs
      )
    ).toEqual([])
  })
})

describe('record.notify together with record.declare', () => {
  it('is reported for the events both name', () => {
    expect(
      validateRole(
        role(
          {
            type: 'record.notify',
            options: { event: [TENNIS_CLUB, 'v2.other'] }
          },
          {
            type: 'record.declare',
            options: { event: [TENNIS_CLUB, FOOTBALL_CLUB] }
          }
        ),
        [tennisClubMembershipEvent]
      )
    ).toContain(
      `record.notify and record.declare are both granted for events: ${TENNIS_CLUB}. A role can notify or declare an event, not both.`
    )
  })

  it('is accepted for disjoint events', () => {
    expect(
      validateRole(
        role(
          { type: 'record.notify', options: { event: [TENNIS_CLUB] } },
          { type: 'record.declare', options: { event: [FOOTBALL_CLUB] } }
        ),
        eventConfigs
      )
    ).toEqual([])
  })

  it('treats a scope without an event option as covering every event', () => {
    expect(
      validateRole(
        role(
          { type: 'record.notify', options: { event: [TENNIS_CLUB] } },
          { type: 'record.declare' }
        ),
        eventConfigs
      )
    ).toEqual([
      `record.notify and record.declare are both granted for events: ${TENNIS_CLUB}. A role can notify or declare an event, not both.`
    ])
  })

  it('names all events when neither scope has an event option', () => {
    expect(
      validateRole(
        role({ type: 'record.notify' }, { type: 'record.declare' }),
        [tennisClubMembershipEvent]
      )
    ).toEqual([
      'record.notify and record.declare are both granted for all events. A role can notify or declare an event, not both.'
    ])
  })

  it('combines every scope of the same type', () => {
    expect(
      validateRole(
        role(
          { type: 'record.notify', options: { event: [TENNIS_CLUB] } },
          { type: 'record.declare', options: { event: [FOOTBALL_CLUB] } },
          { type: 'record.declare', options: { event: [TENNIS_CLUB] } }
        ),
        eventConfigs
      )
    ).toEqual([
      `record.notify and record.declare are both granted for events: ${TENNIS_CLUB}. A role can notify or declare an event, not both.`
    ])
  })
})

describe('record.notify together with a record.edit that can match DECLARED', () => {
  const notifyTennisClub: Scope = {
    type: 'record.notify',
    options: { event: [TENNIS_CLUB] }
  }

  const reported = `record.notify and a record.edit that can match DECLARED records are both granted for events: ${TENNIS_CLUB}. Limit the role's record.edit to status NOTIFIED.`

  it('is reported for a record.edit without a status option', () => {
    expect(
      validateRole(
        role(notifyTennisClub, {
          type: 'record.edit',
          options: { event: [TENNIS_CLUB] }
        }),
        eventConfigs
      )
    ).toEqual([reported])
  })

  it('is reported for a record.edit whose status includes DECLARED', () => {
    expect(
      validateRole(
        role(notifyTennisClub, {
          type: 'record.edit',
          options: { event: [TENNIS_CLUB], status: ['NOTIFIED', 'DECLARED'] }
        }),
        eventConfigs
      )
    ).toEqual([reported])
  })

  it('treats a record.edit without an event option as covering every event', () => {
    expect(
      validateRole(
        role(notifyTennisClub, {
          type: 'record.edit',
          options: { status: ['DECLARED'] }
        }),
        eventConfigs
      )
    ).toEqual([reported])
  })

  it('is accepted for a record.edit limited to NOTIFIED', () => {
    expect(
      validateRole(
        role(notifyTennisClub, {
          type: 'record.edit',
          options: { status: ['NOTIFIED'] }
        }),
        eventConfigs
      )
    ).toEqual([])
  })

  it('is accepted for disjoint events', () => {
    expect(
      validateRole(
        role(notifyTennisClub, {
          type: 'record.edit',
          options: { event: [FOOTBALL_CLUB] }
        }),
        eventConfigs
      )
    ).toEqual([])
  })

  it('counts only the record.edit scopes that can match DECLARED', () => {
    expect(
      validateRole(
        role(
          notifyTennisClub,
          {
            type: 'record.edit',
            options: { event: [TENNIS_CLUB], status: ['NOTIFIED'] }
          },
          {
            type: 'record.edit',
            options: { event: [FOOTBALL_CLUB], status: ['DECLARED'] }
          }
        ),
        eventConfigs
      )
    ).toEqual([])
  })
})

describe('record.notify for an event without a NOTIFY action', () => {
  it('is reported', () => {
    expect(
      validateRole(
        role({ type: 'record.notify', options: { event: [FOOTBALL_CLUB] } }),
        eventConfigs
      )
    ).toEqual([
      `record.notify is granted for events without a NOTIFY action: ${FOOTBALL_CLUB}`
    ])
  })

  it('is accepted for an event that configures NOTIFY', () => {
    expect(
      validateRole(
        role({ type: 'record.notify', options: { event: [TENNIS_CLUB] } }),
        eventConfigs
      )
    ).toEqual([])
  })

  it('is reported for each such event when the scope covers every event', () => {
    expect(
      validateRole(role({ type: 'record.notify' }), eventConfigs)
    ).toEqual([
      `record.notify is granted for events without a NOTIFY action: ${FOOTBALL_CLUB}`
    ])
  })
})

describe('validateRoles()', () => {
  it('accepts valid roles', () => {
    expect(() =>
      validateRoles(
        [
          role({ type: 'record.notify', options: { event: [TENNIS_CLUB] } }),
          { ...role({ type: 'record.declare' }), id: 'LOCAL_REGISTRAR' }
        ],
        eventConfigs
      )
    ).not.toThrow()
  })

  it('throws naming every problem, by role', () => {
    const unknownEvent = encodeScope({
      type: 'record.declare',
      options: { event: ['v2.x'] }
    })

    expect(() =>
      validateRoles(
        [
          role({ type: 'record.notify' }, { type: 'record.declare' }),
          { id: 'LOCAL_REGISTRAR', scopes: [unknownEvent] }
        ],
        [tennisClubMembershipEvent]
      )
    ).toThrow(
      [
        'Invalid roles:',
        "- Role 'COMMUNITY_LEADER': record.notify and record.declare are both granted for all events. A role can notify or declare an event, not both.",
        `- Role 'LOCAL_REGISTRAR': Scope "${unknownEvent}" contains invalid event IDs: v2.x`
      ].join('\n')
    )
  })
})
