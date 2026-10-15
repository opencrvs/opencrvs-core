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

import { groupBy, uniqBy } from 'lodash'
import { EventConfig } from './EventConfig'
import { ActionType } from './ActionType'
import { ActionConfig, DeclareActionConfig } from './ActionConfig'
import { FieldConfig } from './FieldConfig'

/**
 * Identifies an action across its versions. Custom actions are keyed apart from core
 * actions, so a custom action whose `customActionType` matches a core action type
 * (e.g. 'DECLARE') is not taken for a version of it.
 */
export function getActionVersionKey(action: {
  type: string
  customActionType?: string
}) {
  return action.type === ActionType.CUSTOM
    ? `${ActionType.CUSTOM}.${action.customActionType}`
    : action.type
}

/** Sort key: a version without `effectiveFrom` is effective from the beginning of time. */
function startOf(version: { effectiveFrom?: string }) {
  return version.effectiveFrom ?? ''
}

/**
 * @returns the version with the latest `effectiveFrom` not after `date` (YYYY-MM-DD).
 */
export function resolveActionVersion<T extends { effectiveFrom?: string }>(
  versions: T[],
  date: string
): T | undefined {
  return [...versions]
    .sort((a, b) => startOf(a).localeCompare(startOf(b)))
    .filter((version) => startOf(version) <= date)
    .at(-1)
}

/**
 * `config` with only the version of each action effective at `date` (YYYY-MM-DD),
 * so helpers that take the first action of a type find that version. An action
 * whose every version starts after `date` is left out.
 */
function buildEventConfigEffectiveAt(
  config: EventConfig,
  date: string
): EventConfig {
  const effectiveVersions = new Set(
    Object.values(
      groupBy<ActionConfig>(config.actions, getActionVersionKey)
    ).map((versions) => resolveActionVersion(versions, date))
  )
  // Filtered rather than built from the versions, to keep the configured order.
  const actions = config.actions.filter((action) =>
    effectiveVersions.has(action)
  )

  return { ...config, actions }
}

const effectiveConfigs = new WeakMap<EventConfig, Map<string, EventConfig>>()

/**
 * Memoised `buildEventConfigEffectiveAt`: the same config and date give the same
 * object, so caches keyed on the config (e.g. the derived notification form) keep
 * working across requests.
 */
export function getEventConfigEffectiveAt(
  config: EventConfig,
  date: string
): EventConfig {
  const configsByDate =
    effectiveConfigs.get(config) ?? new Map<string, EventConfig>()
  effectiveConfigs.set(config, configsByDate)

  const effectiveConfig =
    configsByDate.get(date) ?? buildEventConfigEffectiveAt(config, date)
  configsByDate.set(date, effectiveConfig)
  return effectiveConfig
}

/**
 * The declaration fields of every DECLARE version, so a record declared with any
 * version can be indexed and searched. A field id defined by several versions
 * takes the first-listed version's field.
 */
export function getAllDeclarationFields(config: EventConfig): FieldConfig[] {
  return uniqBy(
    config.actions
      .filter(
        (action): action is DeclareActionConfig =>
          action.type === ActionType.DECLARE
      )
      .flatMap(({ declaration }) =>
        declaration.pages.flatMap(({ fields }) => fields)
      ),
    (field) => field.id
  )
}
