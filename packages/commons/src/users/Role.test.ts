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
import { tennisClubMembershipEvent } from '../fixtures'
import { defineRoles } from './Role'
import { encodeScope } from './scopes'

const declareTennisClub = encodeScope({
  type: 'record.declare',
  options: { event: [tennisClubMembershipEvent.id] }
})

describe('defineRoles()', () => {
  it('returns the roles when they are valid', () => {
    const roles = [{ id: 'LOCAL_REGISTRAR', scopes: [declareTennisClub] }]

    expect(defineRoles(roles, [tennisClubMembershipEvent])).toEqual(roles)
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
      defineRoles(notifyAndDeclare, [tennisClubMembershipEvent])
    ).toThrow(
      "Role 'COMMUNITY_LEADER': record.notify and record.declare are both granted for all events"
    )
  })
})
