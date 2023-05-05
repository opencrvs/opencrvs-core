import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { isBefore } from 'date-fns'
import subMonths from 'date-fns/subMonths'
import subYears from 'date-fns/subYears'

/**
 * Removes old cache entries
 *
 * Based on requirements in OCRVS-5151, e.g. when we get to the May 2023, we clear out March 2022 values
 */
export const clearOldCacheEntries = (
  client: ApolloClient<NormalizedCacheObject>
) => {
  const evictBeforeThisDate = subMonths(subYears(new Date(), 1), 2)

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

    const timeStart = new Date(timeStartString!)
    return isBefore(timeStart, evictBeforeThisDate)
  })

  for (const toEvictKey of cacheKeysToEvict) {
    delete cacheEntries[toEvictKey]
    console.debug('[Clear Apollo cache]', 'Evicting', toEvictKey)
  }
}
