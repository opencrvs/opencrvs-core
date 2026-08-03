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
import { minBy } from 'lodash'
import {
  EventConfig,
  logger,
  resolveVersionForDate,
  toPlainDate,
  UUID
} from '@opencrvs/commons'
import {
  getEventsMissingConfigVersion,
  setConfigVersionForEvents
} from '@events/storage/postgres/events/events'

const BACKFILL_BATCH_SIZE = 300

/**
 * Resolves the version a pre-existing event should be pinned to, for the
 * one-time backfill only. Unlike live validation/rendering (which should
 * throw on a gap — see `resolveVersionForDate` callers), a backfill gap must
 * degrade to a best-effort assignment rather than abort the whole job: it
 * clamps to the earliest known version for the type and logs a warning,
 * which only fires if a country set their inaugural version's
 * `effectiveFrom` later than some of their real historical data.
 */
function resolveConfigVersionForBackfill(
  configurations: EventConfig[],
  eventType: string,
  createdAt: string
): string {
  const date = toPlainDate(createdAt)

  try {
    return resolveVersionForDate(configurations, eventType, date).version
  } catch {
    const earliest = minBy(
      configurations.filter((config) => config.id === eventType),
      (config) => config.effectiveFrom
    )

    // getEventsMissingConfigVersion only selects types present in
    // `configurations`, so this can't actually be undefined — but don't let a
    // future refactor of that guarantee turn into a silent no-op here.
    if (!earliest) {
      throw new Error(
        `No configuration found for event type '${eventType}' during configVersion backfill.`
      )
    }

    logger.warn(
      `No config version window covers ${eventType} record created at ${createdAt}; ` +
        `clamping to earliest known version '${earliest.version}' (effective from ${earliest.effectiveFrom}).`
    )
    return earliest.version
  }
}

/**
 * One-time backfill for events created before form versioning existed.
 *
 * Every existing record is pinned explicitly, once, rather than left to
 * perpetually re-resolve via `getEventConfigurationForEvent`'s `createdAt`
 * fallback — an unpinned record's applicable version would otherwise be
 * recomputed on every read against whatever versions currently exist, which
 * can silently drift if a country later splits a broad legacy version into
 * finer-grained historical ones. Pinning now, once, is what makes
 * `configVersion` an actual immutable audit trail for pre-existing data, not
 * just for new records.
 *
 * Safe to call on every boot: idempotent (only ever touches
 * `configVersion IS NULL` rows) and a no-op once fully backfilled.
 *
 * @returns the number of events backfilled.
 */
export async function backfillMissingConfigVersions(
  configurations: EventConfig[]
): Promise<number> {
  const configuredEventTypes = [
    ...new Set(configurations.map((config) => config.id))
  ]

  let totalBackfilled = 0

  for (;;) {
    const rows = await getEventsMissingConfigVersion(
      configuredEventTypes,
      BACKFILL_BATCH_SIZE
    )

    if (rows.length === 0) {
      break
    }

    const idsByVersion = new Map<string, UUID[]>()
    for (const row of rows) {
      const version = resolveConfigVersionForBackfill(
        configurations,
        row.eventType,
        row.createdAt
      )
      idsByVersion.set(version, [...(idsByVersion.get(version) ?? []), row.id])
    }

    for (const [version, ids] of idsByVersion) {
      await setConfigVersionForEvents(ids, version)
    }

    totalBackfilled += rows.length
  }

  if (totalBackfilled > 0) {
    logger.info(
      `Backfilled configVersion for ${totalBackfilled} pre-existing event(s).`
    )
  }

  return totalBackfilled
}
