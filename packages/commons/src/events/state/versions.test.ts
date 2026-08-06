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
import { UUID } from '../../uuid'
import { getCurrentEventState } from '.'
import {
  getEventStateAtVersion,
  getRecordVersions,
  RecordForm
} from './versions'

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

  test('one edit yields one extra declaration version, not two', () => {
    /*
     * Editing emits EDIT then a fresh DECLARE — see the edit flow in
     * features/events/actions/edit. One edit must read as one new version.
     */
    const event = generateEventDocument({
      configuration,
      actions: [
        { type: ActionType.CREATE },
        { type: ActionType.DECLARE },
        { type: ActionType.EDIT },
        { type: ActionType.DECLARE },
        { type: ActionType.REGISTER }
      ]
    })

    const declarationVersions = getRecordVersions(event).filter(
      (v) => v.form === RecordForm.DECLARATION
    )

    expect(declarationVersions.map((v) => v.actionType)).toEqual([
      ActionType.DECLARE,
      ActionType.DECLARE
    ])
    expect(declarationVersions.map((v) => v.indexInForm)).toEqual([0, 1])
    expect(declarationVersions.map((v) => v.isLatestOfForm)).toEqual([
      false,
      true
    ])
  })

  test('an EDIT on its own is not a version', () => {
    const event = generateEventDocument({
      configuration,
      actions: [
        { type: ActionType.CREATE },
        { type: ActionType.DECLARE },
        { type: ActionType.EDIT }
      ]
    })

    expect(getRecordVersions(event)).toHaveLength(1)
  })

  test('actions before DECLARE belong to the notification', () => {
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
    ).toHaveLength(1)
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

describe('getEventStateAtVersion', () => {
  test('returns the declaration as it stood at that version, not the latest', () => {
    // No REGISTER here: every generated declaration action carries a full
    // default declaration, so a later one would merge its own default email
    // over the edit and the control assertion below would be meaningless.
    const event = generateEventDocument({
      configuration,
      actions: [
        { type: ActionType.CREATE },
        {
          type: ActionType.DECLARE,
          declarationOverrides: { 'applicant.email': 'original@example.com' }
        },
        {
          type: ActionType.EDIT,
          declarationOverrides: { 'applicant.email': 'edited@example.com' }
        },
        {
          type: ActionType.DECLARE,
          declarationOverrides: { 'applicant.email': 'edited@example.com' }
        }
      ]
    })

    // The first declaration, before the edit.
    const declareVersion = getRecordVersions(event).find(
      (v) => v.indexInForm === 0 && v.form === RecordForm.DECLARATION
    )

    expect(declareVersion).toBeDefined()

    const atDeclare = getEventStateAtVersion(
      event,
      configuration,
      declareVersion!.actionId
    )

    expect(atDeclare.declaration['applicant.email']).toBe(
      'original@example.com'
    )
    expect(
      getCurrentEventState(event, configuration).declaration['applicant.email']
    ).toBe('edited@example.com')
  })

  test('the latest version matches getCurrentEventState', () => {
    const event = generateEventDocument({
      configuration,
      actions: [
        { type: ActionType.CREATE },
        { type: ActionType.DECLARE },
        { type: ActionType.REGISTER }
      ]
    })

    const versions = getRecordVersions(event)
    const latest = versions[versions.length - 1]

    expect(
      getEventStateAtVersion(event, configuration, latest.actionId).declaration
    ).toEqual(getCurrentEventState(event, configuration).declaration)
  })

  test('an approved correction resolves its request from inside the prefix', () => {
    const event = generateEventDocument({
      configuration,
      actions: [
        { type: ActionType.CREATE },
        { type: ActionType.DECLARE },
        { type: ActionType.REGISTER },
        {
          type: ActionType.REQUEST_CORRECTION,
          declarationOverrides: { 'applicant.email': 'corrected@example.com' }
        },
        { type: ActionType.APPROVE_CORRECTION }
      ]
    })

    const request = event.actions.find(
      (a) => a.type === ActionType.REQUEST_CORRECTION
    )
    const approveAction = event.actions.find(
      (a) => a.type === ActionType.APPROVE_CORRECTION
    )

    expect(request).toBeDefined()
    expect(approveAction).toBeDefined()
    ;(approveAction as unknown as { requestId: string }).requestId = request!.id

    const approveVersion = getRecordVersions(event).find(
      (v) => v.actionType === ActionType.APPROVE_CORRECTION
    )

    expect(approveVersion).toBeDefined()
    expect(
      getEventStateAtVersion(event, configuration, approveVersion!.actionId)
        .declaration['applicant.email']
    ).toBe('corrected@example.com')
  })

  test('throws for an action id that is not on the event', () => {
    const event = generateEventDocument({
      configuration,
      actions: [{ type: ActionType.CREATE }, { type: ActionType.DECLARE }]
    })

    expect(() =>
      getEventStateAtVersion(
        event,
        configuration,
        '00000000-0000-4000-8000-000000000000' as UUID
      )
    ).toThrow()
  })

  test('snapshots a record whose creation action is not the earliest', () => {
    /*
     * Clocks differ between the client that drafts an event and the server
     * that records what follows, so CREATE can carry a later timestamp than
     * the actions it precedes. A prefix taken by time then misses it, and a
     * snapshot of an event with no creation action is refused outright.
     */
    const event = generateEventDocument({
      configuration,
      actions: [
        { type: ActionType.CREATE },
        {
          type: ActionType.DECLARE,
          declarationOverrides: { 'applicant.email': 'declared@example.com' }
        }
      ]
    })

    const skewed = {
      ...event,
      actions: event.actions.map((action) =>
        action.type === ActionType.CREATE
          ? { ...action, createdAt: '2030-01-01T00:00:00.000Z' }
          : action
      )
    }

    const declareVersion = getRecordVersions(skewed).find(
      (v) => v.form === RecordForm.DECLARATION
    )

    if (!declareVersion) {
      throw new Error('the declaration version was not found')
    }

    expect(
      getEventStateAtVersion(skewed, configuration, declareVersion.actionId)
        .declaration['applicant.email']
    ).toBe('declared@example.com')
  })
})
