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
  ActionStatus,
  ActionType,
  EventDocument,
  field,
  getDeclarationPages,
  resolveEventCustomFlags,
  UUID,
  validate
} from '@opencrvs/toolkit/events'
import { tennisClubMembershipEvent } from './tennis-club-membership'

const DECLARED_AT = '2026-01-10T09:00:00.000Z'
const REGISTERED_AT = '2026-02-20T09:00:00.000Z'
// 17 years old when declared, 18 by the time of registration
const DOB_TURNS_18_BETWEEN_DECLARE_AND_REGISTER = '2008-01-20'

function action(
  type: ActionType,
  createdAt: string,
  declaration: Record<string, unknown> = {},
  status: ActionStatus = ActionStatus.Accepted
) {
  return {
    id: `${type}-${createdAt}` as UUID,
    type,
    createdAt,
    createdBy: 'user-1',
    createdByUserType: 'user' as const,
    createdByRole: 'LOCAL_REGISTRAR',
    createdAtLocation: 'location-1' as UUID,
    declaration,
    status,
    transactionId: `tx-${type}-${createdAt}`
  }
}

function tennisClubEvent(
  dob: string,
  actions: ReturnType<typeof action>[]
): EventDocument {
  return {
    id: 'event-1' as UUID,
    type: tennisClubMembershipEvent.id,
    trackingId: 'TEST12',
    createdAt: DECLARED_AT,
    updatedAt: REGISTERED_AT,
    actions: [
      action(ActionType.CREATE, DECLARED_AT),
      ...actions.map((a) =>
        a.type === ActionType.DECLARE
          ? { ...a, declaration: { 'applicant.dob': dob } }
          : a
      )
    ]
  } as EventDocument
}

describe('tennis club membership: age measured against the declaration date', () => {
  it('flags a junior member on register when they were under 18 at declaration', () => {
    const event = tennisClubEvent(DOB_TURNS_18_BETWEEN_DECLARE_AND_REGISTER, [
      action(ActionType.DECLARE, DECLARED_AT),
      action(ActionType.REGISTER, REGISTERED_AT)
    ])

    expect(resolveEventCustomFlags(event, tennisClubMembershipEvent)).toContain(
      'junior-member'
    )
  })

  it('would not flag the same applicant if age were measured on the register date', () => {
    const measuredOnRegisterDate = field('applicant.dob')
      .isAfter()
      .days(365 * 18)
      .inPast()

    expect(
      validate(measuredOnRegisterDate, {
        $now: REGISTERED_AT.slice(0, 10),
        $online: true,
        $form: { 'applicant.dob': DOB_TURNS_18_BETWEEN_DECLARE_AND_REGISTER }
      })
    ).toBe(false)
  })

  it('ignores a rejected declaration when finding the anchor', () => {
    // A rejected declare from two years earlier must not make an adult a junior
    const event = tennisClubEvent('2007-06-01', [
      action(
        ActionType.DECLARE,
        '2024-01-10T09:00:00.000Z',
        {},
        ActionStatus.Rejected
      ),
      action(ActionType.DECLARE, DECLARED_AT),
      action(ActionType.REGISTER, REGISTERED_AT)
    ])

    expect(
      resolveEventCustomFlags(event, tennisClubMembershipEvent)
    ).not.toContain('junior-member')
  })

  it('does not flag an adult applicant', () => {
    const event = tennisClubEvent('1990-05-05', [
      action(ActionType.DECLARE, DECLARED_AT),
      action(ActionType.REGISTER, REGISTERED_AT)
    ])

    expect(
      resolveEventCustomFlags(event, tennisClubMembershipEvent)
    ).not.toContain('junior-member')
  })

  describe('senior pass page', () => {
    const seniorPassPage = getDeclarationPages(tennisClubMembershipEvent).find(
      ({ id }) => id === 'senior-pass'
    )!
    // Turns 60 (+15 days) between declaration and a correction a year later
    const dob = '1966-03-01'
    const correctedAt = '2027-01-10'

    it('stays hidden on correction when the applicant was under 60 at declaration', () => {
      expect(
        validate(seniorPassPage.conditional!, {
          $now: correctedAt,
          $online: true,
          $form: { 'applicant.dob': dob },
          $event: tennisClubEvent(dob, [
            action(ActionType.DECLARE, DECLARED_AT),
            action(ActionType.REGISTER, REGISTERED_AT)
          ])
        })
      ).toBe(false)
    })

    it('measures against today before the application is declared', () => {
      expect(
        validate(seniorPassPage.conditional!, {
          $now: correctedAt,
          $online: true,
          $form: { 'applicant.dob': dob },
          $event: tennisClubEvent(dob, [])
        })
      ).toBe(true)
    })
  })
})
