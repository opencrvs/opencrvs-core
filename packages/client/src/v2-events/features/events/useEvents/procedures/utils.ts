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
import {
  MutationObserverOptions,
  OmitKeyof,
  QueryFunctionContext
} from '@tanstack/react-query'
import { TRPCClientError } from '@trpc/client'
import type {
  DecorateMutationProcedure,
  DecorateQueryProcedure,
  inferInput,
  inferOutput
} from '@trpc/tanstack-react-query'
import { AppRouter, queryClient } from '@client/v2-events/trpc'
import { isTemporaryId, RequireKey } from '@client/v2-events/utils'
import { findLocalEventData } from '@client/v2-events/features/events/useEvents/api'

export function waitUntilEventIsCreated<T extends { eventId: string }, R>(
  canonicalMutationFn: (params: T) => Promise<R>
): (params: T) => Promise<R> {
  return async (params) => {
    const { eventId } = params

    if (!isTemporaryId(eventId)) {
      return canonicalMutationFn({ ...params, eventId: eventId })
    }

    const localVersion = findLocalEventData(eventId)
    if (!localVersion || isTemporaryId(localVersion.id)) {
      throw new Error('Event that has not been stored yet cannot be deleted')
    }

    return canonicalMutationFn({
      ...params,
      eventId: localVersion.id,
      eventType: localVersion.type
    })
  }
}

type TRPCError = TRPCClientError<AppRouter>
type TRPCQueryKey<T> = [readonly string[], { input: T }]
/**
 * Sets the default options for a mutation procedure.
 *
 * This function should be the primary method of changing settings for mutations
 * because it ensures that mutations stored in IndexedDB for later processing
 * after the application has reloaded can use the same settings without running
 * the same code paths again.
 *
 * i.e. if you want to override mutationFn, you must use setMutationDefault to do so.
 *
 * @template P - The type of the mutation procedure e.g. trpc.events.get.
 * @template Context - The type of the context, defaults to `any`.
 * @param {OmitKeyof<MutationObserverOptions<inferOutput<P>, TRPCError, inferInput<P>, Context>, 'mutationKey'>} options - The options to set as defaults, excluding the `mutationKey`.
 */
export function setMutationDefaults<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends DecorateMutationProcedure<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Context = any
>(
  mutation: P,
  options: RequireKey<
    OmitKeyof<
      MutationObserverOptions<
        inferOutput<P>,
        TRPCError,
        inferInput<P>,
        Context
      >,
      'mutationKey'
    >,
    'mutationFn'
  >
) {
  queryClient.setMutationDefaults(mutation.mutationKey(), options)
}

/**
 * Sets the default options for a mutation procedure.
 */
export function setQueryDefaults<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends DecorateQueryProcedure<any>
>(
  query: P,
  options: Omit<
    Parameters<typeof queryClient.setQueryDefaults>[1],
    'queryFn'
  > & {
    queryFn: (
      input: QueryFunctionContext<TRPCQueryKey<inferInput<P>>>
    ) => inferOutput<P> | Promise<inferOutput<P>>
  }
) {
  queryClient.setQueryDefaults(
    query.queryKey(),
    options as Parameters<typeof queryClient.setQueryDefaults>[1]
  )
}

export function createEventActionMutationFn<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends DecorateMutationProcedure<any>
>(trpcProcedure: P) {
  /*
   * Merge default tRPC mutationOptions with the ones provided above
   */
  const mutationOptions = {
    ...trpcProcedure.mutationOptions(),
    ...queryClient.getMutationDefaults(trpcProcedure.mutationKey())
  }

  if (!mutationOptions.mutationFn) {
    throw new Error(
      'No mutation fn found for operation. This should never happen'
    )
  }

  const defaultMutationFn = mutationOptions.mutationFn

  return waitUntilEventIsCreated<inferInput<P>, inferOutput<P>>(
    async ({ eventType, ...params }) => {
      return defaultMutationFn({
        ...params,
        declaration: params.declaration
      })
    }
  )
}
