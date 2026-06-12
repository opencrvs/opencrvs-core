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
import { logger } from '@opencrvs/commons'
import { redis } from './redis'

const TTL = 60 * 60 * 24 // 24 hours
const MEM_TTL_MS = 60 * 1000 // 1 minute
const KEY_PREFIX = 'locations:'
// Deduplicates concurrent upstream fetches during cold-cache window. Without this,
// N simultaneous misses on the same query each trigger a separate fetch. Once the
// cache warms, this map is bypassed entirely.
const inflight = new Map<string, Promise<string>>()

// Redis GET allocates a new string per call. Under high concurrency, N requests
// against a warm Redis cache = N strings in memory simultaneously. memCache keeps
// one shared copy per query, reducing allocations to one per TTL window.
type MemEntry = { body: string; expiresAt: number }
const memCache = new Map<string, MemEntry>()

export const getCachedLocations = async (query: string) => {
  const mem = memCache.get(query)
  if (mem && Date.now() < mem.expiresAt) return mem.body

  const body = await redis.get(`${KEY_PREFIX}${query}`)
  if (body) memCache.set(query, { body, expiresAt: Date.now() + MEM_TTL_MS })
  return body
}

export const setCachedLocations = (query: string, body: string) =>
  redis.set(`${KEY_PREFIX}${query}`, body, { EX: TTL })

export const bustLocationsCache = async () => {
  memCache.clear()
  const keys = await redis.keys(`${KEY_PREFIX}*`)
  if (keys.length) {
    await redis.del(keys)
    logger.info(`Locations cache busted: ${keys.length} keys cleared`)
  }
}

export const fetchAndCache = (
  query: string,
  fetcher: () => Promise<string>
): Promise<string> => {
  const existing = inflight.get(query)
  if (existing) return existing

  const promise = fetcher()
    .then((body) => {
      memCache.set(query, { body, expiresAt: Date.now() + MEM_TTL_MS })
      setCachedLocations(query, body)
      return body
    })
    .finally(() => inflight.delete(query))

  inflight.set(query, promise)
  return promise
}
