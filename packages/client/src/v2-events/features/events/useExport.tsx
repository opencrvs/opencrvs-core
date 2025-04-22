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
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { queryClient, trpcOptionsProxy, useTRPC } from '@client/v2-events/trpc'



export function useExport() {
  const trpc = useTRPC()

  return {
    getExports: {
      useQuery: useQuery({
        ...trpc.event.export.config.queryOptions(),
        queryKey: trpc.event.export.queryKey()
      }),
      useSuspenseQuery: () => [
        useSuspenseQuery(trpc.event.export.config.queryOptions()).data
      ]
    },
    createExport: {
      useMutation: useMutation({
        ...trpc.event.export.create.mutationOptions(),
        ...queryClient.getMutationDefaults(
            trpcOptionsProxy.event.export.create.mutationKey()
          )
        }),
    }
  }

}
