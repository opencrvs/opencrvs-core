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
import { redis } from './redis'

const TTL = 60 * 60 * 24 // 24 hours
const KEY_PREFIX = 'locations:'
const inflight = new Map<string, Promise<string>>()

export const getCachedLocations = (query: string) =>
  redis.get(`${KEY_PREFIX}${query}`)

export const setCachedLocations = (query: string, body: string) =>
  redis.set(`${KEY_PREFIX}${query}`, body, { EX: TTL })

export const bustLocationsCache = async () => {
  const keys = await redis.keys(`${KEY_PREFIX}*`)
  if (keys.length) await redis.del(keys)
}

export const fetchAndCache = (
  query: string,
  fetcher: () => Promise<string>
): Promise<string> => {
  const existing = inflight.get(query)
  if (existing) return existing

  const promise = fetcher()
    .then((body) => {
      setCachedLocations(query, body)
      return body
    })
    .finally(() => inflight.delete(query))

  inflight.set(query, promise)
  return promise
}
