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

import { TRPCError } from '@trpc/server'
import {
  ActionConfig,
  ActionInputWithType,
  ActionStatus,
  ActionType,
  EventConfig,
  EventDocument,
  getActionConfig,
  getActionVersionKey,
  getDeclarationFields,
  getEventConfigEffectiveAt,
  isActionConfigType,
  toPlainDate
} from '@opencrvs/commons'

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

/**
 * The date (YYYY-MM-DD) whose configuration an action uses.
 * @TODO: compares UTC dates. Legislation takes effect at local midnight, so this may
 * need the country's time zone (open question in #13602).
 */
export function getActionAnchorDate(
  input: ActionInputWithType,
  event: EventDocument,
  now: Date
) {
  return toPlainDate(
    isAnchoredAtEventCreation(input.type) ? event.createdAt : now.toISOString()
  )
}

const swappedViews = new WeakMap<EventConfig, Map<string, EventConfig>>()

/**
 * `view` with each action of `versions` replaced by (or, when absent, extended with)
 * the given version. Returns `view` itself when it already holds every version, and
 * the same object for the same view and versions, so caches keyed on the config
 * (e.g. the derived notification form) keep working.
 */
function withVersions(
  view: EventConfig,
  versions: ActionConfig[]
): EventConfig {
  const replaced = versions.filter((version) => !view.actions.includes(version))
  if (replaced.length === 0) {
    return view
  }

  const cacheKey = replaced
    .map(
      (version) => `${getActionVersionKey(version)}@${version.effectiveFrom}`
    )
    .join('|')
  const cached = swappedViews.get(view)?.get(cacheKey)
  if (cached) {
    return cached
  }

  const keys = new Set(replaced.map(getActionVersionKey))
  const swapped = {
    ...view,
    actions: [
      ...view.actions.filter(
        (action) => !keys.has(getActionVersionKey(action))
      ),
      ...replaced
    ]
  }
  swappedViews.set(
    view,
    (swappedViews.get(view) ?? new Map()).set(cacheKey, swapped)
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
    toPlainDate(event.createdAt)
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
 * The configuration an action is validated and performed with: for each action,
 * the version effective at the action's anchor date. Actions anchored at now still
 * read the record's declaration with the DECLARE / NOTIFY version it was made with.
 */
export function getEventConfigForAction(
  config: EventConfig,
  input: ActionInputWithType,
  event: EventDocument,
  now: Date
) {
  const view = getEventConfigEffectiveAt(
    config,
    getActionAnchorDate(input, event, now)
  )

  return isAnchoredAtEventCreation(input.type)
    ? view
    : withVersions(view, getRecordDeclarationVersions(config, event))
}

/**
 * Whether storing the action needs the record: to stamp a version (confirmations and
 * configured actions) or to check the files of the declaration it carries.
 */
export function requiresVersionResolution(input: ActionInputWithType) {
  return (
    Boolean(input.originalActionId) ||
    isActionConfigType(input.type) ||
    Object.keys(input.declaration).length > 0
  )
}

/**
 * `effectiveFrom` to store on a new action. A confirmation (Accepted/Rejected
 * following a Requested action) keeps the stamp of the action it confirms.
 */
export function resolveEffectiveFromForAction(
  config: EventConfig,
  input: ActionInputWithType,
  event: EventDocument,
  now: Date
): string | undefined {
  if (input.originalActionId) {
    return (
      event.actions.find(({ id }) => id === input.originalActionId)
        ?.effectiveFrom ?? undefined
    )
  }

  // CREATE, READ, ASSIGN etc. have no configured version to stamp.
  if (!isActionConfigType(input.type)) {
    return undefined
  }

  return getActionConfig({
    eventConfiguration: getEventConfigForAction(config, input, event, now),
    actionType: input.type,
    customActionType:
      input.type === ActionType.CUSTOM ? input.customActionType : undefined
  })?.effectiveFrom
}

/**
 * What storing an action takes from its version: the declaration fields whose files
 * are checked, and the `effectiveFrom` stamped on it. Without the record (an action
 * that needs no version, see `requiresVersionResolution`) nothing is stamped.
 */
export function getActionVersioning(
  config: EventConfig,
  input: ActionInputWithType,
  event: EventDocument | undefined,
  now: Date
) {
  if (!event) {
    return {
      declarationFields: getDeclarationFields(config),
      effectiveFrom: undefined
    }
  }

  return {
    declarationFields: getDeclarationFields(
      getEventConfigForAction(config, input, event, now)
    ),
    effectiveFrom: resolveEffectiveFromForAction(config, input, event, now)
  }
}

/**
 * Throws tRPC HTTP 409 when the action is configured, but every version of it
 * takes effect after the date `eventConfiguration` is the view of. For DECLARE and
 * NOTIFY that date is the record's creation (`recordCreatedOn`): a record created
 * before every version of them cannot be declared or notified.
 */
export function throwConflictIfActionNotInEffect({
  fetchedEventConfiguration,
  eventConfiguration,
  actionType,
  customActionType,
  recordCreatedOn
}: {
  fetchedEventConfiguration: EventConfig
  eventConfiguration: EventConfig
  actionType: ActionType
  customActionType?: string
  recordCreatedOn?: string
}) {
  const findConfig = (configuration: EventConfig) =>
    getActionConfig({
      eventConfiguration: configuration,
      actionType,
      customActionType
    })

  if (
    findConfig(fetchedEventConfiguration) &&
    !findConfig(eventConfiguration)
  ) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: recordCreatedOn
        ? `Action '${actionType}' has no version in effect on ${recordCreatedOn}, when the record was created, action cannot be performed`
        : `Action '${actionType}' is not in effect yet, action cannot be performed`
    })
  }
}

/**
 * The configuration a confirmation of a Requested action is validated with: the
 * action's version the Requested action is stamped with (no stamp: the undated
 * version). When that version is no longer configured, the action's usual view.
 */
export function getEventConfigForConfirmation(
  config: EventConfig,
  input: ActionInputWithType,
  event: EventDocument,
  originalActionId: string | undefined,
  now: Date
): EventConfig {
  const view = getEventConfigForAction(config, input, event, now)
  const original = event.actions.find(({ id }) => id === originalActionId)
  const stamp = original?.effectiveFrom ?? undefined
  const key = getActionVersionKey(input)
  const stamped = config.actions.find(
    (action) =>
      getActionVersionKey(action) === key && action.effectiveFrom === stamp
  )

  return original && stamped ? withVersions(view, [stamped]) : view
}
