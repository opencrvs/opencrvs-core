/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import isBefore from 'date-fns/isBefore'
import lastDayOfMonth from 'date-fns/lastDayOfMonth'
import subMonths from 'date-fns/subMonths'
import subYears from 'date-fns/subYears'

/**
 * Removes old cache entries
 *
 * Based on requirements in OCRVS-5151, e.g. when we get to the May 2023, we clear out March 2022 and older values
 */
export const clearOldCacheEntries = (
  client: ApolloClient<NormalizedCacheObject>
) => {
  const evictBeforeThisDate = lastDayOfMonth(
    subMonths(subYears(new Date(), 1), 2)
  )

  const cache = client.cache.extract()
  const cacheEntries = cache['ROOT_QUERY']
  if (!cacheEntries) {
    return
  }

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
    delete cacheEntries[toEvictKey]
    // eslint-disable-next-line no-console
    console.debug('[Clear Apollo cache]', 'Evicting', toEvictKey)
  }

  // Purge all items in cache that don't get referenced from anywhere anymore
  client.cache.gc()
}
