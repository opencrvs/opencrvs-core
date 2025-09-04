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
import { trpcOptionsProxy, useTRPC } from '@client/v2-events/trpc'
import { setQueryDefaults } from '../features/events/useEvents/procedures/utils'

setQueryDefaults(trpcOptionsProxy.locations.list, {
  queryFn: async (...params) => {
    const queryOptions = trpcOptionsProxy.locations.list.queryOptions()
    if (typeof queryOptions.queryFn !== 'function') {
      throw new Error('queryFn is not a function')
    }
    return queryOptions.queryFn(...params)
  }
})

export function useLocations() {
  const trpc = useTRPC()
  return {
    getLocations: {
      useSuspenseQuery: () => {
        return [
          useSuspenseQuery({
            ...trpc.locations.list.queryOptions(),
            queryKey: trpc.locations.list.queryKey()
          }).data
        ]
      }
    }
  }
}
