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
 * `syncedAt` is the server time of the last sync. The next sync sends it as
 * `since`, and the server returns the rows written after it, plus the rows of
 * its sync window before it.
 */
export interface SyncedCache<T extends SyncedRow> {
  syncedAt: string
  rows: Map<UUID, T>
}

/**
 * Returns `true` when the cached value has the shape of {@link SyncedCache}.
 * When the cache has another shape, for example a `Map` from an earlier client
 * version, {@link syncCache} fetches all rows.
 */
export function isSyncedCache<T extends SyncedRow>(
  value: unknown
): value is SyncedCache<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'syncedAt' in value &&
    typeof value.syncedAt === 'string' &&
    'rows' in value &&
    value.rows instanceof Map
  )
}

/**
 * Returns the rows that the list hooks read from the cached value.
 *
 * When the client restores a cache from an earlier client version, the cached
 * value is a `Map` of the rows, not a {@link SyncedCache}. The hooks render it
 * until the next fetch replaces it, so that the client also works offline
 * after an update.
 */
export function rowsOf<T extends SyncedRow>(data: unknown): Map<UUID, T> {
  if (isSyncedCache<T>(data)) {
    return data.rows
  }

  if (data instanceof Map) {
    return data as Map<UUID, T>
  }

  return new Map()
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
 * normal case. `syncedAt` then stays at the earlier value. This is correct,
 * because the next sync starts from that value, so no rows are lost.
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

/**
 * Builds the next cached value with one call to the `sync` procedure.
 *
 * When the client has no cache, or the cache has another shape, it calls
 * `sync` without `since`, and the server returns all rows. When the client
 * already has a cache, it sends `syncedAt` as `since`, and the server returns
 * only the changed rows. Both paths get `syncedAt` from the server clock.
 */
export async function syncCache<T extends SyncedRow>(
  cached: unknown,
  sync: (since?: string) => Promise<{ syncedAt: string; rows: T[] }>
): Promise<SyncedCache<T>> {
  if (!isSyncedCache<T>(cached)) {
    const { syncedAt, rows } = await sync()
    return { syncedAt, rows: new Map(rows.map((row) => [row.id, row])) }
  }

  const { syncedAt, rows } = await sync(cached.syncedAt)
  return applySync(cached, syncedAt, rows)
}
