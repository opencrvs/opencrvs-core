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
import { create } from 'zustand'
import {
  getCurrentEventState,
  applyDeclarationToEventIndex,
  EventIndex,
  ActionBase
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

interface FailedMutation {
  eventId: string
  action: string
  declaration: Partial<EventState>
  transactionId: string
  annotation: Partial<ActionBase['annotation']>
}

interface FailedMutationStore {
  failedMutations: FailedMutation[]
  addFailedMutation: (mutation: FailedMutation) => void
  removeFailedMutation: (eventId: string, action: string) => void
  clearFailedMutations: () => void
}

export const useFailedMutationStore = create<FailedMutationStore>()(
  (set, get) => ({
    failedMutations: [],
    addFailedMutation: (mutation) => {
      const exists = get().failedMutations.some(
        (m) => m.eventId === mutation.eventId && m.action === mutation.action
      )

      if (!exists) {
        set((state) => ({
          failedMutations: [...state.failedMutations, mutation]
        }))
      }
    },
    removeFailedMutation: (eventId, action) =>
      set((state) => ({
        failedMutations: state.failedMutations.filter(
          (m) => !(m.eventId === eventId && m.action === action)
        )
      })),
    clearFailedMutations: () => set({ failedMutations: [] })
  })
)

type OutboxRecords = (Partial<EventIndex> & {
  meta?: Record<string, unknown>
})[]

export function useOutbox(): {
  pending: OutboxRecords
  failed: OutboxRecords
  all: OutboxRecords
} {
  const trpc = useTRPC()
  const eventConfigurations = useEventConfigurations()

  const pendingMutations = useMutationState({
    filters: {
      predicate: (mutation) =>
        mutation.state.status === 'pending' &&
        !assignmentMutation(mutation.options.mutationKey as MutationKey)
    },
    select: (mutation) => mutation
  })

  const failedMutations = useFailedMutationStore((s) => s.failedMutations)
  const failedOutboxEvents = failedMutations
    .map(({ eventId }) => {
      const event = queryClient.getQueryData(trpc.event.get.queryKey(eventId))
      const config = eventConfigurations.find((c) => c.id === event?.type)
      if (!event || !config) {
        return null
      }
      const eventState = getCurrentEventState(event, config)
      return {
        ...eventState,
        meta: { failed: true }
      }
    })
    .filter((event) => event !== null)

  const pendingOutboxEvents = pendingMutations
    .map((mutation) => {
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

  return {
    pending: pendingOutboxEvents,
    failed: failedOutboxEvents,
    all: [...pendingOutboxEvents, ...failedOutboxEvents]
  }
}
