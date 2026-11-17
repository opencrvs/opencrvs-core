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
import {
  applySync,
  fromFullFetch,
  isSyncedCache,
  SyncedCache
} from './incremental-sync'

interface Row {
  id: UUID
  updatedAt: string
  name: string
}

function row(id: string, updatedAt: string, name = id): Row {
  return { id: id as UUID, updatedAt, name }
}

function toMap(rows: Row[]) {
  return new Map(rows.map((r) => [r.id, r]))
}

describe('isSyncedCache', () => {
  it('accepts a synced cache', () => {
    expect(isSyncedCache({ syncedAt: undefined, rows: new Map() })).toBe(true)
  })

  it('rejects the cache shapes of earlier client versions', () => {
    expect(isSyncedCache(undefined)).toBe(false)
    expect(isSyncedCache(new Map())).toBe(false)
    expect(isSyncedCache([])).toBe(false)
  })
})

describe('fromFullFetch', () => {
  it('uses the latest updatedAt as syncedAt', () => {
    const cache = fromFullFetch([
      row('a', '2026-01-01T10:00:00.000Z'),
      row('b', '2026-03-01T09:00:00.123Z'),
      row('c', '2026-02-01T23:59:59.999Z')
    ])

    expect(cache.syncedAt).toBe('2026-03-01T09:00:00.123Z')
    expect([...cache.rows.keys()]).toEqual(['a', 'b', 'c'])
  })

  it('has no syncedAt when the list is empty', () => {
    expect(fromFullFetch([]).syncedAt).toBeUndefined()
  })
})

describe('applySync', () => {
  const cached: SyncedCache<Row> = {
    syncedAt: '2026-01-01T12:00:00.000Z',
    rows: toMap([
      row('a', '2026-01-01T10:00:00.000Z', 'Old A'),
      row('b', '2026-01-01T10:00:00.000Z', 'B')
    ])
  }
  const NEXT_SYNC = '2026-01-02T12:00:00.000Z'

  it('returns the same reference and keeps syncedAt when no rows are returned', () => {
    expect(applySync(cached, NEXT_SYNC, [])).toBe(cached)
  })

  it('moves syncedAt but keeps the rows reference when only cached rows come back', () => {
    const resent = [row('a', '2026-01-01T10:00:00.000Z', 'Old A')]

    const next = applySync(cached, NEXT_SYNC, resent)

    expect(next.syncedAt).toBe(NEXT_SYNC)
    expect(next.rows).toBe(cached.rows)
  })

  it('replaces a changed entry as a whole and keeps the others', () => {
    const next = applySync(cached, NEXT_SYNC, [
      row('a', '2026-01-02T10:00:00.000Z', 'New A')
    ])

    expect(next.rows).not.toBe(cached.rows)
    expect(next.rows.get('a' as UUID)).toEqual(
      row('a', '2026-01-02T10:00:00.000Z', 'New A')
    )
    expect(next.rows.get('b' as UUID)).toBe(cached.rows.get('b' as UUID))
  })

  it('adds an entry that is not cached', () => {
    const next = applySync(cached, NEXT_SYNC, [
      row('c', '2026-01-02T10:00:00.000Z')
    ])

    expect([...next.rows.keys()]).toEqual(['a', 'b', 'c'])
  })

  it('does not change the cached map', () => {
    applySync(cached, NEXT_SYNC, [row('c', '2026-01-02T10:00:00.000Z')])

    expect(cached.rows.size).toBe(2)
  })
})
