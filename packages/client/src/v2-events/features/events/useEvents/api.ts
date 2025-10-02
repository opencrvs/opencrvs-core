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

import { matchMutation } from '@tanstack/react-query'
import {
  DecorateQueryProcedure,
  inferInput,
  inferOutput
} from '@trpc/tanstack-react-query'
import {
  Draft,
  EventConfig,
  EventDocument,
  EventIndex,
  findLastAssignmentAction,
  getCurrentEventState,
  User
} from '@opencrvs/commons/client'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'
import { removeCachedFiles } from '../../files/cache'
import { MutationType } from './procedures/utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getQueryData<T extends DecorateQueryProcedure<any>>(
  query: T,
  input?: inferInput<T>
): inferOutput<T> | undefined {
  return queryClient.getQueryData<inferOutput<T>>(query.queryKey(input))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getQueriesData<T extends DecorateQueryProcedure<any>>(query: T) {
  return queryClient.getQueriesData<inferOutput<T>>({
    queryKey: query.queryKey()
  })
}

export function addUserToQueryData(user: User) {
  return queryClient.setQueryData(
    trpcOptionsProxy.user.get.queryKey(user.id),
    user
  )
}

async function invalidateWorkqueues() {
  await queryClient.invalidateQueries({
    queryKey: trpcOptionsProxy.workqueue.count.queryKey()
  })
}

export function findLocalEventConfig(eventType: string) {
  return getQueryData(trpcOptionsProxy.event.config.get)?.find(
    ({ id }: EventConfig) => id === eventType
  ) as EventConfig | undefined
}

export function addLocalEventConfig(config: EventConfig) {
  const currentConfigs = queryClient.getQueryData<EventConfig[]>(
    trpcOptionsProxy.event.config.get.queryKey()
  )

  return queryClient.setQueryData(
    trpcOptionsProxy.event.config.get.queryKey(),
    currentConfigs ? [...currentConfigs, config] : [config]
  )
}

export function setDraftData(updater: (drafts: Draft[]) => Draft[]) {
  queryClient.setQueryData(
    trpcOptionsProxy.event.draft.list.queryKey(),
    (drafts) => updater(drafts || [])
  )
}

export function deleteDraft(id: string) {
  setDraftData((drafts) => drafts.filter(({ eventId }) => eventId !== id))
}

export function findLocalEventIndex(id: string): EventIndex | undefined {
  const queries = getQueriesData(trpcOptionsProxy.event.search)
  const eventWithAMatchingId = queries
    .flatMap(([, data]) => data?.results || [])
    .filter((event): event is EventIndex => Boolean(event))
    .find((e) => e.id === id)

  if (eventWithAMatchingId) {
    return eventWithAMatchingId
  }

  /*
   * This branch can find a local even that was originally indexed with a temporary ID
   * but has since been updated to a permanent ID.
   */
  return queries
    .filter(([queryKey]) => JSON.stringify(queryKey).includes(id))
    .flatMap(([, data]) => data?.results || [])[0]
}

export function setEventSearchQuery(updatedEventIndex: EventIndex | undefined) {
  if (!updatedEventIndex) {
    return
  }
  queryClient.setQueryData(
    trpcOptionsProxy.event.search.queryKey({
      query: {
        type: 'and',
        clauses: [{ id: updatedEventIndex.id }]
      }
    }),
    () => ({ results: [updatedEventIndex], total: 1 })
  )
}

export function updateLocalEventIndex(id: string, updatedEvent: EventDocument) {
  const config = findLocalEventConfig(updatedEvent.type)

  if (!config) {
    throw new Error(
      `Event configuration for type ${updatedEvent.type} not found`
    )
  }
  const updatedEventIndex = getCurrentEventState(updatedEvent, config)
  // Update the local event index with the updated event
  setEventSearchQuery(updatedEventIndex)

  /*
   * Ensure there exists a local cached search query for this event
   */

  queryClient.setQueryData(
    trpcOptionsProxy.event.search.queryKey({
      query: {
        type: 'and',
        clauses: [{ id }]
      }
    }),
    () => ({ results: [updatedEventIndex], total: 1 })
  )
  /*
   * Update all searches where this event is present
   */
  getQueriesData(trpcOptionsProxy.event.search).forEach(([queryKey, data]) => {
    const { results } = data || { results: [] }
    queryClient.setQueryData<inferOutput<typeof trpcOptionsProxy.event.search>>(
      queryKey,
      {
        total: results.length,
        results: results.map((eventIndex) =>
          eventIndex.id === id
            ? { ...eventIndex, ...updatedEventIndex }
            : eventIndex
        )
      }
    )
  })
}

export function findLocalEventDocument(eventId: string) {
  return getQueryData(trpcOptionsProxy.event.get, eventId)
}

/*
 * This function makes sure temporary id references to events
 * get updated properly when event is submitted to the server
 * and a new id is generated.
 */
function updateDraftsWithEvent(id: string, data: EventDocument) {
  setDraftData((drafts) =>
    drafts.map((draft) =>
      draft.eventId === id ? { ...draft, eventId: data.id } : draft
    )
  )
}

function findAllPendingDraftCreationRequests() {
  return queryClient
    .getMutationCache()
    .getAll()
    .filter((mutation) =>
      matchMutation(
        {
          mutationKey: trpcOptionsProxy.event.draft.create.mutationKey()
        },
        mutation
      )
    )
    .map(
      (mutation) =>
        mutation as MutationType<typeof trpcOptionsProxy.event.draft.create>
    )
}

export function clearPendingDraftCreationRequests(eventId: string) {
  findAllPendingDraftCreationRequests()
    .filter((mutation) => mutation.state.context?.eventId === eventId)
    .forEach((mutation) => {
      queryClient.getMutationCache().remove(mutation)
    })
}

export function setEventData(id: string, data: EventDocument) {
  updateLocalEventIndex(id, data)
  queryClient.setQueryData(trpcOptionsProxy.event.get.queryKey(id), data)
  updateDraftsWithEvent(id, data)
}

export async function refetchSearchQuery(eventId: string) {
  await queryClient.refetchQueries({
    queryKey: trpcOptionsProxy.event.search.queryKey({
      query: {
        type: 'and',
        clauses: [{ id: eventId }]
      }
    })
  })
}
export async function refetchAllSearchQueries() {
  /*
   * Invalidate search queries
   */
  await Promise.all(
    getQueriesData(trpcOptionsProxy.event.search).map(
      async ([queryKey, eventIndices]) => {
        return queryClient.refetchQueries({
          queryKey
        })
      }
    )
  )
}

async function deleteEventData(updatedEvent: EventDocument) {
  const { id } = updatedEvent
  setDraftData((drafts) => drafts.filter(({ eventId }) => eventId !== id))
  queryClient.removeQueries({
    queryKey: trpcOptionsProxy.event.get.queryKey(id)
  })

  await removeCachedFiles(updatedEvent)
}

export function updateLocalEvent(data: EventDocument) {
  setEventData(data.id, data)
}

export async function deleteLocalEvent(updatedEvent: EventDocument) {
  await deleteEventData(updatedEvent)
  await invalidateWorkqueues()
  return refetchAllSearchQueries()
}

export async function onAssign(updatedEvent: EventDocument) {
  setEventData(updatedEvent.id, updatedEvent)
  await invalidateWorkqueues()

  const lastAssignment = findLastAssignmentAction(updatedEvent.actions)

  if (!lastAssignment) {
    return
  }
}

export async function refetchDraftsList() {
  return queryClient.refetchQueries({
    queryKey: trpcOptionsProxy.event.draft.list.queryKey()
  })
}

export async function cleanUpOnUnassign(updatedEvent: EventDocument) {
  await deleteEventData(updatedEvent)
  updateLocalEventIndex(updatedEvent.id, updatedEvent)
  await invalidateWorkqueues()
}
