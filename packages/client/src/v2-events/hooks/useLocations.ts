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

import {
  useQuery,
  useSuspenseQuery,
  UseQueryResult
} from '@tanstack/react-query'
import {
  ClientLocation,
  toClientLocation,
  UUID
} from '@opencrvs/commons/client'
import { trpcClient, trpcOptionsProxy, useTRPC } from '@client/v2-events/trpc'
import { setQueryDefaults } from '../features/events/useEvents/procedures/utils'
import {
  applySync,
  fromFullFetch,
  isSyncedCache,
  LOCATION_LIST_STALE_TIME_MS,
  SyncedCache
} from './incremental-sync'

setQueryDefaults(trpcOptionsProxy.locations.list, {
  meta: {
    useLargeQueryStorage: true
  },
  // The cached value is a `SyncedCache`, not the `list` response, and the hooks
  // below read its `rows`. When the client has no cache, or the cache has
  // another shape, the query calls `list` for all rows. When the client already
  // has a cache, it calls `sync` for the changed rows only. Both paths strip the
  // server-flattened `name`/`status`/`externalId` as the cache is built, so no
  // client code can read a location's current name without going through the
  // anchored resolution utilities.
  queryFn: async ({ client, queryKey, signal }) => {
    const cached = client.getQueryData<unknown>(queryKey)

    if (!isSyncedCache<ClientLocation>(cached) || !cached.syncedAt) {
      const locations = await trpcClient.locations.list.query(undefined, {
        signal
      })
      return fromFullFetch(locations.map(toClientLocation))
    }

    const { syncedAt, locations } = await trpcClient.locations.sync.query(
      { since: cached.syncedAt },
      { signal }
    )
    return applySync(cached, syncedAt, locations.map(toClientLocation))
  },
  staleTime: LOCATION_LIST_STALE_TIME_MS
})

setQueryDefaults(trpcOptionsProxy.locations.get, {
  queryFn: async (...params) => {
    const {
      queryKey: [, input]
    } = params[0]

    const queryOptions = trpcOptionsProxy.locations.get.queryOptions(
      input.input
    )

    if (typeof queryOptions.queryFn !== 'function') {
      throw new Error('queryFn is not a function')
    }

    const location = await queryOptions.queryFn(...params)
    return toClientLocation(location)
  },
  staleTime: 1000 * 60 * 60 * 24
})

setQueryDefaults(trpcOptionsProxy.locations.getLocationHierarchy, {
  queryFn: async (...params) => {
    const {
      queryKey: [, input]
    } = params[0]

    const queryOptions =
      trpcOptionsProxy.locations.getLocationHierarchy.queryOptions(input.input)

    if (typeof queryOptions.queryFn !== 'function') {
      throw new Error('queryFn is not a function')
    }

    return await queryOptions.queryFn(...params)
  },
  staleTime: 1000 * 60 * 60 * 24
})

export function useLocations() {
  const trpc = useTRPC()
  return {
    getLocations: {
      useSuspenseQuery: () => {
        // We intentionally remove `queryFn` here because we already set a global default
        // via `setQueryDefaults`. Passing it again would override caching/persistence.
        // The `...rest` spread carries the query key and things like staleTime, gcTime, enabled, etc.
        // Do not pass an input to `queryOptions()`. An input changes the key,
        // so the hook stops sharing the cache entry that `PrefetchQueries`
        // fills and the list is fetched and stored twice. Filter the result instead.
        const { queryFn, ...rest } =
          trpcOptionsProxy.locations.list.queryOptions()

        return useSuspenseQuery({
          ...rest,
          select: (data) =>
            (data as unknown as SyncedCache<ClientLocation>).rows
        }).data
      }
    },
    getLocation: {
      useQuery: (id: string, options?: { refetchInterval?: number }) => {
        const { queryFn, ...rest } =
          trpcOptionsProxy.locations.get.queryOptions({ id })
        // The queryFn override above returns a `ClientLocation` (flattened
        // `name`/`status`/`externalId` stripped), but tRPC still infers the
        // server `Location` type here. Cast so callers can't read a location's
        // current name without going through the anchored resolution utilities.
        return useQuery({
          ...rest,
          ...options,
          queryKey: trpc.locations.get.queryKey({ id })
        }) as unknown as UseQueryResult<ClientLocation>
      }
    },
    getLocationHierarchy: {
      useSuspenseQuery: (locationId: UUID) => {
        const { queryFn, ...options } =
          trpcOptionsProxy.locations.getLocationHierarchy.queryOptions({
            locationId
          })
        return useSuspenseQuery({
          ...options,
          queryKey: trpc.locations.getLocationHierarchy.queryKey({
            locationId
          })
        }).data
      },
      useQuery: (
        locationId: UUID,
        options?: {
          enabled?: boolean
        }
      ) => {
        const { queryFn, ...rest } =
          trpcOptionsProxy.locations.getLocationHierarchy.queryOptions({
            locationId
          })
        return useQuery({
          ...rest,
          ...options,
          queryKey: trpc.locations.getLocationHierarchy.queryKey({
            locationId
          })
        }).data
      }
    }
  }
}
