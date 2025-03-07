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

import { v4 as uuid } from 'uuid'
import { EventDocument, EventIndex } from '@opencrvs/commons/client'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'

export function findLocalEventData(eventId: string) {
  return queryClient.getQueryData(
    trpcOptionsProxy.event.get.queryKey(eventId)
  ) as EventDocument | undefined
}

export function setEventData(id: string, data: EventDocument) {
  return queryClient.setQueryData(trpcOptionsProxy.event.get.queryKey(id), data)
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

export async function invalidateDraftsList() {
  return queryClient.invalidateQueries({
    queryKey: trpcOptionsProxy.event.draft.list.queryKey()
  })
}

export function createTemporaryId() {
  return `tmp-${uuid()}`
}

export function isTemporaryId(id: string) {
  return id.startsWith('tmp-')
}
