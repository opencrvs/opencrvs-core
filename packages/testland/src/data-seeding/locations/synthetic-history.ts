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

import { LocationVersion } from '@opencrvs/toolkit/events'
import { deriveUuid, shuffle } from './synthetic-primitives'

/** The beginning-of-time sentinel the server uses for a first version. */
const SENTINEL_DATE = '0001-01-01'

/** Updates are spread from here to today. */
const HISTORY_WINDOW_START = '2000-01-01'

/** Share of rows whose latest element is future-dated, i.e. pending. */
const PENDING_SHARE = 0.05

/** Share of rows that are inactive as of today, i.e. closed. */
const INACTIVE_SHARE = 0.1

/** Share of appends that rename rather than change status. */
const RENAME_SHARE = 0.8

const MS_PER_DAY = 86400000

/**
 * Version-array lengths for `count` rows whose mean is exactly `avg` and whose
 * maximum is at most `max`.
 *
 * Zipf weights hand the surplus out with a heavy tail, so the cap is genuinely
 * reached instead of everything clustering at the mean — both the typical and
 * the worst case then get exercised. A correction pass fixes integer rounding,
 * and the result is shuffled so the tall rows are not always the first ones.
 */
export function planHistoryLengths(
  count: number,
  avg: number,
  max: number,
  rng: () => number
): number[] {
  if (count === 0) {
    return []
  }

  const total = Math.min(Math.round(avg * count), count * max)
  const lengths = new Array<number>(count).fill(1)
  const surplus = total - count

  if (surplus <= 0) {
    return lengths
  }

  const weights = Array.from({ length: count }, (_, index) => 1 / (index + 1))
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0)

  for (let index = 0; index < count; index++) {
    const extra = Math.floor((surplus * weights[index]) / weightSum)
    lengths[index] = Math.min(max, 1 + extra)
  }

  // Integer division loses a few elements; hand them out (or take them back)
  // one at a time so the mean is exact rather than approximate.
  let remaining = total - lengths.reduce((sum, length) => sum + length, 0)
  let cursor = 0

  while (remaining > 0) {
    if (lengths[cursor] < max) {
      lengths[cursor]++
      remaining--
    }
    cursor = (cursor + 1) % count
  }

  while (remaining < 0) {
    if (lengths[cursor] > 1) {
      lengths[cursor]--
      remaining++
    }
    cursor = (cursor + 1) % count
  }

  return shuffle(lengths, rng)
}

/**
 * A history of exactly `length` elements for one row.
 *
 * The first element carries the sentinel date, so it matches what the create
 * path and the 1.9 backfill produce. Later elements ascend strictly through the
 * window; roughly 5% of rows end with a future-dated (pending) element, and
 * roughly 10% are inactive as of today.
 */
export function buildHistory({
  seed,
  kind,
  index,
  length,
  baseName,
  renamedName,
  externalId,
  rng
}: {
  seed: number
  kind: string
  index: number
  length: number
  baseName: string
  /**
   * The name this row carries from version `element` onward when that version is
   * a rename. Supplied by the caller so that name composition stays in one
   * place, and so a rename reads as a genuinely different place rather than an
   * annotated version of the old one.
   */
  renamedName: (element: number) => string
  externalId: string
  rng: () => number
}): LocationVersion[] {
  const isPending = rng() < PENDING_SHARE
  const endsInactive = rng() < INACTIVE_SHARE
  const dates = buildDates(length, isPending, rng)

  let name = baseName
  let status: 'active' | 'inactive' = 'active'

  return dates.map((effectiveFrom, element) => {
    if (element > 0) {
      if (rng() < RENAME_SHARE) {
        name = renamedName(element)
      } else {
        status = status === 'active' ? 'inactive' : 'active'
      }
    }

    const isLast = element === dates.length - 1

    return {
      versionId: deriveUuid(seed, kind, index, 'v', element),
      effectiveFrom,
      name,
      externalId,
      // The latest element decides what the row looks like today, so it is set
      // deliberately rather than left to the churn above.
      status: isLast ? (endsInactive ? 'inactive' : 'active') : status
    }
  })
}

/**
 * `length` strictly ascending ISO dates: the sentinel, then distinct dates in
 * [HISTORY_WINDOW_START, today), with the last one moved into the future when
 * the row is pending.
 */
function buildDates(
  length: number,
  isPending: boolean,
  rng: () => number
): string[] {
  const dates = [SENTINEL_DATE]

  if (length === 1) {
    return dates
  }

  const start = Date.parse(HISTORY_WINDOW_START)
  const span = Math.floor((Date.now() - start) / MS_PER_DAY)
  const offsets = new Set<number>()

  // Distinct day offsets, so two elements can never share an effectiveFrom.
  while (offsets.size < length - 1) {
    offsets.add(1 + Math.floor(rng() * (span - 1)))
  }

  const ascending = [...offsets].sort((left, right) => left - right)

  for (const offset of ascending) {
    dates.push(toIsoDate(start + offset * MS_PER_DAY))
  }

  if (isPending) {
    // Strictly after every past element by construction, so ordering holds.
    dates[dates.length - 1] = toIsoDate(
      Date.now() + (30 + Math.floor(rng() * 700)) * MS_PER_DAY
    )
  }

  return dates
}

function toIsoDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10)
}
