import { useMutation } from '@tanstack/react-query'
import { getMutationKey } from '@trpc/react-query'
import { api, utils } from '@client/v2-events/trpc'
import { getEvent, getEvents } from './persist'

function waitUntilEventIsCreated<T extends { eventId: string }, R>(
  canonicalMutationFn: (params: T) => Promise<R>
): (params: T) => Promise<R> {
  return async (params) => {
    const { eventId } = params
    const events = getEvents()
    const event = getEvent(events, eventId)

    if (!event || event.id === event.transactionId) {
      console.error(
        'Event that has not been stored yet cannot be actioned upon'
      )
      throw new Error(
        'Event that has not been stored yet cannot be actioned upon'
      )
    }

    return canonicalMutationFn({ ...params, eventId: event.id })
  }
}

type Mutation =
  | typeof api.event.actions.declare
  | typeof api.event.actions.draft
  | typeof api.event.actions.notify
  | typeof api.event.actions.register

type Procedure =
  | typeof utils.event.actions.declare
  | typeof utils.event.actions.draft
  | typeof utils.event.actions.notify
  | typeof utils.event.actions.register

utils.event.actions.declare.setMutationDefaults(({ canonicalMutationFn }) => ({
  retry: true,
  retryDelay: 10000,
  mutationFn: waitUntilEventIsCreated(canonicalMutationFn)
}))

utils.event.actions.draft.setMutationDefaults(({ canonicalMutationFn }) => ({
  retry: true,
  retryDelay: 10000,
  mutationFn: waitUntilEventIsCreated(canonicalMutationFn)
}))

utils.event.actions.register.setMutationDefaults(({ canonicalMutationFn }) => ({
  retry: true,
  retryDelay: 10000,
  mutationFn: waitUntilEventIsCreated(canonicalMutationFn)
}))

utils.event.actions.notify.setMutationDefaults(({ canonicalMutationFn }) => ({
  retry: true,
  retryDelay: 10000,
  mutationFn: waitUntilEventIsCreated(canonicalMutationFn)
}))

export function useEventAction<P extends Procedure, M extends Mutation>(
  procedure: P,
  mutation: M
) {
  const mutationDefaults = procedure.getMutationDefaults()

  if (!mutationDefaults?.mutationFn) {
    throw new Error(
      'No mutation fn found for operation. This should never happen'
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMutation<any, any, any, any>({
    ...mutationDefaults,
    mutationKey: getMutationKey(mutation),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: waitUntilEventIsCreated<any, any>(mutationDefaults.mutationFn)
  }) as ReturnType<M['useMutation']>
}