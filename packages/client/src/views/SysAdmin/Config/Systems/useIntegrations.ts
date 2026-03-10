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
import { SCOPES, encodeScope, RecordScopeTypeV2 } from '@opencrvs/commons/client'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'

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

type SystemIntegrationType = 'HEALTH' | 'RECORD_SEARCH'

const DEFAULT_SCOPES_BY_TYPE: Record<SystemIntegrationType, string[]> = {
  HEALTH: [SCOPES.NOTIFICATION_API],
  RECORD_SEARCH: [SCOPES.RECORDSEARCH]
}

const CONFIGURABLE_SCOPES_BY_TYPE: Record<
  SystemIntegrationType,
  RecordScopeTypeV2[]
> = {
  HEALTH: ['record.create', 'record.notify'],
  RECORD_SEARCH: []
}

function getSystemScopesFromType(
  type: SystemIntegrationType,
  eventIds: string[]
): string[] {
  const literalScopes = DEFAULT_SCOPES_BY_TYPE[type]
  const v2Scopes = CONFIGURABLE_SCOPES_BY_TYPE[type].map(
    (scope: RecordScopeTypeV2) =>
      encodeScope({
        type: scope,
        options: { event: eventIds }
      })
  )

  return [...literalScopes, ...v2Scopes]
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

  return {
    integrations: (listQuery.data ?? []) as IntegrationItem[],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    createIntegration: createMutation.mutateAsync,
    createResult: (createMutation.data ?? null) as CreateIntegrationResult | null,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    resetCreate: createMutation.reset
  }
}
