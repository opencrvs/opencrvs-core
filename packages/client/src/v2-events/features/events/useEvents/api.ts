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
  findLastAssignmentAction
} from '@opencrvs/commons/client'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'
import { removeCachedFiles } from '../../files/cache'

export function findLocalEventData(eventId: string) {
  return queryClient.getQueryData(
    trpcOptionsProxy.event.get.queryKey(eventId)
  ) as EventDocument | undefined
}

export function findLocalEventConfig(eventType: string) {
  return queryClient
    .getQueryData(trpcOptionsProxy.event.config.get.queryKey())
    ?.find(({ id }: EventConfig) => id === eventType) as EventConfig | undefined
}

export function setDraftData(updater: (drafts: Draft[]) => Draft[]) {
  return queryClient.setQueryData(
    trpcOptionsProxy.event.draft.list.queryKey(),
    (drafts) => updater(drafts || [])
  )
}

export function setEventData(id: string, data: EventDocument) {
  return queryClient.setQueryData(trpcOptionsProxy.event.get.queryKey(id), data)
}

function deleteEventData(id: string) {
  queryClient.removeQueries({
    queryKey: trpcOptionsProxy.event.get.queryKey(id)
  })
}

export function setEventListData(
  updater: (eventIndices: EventIndex[] | undefined) => EventIndex[] | undefined
) {
  return queryClient.setQueryData(
    trpcOptionsProxy.event.list.queryKey(),
    updater
  )
}

export async function invalidateEventsList() {
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

export async function cleanUpOnUnassign(updatedEvent: EventDocument) {
  const { id } = updatedEvent
  setDraftData((drafts) => drafts.filter(({ eventId }) => eventId !== id))
  deleteEventData(id)

  await removeCachedFiles(updatedEvent)

  /**
   * deleteEventData() is overridden by updateLocalEvent().
   * We should instead update the query that returns a specific eventIndex when it's implemented.
   */
  await updateLocalEvent(updatedEvent)
}
