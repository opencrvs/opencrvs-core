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
import { AdministrativeArea, UUID } from '@opencrvs/commons/client'
import { trpcOptionsProxy, useTRPC } from '@client/v2-events/trpc'
import { setQueryDefaults } from '../features/events/useEvents/procedures/utils'

setQueryDefaults(trpcOptionsProxy.administrativeAreas.list, {
  meta: {
    useLargeQueryStorage: true
  },
  queryFn: async (...params) => {
    const queryOptions =
      trpcOptionsProxy.administrativeAreas.list.queryOptions()
    if (typeof queryOptions.queryFn !== 'function') {
      throw new Error('queryFn is not a function')
    }

    return await queryOptions.queryFn(...params)
  },
  staleTime: 1000 * 60 * 60 * 24 // keep it in cache 1 day
})

export function useAdministrativeAreas() {
  const trpc = useTRPC()
  return {
    getAdministrativeAreas: {
      useSuspenseQuery: ({
        isActive,
        ids
      }: {
        isActive?: boolean
        ids?: UUID[]
      } = {}) => {
        // We intentionally remove `queryFn` here because we already set a global default
        // via `setQueryDefaults`. Passing it again would override caching/persistence.
        // The `...rest` spread carries over things like staleTime, gcTime, enabled, etc.
        // Then we re-attach the queryKey explicitly so React Query can identify this cache.
        const { queryFn, ...rest } =
          trpcOptionsProxy.administrativeAreas.list.queryOptions()

        const administrativeAreas = useSuspenseQuery({
          ...rest,
          queryKey: trpc.administrativeAreas.list.queryKey({
            isActive,
            ids
          })
        }).data

        const administrativeAreasMap = new Map<UUID, AdministrativeArea>(
          administrativeAreas.map((administrativeArea) => [
            administrativeArea.id,
            administrativeArea
          ])
        )
        return administrativeAreasMap
      }
    }
  }
}

/**
 * Get the leaf administrative area IDs from a list of administrative areas.
 *
 * A leaf administrative area is defined as an administrative area that does not have any children in the provided list.
 * AdministrativeArea  might have a CRVS_OFFICE as children, but is still considered to be a leaf administrative area.
 *
 * @param administrativeAreas - The list of administrative areas to search.
 * @returns The list of leaf administrative area IDs.
 */
export function getLeafAdministrativeAreaIds(
  administrativeAreas: Map<UUID, AdministrativeArea>
): Array<{ id: UUID }> {
  const nonLeafAdministrativeAreaIds = new Set<string>()

  for (const [id, location] of administrativeAreas) {
    if (location.parentId) {
      nonLeafAdministrativeAreaIds.add(location.parentId)
    }
  }

  const result: { id: UUID }[] = []
  for (const [id] of administrativeAreas) {
    if (!nonLeafAdministrativeAreaIds.has(id)) {
      result.push({ id })
    }
  }

  return result
}

// Ref works since arrays are compared by reference.
let cachedAdministrativeAreasRef: unknown = null
/** In-memory cache of leaf administrative area IDs */
let cachedLeafAdministrativeAreaIds: { id: UUID }[] | null = null

/**
 * Uses in-memory caching to avoid recomputation on re-renders. Becomes costly with large datasets.
 *
 * @returns array of leaf administrative area IDs.
 */
export function useSuspenseGetLeafAdministrativeAreaIds() {
  const { getAdministrativeAreas } = useAdministrativeAreas()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()

  if (
    cachedLeafAdministrativeAreaIds &&
    cachedAdministrativeAreasRef === administrativeAreas
  ) {
    return cachedLeafAdministrativeAreaIds
  }

  const leafIds = getLeafAdministrativeAreaIds(administrativeAreas)
  cachedAdministrativeAreasRef = administrativeAreas
  cachedLeafAdministrativeAreaIds = leafIds

  return leafIds
}
