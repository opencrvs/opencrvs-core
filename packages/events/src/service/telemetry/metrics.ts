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

import { ActionStatus, ActionType } from '@opencrvs/commons'
import { getClient } from '@events/storage/postgres/events'

/**
 * A single telemetry value. Numbers land in `metrics.value` server-side;
 * strings and booleans land in `metrics.value_text`. Nested objects are not
 * allowed — breakdowns are folded into the dotted key instead
 * (e.g. `declarations.registered.birth`).
 */
type TelemetryMetricValue = number | string | boolean

/** Flat map of dotted metric keys to primitive values. */
export type TelemetryMetrics = Record<string, TelemetryMetricValue>

/** `pg` returns COUNT() as a bigint string; coerce to a JS number. */
function toCount(value: number | string | bigint): number {
  return Number(value)
}

/**
 * Gathers the usage metrics reported to the telemetry service from the events
 * database. Keys are dotted namespaces; breakdowns (e.g. per event type) are
 * folded into the key rather than nested, matching the telemetry contract.
 *
 * New keys added here need no server or schema change — they simply appear as
 * new rows in the long-format `metrics` table the moment we start sending them.
 */
export async function collectTelemetryMetrics(): Promise<TelemetryMetrics> {
  const db = getClient()

  const [totalEvents, registeredByType, certificatesByType, pending, users] =
    await Promise.all([
      db
        .selectFrom('events')
        .select((eb) => eb.fn.countAll<string>().as('count'))
        .executeTakeFirstOrThrow(),
      // Registered declarations, broken down by event type. An event counts as
      // registered once it has an Accepted REGISTER action.
      db
        .selectFrom('eventActions')
        .innerJoin('events', 'events.id', 'eventActions.eventId')
        .select((eb) => [
          'events.eventType as eventType',
          eb.fn.count<string>('eventActions.eventId').distinct().as('count')
        ])
        .where('eventActions.actionType', '=', ActionType.REGISTER)
        .where('eventActions.status', '=', ActionStatus.Accepted)
        .groupBy('events.eventType')
        .execute(),
      // Certificates printed, broken down by event type. A record can be
      // printed more than once, so every Accepted PRINT_CERTIFICATE action is
      // counted (not distinct events) — this total typically exceeds the number
      // of registrations.
      db
        .selectFrom('eventActions')
        .innerJoin('events', 'events.id', 'eventActions.eventId')
        .select((eb) => [
          'events.eventType as eventType',
          eb.fn.countAll<string>().as('count')
        ])
        .where('eventActions.actionType', '=', ActionType.PRINT_CERTIFICATE)
        .where('eventActions.status', '=', ActionStatus.Accepted)
        .groupBy('events.eventType')
        .execute(),
      // Events that have been declared but not yet registered.
      db
        .selectFrom('events')
        .select((eb) => eb.fn.countAll<string>().as('count'))
        .where((eb) =>
          eb.exists(
            eb
              .selectFrom('eventActions as declared')
              .select('declared.id')
              .whereRef('declared.eventId', '=', 'events.id')
              .where('declared.actionType', '=', ActionType.DECLARE)
              .where('declared.status', '=', ActionStatus.Accepted)
          )
        )
        .where((eb) =>
          eb.not(
            eb.exists(
              eb
                .selectFrom('eventActions as registered')
                .select('registered.id')
                .whereRef('registered.eventId', '=', 'events.id')
                .where('registered.actionType', '=', ActionType.REGISTER)
                .where('registered.status', '=', ActionStatus.Accepted)
            )
          )
        )
        .executeTakeFirstOrThrow(),
      db
        .selectFrom('users')
        .select((eb) => [
          eb.fn.countAll<string>().as('total'),
          eb.fn
            .countAll<string>()
            .filterWhere('status', '=', 'active')
            .as('active')
        ])
        .executeTakeFirstOrThrow()
    ])

  const registeredTotal = registeredByType.reduce(
    (sum, row) => sum + toCount(row.count),
    0
  )
  const certificatesTotal = certificatesByType.reduce(
    (sum, row) => sum + toCount(row.count),
    0
  )

  const metrics: TelemetryMetrics = {
    'events.total': toCount(totalEvents.count),
    'declarations.registered': registeredTotal,
    'declarations.pending': toCount(pending.count),
    'certificates.printed': certificatesTotal,
    'users.total': toCount(users.total),
    'users.active': toCount(users.active),
    'system.uptime_seconds': Math.floor(process.uptime())
  }

  // Fold the per-event-type breakdowns into the key, e.g.
  // `declarations.registered.v2.birth` and `certificates.printed.v2.birth`.
  for (const row of registeredByType) {
    metrics[`declarations.registered.${row.eventType}`] = toCount(row.count)
  }
  for (const row of certificatesByType) {
    metrics[`certificates.printed.${row.eventType}`] = toCount(row.count)
  }

  return metrics
}
