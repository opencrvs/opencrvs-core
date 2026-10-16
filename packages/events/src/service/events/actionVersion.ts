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

/** Clock drift tolerated on a client's `performedAt`. */
const CLOCK_SKEW_MS = 5 * 60 * 1000

/**
 * Actions another user may add while the record is assigned to someone working
 * offline. They do not change the record, so they do not bound `performedAt`.
 */
const NON_MODIFYING_ACTIONS: ActionType[] = [
  ActionType.READ,
  ActionType.ASSIGN,
  ActionType.UNASSIGN
]

/** When an action was performed: the client's `performedAt`, else when it was stored. */
function getPerformedAt(action: {
  performedAt?: string | null
  createdAt: string
}) {
  return action.performedAt ?? action.createdAt
}

/** When the record was created: (+) pressed on the client, else when the server stored it. */
export function getRecordCreatedAt(event: EventDocument) {
  return (
    event.actions.find(({ type }) => type === ActionType.CREATE)?.performedAt ??
    event.createdAt
  )
}

/**
 * Throws tRPC HTTP 400 when a client's `performedAt` is in the future or, with the
 * record given, before its latest action from another transaction, either beyond
 * clock drift: clients' clocks differ, from the server's and from each other's.
 * A record being created has no earlier action, so only the future is checked.
 * Actions sent together share a transaction (e.g. declare and register), so they
 * do not bound each other, and a confirmation of a Requested action counts at the
 * time of the action it confirms. READ, ASSIGN and UNASSIGN do not change the record, so
 * they are not bounded either.
 */
export function throwIfPerformedAtOutOfBounds(
  input: { type: ActionType; performedAt?: string; transactionId: string },
  event: EventDocument | undefined,
  now: Date
) {
  if (!input.performedAt || NON_MODIFYING_ACTIONS.includes(input.type)) {
    return
  }

  const performedAt = new Date(input.performedAt).getTime()

  if (performedAt > now.getTime() + CLOCK_SKEW_MS) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `performedAt ${input.performedAt} is in the future`
    })
  }

  const actions = event?.actions ?? []
  const latest = Math.max(
    ...actions
      .filter(
        (action) =>
          action.transactionId !== input.transactionId &&
          !NON_MODIFYING_ACTIONS.includes(action.type)
      )
      // A confirmation is stored when the country config answers, not when the user
      // acted: it is bounded by the action it confirms.
      .map((action) =>
        new Date(
          getPerformedAt(
            actions.find(({ id }) => id === action.originalActionId) ?? action
          )
        ).getTime()
      )
  )

  if (performedAt < latest - CLOCK_SKEW_MS) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `performedAt ${input.performedAt} is before the latest action of the record, performed at ${new Date(latest).toISOString()}`
    })
  }
}

/**
 * The date (YYYY-MM-DD) whose configuration an action uses: the record's creation
 * for DECLARE and NOTIFY, else when the client performed the action, else `now`.
 * @TODO: compares UTC dates. Legislation takes effect at local midnight, so this may
 * need the country's time zone (open question in #13602).
 */
export function getActionAnchorDate(
  input: ActionInputWithType,
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
function withVersions(
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
  return withVersions(
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
 * configured actions), to check the files of the declaration it carries, or to bound
 * the time the client says it performed the action.
 */
export function requiresVersionResolution(input: ActionInputWithType) {
  return (
    Boolean(input.originalActionId) ||
    Boolean(input.performedAt) ||
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
