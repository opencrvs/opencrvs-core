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
import { Location, LocationType, UUID } from '@opencrvs/commons/client'
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
        locationType?: LocationType
      } = {}) => {
        // We intentionally remove `queryFn` here because we already set a global default
        // via `setQueryDefaults`. Passing it again would override caching/persistence.
        // The `...rest` spread carries over things like staleTime, gcTime, enabled, etc.
        // Then we re-attach the queryKey explicitly so React Query can identify this cache.
        const { queryFn, ...rest } =
          trpcOptionsProxy.locations.list.queryOptions()

        return [
          useSuspenseQuery({
            ...rest,
            queryKey: trpc.locations.list.queryKey({
              isActive,
              locationIds,
              locationType
            })
          }).data
        ]
      }
    }
  }
}

/**
 *
 * @returns given the type of location, check if it matches the provided types. When no types are provided, always returns true.
 */
function matchesType(
  type: LocationType | null,
  locationTypes?: LocationType[]
) {
  return (
    !locationTypes ||
    locationTypes.length === 0 ||
    (type !== null && locationTypes.includes(type))
  )
}

/**
 * Get the leaf location IDs from a list of locations.
 *
 * A leaf location is defined as a location that does not have any children in the provided list.
 * e.g. if a location is a parent of another location in the list, it is not considered a leaf. ADMIN_STRUCTURE might have CRVS_OFFICE children, but can be a leaf if we only consider ADMIN_STRUCTURE locations.
 *
 * @param locations - The list of locations to search.
 * @param locationTypes - The types of locations to include.
 * @returns The list of leaf location IDs.
 */
export function getLeafLocationIds(
  locations: Location[],
  locationTypes?: LocationType[]
): Array<{ id: UUID }> {
  const nonLeafLocationIds = new Set<string>()

  for (const location of locations) {
    if (
      location.parentId &&
      matchesType(location.locationType, locationTypes)
    ) {
      nonLeafLocationIds.add(location.parentId)
    }
  }

  const result: { id: UUID }[] = []
  for (const loc of locations) {
    if (
      !nonLeafLocationIds.has(loc.id) &&
      matchesType(loc.locationType, locationTypes)
    ) {
      result.push({ id: loc.id })
    }
  }

  return result
}

// Ref works since arrays are compared by reference.
let cachedLocationsRef: unknown = null
/** In-memory cache of leaf location IDs */
let cachedLeafIds: { id: UUID }[] | null = null

/**
 * Uses in-memory caching to avoid recomputation on re-renders. Becomes costly with large datasets.
 *
 * @returns array of leaf location IDs within the specified types. When no types are provided, returns leaf locations based on all types.
 */
export function useSuspenseAdminLeafLevelLocations() {
  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()

  if (cachedLeafIds && cachedLocationsRef === locations) {
    return cachedLeafIds
  }

  const leafIds = getLeafLocationIds(locations, [
    LocationType.enum.ADMIN_STRUCTURE
  ])

  cachedLocationsRef = locations
  cachedLeafIds = leafIds

  return leafIds
}
