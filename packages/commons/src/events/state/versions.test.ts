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
import { generateEventDocument } from '../test.utils'
import { tennisClubMembershipEvent } from '../../fixtures'
import { getRecordVersions, RecordForm } from './versions'

const configuration = tennisClubMembershipEvent

describe('getRecordVersions', () => {
  test('a notified, declared and registered record yields one version per form', () => {
    const event = generateEventDocument({
      configuration,
      actions: [
        { type: ActionType.CREATE },
        { type: ActionType.NOTIFY },
        { type: ActionType.DECLARE },
        { type: ActionType.REGISTER }
      ]
    })

    const versions = getRecordVersions(event)

    expect(versions.map((v) => v.form)).toEqual([
      RecordForm.NOTIFICATION,
      RecordForm.DECLARATION,
      RecordForm.REGISTRATION
    ])
    expect(versions.every((v) => v.isLatestOfForm)).toBe(true)
    expect(versions.map((v) => v.indexInForm)).toEqual([0, 0, 0])
  })

  test('an edit between DECLARE and REGISTER belongs to the declaration', () => {
    const event = generateEventDocument({
      configuration,
      actions: [
        { type: ActionType.CREATE },
        { type: ActionType.DECLARE },
        { type: ActionType.EDIT },
        { type: ActionType.REGISTER }
      ]
    })

    const declarationVersions = getRecordVersions(event).filter(
      (v) => v.form === RecordForm.DECLARATION
    )

    expect(declarationVersions.map((v) => v.actionType)).toEqual([
      ActionType.DECLARE,
      ActionType.EDIT
    ])
    expect(declarationVersions.map((v) => v.indexInForm)).toEqual([0, 1])
    expect(declarationVersions.map((v) => v.isLatestOfForm)).toEqual([
      false,
      true
    ])
  })

  test('an edit before DECLARE belongs to the notification', () => {
    const event = generateEventDocument({
      configuration,
      actions: [
        { type: ActionType.CREATE },
        { type: ActionType.NOTIFY },
        { type: ActionType.EDIT },
        { type: ActionType.DECLARE }
      ]
    })

    const versions = getRecordVersions(event)

    expect(
      versions.filter((v) => v.form === RecordForm.NOTIFICATION)
    ).toHaveLength(2)
    expect(
      versions.filter((v) => v.form === RecordForm.DECLARATION)
    ).toHaveLength(1)
  })

  test('an approved correction adds a registration version', () => {
    const event = generateEventDocument({
      configuration,
      actions: [
        { type: ActionType.CREATE },
        { type: ActionType.DECLARE },
        { type: ActionType.REGISTER },
        { type: ActionType.REQUEST_CORRECTION },
        { type: ActionType.APPROVE_CORRECTION }
      ]
    })

    const registrationVersions = getRecordVersions(event).filter(
      (v) => v.form === RecordForm.REGISTRATION
    )

    expect(registrationVersions.map((v) => v.actionType)).toEqual([
      ActionType.REGISTER,
      ActionType.APPROVE_CORRECTION
    ])
    expect(registrationVersions[1].isLatestOfForm).toBe(true)
  })

  test('CREATE, READ, ASSIGN and REQUEST_CORRECTION are not versions', () => {
    const event = generateEventDocument({
      configuration,
      actions: [
        { type: ActionType.CREATE },
        { type: ActionType.ASSIGN },
        { type: ActionType.READ },
        { type: ActionType.DECLARE },
        { type: ActionType.REGISTER },
        { type: ActionType.REQUEST_CORRECTION }
      ]
    })

    expect(getRecordVersions(event).map((v) => v.actionType)).toEqual([
      ActionType.DECLARE,
      ActionType.REGISTER
    ])
  })
})
