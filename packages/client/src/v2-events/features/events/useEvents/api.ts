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
  ActionType,
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

export function addUserToQueryData(user: User) {
  return queryClient.setQueryData(
    trpcOptionsProxy.user.get.queryKey(user.id),
    user
  )
}

export function findLocalEventConfig(eventType: string) {
  return queryClient
    .getQueryData(trpcOptionsProxy.event.config.get.queryKey())
    ?.find(({ id }: EventConfig) => id === eventType) as EventConfig | undefined
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
  return queryClient.setQueryData(
    trpcOptionsProxy.event.draft.list.queryKey(),
    (drafts) => updater(drafts || [])
  )
}

export function findLocalEventIndex(id: string) {
  return queryClient
    .getQueriesData<EventIndex>({
      queryKey: trpcOptionsProxy.event.search.queryKey()
    })
    .flatMap(([, data]) => data)
    .filter((event): event is EventIndex => Boolean(event))
    .find((e) => e.id === id)
}

export function setEventListData(
  updater: (eventIndices: EventIndex[] | undefined) => EventIndex[] | undefined
) {
  return queryClient.setQueryData(
    trpcOptionsProxy.event.list.queryKey(),
    updater
  )
}

export function updateLocalEventIndex(updatedEvent: EventDocument) {
  const config = findLocalEventConfig(updatedEvent.type)
  if (!config) {
    throw new Error(
      `Event configuration for type ${updatedEvent.type} not found`
    )
  }
  const updatedEventIndex = getCurrentEventState(updatedEvent, config)
  // Update the local event index with the updated event
  setEventListData((eventIndices) =>
    eventIndices?.map((eventIndex) =>
      eventIndex.id === updatedEvent.id
        ? { ...eventIndex, ...updatedEventIndex }
        : eventIndex
    )
  )

  /*
   * Ensure there exists a local cached search query for this event
   */

  queryClient.setQueryData(
    trpcOptionsProxy.event.search.queryKey({
      type: 'and',
      clauses: [{ id: updatedEvent.id }]
    }),
    () => [updatedEventIndex]
  )
  /*
   * Update all searches where this event is present
   */
  queryClient
    .getQueriesData<EventIndex[]>({
      queryKey: trpcOptionsProxy.event.search.queryKey()
    })
    .forEach(([queryKey, eventIndices]) => {
      queryClient.setQueryData(
        queryKey,
        (eventIndices || []).map((eventIndex) =>
          eventIndex.id === updatedEvent.id
            ? { ...eventIndex, ...updatedEventIndex }
            : eventIndex
        )
      )
    })
}

export function findLocalEventDocument(eventId: string) {
  return queryClient.getQueryData(
    trpcOptionsProxy.event.get.queryKey(eventId)
  ) as EventDocument | undefined
}

export function setEventData(id: string, data: EventDocument) {
  updateLocalEventIndex(data)
  return queryClient.setQueryData(trpcOptionsProxy.event.get.queryKey(id), data)
}

export async function invalidateEventsList() {
  /*
   * Invalidate search queries
   */
  await Promise.all(
    queryClient
      .getQueriesData<EventIndex[]>({
        queryKey: trpcOptionsProxy.event.search.queryKey()
      })
      .map(async ([queryKey, eventIndices]) =>
        queryClient.invalidateQueries({
          queryKey
        })
      )
  )

  return queryClient.invalidateQueries({
    queryKey: trpcOptionsProxy.event.list.queryKey()
  })
}

export async function updateLocalEvent(updatedEvent: EventDocument) {
  setEventData(updatedEvent.id, updatedEvent)
  return invalidateEventsList()
}

export function onAssign(updatedEvent: EventDocument) {
  setEventData(updatedEvent.id, updatedEvent)

  const lastAssignment = findLastAssignmentAction(updatedEvent.actions)

  if (!lastAssignment) {
    return
  }

  if (lastAssignment.type === ActionType.ASSIGN) {
    const { assignedTo } = lastAssignment
    return setEventListData((eventIndices) =>
      eventIndices?.map((eventIndex) =>
        eventIndex.id === updatedEvent.id
          ? { ...eventIndex, assignedTo }
          : eventIndex
      )
    )
  }
}

export async function invalidateDraftsList() {
  return queryClient.invalidateQueries({
    queryKey: trpcOptionsProxy.event.draft.list.queryKey()
  })
}

function deleteEventData(id: string) {
  queryClient.removeQueries({
    queryKey: trpcOptionsProxy.event.get.queryKey(id)
  })
}


export async function cleanUpOnUnassign(updatedEvent: EventDocument) {
  const { id } = updatedEvent
  setDraftData((drafts) => drafts.filter(({ eventId }) => eventId !== id))
  deleteEventData(id)
  await removeCachedFiles(updatedEvent)
}
