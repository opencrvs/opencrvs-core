/* eslint-disable no-console */
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

import { ActionType } from './ActionType'
import { EventConfig } from './EventConfig'
import { EventConfigInput } from './EventConfigInput'

const IGNORED_EVENT_TYPES = [
  'FOOTBALL_CLUB_MEMBERSHIP',
  'tennis-club-membership',
  'library-membership',
  'child-onboarding'
]

function warnOnConfigurationIssues(config: EventConfig) {
  const eventId = config.id

  if (IGNORED_EVENT_TYPES.includes(eventId)) {
    return
  }

  const validateDeclarationAction = config.actions.find(
    (action) =>
      action.type === ActionType.CUSTOM &&
      action.customActionType === 'VALIDATE_DECLARATION'
  )

  if (!validateDeclarationAction) {
    console.warn(
      `
       ************** WARNING **************
       A custom action with customActionType 'VALIDATE_DECLARATION' is not defined for event '${eventId}'!
       For v2.0, we expect this to be defined for all events.

       The deprecated v1.9 'ActionType.VALIDATE' actions are migrated to customActionType 'VALIDATE_DECLARATION' in v2.0.
       ************** WARNING **************
      `
    )
  }
}

/**
 * Builds a validated configuration for an event
 * @param config - Event specific configuration
 */
export const defineConfig = (config: EventConfigInput) => {
  const input = EventConfig.parse(config)

  warnOnConfigurationIssues(input)

  return input
}
