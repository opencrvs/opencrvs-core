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

import { hashKey, MutationKey, useMutationState } from '@tanstack/react-query'
import * as z from 'zod'
import {
  applyDeclarationToEventIndex,
  getCurrentEventState
} from '@opencrvs/commons/client'
import { EventState } from '@opencrvs/commons/client'
import { queryClient, trpcOptionsProxy, useTRPC } from '@client/v2-events/trpc'
import { useEventConfigurations } from '../useEventConfiguration'

const MutationVariables = z.object({
  eventId: z.string(),
  declaration: EventState.optional()
})

function assignmentMutation(mutationKey: MutationKey) {
  return [
    hashKey(trpcOptionsProxy.event.actions.assignment.assign.mutationKey()),
    hashKey(trpcOptionsProxy.event.actions.assignment.unassign.mutationKey())
  ].includes(hashKey(mutationKey))
}

export function useOutbox() {
  const trpc = useTRPC()
  const eventConfigurations = useEventConfigurations()

  const pendingMutations = useMutationState({
    filters: {
      predicate: (mutation) =>
        mutation.state.status !== 'success' &&
        !assignmentMutation(mutation.options.mutationKey as MutationKey)
    },
    select: (mutation) => mutation
  })

  const outboxEvents = pendingMutations
    .map((mutation) => {
      if (mutation.options.meta?.ignoreOutbox) {
        return null
      }
      const maybeVariables = mutation.state.variables

      const parsedVariables = MutationVariables.safeParse(maybeVariables)

      if (!parsedVariables.success) {
        return null
      }

      const { eventId, declaration } = parsedVariables.data

      const event = queryClient.getQueryData(trpc.event.get.queryKey(eventId))

      if (!event) {
        return null
      }

      const eventConfiguration = eventConfigurations.find(
        (config) => config.id === event.type
      )
      if (!eventConfiguration) {
        return null
      }

      const eventState = getCurrentEventState(event, eventConfiguration)

      return {
        // Merge the declaration from mutation to get optimistic declaration
        ...applyDeclarationToEventIndex(
          eventState,
          declaration ?? {},
          eventConfiguration
        ),
        meta: mutation.options.meta
      }
    })
    .filter((event) => event !== null)
    .filter(
      /* uniqueById */
      (e, i, arr) => arr.findIndex((a) => a.id === e.id) === i
    )

  return outboxEvents
}
