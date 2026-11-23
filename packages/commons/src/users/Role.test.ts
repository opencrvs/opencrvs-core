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
import { ZodError } from 'zod'
import { versionedTennisClubMembershipEvent } from '../fixtures'
import { defineRoles, Role, Roles } from './Role'
import { encodeScope } from './scopes'

const declareTennisClub = encodeScope({
  type: 'record.declare',
  options: { event: [versionedTennisClubMembershipEvent.id] }
})

describe('Role', () => {
  it('rejects an empty id', () => {
    expect(Role.safeParse({ id: '', scopes: [] }).success).toBe(false)
  })

  it('rejects a scope that does not decode', () => {
    const result = Role.safeParse({
      id: 'LOCAL_REGISTRAR',
      scopes: [declareTennisClub, 'record.declare-birth']
    })

    expect(result.error?.issues).toEqual([
      expect.objectContaining({
        path: ['scopes', 1],
        message: 'Invalid scope: "record.declare-birth"'
      })
    ])
  })
})

describe('defineRoles()', () => {
  it('returns the roles when they are valid', () => {
    const roles = [{ id: 'LOCAL_REGISTRAR', scopes: [declareTennisClub] }]

    expect(defineRoles(roles, [versionedTennisClubMembershipEvent])).toEqual(
      roles
    )
  })

  it('throws for invalid roles, so a country config fails as it loads them', () => {
    const notifyAndDeclare = [
      {
        id: 'COMMUNITY_LEADER',
        scopes: [
          encodeScope({ type: 'record.notify' }),
          encodeScope({ type: 'record.declare' })
        ]
      }
    ]

    expect(() =>
      defineRoles(notifyAndDeclare, [versionedTennisClubMembershipEvent])
    ).toThrow(
      "Role 'COMMUNITY_LEADER': record.notify and record.declare are both granted for all events"
    )
  })

  it('parses the roles before it validates them', () => {
    const withoutScopes = [{ id: 'LOCAL_REGISTRAR' }] as unknown as Roles

    expect(() =>
      defineRoles(withoutScopes, [versionedTennisClubMembershipEvent])
    ).toThrow(ZodError)
  })
})
