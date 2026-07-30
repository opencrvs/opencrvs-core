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

import { faker } from '@faker-js/faker'
import { v5 as uuidv5 } from 'uuid'
import { UUID } from '@opencrvs/toolkit/events'

/** Fixed namespace so `deriveUuid` is stable across runs and machines. */
const UUID_NAMESPACE = '3f2a9c1e-6b4d-4f8a-9c2e-7d5b1a8e4c60'

const LEVEL_LABELS = ['Province', 'District', 'County', 'Ward']

/**
 * mulberry32. Small, fast and fully determined by its seed — the generator must
 * not depend on `Math.random`, or the same configuration would produce a
 * different country on every run.
 */
export function createRng(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * A UUID derived from the seed and an addressing tuple, e.g.
 * `deriveUuid(42, 'loc', 137, 'v', 2)`. Row ids and version ids are supplied by
 * this generator and stored verbatim, so they must be valid UUIDs and
 * reproducible. The cast is the only place the `UUID` brand is minted; uuidv5
 * output is a valid uuid by construction.
 */
export function deriveUuid(
  seed: number,
  ...parts: Array<string | number>
): UUID {
  return uuidv5(`${seed}:${parts.join(':')}`, UUID_NAMESPACE) as UUID
}

/**
 * A realistic place name that depends only on its address, not on how many
 * names were drawn before it. faker is re-seeded immediately before a single
 * synchronous draw; generation is synchronous throughout, so no interleaving
 * can disturb the sequence.
 */
export function placeName(seed: number, kind: string, index: number): string {
  faker.seed(hashToInt(`${seed}:${kind}:${index}`))

  return faker.location.city()
}

/** `Province`, `District`, … falling back to `Area` past the known labels. */
export function levelLabel(level: number): string {
  return LEVEL_LABELS[level - 1] ?? 'Area'
}

/** A uniformly distributed index in `[0, length)`. */
export function pickIndex(rng: () => number, length: number): number {
  return Math.floor(rng() * length) % length
}

/** Fisher-Yates, driven by the seeded rng. Returns a new array. */
export function shuffle<T>(items: T[], rng: () => number): T[] {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index--) {
    const target = pickIndex(rng, index + 1)
    const swap = shuffled[index]
    shuffled[index] = shuffled[target]
    shuffled[target] = swap
  }

  return shuffled
}

/** FNV-1a, so a string address can seed faker. */
function hashToInt(value: string): number {
  let hash = 0x811c9dc5

  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }

  return hash >>> 0
}
