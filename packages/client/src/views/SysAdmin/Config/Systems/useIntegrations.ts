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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTRPC, trpcClient } from '@client/v2-events/trpc'

/** Data shape returned by integrations.list */
export interface IntegrationItem {
  id: string
  name: string
  scopes: string[]
  status: string
}

/** Data shape returned by integrations.create */
export interface CreateIntegrationResult {
  clientId: string
  shaSecret: string
  clientSecret: string
}

export function useIntegrations() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const listQuery = useQuery(trpc.integrations.list.queryOptions())

  const createMutation = useMutation({
    mutationFn: (input: { name: string; scopes: string[] }) =>
      trpcClient.integrations.create.mutate(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.integrations.list.queryKey()
      })
    }
  })

  return {
    integrations: (listQuery.data ?? []) as IntegrationItem[],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    createIntegration: createMutation.mutate,
    createIntegrationAsync: createMutation.mutateAsync,
    createResult: createMutation.data as
      | CreateIntegrationResult
      | null
      | undefined,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    resetCreate: createMutation.reset
  }
}
