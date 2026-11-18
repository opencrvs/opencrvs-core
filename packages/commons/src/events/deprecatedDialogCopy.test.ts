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

const registerCopyOfDeclare = {
  id: 'event.tennis-club-membership.action.declare.register.copy',
  defaultMessage: 'You are about to register this application.',
  description: 'Copy of the register dialog, given on the DECLARE action'
}

const notifyCopy = {
  id: 'event.tennis-club-membership.action.notify.copy',
  defaultMessage: 'Notifying sends this application to the club.',
  description: 'Copy of the notify dialog'
}

const deprecatedDeclareDialogCopy = {
  notify: notifyCopyOfDeclare,
  declare: declareCopy,
  register: registerCopyOfDeclare
}

const location = `Event '${tennisClubMembershipEvent.id}', version '${INITIAL_EVENT_CONFIG_VERSION_ID}'`

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

/** `config`, where `change` replaces the action of type `actionType`. */
function withAction<T extends ActionInput['type']>(
  actionType: T,
  change: (action: ActionInputOfType<T>) => ActionInputOfType<T>,
  config: EventConfigInput = tennisClubMembershipEvent
): EventConfigInput {
  return {
    ...config,
    actions: config.actions.map((action) =>
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

describe('dialogCopy', () => {
  it('should reject `dialogCopy` on an action whose dialogs show no copy from the configuration', () => {
    const config = withAction(ActionType.PRINT_CERTIFICATE, (action) => ({
      ...action,
      // @ts-expect-error The type of the action also rejects `dialogCopy`
      dialogCopy: registerCopy
    }))

    expect(() => defineConfig(config)).toThrow(
      'This action does not support `dialogCopy`. No dialog of this action shows copy from the configuration.'
    )
  })
})

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
      `${location}: \`supportingCopy\` on the REGISTER action is deprecated and will be removed in v2.3. Rename it to \`dialogCopy\`. \`opencrvs upgrade\` makes this change for you.`
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

  it.each([ActionType.REQUEST_CORRECTION, ActionType.DECLARE] as const)(
    'should drop `supportingCopy` of the %s action, which no dialog showed, and warn to remove it',
    (actionType) => {
      const config = withAction(actionType, (action) => ({
        ...action,
        supportingCopy: registerCopy
      }))

      const action = getAction(config, actionType)

      expect(action).not.toHaveProperty('supportingCopy')
      expect(action).not.toHaveProperty('dialogCopy')
      expect(warn).toHaveBeenCalledWith(
        `${location}: \`supportingCopy\` on the ${actionType} action is deprecated and will be removed in v2.3. No dialog shows it, so remove it. \`opencrvs upgrade\` makes this change for you.`
      )
    }
  )

  describe('`dialogCopy` with `notify`, `declare` and `register` on the DECLARE action', () => {
    const config = withAction(ActionType.DECLARE, (action) => ({
      ...action,
      dialogCopy: deprecatedDeclareDialogCopy
    }))

    it('should give its `declare` copy as `dialogCopy` of the DECLARE action', () => {
      expect(getAction(config, ActionType.DECLARE)).toHaveProperty(
        'dialogCopy',
        declareCopy
      )
    })

    it('should give its `notify` and `register` copy as `dialogCopy` of the NOTIFY and REGISTER actions', () => {
      expect(getAction(config, ActionType.NOTIFY)).toHaveProperty(
        'dialogCopy',
        notifyCopyOfDeclare
      )
      expect(getAction(config, ActionType.REGISTER)).toHaveProperty(
        'dialogCopy',
        registerCopyOfDeclare
      )
    })

    it('should warn that it is deprecated', () => {
      defineConfig(config)

      expect(warn).toHaveBeenCalledWith(
        `${location}: \`dialogCopy\` with \`notify\`, \`declare\` and \`register\` on the DECLARE action is deprecated and will be removed in v2.3. Give the \`declare\` copy as \`dialogCopy\` of the DECLARE action, the \`notify\` copy as \`dialogCopy\` of the NOTIFY action, and the \`register\` copy as \`dialogCopy\` of the REGISTER action. \`opencrvs upgrade\` makes this change for you.`
      )
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it('should not replace the `supportingCopy` of the NOTIFY action, which the notify dialog showed in v2.1', () => {
      const configWithNotifyCopy = withAction(
        ActionType.NOTIFY,
        (action) => ({ ...action, supportingCopy: notifyCopy }),
        config
      )

      expect(getAction(configWithNotifyCopy, ActionType.NOTIFY)).toHaveProperty(
        'dialogCopy',
        notifyCopy
      )
    })

    it('should not replace the `supportingCopy` of the REGISTER action, and warn that the review page now shows it', () => {
      const configWithRegisterCopy = withAction(
        ActionType.REGISTER,
        (action) => ({ ...action, supportingCopy: registerCopy }),
        config
      )

      expect(
        getAction(configWithRegisterCopy, ActionType.REGISTER)
      ).toHaveProperty('dialogCopy', registerCopy)
      expect(warn).toHaveBeenCalledWith(
        `${location}: The register dialog on the review page of the DECLARE action now shows the copy of the REGISTER action. Before v2.2, it showed the \`register\` copy in \`dialogCopy\` of the DECLARE action.`
      )
    })

    it('should warn when the event has no REGISTER action to show the `register` copy', () => {
      defineConfig({
        ...config,
        actions: config.actions.filter(
          ({ type }) => type !== ActionType.REGISTER
        )
      })

      expect(warn).toHaveBeenCalledWith(
        `${location}: The event has no REGISTER action, so no dialog shows the \`register\` copy in \`dialogCopy\` of the DECLARE action. To show it, add a REGISTER action with \`dialogCopy\`.`
      )
    })
  })

  // The events service parses the config that a country config of v2.1 serves
  it('should read the copy of v2.1 from a served config that defineConfig did not change', () => {
    const served = JSON.parse(
      JSON.stringify(defineConfig(tennisClubMembershipEvent))
    )
    served.versions[0].actions = served.versions[0].actions.map(
      (action: { type: string }) => {
        if (action.type === ActionType.REJECT) {
          return { ...action, supportingCopy: registerCopy }
        }
        if (action.type === ActionType.DECLARE) {
          return { ...action, dialogCopy: deprecatedDeclareDialogCopy }
        }
        return action
      }
    )

    const eventConfiguration = resolveEventConfig(
      VersionedEventConfig.parse(served)
    )
    const getServedAction = (actionType: ActionType) =>
      getActionConfig({ eventConfiguration, actionType })

    expect(getServedAction(ActionType.REJECT)).toHaveProperty(
      'dialogCopy',
      registerCopy
    )
    expect(getServedAction(ActionType.REJECT)).not.toHaveProperty(
      'supportingCopy'
    )
    expect(getServedAction(ActionType.DECLARE)).toHaveProperty(
      'dialogCopy',
      declareCopy
    )
    expect(getServedAction(ActionType.NOTIFY)).toHaveProperty(
      'dialogCopy',
      notifyCopyOfDeclare
    )
    expect(getServedAction(ActionType.REGISTER)).toHaveProperty(
      'dialogCopy',
      registerCopyOfDeclare
    )
  })
})
