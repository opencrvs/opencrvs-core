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

describe('purgeLegacyLocationListQueries', () => {
  it('removes list entries keyed with input and keeps the shared entries', () => {
    const queryClient = new QueryClient()
    const sharedLocations = trpcOptionsProxy.locations.list.queryKey()
    const legacyLocations = trpcOptionsProxy.locations.list.queryKey({
      isActive: undefined
    })
    const sharedAreas = trpcOptionsProxy.administrativeAreas.list.queryKey()
    const legacyAreas = trpcOptionsProxy.administrativeAreas.list.queryKey({
      ids: undefined
    })

    for (const key of [
      sharedLocations,
      legacyLocations,
      sharedAreas,
      legacyAreas
    ]) {
      queryClient.setQueryData(key, [])
    }

    purgeLegacyLocationListQueries(queryClient)

    expect(queryClient.getQueryData(sharedLocations)).toBeDefined()
    expect(queryClient.getQueryData(sharedAreas)).toBeDefined()
    expect(queryClient.getQueryData(legacyLocations)).toBeUndefined()
    expect(queryClient.getQueryData(legacyAreas)).toBeUndefined()
  })
})
