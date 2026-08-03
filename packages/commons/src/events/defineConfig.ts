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

import { cloneDeep } from 'lodash'
import { ActionType } from './ActionType'
import { EventConfig, EventConfigInput } from './EventConfig'

const IGNORED_EVENT_TYPES = [
  'FOOTBALL_CLUB_MEMBERSHIP',
  'tennis-club-membership',
  'library-membership',
  'child-onboarding',
  'digital-identity',
  'event-with-optional-address'
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

export const defineConfig = (config: EventConfigInput) => {
  const input = EventConfig.parse(config)

  warnOnConfigurationIssues(input)

  return input
}

/**
 * Authors a new form version as a diff of a previous one, instead of
 * hand-copying the whole form.
 *
 * `patch` receives a mutable clone of `previous` — mutate it directly (e.g.
 * via `getDeclarationFieldById(draft, id)`, which returns a live reference
 * into `draft.declaration.pages[...].fields[...]`). The result is still a
 * complete, independent `EventConfig`, validated by the same
 * `EventConfig.parse` as any other version — so referential integrity
 * (dangling conditionals, missing field ids, etc.) is checked for the
 * resulting snapshot exactly as it would be for a hand-written one.
 *
 * This is also the right tool for fixing an already-effective historical
 * version in place: call it with the same `version`/`effectiveFrom` as
 * before, patching whatever needs correcting. Historical versions are
 * intentionally mutable — see the form-versioning design doc.
 *
 * @example
 * export const birthV2 = defineNextVersion(
 *   birthV1,
 *   { version: 'v2', effectiveFrom: '2027-01-01' },
 *   (draft) => {
 *     getDeclarationFieldById(draft, 'informant.nationalId').required = true
 *   }
 * )
 */
export const defineNextVersion = (
  previous: EventConfig,
  meta: {
    version: string
    effectiveFrom: string
    effectiveTo?: string
    versionLabel?: EventConfigInput['versionLabel']
  },
  patch: (draft: EventConfig) => void
): EventConfig => {
  const draft = cloneDeep(previous)
  patch(draft)

  return defineConfig({
    ...draft,
    ...meta,
    supersedes: previous.version
  } as EventConfigInput)
}
