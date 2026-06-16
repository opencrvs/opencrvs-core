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
import { promisify } from 'util'
import { gzip as _gzip } from 'zlib'
import { redis } from './redis'

const gzip = promisify(_gzip)

const TTL = 60 * 60 * 24 // 24 hours
const MEM_TTL_MS = 60 * 1000 // 1 minute
const KEY_PREFIX = 'locations:'

// Deduplicates concurrent upstream fetches during cold-cache window. Without this,
// N simultaneous misses on the same query each trigger a separate fetch. Once the
// cache warms, this map is bypassed entirely.
const inflight = new Map<string, Promise<Buffer>>()

// Redis GET allocates a new string per call. Under high concurrency, N requests
// against a warm Redis cache = N strings in memory simultaneously. memCache keeps
// one shared compressed Buffer per query, reducing allocations to one per TTL window.
// Stored compressed so write buffers to Traefik are smaller under high concurrency.
type MemEntry = { compressed: Buffer; expiresAt: number }
const memCache = new Map<string, MemEntry>()

export const getCachedLocations = async (
  query: string
): Promise<Buffer | null> => {
  const mem = memCache.get(query)
  if (mem && Date.now() < mem.expiresAt) return mem.compressed

  const stored = await redis.get(`${KEY_PREFIX}${query}`)
  if (stored) {
    const compressed = Buffer.from(stored, 'base64')
    memCache.set(query, { compressed, expiresAt: Date.now() + MEM_TTL_MS })
    return compressed
  }
  return null
}

export const setCachedLocations = (query: string, compressed: Buffer) =>
  redis.set(`${KEY_PREFIX}${query}`, compressed.toString('base64'), { EX: TTL })

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
): Promise<Buffer> => {
  const existing = inflight.get(query)
  if (existing) return existing

  const promise = fetcher()
    .then(async (body) => {
      const compressed = await gzip(body)
      memCache.set(query, { compressed, expiresAt: Date.now() + MEM_TTL_MS })
      setCachedLocations(query, compressed)
      return compressed
    })
    .finally(() => inflight.delete(query))

  inflight.set(query, promise)
  return promise
}
