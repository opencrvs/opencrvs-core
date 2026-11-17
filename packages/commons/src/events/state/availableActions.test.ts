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
import { ActionType } from '../ActionType'
import { EventIndex } from '../EventIndex'
import { EventStatus } from '../EventMetadata'
import { InherentFlags } from '../Flag'
import { getAvailableActionsForEvent } from './availableActions'

describe('getAvailableActionsForEvent()', () => {
  for (const status of EventStatus.options) {
    it(`should return the correct actions for "${status}" status with no flags`, () => {
      expect(
        getAvailableActionsForEvent({
          status: status as EventStatus,
          flags: []
        } as unknown as EventIndex)
      ).toMatchSnapshot()
    })
  }

  it(`should not allow CUSTOM for "${EventStatus.enum.CREATED}" status, since a custom action would destroy the draft`, () => {
    expect(
      getAvailableActionsForEvent({
        status: EventStatus.enum.CREATED,
        flags: []
      } as unknown as EventIndex)
    ).not.toContain(ActionType.CUSTOM)
  })

  const REJECTABLE_STATUSES = [
    EventStatus.enum.NOTIFIED,
    EventStatus.enum.DECLARED
  ]

  for (const status of REJECTABLE_STATUSES) {
    it(`should return the correct actions for "${status}" status with ${InherentFlags.REJECTED} flag`, () => {
      expect(
        getAvailableActionsForEvent({
          status: status as EventStatus,
          flags: [InherentFlags.REJECTED]
        } as EventIndex)
      ).toMatchSnapshot()
    })
  }

  it(`should not allow ARCHIVE or EDIT for "${EventStatus.enum.ARCHIVED}" status with ${InherentFlags.REJECTED} flag`, () => {
    const actions = getAvailableActionsForEvent({
      status: EventStatus.enum.ARCHIVED,
      flags: [InherentFlags.REJECTED]
    } as EventIndex)

    expect(actions).not.toContain(ActionType.ARCHIVE)
    expect(actions).not.toContain(ActionType.EDIT)
    expect(actions).toContain(ActionType.UNARCHIVE)
    expect(actions).toMatchSnapshot()
  })

  it(`should allow UNARCHIVE for "${EventStatus.enum.ARCHIVED}" status with no flags`, () => {
    const actions = getAvailableActionsForEvent({
      status: EventStatus.enum.ARCHIVED,
      flags: []
    } as unknown as EventIndex)

    expect(actions).toContain(ActionType.UNARCHIVE)
  })

  it(`should not allow UNARCHIVE for "${EventStatus.enum.ARCHIVED}" status while an unarchive request is pending`, () => {
    const actions = getAvailableActionsForEvent({
      status: EventStatus.enum.ARCHIVED,
      flags: [(ActionType.UNARCHIVE + ':requested').toLowerCase()]
    } as EventIndex)

    expect(actions).not.toContain(ActionType.UNARCHIVE)
    expect(actions).toMatchSnapshot()
  })

  it(`should allow REVOKE_REGISTRATION for "${EventStatus.enum.REGISTERED}" status with no flags`, () => {
    const actions = getAvailableActionsForEvent({
      status: EventStatus.enum.REGISTERED,
      flags: []
    } as unknown as EventIndex)

    expect(actions).toContain(ActionType.REVOKE_REGISTRATION)
    expect(actions).not.toContain(ActionType.REINSTATE_REGISTRATION)
  })

  it(`should not allow REVOKE_REGISTRATION for "${EventStatus.enum.REGISTERED}" status with ${InherentFlags.CORRECTION_REQUESTED} flag`, () => {
    const actions = getAvailableActionsForEvent({
      status: EventStatus.enum.REGISTERED,
      flags: [InherentFlags.CORRECTION_REQUESTED]
    } as EventIndex)

    expect(actions).not.toContain(ActionType.REVOKE_REGISTRATION)
  })

  it(`should not allow REVOKE_REGISTRATION for "${EventStatus.enum.REGISTERED}" status while a revoke request is pending`, () => {
    const actions = getAvailableActionsForEvent({
      status: EventStatus.enum.REGISTERED,
      flags: [(ActionType.REVOKE_REGISTRATION + ':requested').toLowerCase()]
    } as EventIndex)

    expect(actions).not.toContain(ActionType.REVOKE_REGISTRATION)
  })

  it(`should only allow READ and REINSTATE_REGISTRATION for "${EventStatus.enum.REVOKED}" status`, () => {
    const actions = getAvailableActionsForEvent({
      status: EventStatus.enum.REVOKED,
      flags: []
    } as unknown as EventIndex)

    expect(actions).toEqual([
      ActionType.READ,
      ActionType.REINSTATE_REGISTRATION
    ])
  })

  it(`should not allow REINSTATE_REGISTRATION for "${EventStatus.enum.REVOKED}" status while a reinstate request is pending`, () => {
    const actions = getAvailableActionsForEvent({
      status: EventStatus.enum.REVOKED,
      flags: [(ActionType.REINSTATE_REGISTRATION + ':requested').toLowerCase()]
    } as EventIndex)

    expect(actions).toEqual([ActionType.READ])
  })

  it(`should return the correct actions for "${EventStatus.enum.REGISTERED}" status with ${InherentFlags.CORRECTION_REQUESTED} flag`, () => {
    expect(
      getAvailableActionsForEvent({
        status: EventStatus.enum.REGISTERED,
        flags: [InherentFlags.CORRECTION_REQUESTED]
      } as EventIndex)
    ).toMatchSnapshot()
  })

  it(`returns the correct actions for "${EventStatus.enum.REGISTERED}" status with a "registered:requested" flag`, () => {
    expect(
      getAvailableActionsForEvent({
        status: EventStatus.enum.REGISTERED,
        flags: [(EventStatus.enum.REGISTERED + ':requested').toLowerCase()]
      } as EventIndex)
    ).toMatchSnapshot()
  })

  it(`returns the correct actions for "${EventStatus.enum.DECLARED}" status with a "declared:requested" flag`, () => {
    expect(
      getAvailableActionsForEvent({
        status: EventStatus.enum.DECLARED,
        flags: [(EventStatus.enum.DECLARED + ':requested').toLowerCase()]
      } as EventIndex)
    ).toMatchSnapshot()
  })

  it(`should return the correct actions for "${EventStatus.enum.REGISTERED}" status with "registered:requested" ${InherentFlags.CORRECTION_REQUESTED} flag`, () => {
    expect(
      getAvailableActionsForEvent({
        status: EventStatus.enum.REGISTERED,
        flags: [
          InherentFlags.CORRECTION_REQUESTED,
          (EventStatus.enum.REGISTERED + ':requested').toLowerCase()
        ]
      } as EventIndex)
    ).toMatchSnapshot()
  })
})
