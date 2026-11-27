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
import { QueryClient } from '@tanstack/react-query'
import { purgeLegacyLocationListQueries, trpcOptionsProxy } from './trpc'

const sharedLocations = trpcOptionsProxy.locations.list.queryKey()
const sharedAreas = trpcOptionsProxy.administrativeAreas.list.queryKey()

describe('purgeLegacyLocationListQueries', () => {
  it('removes the list entries that the hooks filled under a key with filter input', () => {
    const queryClient = new QueryClient()
    // The keys that earlier versions of the hooks built from their unused filters.
    const legacyLocations = trpcOptionsProxy.locations.list.queryKey({
      isActive: undefined
    })
    const legacyAreas = trpcOptionsProxy.administrativeAreas.list.queryKey({
      ids: undefined
    })

    for (const key of [
      sharedLocations,
      legacyLocations,
      sharedAreas,
      legacyAreas
    ]) {
      queryClient.setQueryData(key, new Map() as never)
    }

    purgeLegacyLocationListQueries(queryClient)

    expect(queryClient.getQueryData(sharedLocations)).toBeDefined()
    expect(queryClient.getQueryData(sharedAreas)).toBeDefined()
    expect(queryClient.getQueryData(legacyLocations)).toBeUndefined()
    expect(queryClient.getQueryData(legacyAreas)).toBeUndefined()
  })

  it('removes the shared entries that hold the raw list array', () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(sharedLocations, [])
    queryClient.setQueryData(sharedAreas, [])

    purgeLegacyLocationListQueries(queryClient)

    expect(queryClient.getQueryData(sharedLocations)).toBeUndefined()
    expect(queryClient.getQueryData(sharedAreas)).toBeUndefined()
  })
})
