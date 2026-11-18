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
import { UUID } from '@opencrvs/commons/client'

/**
 * Stale time of the location and administrative area lists. A refetch asks
 * the server only for rows written since the previous sync, so it is cheap and
 * can run often.
 */
export const LOCATION_LIST_STALE_TIME_MS = 1000 * 60

interface SyncedRow {
  id: UUID
  updatedAt: string
}

/**
 * The cached value of a list that syncs incrementally.
 *
 * The next sync sends `syncedAt` as `since`, and the server returns the rows
 * written after it, plus the rows of its sync window before it. When
 * `syncedAt` is earlier than the real time of the fetch, the next sync returns
 * some rows that the cache already has. This is correct, because no rows are
 * lost.
 */
export interface SyncedCache<T extends SyncedRow> {
  /** `undefined` when the list was empty. The next fetch is then a full fetch. */
  syncedAt: string | undefined
  rows: Map<UUID, T>
}

/**
 * Returns `true` when the cached value has the shape of {@link SyncedCache}.
 * When the cache has another shape, for example a `Map` from an earlier client
 * version, the caller does a full fetch.
 */
export function isSyncedCache<T extends SyncedRow>(
  value: unknown
): value is SyncedCache<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'syncedAt' in value &&
    'rows' in value &&
    value.rows instanceof Map
  )
}

/**
 * Builds the cache from a full fetch.
 *
 * The full list does not carry the server time, so `syncedAt` is the latest
 * `updatedAt` in the list. That time is before the fetch, so it is correct
 * (see {@link SyncedCache}). The first sync returns the rows of the window
 * before it again, and gives the real `syncedAt`.
 *
 * `updatedAt` values are ISO strings in UTC at millisecond precision, so
 * string order is time order.
 */
export function fromFullFetch<T extends SyncedRow>(rows: T[]): SyncedCache<T> {
  let syncedAt: string | undefined
  for (const row of rows) {
    if (syncedAt === undefined || row.updatedAt > syncedAt) {
      syncedAt = row.updatedAt
    }
  }

  return { syncedAt, rows: new Map(rows.map((row) => [row.id, row])) }
}

/**
 * Applies synced rows to the cached rows. Each row replaces the cached entry
 * with the same id as a whole, or is added when it is new.
 *
 * Returns the same `cached` reference when no row changed, so that the
 * consumers of the rows do not re-render. Each write to a row sets a new
 * `updatedAt`, so the same `updatedAt` means the same row.
 */
function applySyncedRows<T extends SyncedRow>(
  cached: Map<UUID, T>,
  rows: T[]
): Map<UUID, T> {
  const changed = rows.filter(
    (row) => cached.get(row.id)?.updatedAt !== row.updatedAt
  )

  if (changed.length === 0) {
    return cached
  }

  const next = new Map(cached)
  for (const row of changed) {
    next.set(row.id, row)
  }

  return next
}

/**
 * Applies the result of a sync to the cache.
 *
 * Returns the same `cached` reference when the sync returned no rows, so that
 * subscribers do not re-render and the persister does not write. This is the
 * normal case. `syncedAt` then stays at the earlier value, which is correct
 * (see {@link SyncedCache}).
 *
 * When the sync returned rows, `syncedAt` moves to the new value. The rows
 * can be ones that the cache already has, because the server sends the rows
 * of the window before `since` again. Moving `syncedAt` stops them from
 * coming back on each sync.
 */
export function applySync<T extends SyncedRow>(
  cached: SyncedCache<T>,
  syncedAt: string,
  rows: T[]
): SyncedCache<T> {
  if (rows.length === 0) {
    return cached
  }

  return { syncedAt, rows: applySyncedRows(cached.rows, rows) }
}
