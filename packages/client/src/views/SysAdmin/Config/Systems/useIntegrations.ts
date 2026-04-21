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

import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import { trpcClient, useTRPC } from '@client/v2-events/trpc'
import { encodeScope, UUID } from '@opencrvs/commons/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

/** Data shape returned by integrations.list */
export interface IntegrationItem {
  id: string
  name: string
  scopes: string[]
  status: string
  createdAt: string
  createdBy: string
}

/** Data shape returned by integrations.create */
export interface CreateIntegrationResult {
  clientId: string
  shaSecret: string
  clientSecret: string
}

/** Data shape returned by integrations.get (for revealing keys) */
export interface IntegrationDetails {
  id: string
  name: string
  scopes: string[]
  status: string
  shaSecret: string | null
}

type SystemIntegrationType = 'HEALTH' | 'RECORD_SEARCH'

function getSystemScopesFromType(
  type: SystemIntegrationType,
  eventIds: string[]
): string[] {
  if (type === 'HEALTH') {
    return [
      encodeScope({ type: 'record.create', options: { event: eventIds } }),
      encodeScope({ type: 'record.notify', options: { event: eventIds } })
    ]
  }

  if (type === 'RECORD_SEARCH') {
    return [
      encodeScope({ type: 'record.search', options: { event: eventIds } })
    ]
  }

  return []
}

export function useIntegrations() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const eventConfigurations = useEventConfigurations()

  // List integrations via TRPC
  const listQuery = useQuery(trpc.integrations.list.queryOptions())

  // Create integration via TRPC directly
  const createMutation = useMutation({
    mutationFn: (input: { name: string; type: SystemIntegrationType }) => {
      const eventIds = eventConfigurations.map((config) => config.id)
      const scopes = getSystemScopesFromType(input.type, eventIds)
      return trpcClient.integrations.create.mutate({ name: input.name, scopes })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.integrations.list.queryKey()
      })
    }
  })

  // Deactivate integration
  const deactivateMutation = useMutation({
    mutationFn: (id: string) =>
      trpcClient.integrations.deactivate.mutate({ id: id as UUID }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.integrations.list.queryKey()
      })
    }
  })

  // Activate integration
  const activateMutation = useMutation({
    mutationFn: (id: string) =>
      trpcClient.integrations.activate.mutate({ id: id as UUID }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.integrations.list.queryKey()
      })
    }
  })

  // Delete integration
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      trpcClient.integrations.delete.mutate({ id: id as UUID }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.integrations.list.queryKey()
      })
    }
  })

  // Get integration details (for revealing keys)
  const getIntegration = async (id: string) => {
    return trpcClient.integrations.get.query({ id: id as UUID })
  }

  // Refresh client secret
  const refreshSecretMutation = useMutation({
    mutationFn: (id: string) =>
      trpcClient.integrations.refreshSecret.mutate({ id: id as UUID })
  })

  return {
    integrations: (listQuery.data ?? []) as IntegrationItem[],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    createIntegration: createMutation.mutateAsync,
    createResult: (createMutation.data ??
      null) as CreateIntegrationResult | null,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    resetCreate: createMutation.reset,
    deactivateIntegration: deactivateMutation.mutateAsync,
    isDeactivating: deactivateMutation.isPending,
    deactivateError: deactivateMutation.error,
    activateIntegration: activateMutation.mutateAsync,
    isActivating: activateMutation.isPending,
    activateError: activateMutation.error,
    deleteIntegration: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
    getIntegration,
    refreshSecret: refreshSecretMutation.mutateAsync,
    refreshSecretData: refreshSecretMutation.data ?? null,
    isRefreshingSecret: refreshSecretMutation.isPending,
    refreshSecretError: refreshSecretMutation.error,
    resetRefreshSecret: refreshSecretMutation.reset
  }
}
