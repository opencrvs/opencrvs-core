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
  ActionConfig,
  ActionType,
  EventConfig,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { getDialogCopy } from './dialogCopy'

function copy(name: string) {
  return { id: `${name}.copy`, defaultMessage: name, description: name }
}

const editAction: ActionConfig = {
  type: ActionType.EDIT,
  label: copy('edit.label'),
  flags: [],
  dialogCopy: {
    notify: copy('edit.notify'),
    declare: copy('edit.declare'),
    register: copy('edit.register')
  }
}

/** The tennis club event, with the copy of every dialog given on the action that opens it. */
const configWithEveryCopy: EventConfig = {
  ...tennisClubMembershipEvent,
  actions: [
    ...tennisClubMembershipEvent.actions.map((action): ActionConfig => {
      if (action.type === ActionType.DECLARE) {
        return {
          ...action,
          dialogCopy: {
            declare: copy('declare.declare'),
            register: copy('declare.register')
          }
        }
      }
      if (
        action.type === ActionType.NOTIFY ||
        action.type === ActionType.REGISTER
      ) {
        return { ...action, dialogCopy: copy(action.type.toLowerCase()) }
      }
      return action
    }),
    editAction
  ]
}

/** The same event, where the DECLARE and EDIT actions give no copy for the dialogs of their pages. */
const configWithoutCopyOfPages: EventConfig = {
  ...configWithEveryCopy,
  actions: configWithEveryCopy.actions.map((action): ActionConfig => {
    if (action.type === ActionType.DECLARE) {
      return { ...action, dialogCopy: { declare: copy('declare.declare') } }
    }
    if (action.type === ActionType.EDIT) {
      return { ...action, dialogCopy: undefined }
    }
    return action
  })
}

describe('getDialogCopy()', () => {
  it('should give the copy of the dialog that an action opens to confirm itself', () => {
    expect(
      getDialogCopy(configWithEveryCopy, { submits: ActionType.REGISTER })
    ).toEqual(copy('register'))
    expect(
      getDialogCopy(configWithEveryCopy, { submits: ActionType.NOTIFY })
    ).toEqual(copy('notify'))
  })

  it('should give `dialogCopy.declare` for the dialog that the declaration review page opens to declare', () => {
    expect(
      getDialogCopy(configWithEveryCopy, { submits: ActionType.DECLARE })
    ).toEqual(copy('declare.declare'))
  })

  it('should give the copy of the DECLARE action, not of the REGISTER action, for registration from the declaration review page', () => {
    expect(
      getDialogCopy(configWithEveryCopy, {
        openedBy: ActionType.DECLARE,
        submits: ActionType.REGISTER
      })
    ).toEqual(copy('declare.register'))
  })

  it.each([
    [ActionType.NOTIFY, 'edit.notify'],
    [ActionType.DECLARE, 'edit.declare'],
    [ActionType.REGISTER, 'edit.register']
  ] as const)(
    'should give the copy of the EDIT action for the edit dialog that submits %s',
    (submits, name) => {
      expect(
        getDialogCopy(configWithEveryCopy, {
          openedBy: ActionType.EDIT,
          submits
        })
      ).toEqual(copy(name))
    }
  )

  it('should give the copy of the REGISTER action when the DECLARE action gives none for registration', () => {
    expect(
      getDialogCopy(configWithoutCopyOfPages, {
        openedBy: ActionType.DECLARE,
        submits: ActionType.REGISTER
      })
    ).toEqual(copy('register'))
  })

  it.each([
    [ActionType.NOTIFY, 'notify'],
    [ActionType.DECLARE, 'declare.declare'],
    [ActionType.REGISTER, 'register']
  ] as const)(
    'should give the copy of %s when the EDIT action gives none for its dialog',
    (submits, name) => {
      expect(
        getDialogCopy(configWithoutCopyOfPages, {
          openedBy: ActionType.EDIT,
          submits
        })
      ).toEqual(copy(name))
    }
  )

  it('should give no copy when no action gives one', () => {
    expect(
      getDialogCopy(tennisClubMembershipEvent, {
        openedBy: ActionType.EDIT,
        submits: ActionType.REGISTER
      })
    ).toBeUndefined()
  })
})
