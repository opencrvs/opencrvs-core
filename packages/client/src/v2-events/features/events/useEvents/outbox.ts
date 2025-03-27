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

import { hashKey, Mutation, useQuery } from '@tanstack/react-query'

import {
  DecorateMutationProcedure,
  inferInput,
  inferOutput
} from '@trpc/tanstack-react-query'
import { EventIndex } from '@opencrvs/commons/client'
import { queryClient, useTRPC } from '@client/v2-events/trpc'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPendingMutations<T extends DecorateMutationProcedure<any>>(
  procedure: T
) {
  // type MutationFn = Exclude<T['mutationFn'], undefined>
  type Data = inferOutput<T>
  type Variables = inferInput<T>

  const mutationOptions = procedure.mutationOptions()
  const key = mutationOptions.mutationKey

  return queryClient
    .getMutationCache()
    .getAll()
    .filter((mutation) => mutation.state.status !== 'success')
    .filter(
      (mutation) =>
        mutation.options.mutationKey &&
        hashKey(mutation.options.mutationKey) === hashKey(key)
    ) as Mutation<Data, Error, Variables>[]
}

function filterOutboxEventsWithMutation<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends DecorateMutationProcedure<any>
>(
  events: EventIndex[],
  mutation: T,
  filter: (event: EventIndex, parameters: inferInput<T>) => boolean
) {
  return getPendingMutations(mutation).flatMap((m) => {
    const variables = m.state.variables
    return events.filter((event) => filter(event, variables))
  })
}

export function useOutbox() {
  const trpc = useTRPC()
  const eventListQuery = useQuery({
    ...trpc.event.list.queryOptions(),
    queryKey: trpc.event.list.queryKey()
  })

  const eventsList = eventListQuery.data ?? []

  const eventFromDeclareActions = filterOutboxEventsWithMutation(
    eventsList,
    trpc.event.actions.declare,
    (event, parameters) => {
      return event.id === parameters.eventId
    }
  )

  const eventFromValidateActions = filterOutboxEventsWithMutation(
    eventsList,
    trpc.event.actions.validate,
    (event, parameters) => {
      return event.id === parameters.eventId
    }
  )

  const eventFromRegisterActions = filterOutboxEventsWithMutation(
    eventsList,
    trpc.event.actions.register.request,
    (event, parameters) => {
      return event.id === parameters.eventId
    }
  )

  return eventFromDeclareActions
    .concat(eventFromDeclareActions)
    .concat(eventFromValidateActions)
    .concat(eventFromRegisterActions)
    .filter(
      /* uniqueById */
      (e, i, arr) => arr.findIndex((a) => a.id === e.id) === i
    )
}
