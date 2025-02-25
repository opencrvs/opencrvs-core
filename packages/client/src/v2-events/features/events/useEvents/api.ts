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
import { MutationObserverOptions, OmitKeyof } from '@tanstack/react-query'
import { TRPCClientError } from '@trpc/client'
import {
  DecorateMutationProcedure,
  inferInput,
  inferOutput
} from '@trpc/tanstack-react-query'
import { EventDocument, EventIndex } from '@opencrvs/commons/client'
import { AppRouter, queryClient, utils } from '@client/v2-events/trpc'

export function getLocalEventData(eventId: string) {
  return queryClient.getQueryData(utils.event.get.queryKey(eventId))
}

export function setEventData(id: string, data: EventDocument) {
  return queryClient.setQueryData(utils.event.get.queryKey(id), data)
}

export function setEventListData(
  updater: (eventIndices: EventIndex[] | undefined) => EventIndex[] | undefined
) {
  return queryClient.setQueryData(utils.event.list.queryKey(), updater)
}

export async function invalidateEventsList() {
  return queryClient.invalidateQueries({
    queryKey: utils.event.list.queryKey()
  })
}

export function setMutationDefaults<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends DecorateMutationProcedure<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Context = any
>(
  mutation: P,
  options: OmitKeyof<
    MutationObserverOptions<inferOutput<P>, TRPCError, inferInput<P>, Context>,
    'mutationKey'
  >
) {
  const trpcOptions = mutation.mutationOptions<Context>()
  queryClient.setMutationDefaults(mutation.mutationKey(), {
    ...trpcOptions,
    ...options
  })
}

export type TRPCError = TRPCClientError<AppRouter>
export function isTRPCClientError(cause: unknown): cause is TRPCError {
  return cause instanceof TRPCClientError
}
