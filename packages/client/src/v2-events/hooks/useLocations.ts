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

import { useSuspenseQuery } from '@tanstack/react-query'
import { Location, UUID } from '@opencrvs/commons/client'
import { trpcOptionsProxy, useTRPC } from '@client/v2-events/trpc'
import { setQueryDefaults } from '../features/events/useEvents/procedures/utils'

setQueryDefaults(trpcOptionsProxy.locations.list, {
  meta: {
    useLargeQueryStorage: true
  },
  queryFn: async (...params) => {
    const queryOptions = trpcOptionsProxy.locations.list.queryOptions()
    if (typeof queryOptions.queryFn !== 'function') {
      throw new Error('queryFn is not a function')
    }

    return queryOptions.queryFn(...params)
  },
  staleTime: 1000 * 60 * 60 * 24 // keep it in cache 1 day
})

export function useLocations() {
  const trpc = useTRPC()
  return {
    getLocations: {
      useSuspenseQuery: ({
        isActive,
        locationIds,
        locationType
      }: {
        isActive?: boolean
        locationIds?: UUID[]
        locationType?: string
      } = {}) => {
        // We intentionally remove `queryFn` here because we already set a global default
        // via `setQueryDefaults`. Passing it again would override caching/persistence.
        // The `...rest` spread carries over things like staleTime, gcTime, enabled, etc.
        // Then we re-attach the queryKey explicitly so React Query can identify this cache.
        const { queryFn, ...rest } =
          trpcOptionsProxy.locations.list.queryOptions()

        const locationArray = useSuspenseQuery({
          ...rest,
          queryKey: trpc.locations.list.queryKey({
            isActive,
            locationIds,
            locationType
          })
        }).data

        const locationMap = new Map<UUID, Location>(
          locationArray.map((location) => [location.id, location])
        )
        return locationMap
      }
    }
  }
}
