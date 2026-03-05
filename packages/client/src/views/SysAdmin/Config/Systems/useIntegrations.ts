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
import { useTRPC } from '@client/v2-events/trpc'
import { useMutation as useGqlMutation } from '@apollo/client'
import { registerSystem } from './mutations'
import {
  RegisterSystemMutation,
  RegisterSystemMutationVariables
} from '@client/utils/gateway'

/** Data shape returned by integrations.list */
export interface IntegrationItem {
  id: string
  name: string
  scopes: string[]
  status: string
}

/** Data shape returned by registerSystem GraphQL mutation */
export interface CreateIntegrationResult {
  clientId: string
  shaSecret: string
  clientSecret: string
}

export function useIntegrations() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  // List integrations via TRPC
  const listQuery = useQuery(trpc.integrations.list.queryOptions())

  // Create integration via GraphQL (gateway handles type→scopes conversion)
  const [registerSystemMutation, registerSystemState] = useGqlMutation<
    RegisterSystemMutation,
    RegisterSystemMutationVariables
  >(registerSystem, {
    onCompleted: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.integrations.list.queryKey()
      })
    }
  })

  const createIntegration = async (input: { name: string; type: string }) => {
    return registerSystemMutation({
      variables: {
        system: {
          name: input.name,
          type: input.type as RegisterSystemMutationVariables['system'] extends
            | infer T
            | undefined
            ? T extends { type: infer U }
              ? U
              : never
            : never
        }
      }
    })
  }

  const createResult = registerSystemState.data?.registerSystem ?? null

  return {
    integrations: (listQuery.data ?? []) as IntegrationItem[],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    createIntegration,
    createResult: createResult as CreateIntegrationResult | null,
    isCreating: registerSystemState.loading,
    createError: registerSystemState.error,
    resetCreate: registerSystemState.reset
  }
}
