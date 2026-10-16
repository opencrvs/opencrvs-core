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
import { ActionStatus } from './ActionStatus'
import { EventDocument } from './EventDocument'
import { toPlainDate } from './PlainDate'

/** An action, by when the user performed it (`performedAt`, else now). */
type ActionPerformed = { type: ActionType; performedAt?: string }

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

/**
 * Actions started by pressing (+), which create the record. Their version is chosen
 * when the record was created, so a declaration keeps the form it was started with.
 */
const ANCHORED_AT_EVENT_CREATION: ActionType[] = [
  ActionType.DECLARE,
  ActionType.NOTIFY
]

export function isAnchoredAtEventCreation(type: ActionType) {
  return ANCHORED_AT_EVENT_CREATION.includes(type)
}

/** When the record was created: (+) pressed on the client, else when the server stored it. */
export function getRecordCreatedAt(event: EventDocument) {
  return (
    event.actions.find(({ type }) => type === ActionType.CREATE)?.performedAt ??
    event.createdAt
  )
}

/**
 * The date (YYYY-MM-DD) whose configuration an action uses: the record's creation
 * for DECLARE and NOTIFY, else when the client performed the action, else `now`.
 * @TODO: compares UTC dates. Legislation takes effect at local midnight, so this may
 * need the country's time zone (open question in #13602).
 */
export function getActionAnchorDate(
  input: ActionPerformed,
  event: EventDocument,
  now: Date
) {
  return toPlainDate(
    isAnchoredAtEventCreation(input.type)
      ? getRecordCreatedAt(event)
      : (input.performedAt ?? now.toISOString())
  )
}

const swappedConfigs = new WeakMap<EventConfig, Map<string, EventConfig>>()

/** Uses the given action versions in place of the ones in `effectiveConfig`. */
export function withActionVersions(
  effectiveConfig: EventConfig,
  versions: ActionConfig[]
): EventConfig {
  const replaced = versions.filter(
    (version) => !effectiveConfig.actions.includes(version)
  )
  if (replaced.length === 0) {
    return effectiveConfig
  }

  const cacheKey = replaced
    .map(
      (version) => `${getActionVersionKey(version)}@${version.effectiveFrom}`
    )
    .join('|')
  const cached = swappedConfigs.get(effectiveConfig)?.get(cacheKey)
  if (cached) {
    return cached
  }

  const keys = new Set(replaced.map(getActionVersionKey))
  const swapped = {
    ...effectiveConfig,
    actions: [
      ...effectiveConfig.actions.filter(
        (action) => !keys.has(getActionVersionKey(action))
      ),
      ...replaced
    ]
  }
  swappedConfigs.set(
    effectiveConfig,
    (swappedConfigs.get(effectiveConfig) ?? new Map()).set(cacheKey, swapped)
  )
  return swapped
}

/** The version of `type` with exactly this `effectiveFrom` (undefined: the undated one). */
function findVersion(
  config: EventConfig,
  type: ActionType,
  effectiveFrom: string | undefined
) {
  return config.actions.find(
    (action) => action.type === type && action.effectiveFrom === effectiveFrom
  )
}

/**
 * The DECLARE and NOTIFY versions the record's declaration belongs to, each from its
 * own stamp: the version stamped on the latest accepted action of that type, or,
 * when there is none or that version is no longer configured, the version effective
 * at the record's creation.
 */
function getRecordDeclarationVersions(
  config: EventConfig,
  event: EventDocument
): ActionConfig[] {
  const latestAcceptedFirst = event.actions
    .filter(({ status }) => status === ActionStatus.Accepted)
    .reverse()
  const atCreation = getEventConfigEffectiveAt(
    config,
    toPlainDate(getRecordCreatedAt(event))
  )

  return ANCHORED_AT_EVENT_CREATION.flatMap((type) => {
    const stampedAction = latestAcceptedFirst.find(
      (action) => action.type === type
    )
    const version =
      (stampedAction &&
        findVersion(config, type, stampedAction.effectiveFrom ?? undefined)) ??
      atCreation.actions.find((action) => action.type === type)
    return version ? [version] : []
  })
}

/**
 * The configuration in effect today, reading the record's declaration with the
 * DECLARE / NOTIFY versions it was made with. Which actions can be performed on a
 * record follows today's configuration, but the flags and state its declaration
 * produced follow the versions that captured it.
 */
export function getEventConfigForRecord(
  config: EventConfig,
  event: EventDocument,
  now: Date
) {
  return withActionVersions(
    getEventConfigEffectiveAt(config, toPlainDate(now.toISOString())),
    getRecordDeclarationVersions(config, event)
  )
}

/**
 * The configuration an action is validated and performed with: for each action,
 * the version effective at the action's anchor date. Actions anchored at now still
 * read the record's declaration with the DECLARE / NOTIFY version it was made with.
 */
export function getEventConfigForAction(
  config: EventConfig,
  input: ActionPerformed,
  event: EventDocument,
  now: Date
) {
  const view = getEventConfigEffectiveAt(
    config,
    getActionAnchorDate(input, event, now)
  )

  return isAnchoredAtEventCreation(input.type)
    ? view
    : withActionVersions(view, getRecordDeclarationVersions(config, event))
}
