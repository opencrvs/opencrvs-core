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
import { uniq } from 'lodash'
import { ActionType } from '../events/ActionType'
import { EventConfig } from '../events/EventConfig'
import { EventStatus } from '../events/EventStatus'
import { Role, Roles } from './Role'
import { decodeScope, getScopeOptionValue, Scope, ScopeType } from './scopes'

/**
 * The event ids a role holds scopes of `type` for, counting only the scopes
 * `include` accepts. A scope without an `event` option is valid for all event
 * types, so one such scope makes it `'all'`.
 */
function eventsWithScope(
  role: Role,
  type: ScopeType,
  include: (scope: Scope) => boolean = () => true
): string[] | 'all' {
  const scopes = role.scopes
    .map(decodeScope)
    .filter((scope): scope is Scope => scope?.type === type)
    .filter(include)

  const eventIds = scopes.map((scope) => getScopeOptionValue(scope, 'event'))

  if (eventIds.some((ids) => ids === undefined)) {
    return 'all'
  }

  return uniq(eventIds.flatMap((ids) => ids ?? []))
}

function overlap(a: string[] | 'all', b: string[] | 'all') {
  if (a === 'all') {
    return b
  }

  if (b === 'all') {
    return a
  }

  return a.filter((id) => b.includes(id))
}

/** `undefined` when there are no events to name. */
function describeEvents(events: string[] | 'all') {
  if (events === 'all') {
    return 'all events'
  }

  return events.length > 0 ? `events: ${events.join(', ')}` : undefined
}

/** A `record.edit` scope without a `status` option matches every status. */
function canEditDeclared(scope: Scope) {
  const status = getScopeOptionValue(scope, 'status')
  return status === undefined || status.includes(EventStatus.enum.DECLARED)
}

function validateEventIds(role: Role, eventConfigs: EventConfig[]) {
  const eventIds = eventConfigs.map(({ id }) => id)

  return role.scopes.flatMap((scope) => {
    const decoded = decodeScope(scope)
    const unknownIds = (
      (decoded && getScopeOptionValue(decoded, 'event')) ??
      []
    ).filter((id) => !eventIds.includes(id))

    return unknownIds.length > 0
      ? [`Scope "${scope}" contains invalid event IDs: ${unknownIds.join(', ')}`]
      : []
  })
}

function validateNoNotifyAndDeclare(role: Role) {
  const events = describeEvents(
    overlap(
      eventsWithScope(role, 'record.notify'),
      eventsWithScope(role, 'record.declare')
    )
  )

  return events
    ? [
        `record.notify and record.declare are both granted for ${events}. A role can notify or declare an event, not both.`
      ]
    : []
}

function validateNoNotifyAndEditDeclared(role: Role) {
  const events = describeEvents(
    overlap(
      eventsWithScope(role, 'record.notify'),
      eventsWithScope(role, 'record.edit', canEditDeclared)
    )
  )

  return events
    ? [
        `record.notify and a record.edit that can match DECLARED records are both granted for ${events}. Limit the role's record.edit to status NOTIFIED.`
      ]
    : []
}

function validateNotifyConfigExistsIfItsUsedInRole(
  role: Role,
  eventConfigs: EventConfig[]
) {
  const notified = eventsWithScope(role, 'record.notify')

  const withoutNotifyAction = eventConfigs
    .filter(({ id }) => notified === 'all' || notified.includes(id))
    .filter(({ actions }) =>
      actions.every(({ type }) => type !== ActionType.NOTIFY)
    )
    .map(({ id }) => id)

  return withoutNotifyAction.length > 0
    ? [
        `record.notify is granted for events without a NOTIFY action: ${withoutNotifyAction.join(', ')}`
      ]
    : []
}

/**
 * @returns a message for each rule the role breaks, empty when it is valid.
 */
export function validateRole(role: Role, eventConfigs: EventConfig[]) {
  return [
    ...validateEventIds(role, eventConfigs),
    ...validateNotifyConfigExistsIfItsUsedInRole(role, eventConfigs),
    ...validateNoNotifyAndDeclare(role),
    ...validateNoNotifyAndEditDeclared(role)
  ]
}

/**
 * Validates roles, to ensure roles fill certain application requirements.
 *
 * @param roles Array of roles in object format.
 * @param eventConfigs Array of event configurations, which are needed to run validations for scopes.
 * @throws Error if roles are invalid.
 */
export function validateRoles(roles: Roles, eventConfigs: EventConfig[]) {
  const validationErrors = roles.flatMap((role) =>
    validateRole(role, eventConfigs).map(
      (error) => `- Role '${role.id}': ${error}`
    )
  )

  if (validationErrors.length) {
    throw new Error(`Invalid roles:\n${validationErrors.join('\n')}`)
  }
}
