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
import { defineConfig } from './defineConfig'
import {
  EventConfigInput,
  INITIAL_EVENT_CONFIG_VERSION_ID,
  resolveEventConfig,
  VersionedEventConfig
} from './EventConfig'
import { ActionType } from './ActionType'
import { getActionConfig } from './utils'
import { tennisClubMembershipEvent } from '../fixtures'

const registerCopy = {
  id: 'event.tennis-club-membership.action.register.copy',
  defaultMessage: 'Registering creates an official record.',
  description: 'Copy of the register dialog'
}

const declareCopy = {
  id: 'event.tennis-club-membership.action.declare.copy',
  defaultMessage: 'You are about to declare this application.',
  description: 'Copy of the declare dialog'
}

const notifyCopyOfDeclare = {
  id: 'event.tennis-club-membership.action.declare.notify.copy',
  defaultMessage: 'You are about to notify this application.',
  description: 'Copy of the notify dialog, given on the DECLARE action'
}

const notifyCopy = {
  id: 'event.tennis-club-membership.action.notify.copy',
  defaultMessage: 'Notifying sends this application to the club.',
  description: 'Copy of the notify dialog'
}

type ActionInput = EventConfigInput['actions'][number]

type ActionInputOfType<T extends ActionInput['type']> = Extract<
  ActionInput,
  { type: T }
>

function isActionOfType<T extends ActionInput['type']>(
  action: ActionInput,
  actionType: T
): action is ActionInputOfType<T> {
  return action.type === actionType
}

/** The tennis club event, where `change` replaces the action of type `actionType`. */
function withAction<T extends ActionInput['type']>(
  actionType: T,
  change: (action: ActionInputOfType<T>) => ActionInputOfType<T>
): EventConfigInput {
  return {
    ...tennisClubMembershipEvent,
    actions: tennisClubMembershipEvent.actions.map((action) =>
      isActionOfType(action, actionType) ? change(action) : action
    )
  }
}

function getAction(config: EventConfigInput, actionType: ActionType) {
  return getActionConfig({
    eventConfiguration: resolveEventConfig(defineConfig(config)),
    actionType
  })
}

describe('dialog copy of v2.1', () => {
  let warn: jest.SpyInstance

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => {
    warn.mockRestore()
  })

  it('should take `supportingCopy` of the REGISTER action as its `dialogCopy`', () => {
    const config = withAction(ActionType.REGISTER, (action) => ({
      ...action,
      supportingCopy: registerCopy
    }))

    const register = getAction(config, ActionType.REGISTER)

    expect(register).toHaveProperty('dialogCopy', registerCopy)
    expect(register).not.toHaveProperty('supportingCopy')
  })

  it('should warn that `supportingCopy` is deprecated, naming the event, the version and the action', () => {
    defineConfig(
      withAction(ActionType.REGISTER, (action) => ({
        ...action,
        supportingCopy: registerCopy
      }))
    )

    expect(warn).toHaveBeenCalledWith(
      `Event '${tennisClubMembershipEvent.id}', version '${INITIAL_EVENT_CONFIG_VERSION_ID}': \`supportingCopy\` on the REGISTER action is deprecated and will be removed in v2.3. Rename it to \`dialogCopy\`. \`opencrvs upgrade\` makes this change for you.`
    )
  })

  it('should not warn about a config that gives only `dialogCopy`', () => {
    const config = withAction(ActionType.REGISTER, (action) => ({
      ...action,
      dialogCopy: registerCopy
    }))

    expect(getAction(config, ActionType.REGISTER)).toHaveProperty(
      'dialogCopy',
      registerCopy
    )
    expect(warn).not.toHaveBeenCalled()
  })

  it('should reject an action that gives both `supportingCopy` and `dialogCopy`', () => {
    const config = withAction(ActionType.REGISTER, (action) => ({
      ...action,
      supportingCopy: registerCopy,
      dialogCopy: registerCopy
    }))

    expect(() => defineConfig(config)).toThrow(
      'The REGISTER action gives both `dialogCopy` and the deprecated `supportingCopy`. Give only `dialogCopy`.'
    )
  })

  it('should drop `supportingCopy` of an action that opens no dialog, and warn to remove it', () => {
    const config = withAction(ActionType.REQUEST_CORRECTION, (action) => ({
      ...action,
      supportingCopy: registerCopy
    }))

    const correction = getAction(config, ActionType.REQUEST_CORRECTION)

    expect(correction).not.toHaveProperty('supportingCopy')
    expect(correction).not.toHaveProperty('dialogCopy')
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        '`supportingCopy` on the REQUEST_CORRECTION action is deprecated and will be removed in v2.3. No dialog shows it, so remove it.'
      )
    )
  })

  describe('`dialogCopy.notify` of the DECLARE action', () => {
    const config = withAction(ActionType.DECLARE, (action) => ({
      ...action,
      dialogCopy: {
        notify: notifyCopyOfDeclare,
        declare: declareCopy,
        register: registerCopy
      }
    }))

    it('should become the `dialogCopy` of the NOTIFY action', () => {
      expect(getAction(config, ActionType.NOTIFY)).toHaveProperty(
        'dialogCopy',
        notifyCopyOfDeclare
      )
    })

    it('should be removed from the DECLARE action, which keeps its other copy', () => {
      expect(getAction(config, ActionType.DECLARE)).toHaveProperty(
        'dialogCopy',
        { declare: declareCopy, register: registerCopy }
      )
    })

    it('should not replace the `supportingCopy` of the NOTIFY action, which the notify dialog showed in v2.1', () => {
      const configWithNotifyCopy: EventConfigInput = {
        ...config,
        actions: config.actions.map((action) =>
          action.type === ActionType.NOTIFY
            ? { ...action, supportingCopy: notifyCopy }
            : action
        )
      }

      expect(getAction(configWithNotifyCopy, ActionType.NOTIFY)).toHaveProperty(
        'dialogCopy',
        notifyCopy
      )
    })

    it('should warn that it is deprecated', () => {
      defineConfig(config)

      expect(warn).toHaveBeenCalledWith(
        `Event '${tennisClubMembershipEvent.id}', version '${INITIAL_EVENT_CONFIG_VERSION_ID}': \`dialogCopy.notify\` on the DECLARE action is deprecated and will be removed in v2.3. Give it as \`dialogCopy\` on the NOTIFY action instead. \`opencrvs upgrade\` makes this change for you.`
      )
    })
  })

  // The events service parses the config that a country config of v2.1 serves
  it('should take the copy of v2.1 from a served config that defineConfig did not change', () => {
    const served = JSON.parse(
      JSON.stringify(defineConfig(tennisClubMembershipEvent))
    )
    served.versions[0].actions = served.versions[0].actions.map(
      (action: { type: string }) =>
        action.type === ActionType.REGISTER
          ? { ...action, supportingCopy: registerCopy }
          : action
    )

    const register = getActionConfig({
      eventConfiguration: resolveEventConfig(
        VersionedEventConfig.parse(served)
      ),
      actionType: ActionType.REGISTER
    })

    expect(register).toHaveProperty('dialogCopy', registerCopy)
    expect(register).not.toHaveProperty('supportingCopy')
  })
})
