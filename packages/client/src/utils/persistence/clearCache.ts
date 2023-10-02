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
import { ApolloCache, NormalizedCacheObject } from '@apollo/client'
import { IDeclaration } from '@client/declarations'
import isBefore from 'date-fns/isBefore'
import endOfMonth from 'date-fns/endOfMonth'
import subMonths from 'date-fns/subMonths'
import subYears from 'date-fns/subYears'

/**
 * Removes old cache entries
 *
 * Based on requirements in OCRVS-5151, e.g. when we get to the May 2023, we clear out March 2022 and older values
 */
export const clearOldCacheEntries = (
  cache: ApolloCache<NormalizedCacheObject>,
  currentDate = new Date()
) => {
  const cacheState = cache.extract()
  const cacheEntries = cacheState['ROOT_QUERY']
  if (!cacheEntries) {
    return
  }

  const evictBeforeThisDate = endOfMonth(subMonths(subYears(currentDate, 1), 2))

  const cacheKeysToEvict = Object.keys(cacheEntries).filter((key) => {
    // Finds ISO date string from a key like
    // getTotalMetrics({"event":"BIRTH","locationId":"foo","timeEnd":"2023-05-31T20:59:59.999Z","timeStart":"2015-12-31T22:00:00.000Z"})@persist
    const timeStartString = /"timeStart":"(.+)"/g.exec(key)?.[1]

    if (!timeStartString) {
      return false
    }

    const timeStart = new Date(timeStartString)
    return isBefore(timeStart, evictBeforeThisDate)
  })

  for (const toEvictKey of cacheKeysToEvict) {
    // eslint-disable-next-line no-console
    console.debug('[Clear Apollo cache]', 'Evicting', toEvictKey)
    cache.evict({ id: 'ROOT_QUERY', fieldName: toEvictKey })
  }

  // Purge all items in cache that don't get referenced from anywhere anymore
  cache.gc()
}

/**
 * Removes view record cache entries that aren't referenced anymore
 */
export const clearUnusedViewRecordCacheEntries = (
  cache: ApolloCache<NormalizedCacheObject>,
  currentDeclarations: Pick<IDeclaration, 'id' | 'duplicates'>[]
) => {
  const cacheState = cache.extract()
  const cacheEntries = cacheState['ROOT_QUERY']
  if (!cacheEntries) {
    return
  }

  const toBePreservedDuplicateIds = new Set(
    currentDeclarations.flatMap((declaration) =>
      (declaration.duplicates ?? []).map((duplicate) => duplicate.compositionId)
    )
  )

  const cacheKeysToEvict = Object.keys(cacheEntries).filter((key) => {
    // Finds the record id from the cache key
    // fetchRegistrationForViewing({"id":"0c121971-4e90-4682-be5e-cff39cc897d6"})@persist
    const recordId =
      /^fetchRegistrationForViewing\({"id":"(.+)"}\)@persist$/g.exec(key)?.[1]

    if (!recordId) {
      return false
    }

    if (toBePreservedDuplicateIds.has(recordId)) {
      return false
    }

    return true
  })

  for (const toEvictKey of cacheKeysToEvict) {
    // eslint-disable-next-line no-console
    console.debug('[Clear Apollo cache]', 'Evicting', toEvictKey)
    cache.evict({ id: 'ROOT_QUERY', fieldName: toEvictKey })
  }

  // Purge all items in cache that don't get referenced from anywhere anymore
  cache.gc()
}
